import express from 'express';
import { Buffer } from 'node:buffer';
import { dbStore } from '../db/store.js';
import { hashPassword, comparePassword, validatePasswordStrength } from '../auth/passwords.js';
import { signToken, verifyToken } from '../auth/jwt.js';
import { requireAuth } from '../auth/middleware.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { generateMfaSecret, verifyTotp } from '../auth/mfa.js';

const router = express.Router();


// Register User (RIA, Compliance Officer, Client, Admin)
router.post('/register', authRateLimiter, async (req, res) => {
  try {
    const { name, email, password, role = 'ria', firmName, sebiRegNumber, complianceEmail } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
    }

    // Enterprise Password Complexity Enforcement
    const pwdCheck = validatePasswordStrength(password);
    if (!pwdCheck.valid) {
      return res.status(400).json({ success: false, error: pwdCheck.error });
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
      mfaEnabled: false,
    });

    const token = signToken({ userId: user.id });
    const userSafe = { ...user };
    delete userSafe.passwordHash;
    delete userSafe.mfaSecret;
    delete userSafe.mfaPendingSecret;

    res.status(201).json({ success: true, token, user: userSafe });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Login User
router.post('/login', authRateLimiter, async (req, res) => {
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

    // MFA Challenge for enrolled RIA / Staff accounts
    if (user.mfaEnabled) {
      const tempToken = signToken({ userId: user.id, mfaPending: true }, '5m');
      return res.json({
        success: true,
        mfaRequired: true,
        tempToken,
        message: 'Two-factor authentication required to complete login.',
      });
    }

    const token = signToken({ userId: user.id, mfaVerified: false });
    const userSafe = { ...user };
    delete userSafe.passwordHash;
    delete userSafe.mfaSecret;
    delete userSafe.mfaPendingSecret;

    res.json({ success: true, token, user: userSafe });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// MFA Setup Endpoint (Authenticated RIA/Staff user)
router.post('/mfa/setup', requireAuth, (req, res) => {
  try {
    const { secret, backupCodes, otpauthUrl } = generateMfaSecret(req.user.email);
    dbStore.updateUser(req.user.id, { mfaPendingSecret: secret });

    res.json({
      success: true,
      secret,
      otpauthUrl,
      backupCodes,
      message: 'MFA setup initiated. Scan QR or enter key, then verify code to activate.',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// MFA Enable Endpoint (Verify code and commit MFA enrollment)
router.post('/mfa/enable', requireAuth, (req, res) => {
  try {
    const { code, backupCodes } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, error: '6-digit verification code is required' });
    }

    const user = dbStore.findUserById(req.user.id);
    if (!user || !user.mfaPendingSecret) {
      return res.status(400).json({ success: false, error: 'No pending MFA setup found. Call /setup first.' });
    }

    const isValid = verifyTotp(code, user.mfaPendingSecret);
    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Invalid verification code. Please check your authenticator app.' });
    }

    const updated = dbStore.updateUser(user.id, {
      mfaEnabled: true,
      mfaSecret: user.mfaPendingSecret,
      mfaPendingSecret: null,
      backupCodes: backupCodes || [],
    });

    const userSafe = { ...updated };
    delete userSafe.passwordHash;
    delete userSafe.mfaSecret;
    delete userSafe.mfaPendingSecret;

    res.json({
      success: true,
      message: 'Two-factor authentication has been successfully activated for your account.',
      user: userSafe,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// MFA Verify Endpoint (Completes 2FA login challenge)
router.post('/mfa/verify', authRateLimiter, (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const bodyToken = req.body.tempToken;
    const tempToken = bodyToken || (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);
    const { code } = req.body;

    if (!tempToken || !code) {
      return res.status(400).json({ success: false, error: 'Temporary login token and 6-digit MFA code are required' });
    }

    const decoded = verifyToken(tempToken);
    if (!decoded || !decoded.userId || !decoded.mfaPending) {
      return res.status(401).json({ success: false, error: 'Invalid or expired MFA authentication challenge session' });
    }

    const user = dbStore.findUserById(decoded.userId);
    if (!user || !user.mfaEnabled || !user.mfaSecret) {
      return res.status(400).json({ success: false, error: 'MFA is not configured for this account' });
    }

    const isTotpValid = verifyTotp(code, user.mfaSecret);
    const backupCodeIndex = (user.backupCodes || []).indexOf(String(code).toUpperCase());
    const isBackupValid = backupCodeIndex !== -1;

    if (!isTotpValid && !isBackupValid) {
      return res.status(401).json({ success: false, error: 'Invalid two-factor authentication code' });
    }

    // Burn used backup code
    if (isBackupValid) {
      const remainingCodes = [...user.backupCodes];
      remainingCodes.splice(backupCodeIndex, 1);
      dbStore.updateUser(user.id, { backupCodes: remainingCodes });
    }

    // Issue full session token with mfaVerified flag
    const token = signToken({ userId: user.id, mfaVerified: true });
    const userSafe = { ...user };
    delete userSafe.passwordHash;
    delete userSafe.mfaSecret;
    delete userSafe.mfaPendingSecret;

    res.json({
      success: true,
      token,
      user: userSafe,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Change Password Endpoint
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Current password and new password are required' });
    }

    const user = dbStore.findUserById(req.user.id);
    const valid = await comparePassword(oldPassword, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect' });
    }

    const strength = validatePasswordStrength(newPassword);
    if (!strength.valid) {
      return res.status(400).json({ success: false, error: strength.error });
    }

    const newHash = await hashPassword(newPassword);
    dbStore.updateUser(user.id, { passwordHash: newHash });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Logout & Session Revocation Endpoint
router.post('/logout', requireAuth, (req, res) => {
  try {
    if (req.token) {
      dbStore.revokeToken(req.token);
    }
    res.json({ success: true, message: 'Session successfully revoked and logged out' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// Current User & Quota status
router.get('/me', requireAuth, (req, res) => {
  const userSafe = { ...req.user };
  delete userSafe.passwordHash;
  delete userSafe.mfaSecret;
  delete userSafe.mfaPendingSecret;
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

// Update User Profile (e.g. INA number, firm name, role, name, mobile, preferredLanguage)
router.put('/profile', requireAuth, (req, res) => {
  const { sebiRegNumber, firmName, complianceEmail, role, name, mobile, pan, preferredLanguage } = req.body;
  const updates = {};

  if (preferredLanguage) {
    const validLanguages = ['en', 'hi', 'ta', 'bn', 'gu', 'de', 'ja', 'ko'];
    if (validLanguages.includes(preferredLanguage)) {
      updates.preferredLanguage = preferredLanguage;
    }
  }

  if (name) updates.name = name;
  if (mobile) updates.mobile = mobile;
  if (pan) updates.pan = pan;
  if (sebiRegNumber) {
    const sebiRegex = /^INA\d{9}$/i;
    if (!sebiRegex.test(sebiRegNumber.trim())) {
      return res.status(400).json({ success: false, error: 'Invalid SEBI INA registration number format' });
    }
    updates.sebiRegNumber = sebiRegNumber.toUpperCase();
  }
  if (firmName) updates.firmName = firmName;
  if (complianceEmail) updates.complianceEmail = complianceEmail;
  if (role && role !== req.user.role) {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: Self-modification of account role is prohibited. Contact platform administration.',
      });
    }
    if (['ria', 'compliance_officer', 'admin', 'client'].includes(role)) {
      updates.role = role;
    }
  }

  // Prevent tampering with MFA fields via generic profile update
  delete updates.mfaEnabled;
  delete updates.mfaSecret;
  delete updates.mfaPendingSecret;
  delete updates.backupCodes;

  const updated = dbStore.updateUser(req.user.id, updates);
  const userSafe = { ...updated };
  delete userSafe.passwordHash;
  delete userSafe.mfaSecret;
  delete userSafe.mfaPendingSecret;
  res.json({ success: true, user: userSafe });
});

// System Established Roles Metadata & Definitions
router.get('/roles', (req, res) => {
  res.json({
    success: true,
    roles: {
      guest: {
        id: 'guest',
        name: 'Guest Visitor',
        permissions: ['view_public', 'view_disclosures', 'preview_demo', 'switch_persona'],
        description: 'Public visitor exploring FinConsent statutory advisory & consent workflows.',
      },
      ria: {
        id: 'ria',
        name: 'Registered Investment Adviser (RIA)',
        permissions: [
          'create_mandates',
          'view_mandates',
          'compose_requests',
          'view_clients',
          'manage_billing',
          'view_dossier',
        ],
        description: 'SEBI-registered Investment Adviser drafting trade rebalance mandates per Regulation 19.',
      },
      compliance_officer: {
        id: 'compliance_officer',
        name: 'Compliance & Audit Officer',
        permissions: [
          'view_mandates',
          'review_requests',
          'approve_requests',
          'view_clients',
          'view_audit_trail',
          'view_dossier',
          'export_dossier',
        ],
        description: 'Statutory compliance authority scrutinizing trade mandates and SEBI audit dossiers.',
      },
      admin: {
        id: 'admin',
        name: 'Platform Super Admin',
        permissions: ['*'],
        description: 'Platform administrator with unconstrained access across all advisory practices and audit trails.',
      },
      client: {
        id: 'client',
        name: 'Advisory Client / Investor',
        permissions: ['view_own_mandates', 'submit_consent', 'view_receipts', 'view_requests'],
        description: 'Individual or corporate client reviewing rebalance proposals and submitting OTP consent.',
      },
    },
    defaultGuestRole: 'guest',
  });
});

// Guest Session Initialization Endpoint
router.post('/guest-session', (req, res) => {
  const guestUser = {
    id: `guest_${Date.now()}`,
    name: 'Guest Visitor',
    email: 'guest@finconsent.in',
    role: 'guest',
    isGuest: true,
    plan: 'guest',
    permissions: ['view_public', 'view_disclosures', 'preview_demo', 'switch_persona'],
  };
  const token = signToken({ userId: guestUser.id, role: 'guest' });
  res.json({
    success: true,
    token,
    user: guestUser,
  });
});

export default router;
