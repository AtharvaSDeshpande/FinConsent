import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '../../server/index.js';
import { dbStore } from '../../server/db/store.js';
import { runSeed } from '../../server/db/seed.js';

describe('FinConsent Comprehensive Security Hardening & Isolation Suite', () => {
  let server;
  let baseUrl;
  let ria1Token;
  let ria2Token;
  let clientToken;
  let complianceToken;
  let adminToken;

  let ria1ClientId;
  let ria1MandateId;
  let ria1MandateToken;
  let ria1RequestId;

  async function api(path, { method = 'GET', body, token, headers = {} } = {}) {
    const reqHeaders = { ...headers };
    if (token) reqHeaders['Authorization'] = `Bearer ${token}`;
    if (body) reqHeaders['Content-Type'] = 'application/json';
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers: reqHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });
    let data;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    return { status: res.status, body: data };
  }

  beforeAll(async () => {
    if (dbStore.users.size === 0) {
      await runSeed();
    }
    server = app.listen(0);
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;

    // Authenticate test personas
    const login = async (email, password = 'Password@123') => {
      const res = await api('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      return res.body?.token;
    };

    ria1Token = await login('ria@example.in'); // Suresh Narayanan (Prudent Wealth Advisory)
    ria2Token = await login('pro.ria@example.in'); // Meera Iyer (Apex Multi-Family Office)
    clientToken = await login('client@example.in'); // Rohan Mehta
    complianceToken = await login('compliance@example.in'); // Vikramaditya Roy
    adminToken = await login('admin@example.in'); // Neha Singhania

    // Fetch existing seeded data for RIA 1
    const clientsRes = await api('/api/clients', { token: ria1Token });
    expect(clientsRes.status).toBe(200);
    ria1ClientId = clientsRes.body.data[0].id;

    // Create fresh mandate for RIA 1 to test
    const mandateRes = await api('/api/mandates', {
      method: 'POST',
      token: ria1Token,
      body: {
        clientId: ria1ClientId,
        title: 'Security Audit Test Mandate',
        stcgAmount: 50000,
        ltcgAmount: 150000,
        cutoffHours: 48,
        rationale: 'Security testing mandate for authorization validation',
      },
    });
    expect(mandateRes.status).toBe(201);
    ria1MandateId = mandateRes.body.data.id;
    ria1MandateToken = mandateRes.body.data.magicToken;

    // Create fresh request for RIA 1 to test
    const reqRes = await api('/api/requests', {
      method: 'POST',
      token: ria1Token,
      body: {
        title: 'Advisory Review Inquiry',
        description: 'Testing tenant isolation on requests',
        clientId: ria1ClientId,
      },
    });
    expect(reqRes.status).toBe(201);
    ria1RequestId = reqRes.body.data.id;
  }, 35000);

  afterAll(() => {
    if (server) server.close();
  });

  // =========================================================================
  // 1. TENANT ISOLATION & IDOR/BOLA PREVENTION
  // =========================================================================
  describe('1. Strict Multi-Tenant Isolation & IDOR Barriers', () => {
    it('RIA 2 CANNOT access RIA 1 client record (IDOR attempt rejected with 403)', async () => {
      const res = await api(`/api/clients/${ria1ClientId}`, { token: ria2Token });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Unauthorized');
    });

    it('RIA 2 CANNOT view RIA 1 mandate details (IDOR attempt rejected with 403)', async () => {
      const res = await api(`/api/mandates/${ria1MandateId}`, { token: ria2Token });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Unauthorized');
    });

    it('RIA 2 CANNOT dispatch RIA 1 mandate (IDOR attempt rejected with 403)', async () => {
      const res = await api(`/api/mandates/${ria1MandateId}/dispatch`, {
        method: 'POST',
        token: ria2Token,
      });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Unauthorized');
    });

    it('RIA 2 CANNOT revoke or regenerate RIA 1 magic links (IDOR attempt rejected with 403)', async () => {
      const res = await api(`/api/mandates/${ria1MandateId}/revoke-link`, {
        method: 'POST',
        token: ria2Token,
      });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Unauthorized');
    });

    it('RIA 2 CANNOT access RIA 1 compliance dossier (IDOR attempt rejected with 403)', async () => {
      const res = await api(`/api/mandates/${ria1MandateId}/dossier`, { token: ria2Token });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Unauthorized');
    });

    it('RIA 2 CANNOT modify or resolve RIA 1 requests (BOLA attempt rejected with 403)', async () => {
      const res = await api(`/api/requests/${ria1RequestId}`, {
        method: 'PUT',
        token: ria2Token,
        body: { status: 'completed', responseNotes: 'Hacked response' },
      });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Unauthorized');
    });
  });

  // =========================================================================
  // 2. ROLE-BASED ACCESS CONTROL & PRIVILEGE ESCALATION PREVENTION
  // =========================================================================
  describe('2. RBAC & Privilege Escalation Mitigation', () => {
    it('Client role CANNOT view RIA client directory (403 Forbidden)', async () => {
      const res = await api('/api/clients', { token: clientToken });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('Client role CANNOT draft or create mandates (403 Forbidden)', async () => {
      const res = await api('/api/mandates', {
        method: 'POST',
        token: clientToken,
        body: {
          title: 'Illegal Mandate',
          clientId: ria1ClientId,
        },
      });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('Client role CANNOT initiate RIA billing subscription (403 Forbidden)', async () => {
      const res = await api('/api/billing/create-checkout', {
        method: 'POST',
        token: clientToken,
      });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('Non-admin user CANNOT elevate own role via PUT /api/auth/profile (Privilege Escalation Blocked)', async () => {
      const res = await api('/api/auth/profile', {
        method: 'PUT',
        token: ria1Token,
        body: { role: 'admin' },
      });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Self-modification of account role is prohibited');
    });
  });

  // =========================================================================
  // 3. OTP VERIFICATION SECURITY & BRUTE-FORCE LOCKOUT
  // =========================================================================
  describe('3. OTP Security, Brute-Force Rate Limiting & Lockout', () => {
    it('Locks OTP and returns 429 after 3 consecutive failed verification attempts', async () => {
      // 1. Request fresh OTP
      const otpRes = await api(`/api/public/mandates/${ria1MandateToken}/request-otp`, {
        method: 'POST',
      });
      expect(otpRes.status).toBe(200);

      // Attempt 1: Wrong code
      const fail1 = await api(`/api/public/mandates/${ria1MandateToken}/verify-otp`, {
        method: 'POST',
        body: { otp: '000000', statutoryDeclarationsAccepted: true },
      });
      expect(fail1.status).toBe(400);
      expect(fail1.body.remainingAttempts).toBe(2);

      // Attempt 2: Wrong code
      const fail2 = await api(`/api/public/mandates/${ria1MandateToken}/verify-otp`, {
        method: 'POST',
        body: { otp: '111111', statutoryDeclarationsAccepted: true },
      });
      expect(fail2.status).toBe(400);
      expect(fail2.body.remainingAttempts).toBe(1);

      // Attempt 3: Wrong code -> Triggers Lockout!
      const fail3 = await api(`/api/public/mandates/${ria1MandateToken}/verify-otp`, {
        method: 'POST',
        body: { otp: '222222', statutoryDeclarationsAccepted: true },
      });
      expect(fail3.status).toBe(429);
      expect(fail3.body.locked).toBe(true);
      expect(fail3.body.error).toContain('Maximum OTP verification attempts exceeded');

      // Attempt 4: Even if correct test OTP is sent, it remains locked and deleted
      const fail4 = await api(`/api/public/mandates/${ria1MandateToken}/verify-otp`, {
        method: 'POST',
        body: { otp: '123456', statutoryDeclarationsAccepted: true },
      });
      expect(fail4.status).toBe(400);
      expect(fail4.body.error).toContain('OTP not found or expired');
    });

    it('Burns OTP immediately on successful verification (single-use, no replay)', async () => {
      // Re-issue fresh token via RIA
      const revokeRes = await api(`/api/mandates/${ria1MandateId}/revoke-link`, {
        method: 'POST',
        token: ria1Token,
      });
      expect(revokeRes.status).toBe(200);
      ria1MandateToken = revokeRes.body.data.magicToken;
      const freshToken = ria1MandateToken;

      // Request fresh OTP
      await api(`/api/public/mandates/${freshToken}/request-otp`, {
        method: 'POST',
      });

      // Verify OTP successfully
      const successRes = await api(`/api/public/mandates/${freshToken}/verify-otp`, {
        method: 'POST',
        body: { otp: '123456', statutoryDeclarationsAccepted: true },
      });
      expect(successRes.status).toBe(200);
      expect(successRes.body.success).toBe(true);

      // Replay attempt must fail (already approved and locked)
      const replayRes = await api(`/api/public/mandates/${freshToken}/verify-otp`, {
        method: 'POST',
        body: { otp: '123456', statutoryDeclarationsAccepted: true },
      });
      expect(replayRes.status).toBe(400);
      expect(replayRes.body.error).toContain('Mandate is already approved and locked');
    });
  });

  // =========================================================================
  // 4. STATE MACHINE INTEGRITY & CONSENT IMMUTABILITY
  // =========================================================================
  describe('4. State Machine Integrity & Regulatory Immutability', () => {
    it('CANNOT re-dispatch an already consented and locked mandate', async () => {
      const res = await api(`/api/mandates/${ria1MandateId}/dispatch`, {
        method: 'POST',
        token: ria1Token,
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Cannot re-dispatch an already consented and legally sealed mandate');
    });

    it('CANNOT revoke or regenerate access link for an already consented mandate', async () => {
      const res = await api(`/api/mandates/${ria1MandateId}/revoke-link`, {
        method: 'POST',
        token: ria1Token,
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Cannot revoke or regenerate access link for an already consented mandate');
    });

    it('CANNOT request fresh OTP for an already consented mandate', async () => {
      const res = await api(`/api/public/mandates/${ria1MandateToken}/request-otp`, {
        method: 'POST',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('This mandate is already approved and locked');
    });
  });
});
