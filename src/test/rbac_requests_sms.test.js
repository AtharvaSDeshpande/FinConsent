import { describe, it, expect, beforeAll } from 'vitest';
import app from '../../server/index.js';
import { runSeed } from '../../server/db/seed.js';
import { dbStore } from '../../server/db/store.js';

describe('RBAC, Live Requests API, Google Removal & SMS Deprecation Suite', () => {
  let server;
  let baseUrl;
  let riaToken;
  let clientToken;
  let complianceToken;

  beforeAll(async () => {
    if (dbStore.users.size === 0) {
      await runSeed();
    }
    server = app.listen(0);
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;

    // Obtain RIA token
    const riaRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ria@example.in', password: 'Password@123' }),
    });
    const riaData = await riaRes.json();
    riaToken = riaData.token;

    // Obtain Client token
    const clientRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'client@example.in', password: 'Password@123' }),
    });
    const clientData = await clientRes.json();
    clientToken = clientData.token;

    // Obtain Compliance Officer token
    const complianceRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'compliance@example.in', password: 'Password@123' }),
    });
    const compData = await complianceRes.json();
    complianceToken = compData.token;

    return () => server.close();
  }, 35000);

  it('1. Database Seeder successfully populated benchmark targets (1000 users, 200 clients, coherent logs)', () => {
    const users = dbStore.findUsers();
    expect(users.length).toBeGreaterThanOrEqual(1000);

    const clients = dbStore.findClients({});
    expect(clients.length).toBeGreaterThanOrEqual(200);

    const mandates = dbStore.findAllMandates();
    expect(mandates.length).toBeGreaterThanOrEqual(350);

    expect(dbStore.auditLogs.length).toBeGreaterThanOrEqual(1000);
    expect(dbStore.requests.size).toBeGreaterThanOrEqual(50);
  });

  it('2. Health check reports SMS service permanently disabled across the application', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.smsService).toContain('Disabled');
  });

  it('3. Google OAuth endpoint is permanently removed (404) and credentials auth succeeds', async () => {
    const googleRes = await fetch(`${baseUrl}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'investor.google@wealthadvisory.in',
        name: 'Arun Google User',
        role: 'client',
        googleId: 'g_oauth_test_12345',
      }),
    });
    expect(googleRes.status).toBe(404);

    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'ria@example.in',
        password: 'Password@123',
      }),
    });
    expect(loginRes.status).toBe(200);
    const loginData = await loginRes.json();
    expect(loginData.success).toBe(true);
    expect(loginData.token).toBeDefined();
    expect(loginData.user.email).toBe('ria@example.in');
  });

  it('4. RBAC: Client role is forbidden (403) from creating trade mandates (restricted to RIA/Admin)', async () => {
    const res = await fetch(`${baseUrl}/api/mandates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${clientToken}`,
      },
      body: JSON.stringify({
        clientId: 'c_001',
        title: 'Unauthorized Client Mandate Attempt',
        trades: [],
      }),
    });
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Access denied');
  });

  it('5. Live Requests API: Authenticated user can compose, submit, and retrieve requests', async () => {
    // Submit request
    const postRes = await fetch(`${baseUrl}/api/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${riaToken}`,
      },
      body: JSON.stringify({
        title: 'Q2 Asset Drift Rebalancing Request',
        category: 'Portfolio Rebalance Advisory',
        priority: 'high',
        description: 'Client portfolio drifted 8% above target equity allocation; executing tax-optimized trim.',
        proposedEquityRatio: 65,
        proposedDebtRatio: 25,
        proposedGoldRatio: 5,
        proposedCashRatio: 5,
      }),
    });
    expect(postRes.status).toBe(201);
    const postData = await postRes.json();
    expect(postData.success).toBe(true);
    expect(postData.data.id).toBeDefined();
    expect(postData.data.status).toBe('pending');

    // Retrieve requests
    const getRes = await fetch(`${baseUrl}/api/requests`, {
      headers: { Authorization: `Bearer ${riaToken}` },
    });
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.success).toBe(true);
    expect(getData.data.some((r) => r.id === postData.data.id)).toBe(true);
  });

  it('6. Compliance Officer can view requests and update status with audit comments', async () => {
    // Create request
    const postRes = await fetch(`${baseUrl}/api/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${riaToken}`,
      },
      body: JSON.stringify({
        title: 'Statutory Review for High Net Worth Family Trust',
        category: 'Statutory Compliance Review',
        priority: 'urgent',
        description: 'Requesting compliance officer sign-off under SEBI IA Regulation 19.',
      }),
    });
    const postData = await postRes.json();
    const requestId = postData.data.id;

    // Update as Compliance Officer
    const putRes = await fetch(`${baseUrl}/api/requests/${requestId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${complianceToken}`,
      },
      body: JSON.stringify({
        status: 'approved',
        responseNotes: 'Verified compliant with Regulation 19 risk profile tolerances.',
      }),
    });
    expect(putRes.status).toBe(200);
    const putData = await putRes.json();
    expect(putData.success).toBe(true);
    expect(putData.data.status).toBe('approved');
    expect(putData.data.responseNotes).toContain('Regulation 19');
  });
});
