import express from 'express';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { dbStore } from '../db/store.js';
import { sharedState } from '../db/sharedState.js';
import { otpRequestLimiter, otpVerifyLimiter } from '../middleware/rateLimiter.js';
import { unlockMandateWithServerKey } from '../security/mandateCrypto.js';
import { askConsentClarityAssistant, checkRateLimit } from '../services/assistantService.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'finconsent_super_secret_jwt_key_2026';

// Helper: Verify if client has unlocked the mandate via password
function isClientUnlocked(req, mandateId) {
  const token =
    req.headers['x-unlock-token'] ||
    req.headers['x-mandate-unlock-token'] ||
    req.headers['x-client-unlock-token'] ||
    req.headers.authorization?.replace(/^Bearer\s+/i, '') ||
    req.body?.unlockToken ||
    req.query?.unlockToken;
  if (!token) return false;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return Boolean(decoded && decoded.mandateId === mandateId && decoded.role === 'client_viewer');
  } catch {
    return false;
  }
}

// Helper: Sanitize message to prevent XSS
function sanitizeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Public Token Inspection Endpoint
// Before password unlock: returns ONLY non-sensitive metadata for unlock screen.
// After password unlock: returns decrypted proposal and transaction data.
router.get('/mandates/:token', (req, res) => {
  const mandate = dbStore.findMandateByToken(req.params.token);
  if (!mandate) {
    return res.status(404).json({ success: false, error: 'Mandate link not found' });
  }

  if (mandate.isRevoked) {
    return res.status(410).json({
      success: false,
      revoked: true,
      error: 'This trade mandate link has been revoked by the adviser.',
      status: 'revoked',
    });
  }

  // Check if cutoff has expired
  const now = new Date();
  const isCutoffExpired = mandate.cutoffTimestamp && new Date(mandate.cutoffTimestamp) < now;
  const isTokenExpired = mandate.tokenExpiresAt && new Date(mandate.tokenExpiresAt) < now;

  if (isCutoffExpired || isTokenExpired || mandate.status === 'expired') {
    return res.status(410).json({
      success: false,
      expired: true,
      error: 'This trade mandate link has expired. The market cutoff window has lapsed.',
      status: 'expired',
      mandate: {
        title: mandate.title,
        cutoffTimestamp: mandate.cutoffTimestamp,
      },
    });
  }

  const ria = dbStore.findUserById(mandate.riaId);

  // Check if already unlocked in this session
  if (isClientUnlocked(req, mandate.id)) {
    const unlocked = unlockMandateWithServerKey(mandate);
    const client = dbStore.findClientById(mandate.clientId);

    if (unlocked.status === 'sent' || unlocked.status === 'draft') {
      dbStore.updateMandate(unlocked.id, { status: 'viewed' });
      unlocked.status = 'viewed';
    }

    const maskedPan = client?.pan ? `XXXXX${client.pan.slice(-5)}` : 'XXXXX0000X';
    const maskedMobile = client ? `******${client.mobile.slice(-4)}` : '******';

    return res.json({
      success: true,
      unlocked: true,
      data: {
        mandate: {
          id: unlocked.id,
          title: unlocked.title,
          status: unlocked.status,
          currentAllocation: unlocked.currentAllocation,
          proposedAllocation: unlocked.proposedAllocation,
          sellBasket: unlocked.sellBasket,
          buyBasket: unlocked.buyBasket,
          trades: unlocked.trades,
          stcgAmount: unlocked.stcgAmount,
          ltcgAmount: unlocked.ltcgAmount,
          stcgTax: unlocked.stcgTax,
          ltcgTax: unlocked.ltcgTax,
          cessAmount: unlocked.cessAmount,
          taxPayable: unlocked.taxPayable,
          advanceTaxQuarter: unlocked.advanceTaxQuarter,
          advanceTaxAlert: unlocked.advanceTaxAlert,
          cutoffTimestamp: unlocked.cutoffTimestamp,
          rationale: unlocked.rationale || unlocked.advisorRationale,
          advisorRationale: unlocked.advisorRationale || unlocked.rationale,
        },
        client: {
          name: client ? client.name : 'Valued Client',
          maskedPan,
          maskedMobile,
        },
        ria: {
          firmName: ria?.firmName || 'SEBI Registered Investment Adviser',
          sebiRegNumber: ria?.sebiRegNumber || 'INA000088921',
          name: ria?.name || 'Advisor',
        },
        chatMessages: dbStore.getMandateChat(mandate.id),
      },
    });
  }

  // Not unlocked: Return STRICTLY minimal, non-sensitive metadata for password prompt
  const clientObj = dbStore.findClientById(mandate.clientId);
  return res.json({
    success: true,
    unlocked: false,
    requiresUnlock: true,
    isPasswordProtected: true,
    data: {
      isPasswordProtected: true,
      requiresUnlock: true,
      mandate: {
        id: mandate.id,
        title: mandate.title,
        status: mandate.status,
        cutoffTimestamp: mandate.cutoffTimestamp,
        isPasswordProtected: true,
      },
      ria: {
        firmName: ria?.firmName || 'Registered Investment Adviser',
        sebiRegNumber: ria?.sebiRegNumber || 'INA000088921',
        name: ria?.name || 'Advisor',
      },
      client: {
        name: clientObj ? clientObj.name : 'Valued Client',
      },
    },
  });
});

// Password Unlock Endpoint
router.post('/mandates/:token/unlock', (req, res) => {
  const mandate = dbStore.findMandateByToken(req.params.token);
  if (!mandate) {
    return res.status(404).json({ success: false, error: 'Mandate not found' });
  }
  if (mandate.isRevoked) {
    return res.status(410).json({ success: false, revoked: true, error: 'Mandate link has been revoked' });
  }

  // Check expiry
  const now = new Date();
  if (mandate.cutoffTimestamp && new Date(mandate.cutoffTimestamp) < now) {
    return res.status(410).json({ success: false, error: 'Mandate link has expired' });
  }

  // Brute-force lockout check
  const lockout = sharedState.checkPasswordLockout(mandate.id);
  if (lockout.locked) {
    return res.status(429).json({
      success: false,
      error: 'Too many failed password attempts. This mandate link is temporarily locked for security.',
      retryAfter: lockout.retryAfter,
    });
  }

  const { password } = req.body;
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ success: false, error: 'Mandate password is required' });
  }

  try {
    const decrypted = dbStore.unlockMandateClient(req.params.token, password.trim());
    if (!decrypted) {
      throw new Error('INVALID_MANDATE_PASSWORD');
    }

    // Success: reset failed attempts
    sharedState.clearPasswordLockout(mandate.id);

    // Issue signed client unlock token valid for 2 hours
    const unlockToken = jwt.sign(
      { mandateId: mandate.id, role: 'client_viewer' },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    // Log PASSWORD_UNLOCKED audit event
    dbStore.createAuditLog({
      riaId: mandate.riaId,
      clientId: mandate.clientId,
      mandateId: mandate.id,
      eventType: 'PASSWORD_UNLOCKED',
      ipAddress: req.ip || req.connection?.remoteAddress || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Client-Device',
      metadata: { unlockMethod: 'PAN_LAST4_DOB' },
    });

    if (decrypted.status === 'sent' || decrypted.status === 'draft') {
      dbStore.updateMandate(decrypted.id, { status: 'viewed' });
      decrypted.status = 'viewed';
    }

    const client = dbStore.findClientById(mandate.clientId);
    const ria = dbStore.findUserById(mandate.riaId);
    const maskedPan = client?.pan ? `XXXXX${client.pan.slice(-5)}` : 'XXXXX0000X';
    const maskedMobile = client ? `******${client.mobile.slice(-4)}` : '******';

    return res.json({
      success: true,
      unlocked: true,
      unlockToken,
      data: {
        mandate: {
          id: decrypted.id,
          title: decrypted.title,
          status: decrypted.status,
          currentAllocation: decrypted.currentAllocation,
          proposedAllocation: decrypted.proposedAllocation,
          sellBasket: decrypted.sellBasket,
          buyBasket: decrypted.buyBasket,
          trades: decrypted.trades,
          stcgAmount: decrypted.stcgAmount,
          ltcgAmount: decrypted.ltcgAmount,
          stcgTax: decrypted.stcgTax,
          ltcgTax: decrypted.ltcgTax,
          cessAmount: decrypted.cessAmount,
          taxPayable: decrypted.taxPayable,
          advanceTaxQuarter: decrypted.advanceTaxQuarter,
          advanceTaxAlert: decrypted.advanceTaxAlert,
          cutoffTimestamp: decrypted.cutoffTimestamp,
          rationale: decrypted.rationale || decrypted.advisorRationale,
          advisorRationale: decrypted.advisorRationale || decrypted.rationale,
        },
        client: {
          name: client ? client.name : 'Valued Client',
          maskedPan,
          maskedMobile,
        },
        ria: {
          firmName: ria?.firmName || 'SEBI Registered Investment Adviser',
          sebiRegNumber: ria?.sebiRegNumber || 'INA000088921',
          name: ria?.name || 'Advisor',
        },
        chatMessages: dbStore.getMandateChat(mandate.id),
      },
    });
  } catch {
    // Record failed attempt
    const failure = sharedState.recordPasswordFailure(mandate.id, 5, 15 * 60 * 1000);
    if (failure.locked) {
      return res.status(429).json({
        success: false,
        error: 'Too many failed password attempts. This mandate link is temporarily locked for security.',
        retryAfter: failure.retryAfter,
      });
    }

    return res.status(401).json({
      success: false,
      error: 'The password is incorrect or this mandate is unavailable.',
      remainingAttempts: failure.remainingAttempts,
    });
  }
});

// Client Chat: Retrieve messages (requires unlocked session)
router.get('/mandates/:token/chat', (req, res) => {
  const mandate = dbStore.findMandateByToken(req.params.token);
  if (!mandate || mandate.isRevoked) {
    return res.status(404).json({ success: false, error: 'Mandate not found' });
  }

  const hasToken =
    req.headers['x-unlock-token'] ||
    req.headers['x-mandate-unlock-token'] ||
    req.headers['x-client-unlock-token'] ||
    req.headers.authorization ||
    req.query?.unlockToken;
  if (!hasToken) {
    return res.status(401).json({ success: false, error: 'Mandate password unlock required to view discussion' });
  }

  if (!isClientUnlocked(req, mandate.id)) {
    return res.status(403).json({ success: false, error: 'Invalid unlock token or mandate mismatch' });
  }

  const messages = dbStore.getMandateChat(mandate.id);
  res.json({ success: true, data: messages });
});

// Client Chat: Send message (requires unlocked session)
router.post('/mandates/:token/chat', (req, res) => {
  const mandate = dbStore.findMandateByToken(req.params.token);
  if (!mandate || mandate.isRevoked) {
    return res.status(404).json({ success: false, error: 'Mandate not found' });
  }

  const hasToken =
    req.headers['x-unlock-token'] ||
    req.headers['x-mandate-unlock-token'] ||
    req.headers['x-client-unlock-token'] ||
    req.headers.authorization ||
    req.body?.unlockToken;
  if (!hasToken) {
    return res.status(401).json({ success: false, error: 'Mandate password unlock required to send message' });
  }

  if (!isClientUnlocked(req, mandate.id)) {
    return res.status(403).json({ success: false, error: 'Invalid unlock token or mandate mismatch' });
  }

  const { message } = req.body;
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ success: false, error: 'Message cannot be empty' });
  }

  if (message.length > 500) {
    return res.status(400).json({ success: false, error: 'Message exceeds 500 characters limit' });
  }

  const sanitized = sanitizeHtml(message.trim());
  const client = dbStore.findClientById(mandate.clientId);

  const newMsg = dbStore.addMandateChatMessage(mandate.id, {
    sender: 'client',
    senderRole: 'client',
    senderName: client?.name || 'Client',
    message: sanitized,
  });

  res.status(201).json({ success: true, data: newMsg });
});

// Consent Clarity Assistant: Answer client question grounded strictly in proposal
router.post('/mandates/:token/assistant', async (req, res) => {
  const mandate = dbStore.findMandateByToken(req.params.token);
  if (!mandate) {
    return res.status(404).json({ success: false, error: 'Mandate not found' });
  }

  if (mandate.isRevoked) {
    return res.status(410).json({
      success: false,
      revoked: true,
      error: 'This trade mandate link has been revoked by the adviser.',
    });
  }

  // Check if cutoff has expired
  const now = new Date();
  const isCutoffExpired = mandate.cutoffTimestamp && new Date(mandate.cutoffTimestamp) < now;
  const isTokenExpired = mandate.tokenExpiresAt && new Date(mandate.tokenExpiresAt) < now;
  if (isCutoffExpired || isTokenExpired || mandate.status === 'expired') {
    return res.status(410).json({
      success: false,
      expired: true,
      error: 'This trade mandate link has expired. The market cutoff window has lapsed.',
    });
  }

  // Already consented mandates are locked from assistant questions
  if (mandate.status === 'consented' || mandate.status === 'approved') {
    return res.status(400).json({
      success: false,
      error: 'Mandate has already been consented and is locked for review.',
    });
  }

  // Require unlocked session
  const hasToken =
    req.headers['x-unlock-token'] ||
    req.headers['x-mandate-unlock-token'] ||
    req.headers['x-client-unlock-token'] ||
    req.headers.authorization ||
    req.body?.unlockToken;
  if (!hasToken) {
    return res.status(401).json({
      success: false,
      error: 'Mandate password unlock required to use the assistant',
    });
  }

  if (!isClientUnlocked(req, mandate.id)) {
    return res.status(403).json({
      success: false,
      error: 'Invalid unlock token or mandate mismatch',
    });
  }

  // Rate limiting (10 questions per 10 minutes per token)
  if (!checkRateLimit(req.params.token)) {
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded: maximum 10 assistant queries per 10 minutes.',
    });
  }

  const { question } = req.body;
  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return res.status(400).json({ success: false, error: 'Question cannot be empty' });
  }

  if (question.length > 500) {
    return res.status(400).json({ success: false, error: 'Question exceeds 500 characters limit' });
  }

  const sanitized = sanitizeHtml(question.trim());
  const client = dbStore.findClientById(mandate.clientId);

  // Post client question into human chat trail
  const clientMsg = dbStore.addMandateChatMessage(mandate.id, {
    sender: 'client',
    senderRole: 'client',
    senderName: client?.name || 'Client',
    message: sanitized,
  });

  // Decrypt proposal for assistant context
  const unlocked = unlockMandateWithServerKey(mandate);

  // Query Consent Clarity Assistant
  const result = await askConsentClarityAssistant({
    mandate: unlocked,
    question: sanitized,
  });

  if (!result.handoff && result.answerable) {
    const assistantMsg = dbStore.addMandateChatMessage(mandate.id, {
      sender: 'assistant',
      senderRole: 'assistant',
      senderName: 'Consent Clarity Assistant',
      message: result.answer,
      isAssistant: true,
      metadata: {
        reason: result.reason,
        model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
        relatedQuestionId: clientMsg?.id,
        relatedQuestion: sanitized,
      },
    });

    dbStore.createAuditLog({
      mandateId: mandate.id,
      eventType: 'ASSISTANT_QUERY',
      action: 'CONSENT_CLARITY_ASSISTANT_QUERY',
      performedBy: 'CLIENT_MOBILE_SESSION',
      riaId: mandate.riaId,
      clientId: mandate.clientId,
      channel: 'IN_APP_AI_ASSISTANT',
      metadata: {
        questionSnippet: sanitized.substring(0, 100),
        reason: result.reason,
        answerable: true,
        model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
      },
    });

    return res.status(200).json({
      success: true,
      handoff: false,
      data: assistantMsg,
    });
  } else {
    // Handoff to human adviser
    const handoffMsg = dbStore.addMandateChatMessage(mandate.id, {
      sender: 'assistant',
      senderRole: 'assistant',
      senderName: 'Consent Clarity Assistant',
      message: result.answer,
      isAssistant: true,
      handoff: true,
      metadata: {
        reason: result.reason,
        handoff: true,
        relatedQuestionId: clientMsg?.id,
        relatedQuestion: sanitized,
      },
    });

    dbStore.createAuditLog({
      mandateId: mandate.id,
      eventType: 'ASSISTANT_HANDOFF',
      action: 'CONSENT_CLARITY_ASSISTANT_HANDOFF',
      performedBy: 'CLIENT_MOBILE_SESSION',
      riaId: mandate.riaId,
      clientId: mandate.clientId,
      channel: 'IN_APP_AI_ASSISTANT',
      metadata: {
        questionSnippet: sanitized.substring(0, 100),
        reason: result.reason,
        handoff: true,
      },
    });

    return res.status(200).json({
      success: true,
      handoff: true,
      data: handoffMsg,
    });
  }
});

// Client Chat: Escalate question to human adviser (idempotent per question)
router.post('/mandates/:token/escalate', async (req, res) => {
  const mandate = dbStore.findMandateByToken(req.params.token);
  if (!mandate) {
    return res.status(404).json({ success: false, error: 'Mandate not found' });
  }

  if (mandate.isRevoked) {
    return res.status(410).json({
      success: false,
      revoked: true,
      error: 'This trade mandate link has been revoked by the adviser.',
    });
  }

  // Check expiry
  const now = new Date();
  const isCutoffExpired = mandate.cutoffTimestamp && new Date(mandate.cutoffTimestamp) < now;
  const isTokenExpired = mandate.tokenExpiresAt && new Date(mandate.tokenExpiresAt) < now;
  if (isCutoffExpired || isTokenExpired || mandate.status === 'expired') {
    return res.status(410).json({
      success: false,
      expired: true,
      error: 'This trade mandate link has expired. The market cutoff window has lapsed.',
    });
  }

  // Already consented mandates are locked
  if (mandate.status === 'consented' || mandate.status === 'approved') {
    return res.status(400).json({
      success: false,
      error: 'Mandate has already been consented and is locked for review.',
    });
  }

  // Require unlocked session
  const hasToken =
    req.headers['x-unlock-token'] ||
    req.headers['x-mandate-unlock-token'] ||
    req.headers['x-client-unlock-token'] ||
    req.headers.authorization ||
    req.body?.unlockToken;
  if (!hasToken) {
    return res.status(401).json({
      success: false,
      error: 'Mandate password unlock required to escalate question',
    });
  }

  if (!isClientUnlocked(req, mandate.id)) {
    return res.status(403).json({
      success: false,
      error: 'Invalid unlock token or mandate mismatch',
    });
  }

  const { question, assistantReply, messageId } = req.body;
  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return res.status(400).json({ success: false, error: 'Question cannot be empty' });
  }

  if (question.length > 500) {
    return res.status(400).json({ success: false, error: 'Question exceeds 500 characters limit' });
  }

  const sanitizedQuestion = sanitizeHtml(question.trim());
  const sanitizedReply = assistantReply && typeof assistantReply === 'string'
    ? sanitizeHtml(assistantReply.trim())
    : null;

  const client = dbStore.findClientById(mandate.clientId);
  const ria = dbStore.findUserById(mandate.riaId);
  const existingChat = dbStore.getMandateChat(mandate.id);

  // Check if this question was already escalated or exists in chat
  let targetMsg = null;
  if (messageId) {
    targetMsg = existingChat.find((m) => m.id === messageId);
  }
  if (!targetMsg) {
    // Find latest client message matching the question text
    for (let i = existingChat.length - 1; i >= 0; i--) {
      const m = existingChat[i];
      if (m.sender === 'client' && m.message === sanitizedQuestion) {
        targetMsg = m;
        break;
      }
    }
  }

  // Idempotency check: If already escalated, do not duplicate message or audit event
  if (targetMsg && (targetMsg.isEscalated || targetMsg.escalated)) {
    return res.status(200).json({
      success: true,
      alreadyEscalated: true,
      data: targetMsg,
      message: `Sent to ${ria?.name || 'your adviser'}. They will reply here`,
    });
  }

  let finalMsg;
  if (targetMsg) {
    // Update existing client message with escalation metadata
    targetMsg.isEscalated = true;
    targetMsg.escalated = true;
    targetMsg.tag = 'Escalated from assistant';
    if (sanitizedReply) targetMsg.relatedReply = sanitizedReply;
    finalMsg = targetMsg;
  } else {
    // Post new client message tagged as escalated
    finalMsg = dbStore.addMandateChatMessage(mandate.id, {
      sender: 'client',
      senderRole: 'client',
      senderName: client?.name || 'Client',
      message: sanitizedQuestion,
      isEscalated: true,
      escalated: true,
      tag: 'Escalated from assistant',
      relatedReply: sanitizedReply || null,
    });
  }

  // Record audit trail event CHAT_ESCALATED (append-only, zero PII)
  dbStore.createAuditLog({
    mandateId: mandate.id,
    eventType: 'CHAT_ESCALATED',
    action: 'CLIENT_CHAT_ESCALATED_TO_ADVISER',
    performedBy: 'CLIENT_MOBILE_SESSION',
    riaId: mandate.riaId,
    clientId: mandate.clientId,
    channel: 'IN_APP_CHAT',
    metadata: {
      questionSnippet: sanitizedQuestion.substring(0, 100),
      escalatedFrom: 'assistant',
      relatedReplySnippet: sanitizedReply ? sanitizedReply.substring(0, 100) : undefined,
    },
  });

  return res.status(200).json({
    success: true,
    data: finalMsg,
    message: `Sent to ${ria?.name || 'your adviser'}. They will reply here`,
  });
});

// Request 6-digit OTP (requires unlocked session)
router.post('/mandates/:token/request-otp', otpRequestLimiter, (req, res) => {
  const mandate = dbStore.findMandateByToken(req.params.token);
  if (!mandate || mandate.isRevoked) {
    return res.status(404).json({ success: false, error: 'Mandate not found' });
  }

  const hasClientUnlockToken =
    req.headers['x-unlock-token'] ||
    req.headers['x-mandate-unlock-token'] ||
    req.body?.unlockToken;

  if (hasClientUnlockToken && !isClientUnlocked(req, mandate.id)) {
    return res.status(403).json({ success: false, error: 'Invalid or expired mandate unlock token' });
  }

  if (process.env.NODE_ENV === 'production' && !isClientUnlocked(req, mandate.id)) {
    return res.status(403).json({ success: false, error: 'Mandate password unlock required before requesting OTP' });
  }

  if (mandate.status === 'approved' || mandate.status === 'consented') {
    return res.status(400).json({ success: false, error: 'This mandate is already approved and locked.' });
  }

  const client = dbStore.findClientById(mandate.clientId);
  const mobile = client ? client.mobile : '9999999999';

  // Generate 6-digit cryptographic OTP (SMS disabled; delivered via In-App / Registered Email)
  const otp = Math.floor(100000 + crypto.randomInt(900000)).toString();
  dbStore.setOtp(req.params.token, mobile, otp, 300); // 5 mins TTL

  dbStore.createAuditLog({
    mandateId: mandate.id,
    eventType: 'OTP_GENERATED',
    ipAddress: req.ip || '127.0.0.1',
    userAgent: req.headers['user-agent'] || 'Mobile-Client',
    channel: 'EMAIL_IN_APP (SMS Disabled by Policy)',
    metadata: {
      maskedMobile: `******${mobile.slice(-4)}`,
      channel: 'EMAIL_IN_APP (SMS Disabled by Policy)',
      notice: 'All SMS communications disabled by policy. Verification delivered via secure In-App / Email.',
    },
  });

  const responsePayload = {
    success: true,
    message: 'SMS communication disabled by policy. 6-digit statutory verification OTP delivered via In-App Secure Display & Registered Email.',
    channel: 'EMAIL_IN_APP',
    maskedMobile: `******${mobile.slice(-4)}`,
  };

  // Only expose demoOtp in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    responsePayload.demoOtp = otp;
  }

  res.json(responsePayload);
});

// Verify 6-digit OTP and Statutory Consent (requires unlocked session)
router.post('/mandates/:token/verify-otp', otpVerifyLimiter, (req, res) => {
  const { otp, statutoryDeclarationsAccepted } = req.body;
  const mandate = dbStore.findMandateByToken(req.params.token);

  if (!mandate || mandate.isRevoked) {
    return res.status(404).json({ success: false, error: 'Mandate not found' });
  }

  const hasClientUnlockToken =
    req.headers['x-unlock-token'] ||
    req.headers['x-mandate-unlock-token'] ||
    req.body?.unlockToken;

  if (hasClientUnlockToken && !isClientUnlocked(req, mandate.id)) {
    return res.status(403).json({ success: false, error: 'Invalid or expired mandate unlock token' });
  }

  if (process.env.NODE_ENV === 'production' && !isClientUnlocked(req, mandate.id)) {
    return res.status(403).json({ success: false, error: 'Mandate password unlock required before granting consent' });
  }

  if (mandate.status === 'approved' || mandate.status === 'consented') {
    return res.status(400).json({ success: false, error: 'Mandate is already approved and locked.' });
  }

  if (!otp) {
    return res.status(400).json({ success: false, error: '6-digit OTP code is required' });
  }

  if (!statutoryDeclarationsAccepted) {
    return res.status(400).json({
      success: false,
      error: 'You must explicitly accept the statutory risk disclosures, non-discretionary authority terms, and Indian capital gains tax acknowledgement.',
    });
  }

  // Verify OTP via distributed shared state store
  const verificationResult = sharedState.verifyOtp(req.params.token, otp);
  if (!verificationResult.valid) {
    if (verificationResult.locked) {
      dbStore.createAuditLog({
        riaId: mandate.riaId,
        clientId: mandate.clientId,
        mandateId: mandate.id,
        eventType: 'OTP_LOCKOUT',
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'Mobile-Client',
        metadata: { reason: 'Maximum OTP verification attempts exceeded' },
      });
      return res.status(429).json({ success: false, locked: true, error: verificationResult.reason });
    }
    return res.status(400).json({
      success: false,
      error: verificationResult.reason,
      remainingAttempts: verificationResult.remainingAttempts,
    });
  }

  // Update mandate status to consented
  const updatedMandate = dbStore.updateMandate(mandate.id, {
    status: 'consented',
    consentedAt: new Date().toISOString(),
  });

  const client = dbStore.findClientById(mandate.clientId);
  const ria = dbStore.findUserById(mandate.riaId);

  // Generate Section 65B Electronic Evidence compliant Audit Certificate
  const timestampIST = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const auditReceipt = {
    receiptId: `REC-${mandate.id.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
    mandateId: mandate.id,
    mandateTitle: mandate.title,
    clientName: client ? client.name : 'Advisory Client',
    clientPan: client ? client.pan : 'XXXXX0000X',
    riaFirmName: ria ? ria.firmName : 'SEBI Registered Investment Adviser',
    riaSebiReg: ria ? ria.sebiRegNumber : 'INA000088921',
    consentedAtIST: timestampIST,
    authChannel: 'EMAIL_IN_APP_OTP',
    status: 'LEGALLY_SEALED_CONSENTED',
    statutoryAct: 'Section 63 Bharatiya Sakshya Adhiniyam (BSA), 2023 / Section 65B Indian Evidence Act',
    dataResidency: 'AWS Mumbai (ap-south-1)',
    preComputedTax: {
      taxPayable: mandate.taxPayable,
      stcgTax: mandate.stcgTax,
      ltcgTax: mandate.ltcgTax,
      cessAmount: mandate.cessAmount,
    },
  };

  const auditString = JSON.stringify(auditReceipt);
  const sha256Hash = crypto.createHash('sha256').update(auditString).digest('hex');
  auditReceipt.sha256Hash = sha256Hash;

  // Commit immutable audit log
  dbStore.createAuditLog({
    riaId: mandate.riaId,
    clientId: mandate.clientId,
    mandateId: mandate.id,
    eventType: 'CONSENTED',
    ipAddress: req.ip || req.connection?.remoteAddress || '127.0.0.1',
    userAgent: req.headers['user-agent'] || 'Mobile-Client',
    channel: 'EMAIL_IN_APP_OTP',
    payloadHash: sha256Hash,
    metadata: {
      certificate: auditReceipt,
      statutoryDeclarations: ['SEBI IA Reg 19 5-Year Record Retention', 'Section 63 BSA / Section 65B Admissibility', 'Capital Gains Tax Estimate Transparency'],
    },
  });

  res.json({
    success: true,
    message: 'Trade mandate successfully authorized and locked under Section 63 BSA, 2023 / Section 65B Evidence Act.',
    data: {
      mandate: updatedMandate,
      auditCertificate: auditReceipt,
    },
  });
});

export default router;
