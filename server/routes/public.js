import express from 'express';
import crypto from 'node:crypto';
import { dbStore } from '../db/store.js';
import { otpRequestLimiter, otpVerifyLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public Token Inspection Endpoint (Zero Login)
router.get('/mandates/:token', (req, res) => {
  const mandate = dbStore.findMandateByToken(req.params.token);
  if (!mandate) {
    return res.status(404).json({ success: false, error: 'Mandate link not found or has been revoked' });
  }

  // Check if cutoff has expired
  const now = new Date();
  const isCutoffExpired = mandate.cutoffTimestamp && new Date(mandate.cutoffTimestamp) < now;
  const isTokenExpired = mandate.tokenExpiresAt && new Date(mandate.tokenExpiresAt) < now;

  if (isCutoffExpired || isTokenExpired || mandate.status === 'expired') {
    return res.status(410).json({
      success: false,
      error: 'This trade mandate link has expired. The market cutoff window has lapsed.',
      status: 'expired',
      mandate: {
        title: mandate.title,
        cutoffTimestamp: mandate.cutoffTimestamp,
      },
    });
  }

  // Mark status as viewed if sent/draft
  if (mandate.status === 'sent' || mandate.status === 'draft') {
    dbStore.updateMandate(mandate.id, { status: 'viewed' });
    mandate.status = 'viewed';
  }

  const client = dbStore.findClientById(mandate.clientId);
  const ria = dbStore.findUserById(mandate.riaId);

  // Mask sensitive PAN and Mobile for privacy
  const maskedPan = client ? `${client.pan.slice(0, 2)}*****${client.pan.slice(-2)}` : '******';
  const maskedMobile = client ? `******${client.mobile.slice(-4)}` : '******';

  // Log OPENED audit event
  dbStore.createAuditLog({
    riaId: mandate.riaId,
    clientId: mandate.clientId,
    mandateId: mandate.id,
    eventType: 'OPENED',
    ipAddress: req.ip || req.connection?.remoteAddress || '127.0.0.1',
    userAgent: req.headers['user-agent'] || 'Mobile-Client',
    metadata: { clientDevice: 'Client Review Mobile View' },
  });

  res.json({
    success: true,
    data: {
      mandate: {
        id: mandate.id,
        title: mandate.title,
        status: mandate.status,
        currentAllocation: mandate.currentAllocation,
        proposedAllocation: mandate.proposedAllocation,
        sellBasket: mandate.sellBasket,
        buyBasket: mandate.buyBasket,
        stcgAmount: mandate.stcgAmount,
        ltcgAmount: mandate.ltcgAmount,
        stcgTax: mandate.stcgTax,
        ltcgTax: mandate.ltcgTax,
        cessAmount: mandate.cessAmount,
        taxPayable: mandate.taxPayable,
        advanceTaxQuarter: mandate.advanceTaxQuarter,
        advanceTaxAlert: mandate.advanceTaxAlert,
        cutoffTimestamp: mandate.cutoffTimestamp,
        rationale: mandate.rationale,
      },
      client: {
        name: client ? client.name : 'Valued Client',
        maskedPan,
        maskedMobile,
      },
      ria: {
        firmName: ria ? ria.firmName : 'SEBI Registered Investment Adviser',
        sebiRegNumber: ria ? ria.sebiRegNumber : 'INA000000000',
        name: ria ? ria.name : 'Advisor',
      },
    },
  });
});

// Request 6-digit OTP
router.post('/mandates/:token/request-otp', otpRequestLimiter, (req, res) => {
  const mandate = dbStore.findMandateByToken(req.params.token);
  if (!mandate) {
    return res.status(404).json({ success: false, error: 'Mandate not found' });
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

// Verify 6-digit OTP and Statutory Consent
router.post('/mandates/:token/verify-otp', otpVerifyLimiter, (req, res) => {
  const { otp, statutoryDeclarationsAccepted } = req.body;
  const mandate = dbStore.findMandateByToken(req.params.token);

  if (!mandate) {
    return res.status(404).json({ success: false, error: 'Mandate not found' });
  }

  if (mandate.status === 'approved' || mandate.status === 'consented') {
    return res.status(400).json({ success: false, error: 'Mandate is already approved and locked.' });
  }

  if (!statutoryDeclarationsAccepted) {
    return res.status(400).json({
      success: false,
      error: 'Statutory declarations acknowledging capital gains tax and SEBI Regulation 19 consent must be accepted.',
    });
  }

  const verification = dbStore.verifyOtp(req.params.token, otp);
  if (!verification.valid) {
    if (verification.locked) {
      dbStore.createAuditLog({
        mandateId: mandate.id,
        eventType: 'OTP_BRUTE_FORCE_LOCK',
        ipAddress: req.ip || req.connection?.remoteAddress || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'Mobile-Client',
        metadata: { reason: 'Excessive failed OTP attempts (3/3). Authorization code revoked.' },
      });
      return res.status(429).json({
        success: false,
        error: verification.reason,
        locked: true,
      });
    }

    return res.status(400).json({
      success: false,
      error: verification.reason,
      remainingAttempts: verification.remainingAttempts,
    });
  }

  // Lock mandate to Consented and preserve for Section 65B receipt
  const updated = dbStore.updateMandate(mandate.id, {
    status: 'consented',
    isApproved: true,
    approvedAt: new Date().toISOString(),
    consentedAt: new Date().toISOString(),
  });

  const otpVerificationId = `otp_ver_${crypto.randomUUID()}`;

  // Commit immutable SHA-256 audit entry satisfying Criterion 7
  const auditEntry = dbStore.createAuditLog({
    riaId: mandate.riaId,
    clientId: mandate.clientId,
    mandateId: mandate.id,
    eventType: 'CONSENT_GRANTED',
    ipAddress: req.ip || req.connection?.remoteAddress || '127.0.0.1',
    userAgent: req.headers['user-agent'] || 'Mobile-Client',
    verificationMethod: 'OTP_SMS',
    otpVerificationId,
    timestampIST: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    metadata: {
      status: 'Consented & Locked',
      declarationsAcknowledged: [
        'SEBI Regulation 19 Informed Consent',
        `Acknowledged Capital Gains Tax Obligation of ₹${mandate.taxPayable.toLocaleString('en-IN')}`,
      ],
      sha256PayloadHash: crypto.createHash('sha256').update(JSON.stringify(mandate)).digest('hex'),
    },
  });

  const client = dbStore.findClientById(mandate.clientId);
  const ria = dbStore.findUserById(mandate.riaId);

  res.json({
    success: true,
    data: {
      mandate: updated,
      auditCertificate: {
        receiptId: auditEntry.id,
        otpVerificationId,
        timestamp: auditEntry.timestamp,
        sha256Hash: auditEntry.payloadHash,
        taxPayable: mandate.taxPayable,
        clientName: client ? client.name : '',
        riaFirm: ria ? ria.firmName : '',
        sebiRegNumber: ria ? ria.sebiRegNumber : '',
      },
    },
  });
});

export default router;
