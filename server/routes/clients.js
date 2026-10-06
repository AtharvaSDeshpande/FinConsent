import express from 'express';
import { dbStore } from '../db/store.js';
import { requireAuth } from '../auth/middleware.js';

const router = express.Router();
router.use(requireAuth);

// List clients
router.get('/', (req, res) => {
  const clients = dbStore.findClientsByRiaId(req.user.id);
  res.json({ success: true, data: clients });
});

// Create client
router.post('/', (req, res) => {
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

// Single client
router.get('/:id', (req, res) => {
  const client = dbStore.findClientById(req.params.id);
  if (!client || client.riaId !== req.user.id) {
    return res.status(404).json({ success: false, error: 'Client not found' });
  }
  res.json({ success: true, data: client });
});

export default router;
