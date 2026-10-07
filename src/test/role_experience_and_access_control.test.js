import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '../../server/index.js';
import { signToken } from '../../server/auth/jwt.js';
import { runSeed } from '../../server/db/seed.js';
import { dbStore } from '../../server/db/store.js';

describe('Role-Based Access Control, Tenant Isolation & User Experience Test Suite', () => {
  let server;
  let baseUrl;
  let riaSureshToken;
  let otherRiaToken;
  let clientRohanToken;
  let otherClientToken;
  let compliancePriyaToken;
  let adminVikramToken;

  beforeAll(async () => {
    if (dbStore.users.size === 0) {
      await runSeed();
    }
    server = app.listen(0);
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;

    // Valid authenticated tokens based on real seeded accounts
    riaSureshToken = signToken({ userId: 'usr_ria_suresh' });
    otherRiaToken = signToken({ userId: 'usr_ria_meera' });
    clientRohanToken = signToken({ userId: 'usr_client_rohan' });

    // Create an un-affiliated stranger client
    dbStore.createUser({
      id: 'usr_client_stranger',
      name: 'Stranger Client',
      email: 'stranger@example.in',
      role: 'client',
      clientId: 'cli_stranger_unaffiliated',
    });
    otherClientToken = signToken({ userId: 'usr_client_stranger' });

    compliancePriyaToken = signToken({ userId: 'usr_compliance_officer' });
    adminVikramToken = signToken({ userId: 'usr_admin_neha' });
  }, 35000);

  afterAll(() => {
    if (server) server.close();
  });

  describe('1. Mandates Access Scoping & Tenant Isolation', () => {
    it('rejects unauthenticated requests with 401', async () => {
      const res = await fetch(`${baseUrl}/api/mandates`);
      expect(res.status).toBe(401);
    });

    it('returns only firm mandates to the RIA who created them', async () => {
      const res = await fetch(`${baseUrl}/api/mandates`, {
        headers: { Authorization: `Bearer ${riaSureshToken}` },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
      // All returned mandates must belong to Suresh
      data.data.forEach((m) => {
        expect(m.riaId).toBe('usr_ria_suresh');
      });
    });

    it('returns only personal mandates to the client persona (Rohan Mehta)', async () => {
      const res = await fetch(`${baseUrl}/api/mandates`, {
        headers: { Authorization: `Bearer ${clientRohanToken}` },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      // Must return mandates addressed to cli_1 / Rohan Mehta
      expect(data.data.length).toBeGreaterThan(0);
      data.data.forEach((m) => {
        expect(m.clientId).toBe('cli_1');
      });
    });

    it('returns empty list for an unaffiliated client with no mandates', async () => {
      const res = await fetch(`${baseUrl}/api/mandates`, {
        headers: { Authorization: `Bearer ${otherClientToken}` },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.length).toBe(0);
    });

    it('allows Compliance Officer and Super Admin full statutory audit access', async () => {
      const resComp = await fetch(`${baseUrl}/api/mandates`, {
        headers: { Authorization: `Bearer ${compliancePriyaToken}` },
      });
      expect(resComp.status).toBe(200);
      const compData = await resComp.json();
      expect(compData.data.length).toBeGreaterThanOrEqual(1);

      const resAdmin = await fetch(`${baseUrl}/api/mandates`, {
        headers: { Authorization: `Bearer ${adminVikramToken}` },
      });
      expect(resAdmin.status).toBe(200);
      const adminData = await resAdmin.json();
      expect(adminData.data.length).toBeGreaterThanOrEqual(1);
    });

    it('strictly forbids a client from accessing another client mandate via direct ID', async () => {
      // man_1 is addressed to cli_1 (Rohan Mehta)
      const res = await fetch(`${baseUrl}/api/mandates/man_1`, {
        headers: { Authorization: `Bearer ${otherClientToken}` },
      });
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toMatch(/prepared for your account|access restricted/i);
    });

    it('strictly forbids a foreign RIA from accessing another RIA firm mandate', async () => {
      const res = await fetch(`${baseUrl}/api/mandates/man_1`, {
        headers: { Authorization: `Bearer ${otherRiaToken}` },
      });
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.success).toBe(false);
    });

    it('allows Rohan Mehta to view his own mandate man_1', async () => {
      const res = await fetch(`${baseUrl}/api/mandates/man_1`, {
        headers: { Authorization: `Bearer ${clientRohanToken}` },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('man_1');
      expect(data.data.clientId).toBe('cli_1');
    });
  });

  describe('2. Client Registry Boundaries (/api/clients)', () => {
    it('returns 403 Forbidden when a client attempts to view the client directory', async () => {
      const res = await fetch(`${baseUrl}/api/clients`, {
        headers: { Authorization: `Bearer ${clientRohanToken}` },
      });
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toMatch(/cannot access advisor client|cannot view the client registry/i);
    });

    it('returns 403 Forbidden when a client attempts to create a new client record', async () => {
      const res = await fetch(`${baseUrl}/api/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${clientRohanToken}`,
        },
        body: JSON.stringify({
          name: 'Hacker Client',
          pan: 'ABCDE9999Z',
          mobile: '9820099999',
        }),
      });
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.success).toBe(false);
    });

    it('allows RIA to access only their own clients', async () => {
      const res = await fetch(`${baseUrl}/api/clients`, {
        headers: { Authorization: `Bearer ${riaSureshToken}` },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
      data.data.forEach((c) => {
        expect(c.riaId).toBe('usr_ria_suresh');
      });
    });

    it('allows RIA to register a new client with validated Indian PAN and mobile', async () => {
      const res = await fetch(`${baseUrl}/api/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${riaSureshToken}`,
        },
        body: JSON.stringify({
          name: 'Ananya Sharma',
          pan: 'ANAYA1234F',
          email: 'ananya.sharma@example.in',
          mobile: '9820987654',
          portfolioValue: 4500000,
        }),
      });
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.pan).toBe('ANAYA1234F');
      expect(data.data.riaId).toBe('usr_ria_suresh');
    });
  });

  describe('3. Requests & Inquiries Authorization (/api/requests)', () => {
    let createdRequestId;

    it('allows Client to submit an advisory inquiry and automatically binds their identity', async () => {
      const res = await fetch(`${baseUrl}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${clientRohanToken}`,
        },
        body: JSON.stringify({
          title: 'Tax Question on Rebalancing',
          description: 'Can we offset STCG with previous year losses?',
          category: 'Tax Impact Question',
          priority: 'standard',
        }),
      });
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.clientId).toBe('cli_1');
      expect(data.data.userName).toBe('Rohan Mehta');
      createdRequestId = data.data.id;
    });

    it('forbids Client from marking requests as approved or completed', async () => {
      const res = await fetch(`${baseUrl}/api/requests/${createdRequestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${clientRohanToken}`,
        },
        body: JSON.stringify({
          status: 'approved',
          responseNotes: 'Self-approved by client',
        }),
      });
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toMatch(/Investors cannot modify request status|Clients cannot approve/i);
    });

    it('allows RIA to review and approve the request', async () => {
      const res = await fetch(`${baseUrl}/api/requests/${createdRequestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${riaSureshToken}`,
        },
        body: JSON.stringify({
          status: 'approved',
          responseNotes: 'Reviewed with statutory tax assessment. Eligible for offset.',
        }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('approved');
      expect(data.data.responseNotes).toContain('Reviewed with statutory tax assessment');
    });

    it('strictly isolates client inquiry lists to their own requests', async () => {
      const res = await fetch(`${baseUrl}/api/requests`, {
        headers: { Authorization: `Bearer ${clientRohanToken}` },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      data.data.forEach((r) => {
        expect(r.clientId === 'cli_1' || r.userName === 'Rohan Mehta').toBe(true);
      });
    });
  });
});
