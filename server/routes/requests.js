import express from 'express';
import { dbStore } from '../db/store.js';
import { requireAuth } from '../auth/middleware.js';

const router = express.Router();
router.use(requireAuth);

// List advisory / compliance requests (RBAC & Tenant isolation)
router.get('/', (req, res) => {
  const { status, category } = req.query;
  let requests = [];

  if (req.user.role === 'admin' || req.user.role === 'compliance_officer') {
    requests = dbStore.findRequests({ status });
  } else if (req.user.role === 'client') {
    requests = dbStore.findRequests({ status }).filter((r) => r.userId === req.user.id);
  } else if (req.user.role === 'ria') {
    const riaClientIds = new Set(dbStore.findClientsByRiaId(req.user.id).map((c) => c.id));
    requests = dbStore.findRequests({ status }).filter((r) => {
      return (
        r.userId === req.user.id ||
        r.assignedTo === req.user.id ||
        (r.clientId && riaClientIds.has(r.clientId))
      );
    });
  }

  if (category) {
    requests = requests.filter((r) => r.category === category);
  }

  res.json({ success: true, data: requests });
});

// Get request by ID (Tenant & Role boundary enforcement)
router.get('/:id', (req, res) => {
  const request = dbStore.findRequestById(req.params.id);
  if (!request) {
    return res.status(404).json({ success: false, error: 'Request not found' });
  }

  if (req.user.role === 'client' && request.userId !== req.user.id) {
    return res.status(403).json({ success: false, error: 'Unauthorized: You can only access your own advisory inquiries' });
  }

  if (req.user.role === 'ria') {
    const riaClientIds = new Set(dbStore.findClientsByRiaId(req.user.id).map((c) => c.id));
    const isPermitted = request.userId === req.user.id ||
                        request.assignedTo === req.user.id ||
                        (request.clientId && riaClientIds.has(request.clientId));
    if (!isPermitted) {
      return res.status(403).json({ success: false, error: 'Unauthorized: Request does not belong to your advisory practice' });
    }
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
  let targetClientId = clientId;
  if (req.user.role === 'client') {
    // Automatically bind client identity for investor inquiries
    const userEmail = req.user.email?.toLowerCase();
    const userPan = req.user.pan?.toUpperCase();
    const clientRecord = dbStore.findClients().find((c) => (userEmail && c.email?.toLowerCase() === userEmail) || (userPan && c.pan?.toUpperCase() === userPan) || c.userId === req.user.id);
    if (clientRecord) {
      targetClientId = clientRecord.id;
      clientName = clientRecord.name;
    } else {
      clientName = req.user.name;
    }
  } else if (clientId) {
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
    clientId: targetClientId,
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

// Update request status or add advisory response (Role Authorization Enforced)
router.put('/:id', (req, res) => {
  const request = dbStore.findRequestById(req.params.id);
  if (!request) {
    return res.status(404).json({ success: false, error: 'Request not found' });
  }

  const { status, responseNotes } = req.body;

  // Authorization: Client cannot approve, scrutinize, or complete requests
  if (req.user.role === 'client') {
    if (request.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized: You can only update your own requests' });
    }
    if (status && status !== 'pending' && status !== 'cancelled') {
      return res.status(403).json({ success: false, error: 'Investors cannot modify request status to ' + status });
    }
  }

  // Authorization: RIA can only update requests belonging to their advisory practice
  if (req.user.role === 'ria') {
    const riaClientIds = new Set(dbStore.findClientsByRiaId(req.user.id).map((c) => c.id));
    const isPermitted = request.userId === req.user.id ||
                        request.assignedTo === req.user.id ||
                        (request.clientId && riaClientIds.has(request.clientId));
    if (!isPermitted) {
      return res.status(403).json({ success: false, error: 'Unauthorized: Request does not belong to your advisory practice' });
    }
  }

  const updates = {};
  if (status) updates.status = status;
  if (responseNotes) updates.responseNotes = responseNotes;

  const updated = dbStore.updateRequest(req.params.id, updates);
  res.json({ success: true, data: updated });
});

export default router;
