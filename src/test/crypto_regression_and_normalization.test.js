import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import crypto from 'node:crypto';
import { Buffer } from 'node:buffer';
import app from '../../server/index.js';
import { dbStore } from '../../server/db/store.js';
import { runSeed } from '../../server/db/seed.js';
import {
  ENCRYPTION_VERSION,
  CIPHER_ALGORITHM,
  formatClientPassword,
  deriveClientKey,
  getServerMasterKey,
  protectMandatePayload,
  unlockMandateWithPassword,
  unlockMandateWithServerKey,
  encryptPayload,
  decryptPayload,
  wrapDek,
  unwrapDek,
} from '../../server/security/mandateCrypto.js';

describe('Cryptographic Regressions, Normalization & Versioning Suite', () => {
  let server;
  let baseUrl;

  beforeAll(async () => {
    server = app.listen(0);
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;
    await runSeed();
  });

  afterAll(() => {
    if (server) server.close();
  });

  // --------------------------------------------------------------------------
  // SECTION 1: Password Normalization Verification
  // --------------------------------------------------------------------------
  describe('1. Canonical Password Normalization (formatClientPassword)', () => {
    it('1.1 Normalizes standard 10-character Indian PAN and ISO YYYY-MM-DD date', () => {
      const password = formatClientPassword('ABCPM1234F', '1978-08-14');
      expect(password).toBe('123414081978');
    });

    it('1.2 Normalizes slash-delimited date DD/MM/YYYY identically', () => {
      const password = formatClientPassword('ABCPM1234F', '14/08/1978');
      expect(password).toBe('123414081978');
    });

    it('1.3 Normalizes dash-delimited date DD-MM-YYYY identically', () => {
      const password = formatClientPassword('ABCPM1234F', '14-08-1978');
      expect(password).toBe('123414081978');
    });

    it('1.4 Normalizes unpadded single-digit days and months (e.g. 5/2/1972 -> 05021972)', () => {
      const password = formatClientPassword('ABCPS9012S', '1972-2-5');
      expect(password).toBe('901205021972');
    });

    it('1.5 Resilient to leading/trailing whitespace and lowercased PAN input', () => {
      const password = formatClientPassword('  abcpm1234f  ', '  1978-08-14  ');
      expect(password).toBe('123414081978');
    });

    it('1.6 Returns empty string when either PAN or DOB is missing', () => {
      expect(formatClientPassword(null, '1978-08-14')).toBe('');
      expect(formatClientPassword('ABCPM1234F', null)).toBe('');
      expect(formatClientPassword('', '')).toBe('');
    });
  });

  // --------------------------------------------------------------------------
  // SECTION 2: Explicit Encryption Versioning & Metadata Integrity
  // --------------------------------------------------------------------------
  describe('2. Encryption Versioning & Metadata Audit', () => {
    it('2.1 Protects payload with explicit version 1 and persists KDF metadata', () => {
      const payload = {
        trades: [{ securityName: 'TCS', units: 100 }],
        taxPayable: 45000,
      };
      const clientPassword = '123414081978';

      const protectedObj = protectMandatePayload(payload, clientPassword);

      expect(protectedObj.encryptionVersion).toBe(ENCRYPTION_VERSION);
      expect(protectedObj.encryptedPayload.encryptionVersion).toBe(ENCRYPTION_VERSION);
      expect(protectedObj.encryptedPayload.algorithm).toBe(CIPHER_ALGORITHM);
      expect(protectedObj.encryptedPayload.authTagLength).toBe(16);
      expect(protectedObj.encryptedPayload.ciphertext).toBeDefined();
      expect(protectedObj.encryptedPayload.iv).toBeDefined();
      expect(protectedObj.encryptedPayload.authTag).toBeDefined();

      // Check Server KDF metadata
      expect(protectedObj.serverWrappedDek.encryptionVersion).toBe(ENCRYPTION_VERSION);
      expect(protectedObj.serverWrappedDek.kdf).toBeDefined();
      expect(protectedObj.serverWrappedDek.kdf.algorithm).toBe('pbkdf2');
      expect(protectedObj.serverWrappedDek.kdf.digest).toBe('sha256');
      expect(protectedObj.serverWrappedDek.kdf.rounds).toBeGreaterThanOrEqual(1000);
      expect(protectedObj.serverWrappedDek.kdf.salt).toBeDefined();

      // Check Client KDF metadata
      expect(protectedObj.clientWrappedDek.encryptionVersion).toBe(ENCRYPTION_VERSION);
      expect(protectedObj.clientWrappedDek.kdf).toBeDefined();
      expect(protectedObj.clientWrappedDek.kdf.algorithm).toBe('pbkdf2');
      expect(protectedObj.clientWrappedDek.kdf.rounds).toBeGreaterThanOrEqual(1000);
      expect(protectedObj.clientWrappedDek.kdf.salt).toBeDefined();
    });

    it('2.2 Explicitly rejects unsupported encryption versions with controlled error', () => {
      const dek = crypto.randomBytes(32);
      const unsupportedPayload = {
        encryptionVersion: 999, // Future unsupported version
        algorithm: 'aes-256-gcm',
        ciphertext: 'AAAA',
        iv: 'BBBB',
        authTag: 'CCCC',
      };

      expect(() => decryptPayload(unsupportedPayload, dek)).toThrow(/UNSUPPORTED_ENCRYPTION_VERSION/);

      const unsupportedWrappedDek = {
        encryptionVersion: 999,
        ciphertext: 'AAAA',
        iv: 'BBBB',
        authTag: 'CCCC',
      };
      expect(() => unwrapDek(unsupportedWrappedDek, dek)).toThrow(/UNSUPPORTED_ENCRYPTION_VERSION/);
    });
  });

  // --------------------------------------------------------------------------
  // SECTION 3: AES-256-GCM Cryptographic Decryption & Regression Defense
  // --------------------------------------------------------------------------
  describe('3. AES-256-GCM Decryption Integrity & "Unsupported state" Prevention', () => {
    it('3.1 Successfully decrypts when correct password is provided', () => {
      const sensitiveData = {
        trades: [{ securityName: 'Infosys Ltd', units: 50 }],
        taxPayable: 18200,
        rationale: 'Portfolio rebalancing per SEBI Regulation 19',
      };
      const clientPassword = '123414081978';
      const protectedObj = protectMandatePayload(sensitiveData, clientPassword);

      const fakeMandate = {
        id: 'man_test_1',
        ...protectedObj,
      };

      const unlocked = unlockMandateWithPassword(fakeMandate, clientPassword);
      expect(unlocked.trades).toEqual(sensitiveData.trades);
      expect(unlocked.taxPayable).toBe(18200);
      expect(unlocked.rationale).toBe('Portfolio rebalancing per SEBI Regulation 19');
    });

    it('3.2 Rejects wrong password with INVALID_MANDATE_PASSWORD without crashing', () => {
      const sensitiveData = { trades: [], taxPayable: 1000 };
      const clientPassword = '123414081978';
      const protectedObj = protectMandatePayload(sensitiveData, clientPassword);

      const fakeMandate = { id: 'man_test_2', ...protectedObj };

      expect(() => unlockMandateWithPassword(fakeMandate, '999901011990')).toThrow('INVALID_MANDATE_PASSWORD');
    });

    it('3.3 Prevents "Unsupported state or unable to authenticate data" across different KDF round counts', () => {
      // Simulate mandate created with 100,000 rounds (e.g. production/seed)
      const dek = crypto.randomBytes(32);
      const saltBytes = crypto.randomBytes(16);
      const highRoundsKdf = {
        algorithm: 'pbkdf2',
        digest: 'sha256',
        rounds: 100000,
        salt: saltBytes.toString('base64'),
      };
      const clientKey = deriveClientKey('123414081978', highRoundsKdf);
      const clientWrappedDek = wrapDek(dek, clientKey, highRoundsKdf);
      const encryptedPayload = encryptPayload({ taxPayable: 35000 }, dek);

      const mandate = {
        id: 'man_cross_env_test',
        encryptionVersion: 1,
        encryptedPayload,
        clientWrappedDek,
      };

      // Even though Vitest runs with test settings, unwrap MUST use the stored 100,000 rounds
      const unlocked = unlockMandateWithPassword(mandate, '123414081978');
      expect(unlocked.taxPayable).toBe(35000);
    });

    it('3.4 Strictly enforces authentication tag integrity (detects ciphertext tampering)', () => {
      const sensitiveData = { taxPayable: 50000 };
      const clientPassword = '123414081978';
      const protectedObj = protectMandatePayload(sensitiveData, clientPassword);

      // Tamper with the encrypted ciphertext
      const originalCipherBuf = Buffer.from(protectedObj.encryptedPayload.ciphertext, 'base64');
      originalCipherBuf[0] ^= 0xff; // Flip bits
      protectedObj.encryptedPayload.ciphertext = originalCipherBuf.toString('base64');

      const tamperedMandate = { id: 'man_tampered', ...protectedObj };

      expect(() => unlockMandateWithPassword(tamperedMandate, clientPassword)).toThrow('INVALID_MANDATE_PASSWORD');
    });

    it('3.5 Strictly enforces authTag authenticity (detects authTag tampering)', () => {
      const sensitiveData = { taxPayable: 50000 };
      const clientPassword = '123414081978';
      const protectedObj = protectMandatePayload(sensitiveData, clientPassword);

      // Tamper with the authTag
      const tagBuf = Buffer.from(protectedObj.encryptedPayload.authTag, 'base64');
      tagBuf[0] ^= 0xff;
      protectedObj.encryptedPayload.authTag = tagBuf.toString('base64');

      const tamperedMandate = { id: 'man_tampered_tag', ...protectedObj };

      expect(() => unlockMandateWithPassword(tamperedMandate, clientPassword)).toThrow('INVALID_MANDATE_PASSWORD');
    });
  });

  // --------------------------------------------------------------------------
  // SECTION 4: Dual-Envelope Mandate Access Architecture
  // --------------------------------------------------------------------------
  describe('4. Dual-Envelope Architecture (RIA vs Client Access Model)', () => {
    it('4.1 Owning RIA accesses mandate transparently via Server Master Key without client password', () => {
      const mandate = dbStore.findMandateById('man_1');
      expect(mandate).toBeDefined();
      expect(mandate.riaId).toBe('usr_ria_suresh');

      // The unlocked mandate contains sensitive decrypted financial fields
      expect(mandate.sellBasket).toBeDefined();
      expect(Array.isArray(mandate.sellBasket)).toBe(true);
      expect(mandate.sellBasket.length).toBeGreaterThan(0);
      expect(mandate.taxPayable).toBeGreaterThan(0);
    });

    it('4.2 Client can unlock their mandate using their PAN last 4 + DOB password', () => {
      const client = dbStore.findClientById('cli_1');
      const expectedPassword = formatClientPassword(client.pan, client.dob);
      expect(expectedPassword).toBe('123414081978');

      const rawMandate = dbStore.mandates.get('man_1');
      const clientUnlocked = unlockMandateWithPassword(rawMandate, expectedPassword);

      expect(clientUnlocked.sellBasket).toBeDefined();
      expect(clientUnlocked.taxPayable).toBe(12480);
    });
  });

  // --------------------------------------------------------------------------
  // SECTION 5: Public API Contract & Unlock Verification
  // --------------------------------------------------------------------------
  describe('5. Public API Contracts (/api/public/mandates/:token)', () => {
    it('5.1 Unlocked mandate endpoint requires password before revealing financial data', async () => {
      const res = await fetch(`${baseUrl}/api/public/mandates/tok_rohan_mandate_a`);
      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(data.unlocked).toBe(false);
      expect(data.requiresUnlock).toBe(true);
      expect(data.data.mandate.sellBasket).toBeUndefined();
      expect(data.data.mandate.trades).toBeUndefined();
    });

    it('5.2 POST /api/public/mandates/:token/unlock accepts valid password and issues unlock token', async () => {
      const res = await fetch(`${baseUrl}/api/public/mandates/tok_rohan_mandate_a/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: '123414081978' }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(data.unlocked).toBe(true);
      expect(data.unlockToken).toBeDefined();
      expect(data.data.mandate.sellBasket).toBeDefined();
      expect(data.data.mandate.taxPayable).toBe(12480);
    });

    it('5.3 POST /api/public/mandates/:token/unlock rejects incorrect password with 401', async () => {
      const res = await fetch(`${baseUrl}/api/public/mandates/tok_rohan_mandate_a/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'wrongpassword' }),
      });
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('The password is incorrect or this mandate is unavailable.');
    });
  });
});
