import express from 'express';
import { dbStore } from '../db/store.js';
import { hashPassword, comparePassword } from '../auth/passwords.js';
import { signToken } from '../auth/jwt.js';
import { requireAuth } from '../auth/middleware.js';

const router = express.Router();

// Register RIA
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, firmName, sebiRegNumber, complianceEmail } = req.body;

    if (!name || !email || !password || !firmName || !sebiRegNumber) {
      return res.status(400).json({ success: false, error: 'All mandatory fields must be provided' });
    }

    const sebiRegex = /^INA\d{9}$/i;
    if (!sebiRegex.test(sebiRegNumber.trim())) {
      return res.status(400).json({ success: false, error: 'Invalid SEBI INA registration number format' });
    }

    const existing = dbStore.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, error: 'An RIA account already exists with this email address' });
    }

    const passwordHash = await hashPassword(password);
    const user = dbStore.createUser({
      name,
      email,
      passwordHash,
      firmName,
      sebiRegNumber: sebiRegNumber.toUpperCase(),
      complianceEmail: complianceEmail || email,
      plan: 'free',
    });

    const token = signToken({ userId: user.id });
    const { passwordHash: _, ...userSafe } = user;

    res.status(201).json({ success: true, token, user: userSafe });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Login RIA
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const user = dbStore.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = signToken({ userId: user.id });
    const { passwordHash: _, ...userSafe } = user;

    res.json({ success: true, token, user: userSafe });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Current User & Quota status
router.get('/me', requireAuth, (req, res) => {
  const { passwordHash: _, ...userSafe } = req.user;
  const activeMandates = dbStore.countActiveMandates(req.user.id);
  const quotaLimit = req.user.plan === 'pro' ? Infinity : 3;

  res.json({
    success: true,
    user: userSafe,
    quota: {
      activeMandates,
      quotaLimit,
      canCreate: req.user.plan === 'pro' || activeMandates < 3,
    },
  });
});

// Update RIA Profile (e.g. INA number, firm name)
router.put('/profile', requireAuth, (req, res) => {
  const { sebiRegNumber, firmName, complianceEmail } = req.body;
  const updates = {};

  if (sebiRegNumber) {
    const sebiRegex = /^INA\d{9}$/i;
    if (!sebiRegex.test(sebiRegNumber.trim())) {
      return res.status(400).json({ success: false, error: 'Invalid SEBI INA registration number format' });
    }
    updates.sebiRegNumber = sebiRegNumber.toUpperCase();
  }
  if (firmName) updates.firmName = firmName;
  if (complianceEmail) updates.complianceEmail = complianceEmail;

  const updated = dbStore.updateUser(req.user.id, updates);
  const { passwordHash: _, ...userSafe } = updated;
  res.json({ success: true, user: userSafe });
});

export default router;
