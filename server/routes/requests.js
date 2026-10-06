import express from 'express';
import { dbStore } from '../db/store.js';
import { requireAuth } from '../auth/middleware.js';

const router = express.Router();
router.use(requireAuth);

// List advisory / compliance requests
router.get('/', (req, res) => {
  const { status, category } = req.query;
  let requests = dbStore.findRequests({
    userId: req.user.id,
    role: req.user.role,
    status,
  });

  if (category) {
    requests = requests.filter((r) => r.category === category);
  }

  res.json({ success: true, data: requests });
});

// Get request by ID
router.get('/:id', (req, res) => {
  const request = dbStore.findRequestById(req.params.id);
  if (!request) {
    return res.status(404).json({ success: false, error: 'Request not found' });
  }
  res.json({ success: true, data: request });
});

// Compose & submit new request (Authenticated users across roles)
router.post('/', (req, res) => {
  const {
    title,
    category = 'Portfolio Rebalance Advisory',
    clientId,
    priority = 'standard',
    description,
    proposedEquityRatio = 60,
    proposedDebtRatio = 25,
    proposedGoldRatio = 10,
    proposedCashRatio = 5,
  } = req.body;

  if (!title || !description) {
    return res.status(400).json({
      success: false,
      error: 'Request title and detailed description are required',
    });
  }

  let clientName = 'General Advisory Client';
  if (clientId) {
    const client = dbStore.findClientById(clientId);
    if (client) {
      clientName = client.name;
    }
  }

  const newRequest = dbStore.createRequest({
    userId: req.user.id,
    userRole: req.user.role || 'ria',
    userName: req.user.name,
    userFirm: req.user.firmName,
    clientId,
    clientName,
    category,
    title,
    priority,
    description,
    proposedEquityRatio: Number(proposedEquityRatio),
    proposedDebtRatio: Number(proposedDebtRatio),
    proposedGoldRatio: Number(proposedGoldRatio),
    proposedCashRatio: Number(proposedCashRatio),
    status: 'pending',
  });

  // Log in append-only audit trail
  dbStore.createAuditLog({
    eventType: 'REQUEST_SUBMITTED',
    requestId: newRequest.id,
    userId: req.user.id,
    channel: 'IN_APP_COMPOSER',
    metadata: {
      category,
      title,
      priority,
      userRole: req.user.role,
    },
  });

  res.status(201).json({ success: true, data: newRequest });
});

// Update request status or add advisory response
router.put('/:id', (req, res) => {
  const { status, responseNotes } = req.body;
  const updates = {};
  if (status) updates.status = status;
  if (responseNotes) updates.responseNotes = responseNotes;

  const updated = dbStore.updateRequest(req.params.id, updates);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Request not found' });
  }

  res.json({ success: true, data: updated });
});

export default router;
