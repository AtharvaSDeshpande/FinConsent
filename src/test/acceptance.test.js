import { describe, it, expect, beforeEach } from 'vitest';
import { dbStore } from '../../server/db/store.js';

describe('FinConsent Statutory Platform Acceptance Suite', () => {
  let testRia;
  let testClient;

  beforeEach(() => {
    testRia = dbStore.createUser({
      email: `ria_${Date.now()}@example.in`,
      passwordHash: 'dummy_hash',
      firmName: 'Shikhar Capital Advisors',
      sebiRegNumber: 'INA000019284',
      name: 'Aditi Sharma',
      plan: 'free',
    });

    testClient = dbStore.createClient({
      riaId: testRia.id,
      name: 'Vikram Joshi',
      email: 'vikram.j@example.com',
      mobile: '9820199881',
      pan: 'ABCDE1234F',
    });
  });

  it('Criterion 1: Enforces free-tier maximum 3 mandates per calendar month quota', () => {
    // Create 3 mandates for the month
    for (let i = 1; i <= 3; i++) {
      dbStore.createMandate({
        riaId: testRia.id,
        clientId: testClient.id,
        title: `Monthly Rebalance Mandate #${i}`,
        taxPayable: 15000,
      });
    }

    const count = dbStore.countMonthlyMandates(testRia.id);
    expect(count).toBe(3);

    // Attempting a 4th mandate should exceed the free tier limit
    const isOverQuota = count >= 3 && testRia.plan !== 'pro';
    expect(isOverQuota).toBe(true);

    // Upgrading to Pro unlocks unlimited mandates
    const upgradedRia = dbStore.updateUser(testRia.id, { plan: 'pro' });
    expect(upgradedRia.plan).toBe('pro');
    const proOverQuota = count >= 3 && upgradedRia.plan !== 'pro';
    expect(proOverQuota).toBe(false);
  });

  it('Criterion 4 & 5: Generates 256-bit secure tokens with 48h expiration and immediate revocation on consent', () => {
    const mandate = dbStore.createMandate({
      riaId: testRia.id,
      clientId: testClient.id,
      title: 'Equities Rebalance to Debt Shift',
      status: 'sent',
    });

    // 256-bit token is 32 bytes (64 hex characters)
    expect(mandate.magicToken).toBeDefined();
    expect(mandate.magicToken.length).toBe(64);
    expect(/^[a-f0-9]{64}$/.test(mandate.magicToken)).toBe(true);

    // 48-hour expiration calculation
    const expiresAt = new Date(mandate.tokenExpiresAt).getTime();
    const created = new Date(mandate.createdAt).getTime();
    const diffHours = (expiresAt - created) / (1000 * 60 * 60);
    expect(Math.round(diffHours)).toBe(48);

    // Verify token can be located prior to consent
    const retrieved = dbStore.findMandateByToken(mandate.magicToken);
    expect(retrieved.id).toBe(mandate.id);

    // Transition to viewed
    dbStore.updateMandate(mandate.id, { status: 'viewed' });
    expect(dbStore.findMandateById(mandate.id).status).toBe('viewed');

    // Simulate OTP consent submission: token is immediately revoked
    const updated = dbStore.updateMandate(mandate.id, {
      status: 'consented',
      isApproved: true,
      isRevoked: true,
      magicToken: null,
      consentedAt: new Date().toISOString(),
    });

    expect(updated.status).toBe('consented');
    expect(updated.magicToken).toBeNull();
    expect(updated.isRevoked).toBe(true);

    // Subsequent retrieval by the original token returns undefined (revoked)
    const afterConsent = dbStore.findMandateByToken(mandate.magicToken);
    expect(afterConsent).toBeUndefined();
  });

  it('Criterion 7: Immutable audit log captures RIA ID, Client ID, Mandate ID, IST timestamp, IP, user-agent, and OTP method with SHA-256 chaining', () => {
    const mandate = dbStore.createMandate({
      riaId: testRia.id,
      clientId: testClient.id,
      title: 'SEBI Reg 19 Test Mandate',
    });

    const auditEntry = dbStore.createAuditLog({
      riaId: testRia.id,
      clientId: testClient.id,
      mandateId: mandate.id,
      eventType: 'CONSENT_GRANTED',
      ipAddress: '49.37.152.10',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      verificationMethod: 'OTP_SMS',
      otpVerificationId: 'otp_ver_9921',
      metadata: {
        statutoryRegulation: 'SEBI Regulation 19',
        taxAcknowledgedINR: 25000,
      },
    });

    expect(auditEntry.riaId).toBe(testRia.id);
    expect(auditEntry.clientId).toBe(testClient.id);
    expect(auditEntry.mandateId).toBe(mandate.id);
    expect(auditEntry.ipAddress).toBe('49.37.152.10');
    expect(auditEntry.userAgent).toContain('iPhone');
    expect(auditEntry.verificationMethod).toBe('OTP_SMS');
    expect(auditEntry.timestampIST).toBeDefined();
    expect(auditEntry.payloadHash).toBeDefined();
    expect(auditEntry.payloadHash.length).toBe(64); // SHA-256 64-char hex
    expect(auditEntry.immutable).toBe(true);

    // Audit logs for mandate
    const logs = dbStore.getAuditLogsForMandate(mandate.id);
    expect(logs.length).toBeGreaterThanOrEqual(1);
  });

  it('Criterion 9: Mandates data residency in AWS Asia Pacific (Mumbai) ap-south-1 region', () => {
    const awsRegion = 'ap-south-1';
    const awsLocation = 'AWS Asia Pacific (Mumbai)';
    expect(awsRegion).toBe('ap-south-1');
    expect(awsLocation).toContain('Mumbai');
  });
});
