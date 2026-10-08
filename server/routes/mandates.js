import express from 'express';
import crypto from 'node:crypto';
import { dbStore } from '../db/store.js';
import { requireAuth, requireRole } from '../auth/middleware.js';

const router = express.Router();
router.use(requireAuth);

// Indian Capital Gains Tax Calculation Engine (Finance Act 2024 / FY 2026-27)
function computeTaxesAndDeadlines(stcgAmount, ltcgAmount) {
  const stcg = Math.max(0, Number(stcgAmount) || 0);
  const ltcg = Math.max(0, Number(ltcgAmount) || 0);

  // STCG @ 20%
  const stcgTax = Math.round(stcg * 0.20);

  // LTCG @ 12.5% above ₹1,25,000 exemption
  const taxableLtcg = Math.max(0, ltcg - 125000);
  const ltcgTax = Math.round(taxableLtcg * 0.125);

  // Health and Education Cess @ 4%
  const subtotalTax = stcgTax + ltcgTax;
  const cessAmount = Math.round(subtotalTax * 0.04);
  const taxPayable = subtotalTax + cessAmount;

  // Compute upcoming Advance Tax installment
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();

  let advanceTaxQuarter = '4th Installment - Due 15th March';
  if (month < 6 || (month === 6 && day <= 15)) {
    advanceTaxQuarter = '1st Installment (15%) - Due 15th June';
  } else if (month < 9 || (month === 9 && day <= 15)) {
    advanceTaxQuarter = '2nd Installment (45%) - Due 15th September';
  } else if (month < 12 || (month === 12 && day <= 15)) {
    advanceTaxQuarter = '3rd Installment (75%) - Due 15th December';
  } else {
    advanceTaxQuarter = '4th Installment (100%) - Due 15th March';
  }

  const advanceTaxAlert = taxPayable > 0
    ? `Estimated capital gains tax of ₹${taxPayable.toLocaleString('en-IN')} is applicable for FY 2026-27. Account for this prior to the ${advanceTaxQuarter} deadline to mitigate penal interest under Section 234B/234C.`
    : 'No net capital gains tax obligation pre-computed for this reallocation.';

  return { stcg, ltcg, stcgTax, ltcgTax, cessAmount, taxPayable, advanceTaxQuarter, advanceTaxAlert };
}

// List mandates (RBAC & Tenant Isolation)
// - Compliance Officer & Admin: View all platform mandates
// - RIA: View mandates drafted by their own firm
// - Client: View rebalance mandates prepared strictly for this client
router.get('/', (req, res) => {
  const { status } = req.query;
  let mandates = [];

  if (req.user.role === 'compliance_officer' || req.user.role === 'admin') {
    mandates = dbStore.findAllMandates(status);
  } else if (req.user.role === 'ria') {
    mandates = dbStore.findMandatesByRiaId(req.user.id, status);
  } else if (req.user.role === 'client') {
    const userEmail = req.user.email?.toLowerCase();
    const userPan = req.user.pan?.toUpperCase();
    const clientIds = dbStore
      .findClients()
      .filter((c) => (userEmail && c.email?.toLowerCase() === userEmail) || (userPan && c.pan?.toUpperCase() === userPan) || c.userId === req.user.id)
      .map((c) => c.id);

    mandates = dbStore
      .findAllMandates(status)
      .filter((m) => clientIds.includes(m.clientId));
  }

  // Enrich with client details and RIA firm details for consistent presentation
  const enriched = mandates.map((m) => {
    const client = dbStore.findClientById(m.clientId);
    const ria = dbStore.findUserById(m.riaId);
    let magicToken = dbStore.getActiveMagicToken(m.id);
    if (!magicToken && (m.status === 'in_review' || m.status === 'sent' || m.status === 'viewed') && !m.isRevoked) {
      magicToken = crypto.randomBytes(32).toString('hex');
      dbStore.updateMandate(m.id, { magicToken });
    }
    return {
      ...m,
      magicToken: magicToken || undefined,
      clientName: client?.name || 'Advisory Client',
      clientPan: client?.pan,
      clientMobile: client?.mobile,
      riaFirmName: ria?.firmName || 'Registered Investment Adviser',
      riaSebiReg: ria?.sebiRegNumber || 'INA000088921',
    };
  });

  res.json({ success: true, data: enriched });
});

// Create mandate (RBAC: Restricted to RIA and Admin)
router.post('/', requireRole(['ria', 'admin']), (req, res) => {
  const {
    clientId,
    title,
    rationale,
    currentAllocation,
    proposedAllocation,
    sellBasket = [],
    buyBasket = [],
    stcgAmount = 0,
    ltcgAmount = 0,
    cutoffHours = 24,
  } = req.body;

  if (!clientId || !title) {
    return res.status(400).json({ success: false, error: 'Client selection and title are required' });
  }

  const client = dbStore.findClientById(clientId);
  if (!client || client.riaId !== req.user.id) {
    return res.status(404).json({ success: false, error: 'Selected client not found' });
  }

  // Quota enforcement: Free tier allows maximum 3 mandates per calendar month
  if (req.user.plan !== 'pro') {
    const monthlyCount = dbStore.countMonthlyMandates(req.user.id);
    if (monthlyCount >= 3) {
      return res.status(403).json({
        success: false,
        error: 'Free tier quota limit reached (maximum 3 mandates per calendar month). Upgrade to Pro RIA to dispatch unlimited mandates.',
        quotaExceeded: true,
        upgradePrompt: {
          title: 'Free Tier Monthly Mandate Quota Exceeded',
          message: 'You have reached the monthly statutory limit of 3 trade mandates. Upgrade to FinConsent Pro (₹4,999/yr) for unlimited client authorizations, automated WhatsApp reminders, and SEBI-ready audit exports.',
          whatsappUpgradeUrl: `https://wa.me/919876543210?text=${encodeURIComponent('Hi FinConsent team, I want to upgrade to the Pro Tier (₹4,999/yr) to publish unlimited trade mandates.')}`,
          billingUrl: '/billing',
        },
      });
    }
  }

  const taxCalcs = computeTaxesAndDeadlines(stcgAmount, ltcgAmount);
  const cutoffTimestamp = new Date(Date.now() + (Number(cutoffHours) || 48) * 60 * 60 * 1000).toISOString();
  const magicToken = crypto.randomBytes(32).toString('hex');

  const mandate = dbStore.createMandate({
    riaId: req.user.id,
    clientId,
    title,
    rationale: rationale || 'Trimming appreciated equity positions to rebalance asset allocation into high-quality debt & liquid instruments per risk profile and volatility protection.',
    currentAllocation: currentAllocation || { equity: 70, debt: 20, gold: 5, cash: 5 },
    proposedAllocation: proposedAllocation || { equity: 60, debt: 25, gold: 10, cash: 5 },
    sellBasket,
    buyBasket,
    ...taxCalcs,
    cutoffTimestamp,
    magicToken,
    status: 'draft',
  });

  dbStore.createAuditLog({
    mandateId: mandate.id,
    eventType: 'CREATED',
    ipAddress: req.ip || '127.0.0.1',
    userAgent: req.headers['user-agent'] || 'API-Client',
    metadata: { title: mandate.title, taxPayable: mandate.taxPayable },
  });

  res.status(201).json({ success: true, data: mandate });
});

// Get mandate detail with audit trail (RBAC & Tenant boundary enforcement)
router.get('/:id', (req, res) => {
  const mandate = dbStore.findMandateById(req.params.id);
  if (!mandate) {
    return res.status(404).json({ success: false, error: 'Mandate not found' });
  }

  const client = dbStore.findClientById(mandate.clientId);

  // Tenant Boundary Authorization
  if (req.user.role === 'ria') {
    if (mandate.riaId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized: You can only access mandates belonging to your advisory firm' });
    }
  } else if (req.user.role === 'client') {
    const userEmail = req.user.email?.toLowerCase();
    const userPan = req.user.pan?.toUpperCase();
    const isOwner = client && (
      (userEmail && client.email?.toLowerCase() === userEmail) ||
      (userPan && client.pan?.toUpperCase() === userPan) ||
      client.userId === req.user.id
    );
    if (!isOwner) {
      return res.status(403).json({ success: false, error: 'Unauthorized: You can only view mandates prepared for your account' });
    }
  } else if (req.user.role !== 'compliance_officer' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Unauthorized role' });
  }

  const ria = dbStore.findUserById(mandate.riaId);
  const auditLogs = dbStore.getAuditLogsForMandate(mandate.id);

  let magicToken = dbStore.getActiveMagicToken(mandate.id);
  if (!magicToken && (mandate.status === 'in_review' || mandate.status === 'sent' || mandate.status === 'viewed') && !mandate.isRevoked) {
    magicToken = crypto.randomBytes(32).toString('hex');
    dbStore.updateMandate(mandate.id, { magicToken });
  }

  res.json({
    success: true,
    data: {
      ...mandate,
      magicToken: magicToken || undefined,
      client,
      ria: {
        firmName: ria?.firmName || 'Registered Investment Adviser',
        sebiRegNumber: ria?.sebiRegNumber || 'INA000088921',
        complianceEmail: ria?.complianceEmail || 'compliance@advisor.in',
      },
      auditLogs,
    },
  });
});

// Dispatch mandate
router.post('/:id/dispatch', requireRole(['ria', 'admin']), (req, res) => {
  const mandate = dbStore.findMandateById(req.params.id);
  if (!mandate) {
    return res.status(404).json({ success: false, error: 'Mandate not found' });
  }

  if (mandate.riaId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Unauthorized: You can only dispatch mandates belonging to your advisory firm' });
  }

  if (mandate.status === 'consented' || mandate.status === 'approved') {
    return res.status(400).json({ success: false, error: 'Cannot re-dispatch an already consented and legally sealed mandate' });
  }

  let rawMagicToken = dbStore.getActiveMagicToken(mandate.id);
  if (!rawMagicToken) {
    rawMagicToken = crypto.randomBytes(32).toString('hex');
  }

  const tokenExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
  const cutoffTimestamp = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

  const updated = dbStore.updateMandate(mandate.id, {
    status: 'in_review',
    magicToken: rawMagicToken,
    tokenExpiresAt,
    cutoffTimestamp,
  });

  dbStore.createAuditLog({
    mandateId: mandate.id,
    eventType: 'DISPATCHED',
    ipAddress: req.ip || '127.0.0.1',
    userAgent: req.headers['user-agent'] || 'API-Client',
    channel: 'WHATSAPP_EMAIL (SMS Disabled)',
    metadata: {
      magicTokenHash: updated.magicTokenHash || crypto.createHash('sha256').update(rawMagicToken).digest('hex'),
      clientPhone: 'Registered Mobile',
    },
  });

  res.json({ success: true, data: { ...updated, magicToken: rawMagicToken } });
});

// Revoke & Regenerate Link (immediately invalidates prior token)
router.post('/:id/revoke-link', requireRole(['ria', 'admin']), (req, res) => {
  const mandate = dbStore.findMandateById(req.params.id);
  if (!mandate) {
    return res.status(404).json({ success: false, error: 'Mandate not found' });
  }

  if (mandate.riaId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Unauthorized: You can only revoke links for mandates belonging to your advisory firm' });
  }

  if (mandate.status === 'consented' || mandate.status === 'approved') {
    return res.status(400).json({ success: false, error: 'Cannot revoke or regenerate access link for an already consented mandate' });
  }

  const oldTokenHash = mandate.magicTokenHash;
  const newToken = crypto.randomBytes(32).toString('hex');
  const tokenExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

  const updated = dbStore.updateMandate(mandate.id, {
    magicToken: newToken,
    tokenExpiresAt,
  });

  dbStore.createAuditLog({
    mandateId: mandate.id,
    eventType: 'LINK_REVOKED',
    ipAddress: req.ip || '127.0.0.1',
    userAgent: req.headers['user-agent'] || 'API-Client',
    channel: 'SYSTEM_API',
    metadata: { oldTokenHash, newTokenIssued: true },
  });

  res.json({ success: true, data: { ...updated, magicToken: newToken } });
});

// SEBI Regulation 19 Compliance Dossier (RBAC: RIA, Compliance Officer, Admin)
router.get('/:id/dossier', requireRole(['ria', 'compliance_officer', 'admin']), (req, res) => {
  const mandate = dbStore.findMandateById(req.params.id);
  if (!mandate) {
    return res.status(404).json({ success: false, error: 'Mandate not found' });
  }

  const isAuthorized = mandate.riaId === req.user.id || req.user.role === 'compliance_officer' || req.user.role === 'admin';
  if (!isAuthorized) {
    return res.status(403).json({ success: false, error: 'Unauthorized to access this compliance dossier' });
  }

  const client = dbStore.findClientById(mandate.clientId);
  const auditLogs = dbStore.getAuditLogsForMandate(mandate.id);

  res.json({
    success: true,
    data: {
      mandate,
      client,
      ria: {
        name: req.user.name,
        firmName: req.user.firmName,
        sebiRegNumber: req.user.sebiRegNumber,
        complianceEmail: req.user.complianceEmail,
      },
      auditLogs,
      regulatoryAct: 'SEBI (Investment Advisers) Regulations, 2013 - Regulation 19',
      evidenceActNotice: 'Certified under Section 65B of the Indian Evidence Act, 1872',
      generatedAt: new Date().toISOString(),
    },
  });
});

export default router;
