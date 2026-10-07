import express from 'express';
import { dbStore } from '../db/store.js';
import { requireAuth, requireRole } from '../auth/middleware.js';

const router = express.Router();
router.use(requireAuth);

// List clients (RBAC: RIA views own; Compliance Officer & Admin view full registry; Forbidden for Client)
router.get('/', (req, res) => {
  if (req.user.role === 'client') {
    return res.status(403).json({ success: false, error: 'Unauthorized: Clients cannot access advisor client directories' });
  }

  const isSuperUser = req.user.role === 'compliance_officer' || req.user.role === 'admin';
  const clients = isSuperUser ? dbStore.findClients() : dbStore.findClientsByRiaId(req.user.id);
  res.json({ success: true, data: clients });
});

// Create client (RBAC: Strictly RIA & Admin)
router.post('/', requireRole(['ria', 'admin']), (req, res) => {
  const { name, pan, mobile, email, portfolioValue } = req.body;

  if (!name || !pan || !mobile || !email) {
    return res.status(400).json({ success: false, error: 'Name, PAN, mobile number, and email are required' });
  }

  // PAN Format validation: 5 uppercase letters, 4 digits, 1 uppercase letter
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/i;
  if (!panRegex.test(pan.trim())) {
    return res.status(400).json({ success: false, error: 'Invalid Indian PAN format. Must be 10 characters (e.g. ABCDE1234F)' });
  }

  // Indian Mobile format: 10 digits starting with 6, 7, 8, or 9
  const mobileClean = mobile.replace(/\D/g, '');
  if (mobileClean.length !== 10 || !/^[6-9]/.test(mobileClean)) {
    return res.status(400).json({ success: false, error: 'Invalid 10-digit Indian mobile number' });
  }

  const client = dbStore.createClient({
    riaId: req.user.id,
    name: name.trim(),
    pan: pan.trim().toUpperCase(),
    mobile: mobileClean,
    email: email.trim().toLowerCase(),
    portfolioValue: Number(portfolioValue) || 0,
  });

  res.status(201).json({ success: true, data: client });
});

// Single client (Tenant & RBAC Boundary)
router.get('/:id', (req, res) => {
  const client = dbStore.findClientById(req.params.id);
  if (!client) {
    return res.status(404).json({ success: false, error: 'Client not found' });
  }

  if (req.user.role === 'ria' && client.riaId !== req.user.id) {
    return res.status(403).json({ success: false, error: 'Unauthorized: You can only view clients of your advisory firm' });
  }

  if (req.user.role === 'client') {
    const userEmail = req.user.email?.toLowerCase();
    const userPan = req.user.pan?.toUpperCase();
    const isSelf = (userEmail && client.email?.toLowerCase() === userEmail) ||
                   (userPan && client.pan?.toUpperCase() === userPan) ||
                   client.userId === req.user.id;
    if (!isSelf) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }
  }

  res.json({ success: true, data: client });
});

export default router;
