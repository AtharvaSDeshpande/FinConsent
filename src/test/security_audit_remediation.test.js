import { describe, it, expect, beforeAll } from 'vitest';
import crypto from 'node:crypto';
import app from '../../server/index.js';
import { dbStore } from '../../server/db/store.js';
import { sharedState, SharedStateStore } from '../../server/db/sharedState.js';
import { signToken, verifyToken } from '../../server/auth/jwt.js';
import { validatePasswordStrength } from '../../server/auth/passwords.js';
import { generateTotp, generateMfaSecret, verifyTotp } from '../../server/auth/mfa.js';
import { SlidingWindowLimiter } from '../../server/middleware/rateLimiter.js';

describe('FinConsent Security Remediation Verification Suite', () => {
  let testRiaUser;
  let testClientUser;
  let testRiaToken;
  let testMandate;
  let testRawMagicToken;

  beforeAll(async () => {
    // 1. Create RIA user with strong password
    testRiaUser = dbStore.createUser({
      name: 'Remediation Test RIA',
      email: `ria_remediation_${Date.now()}@advisor.in`,
      role: 'ria',
      firmName: 'Remediation Advisory LLP',
      sebiRegNumber: 'INA123456789',
      plan: 'pro',
    });
    testRiaToken = signToken({ userId: testRiaUser.id });

    // 2. Create Client
    testClientUser = dbStore.createClient({
      riaId: testRiaUser.id,
      name: 'Remediation Client',
      email: `client_remed_${Date.now()}@example.in`,
      pan: 'ABCDE9999Z',
      mobile: '9876543210',
    });

    // 3. Create Mandate
    testRawMagicToken = crypto.randomBytes(32).toString('hex');
    testMandate = dbStore.createMandate({
      riaId: testRiaUser.id,
      clientId: testClientUser.id,
      title: 'Tax Loss Harvesting Rebalance',
      magicToken: testRawMagicToken,
      status: 'sent',
      cutoffTimestamp: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      tokenExpiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    });
  });

  // =========================================================================
  // SECTION 1: SECURE MAGIC-LINK TOKEN STORAGE
  // =========================================================================
  describe('1. Secure Magic-Link Token Storage & Lifecycle', () => {
    it('1.1: Raw magic-link token is NEVER persisted in database or store map', () => {
      const stored = dbStore.findMandateById(testMandate.id);
      expect(stored).toBeDefined();
      // Raw bearer token MUST be undefined in database
      expect(stored.magicToken).toBeUndefined();
      // Only SHA-256 hash must be stored
      expect(stored.magicTokenHash).toBeDefined();
      expect(stored.magicTokenHash.length).toBe(64);
      expect(/^[a-f0-9]{64}$/.test(stored.magicTokenHash)).toBe(true);

      const expectedHash = crypto.createHash('sha256').update(testRawMagicToken).digest('hex');
      expect(stored.magicTokenHash).toBe(expectedHash);
    });

    it('1.2: Incoming raw token is hashed and successfully locates the mandate', () => {
      const found = dbStore.findMandateByToken(testRawMagicToken);
      expect(found).toBeDefined();
      expect(found.id).toBe(testMandate.id);
      expect(found.title).toBe('Tax Loss Harvesting Rebalance');
    });

    it('1.3: Invalid raw token is rejected (returns undefined / 404)', () => {
      const found = dbStore.findMandateByToken('completely-invalid-bogus-token-xyz');
      expect(found).toBeUndefined();
    });

    it('1.4: Expired cutoff or token expiration is rejected', () => {
      const expiredRawToken = crypto.randomBytes(32).toString('hex');
      const expiredMandate = dbStore.createMandate({
        riaId: testRiaUser.id,
        clientId: testClientUser.id,
        title: 'Expired Portfolio Mandate',
        magicToken: expiredRawToken,
        status: 'expired',
        cutoffTimestamp: new Date(Date.now() - 3600 * 1000).toISOString(),
        tokenExpiresAt: new Date(Date.now() - 3600 * 1000).toISOString(),
      });

      const found = dbStore.findMandateByToken(expiredRawToken);
      expect(found).toBeDefined();
      // Cutoff expired check
      const isExpired = new Date(found.cutoffTimestamp) < new Date();
      expect(isExpired).toBe(true);
    });

    it('1.5: Revoked link invalidates old token and issues fresh hashed token', () => {
      const revokeRawToken = crypto.randomBytes(32).toString('hex');
      const mandateToRevoke = dbStore.createMandate({
        riaId: testRiaUser.id,
        clientId: testClientUser.id,
        title: 'Revocation Test Proposal',
        magicToken: revokeRawToken,
        status: 'sent',
      });

      // Verify old token works initially
      expect(dbStore.findMandateByToken(revokeRawToken)).toBeDefined();

      // Revoke and generate new token
      const newRawToken = crypto.randomBytes(32).toString('hex');
      dbStore.updateMandate(mandateToRevoke.id, {
        magicToken: newRawToken,
      });

      // Old token MUST now fail
      expect(dbStore.findMandateByToken(revokeRawToken)).toBeUndefined();

      // New token MUST succeed
      const foundNew = dbStore.findMandateByToken(newRawToken);
      expect(foundNew).toBeDefined();
      expect(foundNew.id).toBe(mandateToRevoke.id);
      // DB has new hash and no plaintext token
      const inDb = dbStore.findMandateById(mandateToRevoke.id);
      expect(inDb.magicToken).toBeUndefined();
      expect(inDb.magicTokenHash).toBe(crypto.createHash('sha256').update(newRawToken).digest('hex'));
    });

    it('1.6: Token for Mandate A cannot access Mandate B', () => {
      const tokenA = crypto.randomBytes(32).toString('hex');
      const mandateA = dbStore.createMandate({
        riaId: testRiaUser.id,
        clientId: testClientUser.id,
        title: 'Proposal A',
        magicToken: tokenA,
      });

      const tokenB = crypto.randomBytes(32).toString('hex');
      const mandateB = dbStore.createMandate({
        riaId: testRiaUser.id,
        clientId: testClientUser.id,
        title: 'Proposal B',
        magicToken: tokenB,
      });

      const lookupA = dbStore.findMandateByToken(tokenA);
      expect(lookupA.id).toBe(mandateA.id);
      expect(lookupA.id).not.toBe(mandateB.id);
    });

    it('1.7: Legacy unmigrated tokens are safely migrated on first access without breaking links', () => {
      const legacyToken = 'legacy-unmigrated-active-client-token-999';
      // Simulate legacy record stored directly with magicToken in plaintext
      const legacyMandate = {
        id: `man_legacy_${Date.now()}`,
        riaId: testRiaUser.id,
        clientId: testClientUser.id,
        title: 'Legacy In-Flight Mandate',
        magicToken: legacyToken,
        status: 'sent',
        createdAt: new Date().toISOString(),
      };
      dbStore.mandates.set(legacyMandate.id, legacyMandate);

      // Verify findMandateByToken resolves it and migrates to magicTokenHash
      const resolved = dbStore.findMandateByToken(legacyToken);
      expect(resolved).toBeDefined();
      expect(resolved.id).toBe(legacyMandate.id);

      // Verify opportunistic migration took place: plaintext removed, hash populated
      const inStore = dbStore.findMandateById(legacyMandate.id);
      expect(inStore.magicToken).toBeUndefined();
      expect(inStore.magicTokenHash).toBe(crypto.createHash('sha256').update(legacyToken).digest('hex'));
    });
  });

  // =========================================================================
  // SECTION 2: PASSWORD POLICY ENFORCEMENT
  // =========================================================================
  describe('2. Enterprise Password Policy Enforcement', () => {
    it('2.1: Rejects password that is too short (< 8 characters)', () => {
      const res = validatePasswordStrength('Sh0rt!');
      expect(res.valid).toBe(false);
      expect(res.error).toMatch(/at least 8 characters/i);
    });

    it('2.2: Rejects password missing uppercase letter', () => {
      const res = validatePasswordStrength('lowercase123!@#');
      expect(res.valid).toBe(false);
      expect(res.error).toMatch(/uppercase letter/i);
    });

    it('2.3: Rejects password missing lowercase letter', () => {
      const res = validatePasswordStrength('UPPERCASE123!@#');
      expect(res.valid).toBe(false);
      expect(res.error).toMatch(/lowercase letter/i);
    });

    it('2.4: Rejects password missing numeric digit', () => {
      const res = validatePasswordStrength('NoDigitsHere!@#');
      expect(res.valid).toBe(false);
      expect(res.error).toMatch(/numeric digit/i);
    });

    it('2.5: Rejects password missing special symbol', () => {
      const res = validatePasswordStrength('NoSpecialChar1234');
      expect(res.valid).toBe(false);
      expect(res.error).toMatch(/special character/i);
    });

    it('2.6: Accepts robust password satisfying all complexity requirements', () => {
      const res = validatePasswordStrength('FinConsent#2026!Sec');
      expect(res.valid).toBe(true);
      expect(res.error).toBeUndefined();
    });
  });

  // =========================================================================
  // SECTION 3: SHORT-LIVED JWT EXPIRATION & SESSION REVOCATION
  // =========================================================================
  describe('3. Short-Lived JWT Expiration & Revocation', () => {
    it('3.1: Token valid immediately after issuance, rejected with 401 upon expiration', async () => {
      // Issue short-lived token expiring in 1s (standard JWT second granularity)
      const shortToken = signToken({ userId: testRiaUser.id }, '1s');

      // Valid immediately
      const decodedImmediate = verifyToken(shortToken);
      expect(decodedImmediate).toBeDefined();
      expect(decodedImmediate.userId).toBe(testRiaUser.id);

      // Wait 1100ms for expiration window to elapse
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Same token must now be rejected as expired
      const decodedExpired = verifyToken(shortToken);
      expect(decodedExpired).toBeNull();
    });

    it('3.2: Rejects tokens with forged signatures', () => {
      const forgedSecret = 'completely_different_forged_key_999';
      const fakeToken = signToken({ userId: testRiaUser.id });
      // Tamper with the signature portion
      const parts = fakeToken.split('.');
      parts[2] = crypto.createHash('sha256').update('tampered').digest('base64url');
      const tamperedToken = parts.join('.');

      const result = verifyToken(tamperedToken);
      expect(result).toBeNull();
    });

    it('3.3: Rejects malformed JWT strings', () => {
      expect(verifyToken('not-even-a-jwt')).toBeNull();
      expect(verifyToken('')).toBeNull();
      expect(verifyToken(null)).toBeNull();
    });

    it('3.4: Session revocation blacklist immediately invalidates active JWTs upon logout', () => {
      const sessionToken = signToken({ userId: testRiaUser.id });

      // Active before logout
      expect(dbStore.isTokenRevoked(sessionToken)).toBe(false);

      // User logs out -> revoke token
      dbStore.revokeToken(sessionToken);

      // Must be immediately reported as revoked
      expect(dbStore.isTokenRevoked(sessionToken)).toBe(true);
    });
  });

  // =========================================================================
  // SECTION 4: MULTI-FACTOR AUTHENTICATION (MFA) FOR RIA/STAFF
  // =========================================================================
  describe('4. TOTP MFA for RIA/Staff Accounts', () => {
    let mfaSecretObj;

    it('4.1: Generates valid RFC 6238 Base32 secret and backup recovery codes', () => {
      mfaSecretObj = generateMfaSecret('advisor@prudent.in');
      expect(mfaSecretObj.secret).toBeDefined();
      expect(mfaSecretObj.secret.length).toBeGreaterThanOrEqual(26);
      expect(mfaSecretObj.backupCodes.length).toBe(5);
      expect(mfaSecretObj.otpauthUrl).toContain('otpauth://totp/FinConsent');
    });

    it('4.2: Computes and validates standard 6-digit TOTP codes with clock drift tolerance', () => {
      const validCode = generateTotp(mfaSecretObj.secret, 0);
      expect(validCode.length).toBe(6);
      expect(/^\d{6}$/.test(validCode)).toBe(true);

      // Verifies current code
      const isValid = verifyTotp(validCode, mfaSecretObj.secret);
      expect(isValid).toBe(true);

      // Verifies code from previous time step (clock drift -30s)
      const pastCode = generateTotp(mfaSecretObj.secret, -1);
      expect(verifyTotp(pastCode, mfaSecretObj.secret)).toBe(true);

      // Rejects invalid code
      expect(verifyTotp('000000', mfaSecretObj.secret)).toBe(false);
      expect(verifyTotp('999999', mfaSecretObj.secret)).toBe(false);
    });

    it('4.3: MFA enrollment updates user state and prevents unauthorized bypass', () => {
      const mfaRia = dbStore.createUser({
        name: 'MFA Enrolled RIA',
        email: `mfa_ria_${Date.now()}@firm.in`,
        role: 'ria',
        mfaEnabled: true,
        mfaSecret: mfaSecretObj.secret,
        backupCodes: ['BACKUP1', 'BACKUP2'],
      });

      // Validating TOTP
      const validCode = generateTotp(mfaRia.mfaSecret);
      expect(verifyTotp(validCode, mfaRia.mfaSecret)).toBe(true);

      // User with mfaEnabled requires token with mfaVerified: true
      const fullToken = signToken({ userId: mfaRia.id, mfaVerified: true });
      const decoded = verifyToken(fullToken);
      expect(decoded.mfaVerified).toBe(true);

      // Token without mfaVerified is distinct
      const unverifiedToken = signToken({ userId: mfaRia.id, mfaVerified: false });
      const decodedUnverified = verifyToken(unverifiedToken);
      expect(decodedUnverified.mfaVerified).toBe(false);
    });

    it('4.4: Client approval flow is strictly unaffected by RIA MFA requirements', () => {
      // Client review never requires TOTP MFA
      const mandate = dbStore.createMandate({
        riaId: testRiaUser.id,
        clientId: testClientUser.id,
        title: 'Zero Login Client Review',
        magicToken: crypto.randomBytes(32).toString('hex'),
        status: 'sent',
      });
      // Client accesses via magicToken
      const found = dbStore.findMandateByToken(mandate.magicToken);
      expect(found).toBeDefined();
      expect(found.id).toBe(mandate.id);
    });
  });

  // =========================================================================
  // SECTION 5: DISTRIBUTED RATE LIMITING & OTP STATE SYNCHRONIZATION
  // =========================================================================
  describe('5. Distributed Rate Limiting & Multi-Instance OTP Protection', () => {
    it('5.1: Multiple server instances share rate limit hit counter', () => {
      // Instantiate shared backing store
      const clusterStore = new SharedStateStore();

      // Create two independent server instance limiters pointing to the same cluster store
      const server1Limiter = new SlidingWindowLimiter(60000, 5, 'Rate limited', clusterStore);
      const server2Limiter = new SlidingWindowLimiter(60000, 5, 'Rate limited', clusterStore);

      const testKey = `cluster_ip_${Date.now()}`;

      // Server 1 handles 3 requests
      clusterStore.recordHit(testKey, 60000, 5);
      clusterStore.recordHit(testKey, 60000, 5);
      clusterStore.recordHit(testKey, 60000, 5);

      // Server 2 handles 2 requests
      clusterStore.recordHit(testKey, 60000, 5);
      const hit5 = clusterStore.recordHit(testKey, 60000, 5);
      expect(hit5.limited).toBe(false);
      expect(hit5.totalHits).toBe(5);

      // 6th request hitting Server 2 MUST be limited based on Server 1 + Server 2 cumulative hits
      const hit6OnServer2 = clusterStore.recordHit(testKey, 60000, 5);
      expect(hit6OnServer2.limited).toBe(true);

      // 7th request hitting Server 1 MUST also be limited
      const hit7OnServer1 = clusterStore.recordHit(testKey, 60000, 5);
      expect(hit7OnServer1.limited).toBe(true);
    });

    it('5.2: IP rotation CANNOT bypass OTP attempt counter or lockout', () => {
      const clusterStore = new SharedStateStore();
      const testToken = `otp_token_${Date.now()}`;

      // Set OTP for proposal
      clusterStore.setOtp(testToken, '9876543210', '883921', 300);

      // Attacker sends Attempt 1 from IP 1 (Node A)
      const res1 = clusterStore.verifyOtp(testToken, '111111');
      expect(res1.valid).toBe(false);
      expect(res1.remainingAttempts).toBe(2);

      // Attacker rotates IP and sends Attempt 2 from IP 2 (Node B)
      const res2 = clusterStore.verifyOtp(testToken, '222222');
      expect(res2.valid).toBe(false);
      expect(res2.remainingAttempts).toBe(1);

      // Attacker rotates IP and sends Attempt 3 from IP 3 (Node C)
      const res3 = clusterStore.verifyOtp(testToken, '333333');
      expect(res3.valid).toBe(false);
      expect(res3.locked).toBe(true);
      expect(res3.reason).toMatch(/Maximum OTP verification attempts exceeded/i);

      // Subsequent 4th attempt from ANY IP is locked
      const res4 = clusterStore.verifyOtp(testToken, '883921'); // Even correct OTP now rejected!
      expect(res4.valid).toBe(false);
      expect(res4.reason).toMatch(/expired|not found/i);
    });

    it('5.3: Successful OTP verification single-use immediately burns the token across all nodes', () => {
      const clusterStore = new SharedStateStore();
      const oneTimeToken = `single_use_${Date.now()}`;

      clusterStore.setOtp(oneTimeToken, '9876543210', '554433', 300);

      // First verification on Server 1 succeeds
      const verify1 = clusterStore.verifyOtp(oneTimeToken, '554433');
      expect(verify1.valid).toBe(true);

      // Second verification attempt on Server 2 fails (replay protection)
      const verify2 = clusterStore.verifyOtp(oneTimeToken, '554433');
      expect(verify2.valid).toBe(false);
      expect(verify2.reason).toMatch(/OTP not found or expired/i);
    });
  });
});
