import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '../../server/index.js';
import { runSeed } from '../../server/db/seed.js';
import { dbStore } from '../../server/db/store.js';
import { decryptPayload, encryptPayload } from '../../server/security/mandateCrypto.js';
import crypto from 'node:crypto';

describe('Mandate Security, Envelope Encryption, Cross-Tenant Isolation & Chat Suite', () => {
  let server;
  let baseUrl;
  let ria1Token;
  let ria2Token;
  let seededRohanMandateToken;
  let seededRohanMandateId;
  let seededArthaMandateId;

  beforeAll(async () => {
    // Ensure clean reseed
    const seedResult = await runSeed();
    server = app.listen(0);
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;

    seededRohanMandateToken = 'tok_rohan_mandate_a';
    seededRohanMandateId = 'man_1';
    seededArthaMandateId = 'man_nikhil_artha_sent';

    // 1. Authenticate RIA 1 (Suresh Narayanan - Prudent Wealth Advisory)
    const ria1Login = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ria@example.in', password: 'Password@123' }),
    });
    const ria1Data = await ria1Login.json();
    expect(ria1Data.success).toBe(true);
    ria1Token = ria1Data.token;

    // 2. Authenticate RIA 2 (Meera Iyer - Artha Capital Advisors)
    const ria2Login = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'pro.ria@example.in', password: 'Password@123' }),
    });
    const ria2Data = await ria2Login.json();
    expect(ria2Data.success).toBe(true);
    ria2Token = ria2Data.token;
  }, 30000);

  afterAll(async () => {
    if (server) await new Promise((r) => server.close(r));
  });

  // --- SECTION 1: MANDATE PROTECTION & CLIENT ACCESS BARRIER ---
  describe('1. Mandate Protection & Access Barrier', () => {
    it('Random mandate URL returns 404 without leaking data', async () => {
      const res = await fetch(`${baseUrl}/api/public/mandates/random-token-attack-xyz-999`);
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.data).toBeUndefined();
    });

    it('Valid client mandate link does NOT return sensitive data before password unlock', async () => {
      const res = await fetch(`${baseUrl}/api/public/mandates/${seededRohanMandateToken}`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.unlocked).toBe(false);
      expect(body.requiresUnlock).toBe(true);
      expect(body.isPasswordProtected).toBe(true);

      const returned = body.data;
      // Must not leak sensitive financial payload
      expect(returned.mandate.sellBasket).toBeUndefined();
      expect(returned.mandate.buyBasket).toBeUndefined();
      expect(returned.mandate.taxPayable).toBeUndefined();
      expect(returned.mandate.stcgAmount).toBeUndefined();
      expect(returned.mandate.ltcgAmount).toBeUndefined();
      expect(returned.mandate.advisorRationale).toBeUndefined();

      // Must not leak client PAN or DOB
      expect(returned.client.pan).toBeUndefined();
      expect(returned.client.dob).toBeUndefined();
    });

    it('Incorrect mandate password fails with generic error message', async () => {
      const res = await fetch(`${baseUrl}/api/public/mandates/${seededRohanMandateToken}/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'wrongpassword999' }),
      });
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('The password is incorrect or this mandate is unavailable.');
    });

    it('Repeated incorrect password attempts trigger rate limiting / lockout', async () => {
      // Execute 4 more failures to exceed limit of 5
      for (let i = 0; i < 4; i++) {
        await fetch(`${baseUrl}/api/public/mandates/${seededRohanMandateToken}/unlock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: `failed_attempt_${i}` }),
        });
      }

      // 6th attempt must be locked out with 429
      const lockoutRes = await fetch(`${baseUrl}/api/public/mandates/${seededRohanMandateToken}/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: '123414081978' }),
      });
      expect(lockoutRes.status).toBe(429);
      const lockoutData = await lockoutRes.json();
      expect(lockoutData.error).toContain('Too many failed password attempts');

      // Clear lockout for subsequent tests
      const mandate = dbStore.findMandateByToken(seededRohanMandateToken);
      if (mandate) {
        dbStore.sharedState.clearPasswordLockout(mandate.id);
      }
    });

    it('Correct PAN last 4 + DOB password successfully unlocks and returns decrypted mandate', async () => {
      // Rohan Mehta: PAN ABCPM1234F (1234), DOB 1978-08-14 (14081978) -> Password: 123414081978
      const res = await fetch(`${baseUrl}/api/public/mandates/${seededRohanMandateToken}/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: '123414081978' }),
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.unlockToken).toBeDefined();

      const decrypted = body.data;
      expect(decrypted.mandate.sellBasket).toBeDefined();
      expect(decrypted.mandate.sellBasket.length).toBeGreaterThan(0);
      expect(decrypted.mandate.taxPayable).toBe(12480);
      expect(decrypted.mandate.advisorRationale).toContain('Client equity portfolio');
    });

    it('Expired mandate link cannot be unlocked (returns 410)', async () => {
      const res = await fetch(`${baseUrl}/api/public/mandates/tok_vikram_expired`);
      expect(res.status).toBe(410);
      const body = await res.json();
      expect(body.expired).toBe(true);
    });

    it('Revoked mandate link cannot be unlocked (returns 410)', async () => {
      const res = await fetch(`${baseUrl}/api/public/mandates/tok_rohan_revoked`);
      expect(res.status).toBe(410);
      const body = await res.json();
      expect(body.revoked).toBe(true);
    });
  });

  // --- SECTION 2: ENVELOPE ENCRYPTION AT REST ---
  describe('2. Envelope Encryption at Rest Verification', () => {
    it('Stored mandate contains encryptedPayload and wrapped DEKs, not plaintext financial fields', () => {
      const mandate = dbStore.findMandateById(seededRohanMandateId);
      expect(mandate).toBeDefined();
      expect(mandate.encryptedPayload).toBeDefined();
      expect(mandate.encryptedPayload.ciphertext).toBeDefined();
      expect(mandate.encryptedPayload.iv).toBeDefined();
      expect(mandate.encryptedPayload.authTag).toBeDefined();

      expect(mandate.serverWrappedDek).toBeDefined();
      expect(mandate.clientWrappedDek).toBeDefined();
      expect(mandate.isPasswordProtected).toBe(true);

      // Neither plaintext password nor derived DEK should be stored on the record
      expect(mandate.clientPassword).toBeUndefined();
      expect(mandate.dek).toBeUndefined();
    });

    it('Tampered ciphertext fails AES-256-GCM authentication tag verification', () => {
      const key = crypto.randomBytes(32);
      const original = { tax: 50000, secret: 'confidential' };
      const encrypted = encryptPayload(original, key);

      // Tamper with ciphertext by altering last byte
      const tamperedCiphertext =
        encrypted.ciphertext.slice(0, -2) + (encrypted.ciphertext.slice(-2) === 'aa' ? 'bb' : 'aa');
      const tamperedPayload = { ...encrypted, ciphertext: tamperedCiphertext };

      expect(() => decryptPayload(tamperedPayload, key)).toThrow();
    });
  });

  // --- SECTION 3: RIA ACCESS & CROSS-TENANT ISOLATION ---
  describe('3. RIA Access & Multi-Tenant Isolation', () => {
    it('Owning RIA can view and manage its own mandate without client password', async () => {
      const res = await fetch(`${baseUrl}/api/mandates/${seededRohanMandateId}`, {
        headers: { Authorization: `Bearer ${ria1Token}` },
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(seededRohanMandateId);
      expect(body.data.taxPayable).toBe(12480);
      expect(body.data.sellBasket).toBeDefined();
    });

    it('Cross-RIA Mandate Access: RIA 2 is FORBIDDEN (403) from accessing RIA 1 mandate', async () => {
      const res = await fetch(`${baseUrl}/api/mandates/${seededRohanMandateId}`, {
        headers: { Authorization: `Bearer ${ria2Token}` },
      });
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error).toContain('Unauthorized');
    });

    it('Cross-RIA Client Access: RIA 2 is FORBIDDEN (403) from accessing RIA 1 client', async () => {
      const res = await fetch(`${baseUrl}/api/clients/cli_rohan_mehta`, {
        headers: { Authorization: `Bearer ${ria2Token}` },
      });
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error).toContain('Unauthorized');
    });

    it('Direct status manipulation: Cannot directly set status=consented without OTP', async () => {
      const res = await fetch(`${baseUrl}/api/mandates/${seededRohanMandateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ria1Token}`,
        },
        body: JSON.stringify({ status: 'consented' }),
      });
      expect(res.status).toBe(403);
    });
  });

  // --- SECTION 4: MANDATE-SCOPED CHAT & CONSENT NON-EQUIVALENCE ---
  describe('4. Mandate-Scoped Chat Communication', () => {
    let clientUnlockToken;

    beforeAll(async () => {
      dbStore.sharedState.clearPasswordLockout(seededRohanMandateId);
      const unlockRes = await fetch(`${baseUrl}/api/public/mandates/${seededRohanMandateToken}/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: '123414081978' }),
      });
      const data = await unlockRes.json();
      clientUnlockToken = data.unlockToken;
    });

    it('Client can post a question to their unlocked mandate chat', async () => {
      const res = await fetch(`${baseUrl}/api/public/mandates/${seededRohanMandateToken}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-unlock-token': clientUnlockToken,
        },
        body: JSON.stringify({ message: 'Can you clarify the advance tax installment due date?' }),
      });
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.message).toBe('Can you clarify the advance tax installment due date?');
      expect(body.data.sender).toBe('client');
    });

    it('Chat messages do NOT alter mandate status to consented', async () => {
      const mandate = dbStore.findMandateById(seededRohanMandateId);
      expect(mandate.status).not.toBe('consented');
      expect(Boolean(mandate.isApproved)).toBe(false);
    });

    it('Owning RIA can read and reply to the client question', async () => {
      const getRes = await fetch(`${baseUrl}/api/mandates/${seededRohanMandateId}/chat`, {
        headers: { Authorization: `Bearer ${ria1Token}` },
      });
      expect(getRes.status).toBe(200);
      const getData = await getRes.json();
      expect(getData.data.length).toBeGreaterThan(0);

      const replyRes = await fetch(`${baseUrl}/api/mandates/${seededRohanMandateId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ria1Token}`,
        },
        body: JSON.stringify({ message: 'The 4th installment is due on 15th March.' }),
      });
      expect(replyRes.status).toBe(201);
      const replyData = await replyRes.json();
      expect(replyData.data.sender).toBe('ria');
    });

    it('Cross-RIA Chat Access: RIA 2 is FORBIDDEN (403) from reading or posting to RIA 1 chat', async () => {
      const res = await fetch(`${baseUrl}/api/mandates/${seededRohanMandateId}/chat`, {
        headers: { Authorization: `Bearer ${ria2Token}` },
      });
      expect(res.status).toBe(403);

      const postRes = await fetch(`${baseUrl}/api/mandates/${seededRohanMandateId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ria2Token}`,
        },
        body: JSON.stringify({ message: 'Unauthorized intrusion attempt' }),
      });
      expect(postRes.status).toBe(403);
    });

    it('Chat without unlock token is rejected (401)', async () => {
      const res = await fetch(`${baseUrl}/api/public/mandates/${seededRohanMandateToken}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Unauthenticated message' }),
      });
      expect(res.status).toBe(401);
    });
  });

  // --- SECTION 5: GOOGLE REMOVAL VERIFICATION ---
  describe('5. Complete Google Sign-In Removal', () => {
    it('Google OAuth endpoint POST /api/auth/google returns 404 Not Found', async () => {
      const res = await fetch(`${baseUrl}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: 'dummy_token' }),
      });
      expect(res.status).toBe(404);
    });

    it('Health check does not report googleOAuth field', async () => {
      const res = await fetch(`${baseUrl}/api/health`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.googleOAuth).toBeUndefined();
    });
  });
});
