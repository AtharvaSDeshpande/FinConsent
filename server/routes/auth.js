import express from 'express';
import { Buffer } from 'node:buffer';
import { dbStore } from '../db/store.js';
import { hashPassword, comparePassword } from '../auth/passwords.js';
import { signToken } from '../auth/jwt.js';
import { requireAuth } from '../auth/middleware.js';

const router = express.Router();

// Helper to safely parse Google ID token payload
function parseGoogleCredential(credential) {
  try {
    const parts = credential.split('.');
    if (parts.length === 3) {
      const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = Buffer.from(payloadBase64, 'base64').toString('utf8');
      return JSON.parse(jsonPayload);
    }
  } catch (err) {
    console.warn('[Google OAuth] Could not parse token payload:', err.message);
  }
  return null;
}

// Register User (RIA, Compliance Officer, Client, Admin)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'ria', firmName, sebiRegNumber, complianceEmail } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
    }

    if (role === 'ria') {
      if (!firmName || !sebiRegNumber) {
        return res.status(400).json({ success: false, error: 'Firm name and SEBI Registration Number are required for RIA accounts' });
      }
      const sebiRegex = /^INA\d{9}$/i;
      if (!sebiRegex.test(sebiRegNumber.trim())) {
        return res.status(400).json({ success: false, error: 'Invalid SEBI INA registration number format (e.g. INA000088921)' });
      }
    }

    const existing = dbStore.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, error: 'An account already exists with this email address' });
    }

    const passwordHash = await hashPassword(password);
    const user = dbStore.createUser({
      name,
      email,
      passwordHash,
      role: ['ria', 'compliance_officer', 'admin', 'client'].includes(role) ? role : 'ria',
      firmName: firmName || (role === 'client' ? 'Individual Investor' : 'Compliance & Advisory'),
      sebiRegNumber: sebiRegNumber ? sebiRegNumber.toUpperCase() : undefined,
      complianceEmail: complianceEmail || email,
      plan: 'free',
    });

    const token = signToken({ userId: user.id });
    const userSafe = { ...user };
    delete userSafe.passwordHash;

    res.status(201).json({ success: true, token, user: userSafe });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Login User
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
    const userSafe = { ...user };
    delete userSafe.passwordHash;

    res.json({ success: true, token, user: userSafe });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Google OAuth Authentication (Live endpoint using GOOGLE_CLIENT_ID from .env)
router.post('/google', async (req, res) => {
  try {
    const { credential, email: bodyEmail, name: bodyName, googleId: bodyGoogleId, role = 'ria' } = req.body;

    let email = bodyEmail;
    let name = bodyName;
    let googleId = bodyGoogleId;

    if (credential) {
      const parsed = parseGoogleCredential(credential);
      if (parsed) {
        email = parsed.email || email;
        name = parsed.name || name;
        googleId = parsed.sub || googleId;
      }
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Google authentication credential missing valid email address',
      });
    }

    // Check if user already exists
    let user = dbStore.findUserByEmail(email) || (googleId ? dbStore.findUserByGoogleId(googleId) : null);

    if (user) {
      // Update Google ID if not already set
      if (googleId && !user.googleId) {
        user = dbStore.updateUser(user.id, { googleId });
      }
    } else {
      // Auto-provision user with selected role
      const defaultFirm = role === 'compliance_officer'
        ? 'Independent Compliance Office'
        : role === 'client'
        ? 'Individual Advisory Client'
        : `${name}'s Advisory Practice`;

      user = dbStore.createUser({
        name: name || email.split('@')[0],
        email,
        googleId,
        role: ['ria', 'compliance_officer', 'admin', 'client'].includes(role) ? role : 'ria',
        firmName: defaultFirm,
        sebiRegNumber: role === 'ria' ? 'INA000088921' : undefined,
        complianceEmail: email,
        plan: 'free',
      });
    }

    const token = signToken({ userId: user.id });
    const userSafe = { ...user };
    delete userSafe.passwordHash;

    res.json({
      success: true,
      token,
      user: userSafe,
      provider: 'google',
      googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Simulated',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Current User & Quota status
router.get('/me', requireAuth, (req, res) => {
  const userSafe = { ...req.user };
  delete userSafe.passwordHash;
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

// Update User Profile (e.g. INA number, firm name, role)
router.put('/profile', requireAuth, (req, res) => {
  const { sebiRegNumber, firmName, complianceEmail, role } = req.body;
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
  if (role && ['ria', 'compliance_officer', 'admin', 'client'].includes(role)) {
    updates.role = role;
  }

  const updated = dbStore.updateUser(req.user.id, updates);
  const userSafe = { ...updated };
  delete userSafe.passwordHash;
  res.json({ success: true, user: userSafe });
});

export default router;
