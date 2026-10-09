import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import app from '../../server/index.js';
import { runSeed } from '../../server/db/seed.js';
import { dbStore } from '../../server/db/store.js';

describe('Mandate Dispatch Testing Print & Password Verification Suite', () => {
  let server;
  let baseUrl;
  let riaToken;
  let createdMandateId;

  beforeAll(async () => {
    await runSeed();
    server = app.listen(0);
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;

    // Login as RIA (Suresh Narayanan)
    const riaLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ria@example.in', password: 'Password@123' }),
    });
    const riaData = await riaLogin.json();
    expect(riaData.success).toBe(true);
    riaToken = riaData.token;

    // Create a new draft mandate for Rohan Mehta (PAN ABCPM1234F, DOB 1978-08-14)
    const createRes = await fetch(`${baseUrl}/api/mandates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${riaToken}`,
      },
      body: JSON.stringify({
        clientId: 'cli_rohan_mehta',
        title: 'Dispatch Print Test Rebalancing',
        stcgAmount: 100000,
        ltcgAmount: 200000,
        cutoffHours: 48,
      }),
    });
    const createBody = await createRes.json();
    expect(createRes.status).toBe(201);
    createdMandateId = createBody.data.id;
  }, 30000);

  afterAll(async () => {
    if (server) await new Promise((r) => server.close(r));
  });

  it('POST /api/mandates/:id/dispatch logs mandate and password to console and returns password', async () => {
    const consoleSpy = vi.spyOn(console, 'log');

    const res = await fetch(`${baseUrl}/api/mandates/${createdMandateId}/dispatch`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${riaToken}` },
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(createdMandateId);
    expect(body.data.status).toBe('in_review');
    expect(body.data.magicToken).toBeDefined();

    // Password for Rohan Mehta (PAN ABCPM1234F -> 1234, DOB 1978-08-14 -> 14081978) = 123414081978
    expect(body.data.password).toBe('123414081978');
    expect(body.data.clientPassword).toBe('123414081978');

    // Verify console output contains the mandate and testing password
    const loggedCalls = consoleSpy.mock.calls.map((c) => c.join(' ')).join('\n');
    expect(loggedCalls).toContain('>>> [MANDATE DISPATCHED - FOR TESTING PURPOSE] <<<');
    expect(loggedCalls).toContain(`Mandate ID:      ${createdMandateId}`);
    expect(loggedCalls).toContain('Client Password: 123414081978');
    expect(loggedCalls).toContain(`Magic Token:     ${body.data.magicToken}`);

    consoleSpy.mockRestore();
  });

  it('GET /api/mandates/:id includes test password for the owning RIA workspace', async () => {
    const res = await fetch(`${baseUrl}/api/mandates/${createdMandateId}`, {
      headers: { Authorization: `Bearer ${riaToken}` },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.password).toBe('123414081978');
    expect(body.data.clientPassword).toBe('123414081978');
  });

  it('Dispatched test password successfully unlocks client-facing mandate review', async () => {
    const dispatchDetail = await fetch(`${baseUrl}/api/mandates/${createdMandateId}`, {
      headers: { Authorization: `Bearer ${riaToken}` },
    });
    const dispatchBody = await dispatchDetail.json();
    const token = dispatchBody.data.magicToken;
    const password = dispatchBody.data.password;

    expect(token).toBeDefined();
    expect(password).toBe('123414081978');

    // Attempt client unlock with the dispatched test password
    const unlockRes = await fetch(`${baseUrl}/api/public/mandates/${token}/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    expect(unlockRes.status).toBe(200);
    const unlockData = await unlockRes.json();
    expect(unlockData.success).toBe(true);
    expect(unlockData.unlockToken).toBeDefined();
    expect(unlockData.data.mandate.id).toBe(createdMandateId);
  });

  it('Persistent database store retains dual-wrapped DEKs and does NOT persist plaintext password', () => {
    const stored = dbStore.findMandateById(createdMandateId);
    expect(stored).toBeDefined();
    expect(stored.clientPassword).toBeUndefined();
    expect(stored.password).toBeUndefined();
    expect(stored.encryptedPayload).toBeDefined();
    expect(stored.serverWrappedDek).toBeDefined();
    expect(stored.clientWrappedDek).toBeDefined();
  });
});
