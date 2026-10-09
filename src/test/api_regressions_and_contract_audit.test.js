import { describe, it, expect, beforeAll } from 'vitest';
import crypto from 'node:crypto';
import app from '../../server/index.js';
import { dbStore } from '../../server/db/store.js';
import { runSeed } from '../../server/db/seed.js';

let server;
let baseUrl;
let riaToken;
let clientToken;
let otherClientToken;
let otherRiaToken;
let complianceToken;
let adminToken;

beforeAll(async () => {
  await runSeed();
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });

  // Login RIA 1 (Suresh Narayanan)
  const riaRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ria@example.in', password: 'Password@123' }),
  });
  const riaData = await riaRes.json();
  riaToken = riaData.token;

  // Login Client Rohan Mehta (cli_1)
  const clientRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'client@example.in', password: 'Password@123' }),
  });
  const clientData = await clientRes.json();
  clientToken = clientData.token;

  // Create & Login Other Client (cli_other)
  const otherClientUser = dbStore.createUser({
    name: 'Vikram Foreign',
    email: 'vikram.foreign@example.in',
    passwordHash: '$2a$10$20gor5UMRbxD0N2.5fuZ1OAk5eTmWZCa6Aj2b5AKHVOfVU8SoIwwa',
    role: 'client',
    pan: 'XYZAB9999K',
    mobile: '9820999999',
    plan: 'free',
  });
  const otherClientRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: otherClientUser.email, password: 'Password@123' }),
  });
  const otherClientData = await otherClientRes.json();
  otherClientToken = otherClientData.token;

  // Login Other RIA 2 (Meera Iyer)
  const otherRiaRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'pro.ria@example.in', password: 'Password@123' }),
  });
  const otherRiaData = await otherRiaRes.json();
  otherRiaToken = otherRiaData.token;

  // Login Compliance Officer
  const compRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'compliance@example.in', password: 'Password@123' }),
  });
  const compData = await compRes.json();
  complianceToken = compData.token;

  // Login Admin
  const adminRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@example.in', password: 'Password@123' }),
  });
  const adminData = await adminRes.json();
  adminToken = adminData.token;

  return () => {
    if (server) server.close();
  };
});

describe('FinConsent API Regression & Contract Audit Suite', () => {
  describe('1. Client Registry Boundaries & RequestComposer Separation', () => {
    it('1.1: GET /api/clients strictly blocks client users with 403 Forbidden', async () => {
      const res = await fetch(`${baseUrl}/api/clients`, {
        headers: { Authorization: `Bearer ${clientToken}` },
      });
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toMatch(/Unauthorized: Clients cannot access advisor client directories/i);
    });

    it('1.2: GET /api/clients allows RIA and Compliance Officers', async () => {
      const riaRes = await fetch(`${baseUrl}/api/clients`, {
        headers: { Authorization: `Bearer ${riaToken}` },
      });
      expect(riaRes.status).toBe(200);
      const riaData = await riaRes.json();
      expect(Array.isArray(riaData.data)).toBe(true);

      const compRes = await fetch(`${baseUrl}/api/clients`, {
        headers: { Authorization: `Bearer ${complianceToken}` },
      });
      expect(compRes.status).toBe(200);
      const compData = await compRes.json();
      expect(compData.data.length).toBeGreaterThanOrEqual(riaData.data.length);
    });
  });

  describe('2. Mandate Token Preservation & Receipt Accessibility', () => {
    let freshMandateId;
    let freshMagicToken;
    let freshPassword;

    it('2.1: Dispatched mandate generates active magicToken and prints password', async () => {
      // Create mandate
      const createRes = await fetch(`${baseUrl}/api/mandates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${riaToken}`,
        },
        body: JSON.stringify({
          clientId: 'cli_1',
          title: 'Preservation Test Mandate',
          rationale: 'Testing magic token lifecycle across consented state',
          stcgAmount: 120000,
          ltcgAmount: 200000,
        }),
      });
      expect(createRes.status).toBe(201);
      const created = await createRes.json();
      freshMandateId = created.data.id;

      // Dispatch mandate
      const dispatchRes = await fetch(`${baseUrl}/api/mandates/${freshMandateId}/dispatch`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${riaToken}` },
      });
      expect(dispatchRes.status).toBe(200);
      const dispatchData = await dispatchRes.json();
      expect(dispatchData.data.magicToken).toBeDefined();
      expect(dispatchData.data.password).toBeDefined();

      freshMagicToken = dispatchData.data.magicToken;
      freshPassword = dispatchData.data.password;
    });

    it('2.2: Consented mandate preserves magicToken in GET /api/mandates and GET /api/mandates/:id', async () => {
      // Unlock mandate
      const unlockRes = await fetch(`${baseUrl}/api/public/mandates/${freshMagicToken}/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: freshPassword }),
      });
      expect(unlockRes.status).toBe(200);
      const unlockData = await unlockRes.json();
      const unlockToken = unlockData.unlockToken;

      // Request and verify OTP
      const otpRes = await fetch(`${baseUrl}/api/public/mandates/${freshMagicToken}/request-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-unlock-token': unlockToken,
        },
      });
      expect(otpRes.status).toBe(200);
      const { demoOtp } = await otpRes.json();

      const verifyRes = await fetch(`${baseUrl}/api/public/mandates/${freshMagicToken}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-unlock-token': unlockToken,
        },
        body: JSON.stringify({ otp: demoOtp, statutoryDeclarationsAccepted: true }),
      });
      expect(verifyRes.status).toBe(200);

      // Verify mandate in GET /api/mandates retains magicToken even after consented
      const listRes = await fetch(`${baseUrl}/api/mandates?status=all`, {
        headers: { Authorization: `Bearer ${riaToken}` },
      });
      const listData = await listRes.json();
      const foundInList = listData.data.find((m) => m.id === freshMandateId);
      expect(foundInList).toBeDefined();
      expect(foundInList.status).toBe('consented');
      expect(foundInList.magicToken).toBe(freshMagicToken);

      // Verify single GET /api/mandates/:id retains magicToken
      const singleRes = await fetch(`${baseUrl}/api/mandates/${freshMandateId}`, {
        headers: { Authorization: `Bearer ${riaToken}` },
      });
      const singleData = await singleRes.json();
      expect(singleData.data.magicToken).toBe(freshMagicToken);
    });

    it('2.3: GET /api/public/mandates/:token with x-unlock-token returns decrypted financial fields', async () => {
      // Unlock mandate to obtain fresh unlock token
      const unlockRes = await fetch(`${baseUrl}/api/public/mandates/${freshMagicToken}/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: freshPassword }),
      });
      const { unlockToken } = await unlockRes.json();

      const res = await fetch(`${baseUrl}/api/public/mandates/${freshMagicToken}`, {
        headers: { 'x-unlock-token': unlockToken },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.unlocked).toBe(true);
      expect(data.data.mandate.taxPayable).toBeGreaterThan(0);
      expect(data.data.client.maskedPan).toBeDefined();
      expect(data.data.client.maskedMobile).toBeDefined();
    });
  });

  describe('3. Multi-Role Mandate Authorization & Tenant Isolation', () => {
    it('3.1: Client Rohan can view his own mandate via GET /api/mandates/:id', async () => {
      const res = await fetch(`${baseUrl}/api/mandates/man_1`, {
        headers: { Authorization: `Bearer ${clientToken}` },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data.id).toBe('man_1');
      expect(data.data.clientId).toBe('cli_1');
    });

    it('3.2: Other client cannot view Rohan mandate via GET /api/mandates/:id (403)', async () => {
      const res = await fetch(`${baseUrl}/api/mandates/man_1`, {
        headers: { Authorization: `Bearer ${otherClientToken}` },
      });
      expect(res.status).toBe(403);
    });

    it('3.3: Foreign RIA cannot view Prudent Wealth mandate via GET /api/mandates/:id (403)', async () => {
      const res = await fetch(`${baseUrl}/api/mandates/man_1`, {
        headers: { Authorization: `Bearer ${otherRiaToken}` },
      });
      expect(res.status).toBe(403);
    });

    it('3.4: Direct status tampering to consented or approved via PUT /api/mandates/:id is prohibited (403)', async () => {
      const res = await fetch(`${baseUrl}/api/mandates/man_1`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${riaToken}`,
        },
        body: JSON.stringify({ status: 'consented' }),
      });
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toMatch(/Direct mutation to consented or approved state is prohibited/i);
    });
  });

  describe('4. Mandate Chat Security & Token Protection', () => {
    it('4.1: Public chat GET rejects unauthenticated requests with 401', async () => {
      const res = await fetch(`${baseUrl}/api/public/mandates/tok_rohan_mandate_a/chat`);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toMatch(/Mandate password unlock required/i);
    });

    it('4.2: Public chat POST rejects unauthenticated requests with 401', async () => {
      const res = await fetch(`${baseUrl}/api/public/mandates/tok_rohan_mandate_a/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Unauthenticated probe' }),
      });
      expect(res.status).toBe(401);
    });
  });

  describe('5. Session Revocation & Logout Contract', () => {
    it('5.1: POST /api/auth/logout revokes JWT token; subsequent calls return 401', async () => {
      // Create temporary session
      const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'client@example.in', password: 'Password@123' }),
      });
      const { token: tempToken } = await loginRes.json();

      // Check /api/auth/me works
      const meResBefore = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${tempToken}` },
      });
      expect(meResBefore.status).toBe(200);

      // Call /api/auth/logout
      const logoutRes = await fetch(`${baseUrl}/api/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tempToken}` },
      });
      expect(logoutRes.status).toBe(200);
      const logoutData = await logoutRes.json();
      expect(logoutData.success).toBe(true);

      // Verify token is now rejected
      const meResAfter = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${tempToken}` },
      });
      expect(meResAfter.status).toBe(401);
      const meDataAfter = await meResAfter.json();
      expect(meDataAfter.error).toMatch(/revoked/i);
    });
  });

  describe('6. Serialization & Error Protocol', () => {
    it('6.1: Non-existent /api route returns pure JSON 404 with standard error contract', async () => {
      const res = await fetch(`${baseUrl}/api/unknown/endpoint/route`);
      expect(res.status).toBe(404);
      expect(res.headers.get('content-type')).toMatch(/application\/json/i);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toMatch(/API route not found/i);
    });
  });

  describe('7. Formatters & Localization Contracts', () => {
    it('7.1: formatTime and formatDateTime exports format dates with English numerals', async () => {
      const { formatTime, formatDateTime, formatDate, formatDateOnly } = await import('../../src/i18n/formatters.js');
      const testTimestamp = new Date('2026-10-09T05:30:00.000Z').getTime();
      expect(typeof formatTime).toBe('function');
      expect(typeof formatDateTime).toBe('function');
      expect(typeof formatDate).toBe('function');
      expect(typeof formatDateOnly).toBe('function');

      const timeStr = formatTime(testTimestamp);
      expect(timeStr).toMatch(/\d{2}:\d{2}/);
      expect(timeStr).not.toMatch(/[०-९]/);

      const dtStr = formatDateTime(testTimestamp);
      expect(dtStr).toMatch(/2026/);
      expect(dtStr).not.toMatch(/[०-९]/);
    });
  });
});
