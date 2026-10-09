import crypto from 'node:crypto';
import { Buffer } from 'node:buffer';

export const ENCRYPTION_VERSION = 1;
export const CIPHER_ALGORITHM = 'aes-256-gcm';
export const KDF_ALGORITHM = 'pbkdf2';
export const KDF_DIGEST = 'sha256';

/**
 * Returns default PBKDF2 rounds based on environment.
 * Recorded explicitly in ciphertext metadata so future decryptions never guess.
 */
export function getDefaultKdfRounds() {
  return (process.env.NODE_ENV === 'test' || process.env.FAST_CRYPTO === '1') ? 1000 : 100000;
}

/**
 * Server-side Master Key derivation from JWT_SECRET and stored/default KDF parameters.
 */
export function getServerMasterKey(kdfOptions = null) {
  const secret = process.env.JWT_SECRET || 'finconsent_master_key_default_2026';
  const rounds = Number(kdfOptions?.rounds) || getDefaultKdfRounds();
  const digest = kdfOptions?.digest || KDF_DIGEST;
  let salt = 'finconsent_server_salt_v1';

  if (kdfOptions?.salt) {
    salt = Buffer.isBuffer(kdfOptions.salt)
      ? kdfOptions.salt
      : Buffer.from(kdfOptions.salt, 'base64');
  }

  return crypto.pbkdf2Sync(secret, salt, rounds, 32, digest);
}

/**
 * Derives a 256-bit cryptographic key from the client's mandate password
 * using PBKDF2 with explicit parameters stored in metadata.
 */
export function deriveClientKey(password, kdfOptions) {
  if (!password) {
    throw new Error('PASSWORD_REQUIRED');
  }

  let saltBuf;
  let rounds = getDefaultKdfRounds();
  let digest = KDF_DIGEST;

  if (kdfOptions) {
    if (Buffer.isBuffer(kdfOptions)) {
      saltBuf = kdfOptions;
    } else if (typeof kdfOptions === 'string') {
      saltBuf = Buffer.from(kdfOptions, 'base64');
    } else if (typeof kdfOptions === 'object') {
      rounds = Number(kdfOptions.rounds) || rounds;
      digest = kdfOptions.digest || digest;
      if (kdfOptions.salt) {
        saltBuf = Buffer.isBuffer(kdfOptions.salt)
          ? kdfOptions.salt
          : Buffer.from(kdfOptions.salt, 'base64');
      }
    }
  }

  if (!saltBuf || saltBuf.length === 0) {
    throw new Error('KDF_SALT_REQUIRED');
  }

  const normalizedPassword = String(password).trim();
  return crypto.pbkdf2Sync(normalizedPassword, saltBuf, rounds, 32, digest);
}

/**
 * Normalizes client PAN (last 4 digits) and DOB into DDMMYYYY format.
 * Strictly guarantees identical canonical string derivation across encryption and decryption.
 * Example: PAN "ABCPM1234M", DOB "1978-08-14" -> "123414081978"
 */
export function formatClientPassword(pan, dob) {
  if (!pan || !dob) return '';

  const cleanPan = String(pan).trim().toUpperCase();
  // Standard PAN format: 5 letters + 4 digits + 1 letter (e.g. ABCPM1234F)
  const panStandardMatch = cleanPan.match(/^[A-Z]{5}(\d{4})[A-Z]$/);
  let panLast4 = '';

  if (panStandardMatch && panStandardMatch[1]) {
    panLast4 = panStandardMatch[1];
  } else {
    const digitsOnly = cleanPan.replace(/\D/g, '');
    if (digitsOnly.length >= 4) {
      panLast4 = digitsOnly.slice(-4);
    } else {
      panLast4 = cleanPan.slice(-4);
    }
  }

  let cleanDob = String(dob).trim();
  let dobFormatted = '';

  if (cleanDob.includes('-')) {
    const parts = cleanDob.split('-').map((p) => p.trim());
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      const [yyyy, mm, dd] = parts;
      dobFormatted = `${dd.padStart(2, '0')}${mm.padStart(2, '0')}${yyyy}`;
    } else if (parts[2]?.length === 4) {
      // DD-MM-YYYY
      const [dd, mm, yyyy] = parts;
      dobFormatted = `${dd.padStart(2, '0')}${mm.padStart(2, '0')}${yyyy}`;
    } else {
      dobFormatted = cleanDob.replace(/\D/g, '');
    }
  } else if (cleanDob.includes('/')) {
    const parts = cleanDob.split('/').map((p) => p.trim());
    if (parts[2]?.length === 4) {
      // DD/MM/YYYY
      const [dd, mm, yyyy] = parts;
      dobFormatted = `${dd.padStart(2, '0')}${mm.padStart(2, '0')}${yyyy}`;
    } else if (parts[0]?.length === 4) {
      // YYYY/MM/DD
      const [yyyy, mm, dd] = parts;
      dobFormatted = `${dd.padStart(2, '0')}${mm.padStart(2, '0')}${yyyy}`;
    } else {
      dobFormatted = cleanDob.replace(/\D/g, '');
    }
  } else {
    dobFormatted = cleanDob.replace(/\D/g, '');
  }

  return `${panLast4}${dobFormatted}`;
}

/**
 * Encrypts arbitrary payload with a 256-bit DEK using AES-256-GCM.
 * Records explicit encryption version and algorithm metadata.
 */
export function encryptPayload(payload, dek) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(CIPHER_ALGORITHM, dek, iv);
  const jsonStr = JSON.stringify(payload);
  const ciphertext = Buffer.concat([cipher.update(jsonStr, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    encryptionVersion: ENCRYPTION_VERSION,
    algorithm: CIPHER_ALGORITHM,
    ciphertext: ciphertext.toString('base64'),
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    authTagLength: 16,
  };
}

/**
 * Decrypts AES-256-GCM ciphertext using the given DEK.
 * Validates encryption version and authenticates the authentication tag.
 */
export function decryptPayload(encrypted, dek) {
  if (!encrypted || typeof encrypted !== 'object') {
    throw new Error('INVALID_ENCRYPTED_PAYLOAD');
  }

  const version = encrypted.encryptionVersion || encrypted.version || 1;
  if (version !== ENCRYPTION_VERSION) {
    throw new Error(`UNSUPPORTED_ENCRYPTION_VERSION: version ${version} is not supported`);
  }

  const iv = Buffer.from(encrypted.iv, 'base64');
  const authTag = Buffer.from(encrypted.authTag, 'base64');
  const ciphertext = Buffer.from(encrypted.ciphertext, 'base64');

  const decipher = crypto.createDecipheriv(CIPHER_ALGORITHM, dek, iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');

  return JSON.parse(plaintext);
}

/**
 * Wraps (encrypts) the Data Encryption Key with a wrapping key using AES-256-GCM.
 * Records explicit encryption version, algorithm, and KDF metadata.
 */
export function wrapDek(dek, wrappingKey, kdfMetadata = null) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(CIPHER_ALGORITHM, wrappingKey, iv);
  const ciphertext = Buffer.concat([cipher.update(dek), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const wrapped = {
    encryptionVersion: ENCRYPTION_VERSION,
    algorithm: CIPHER_ALGORITHM,
    ciphertext: ciphertext.toString('base64'),
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    authTagLength: 16,
  };

  if (kdfMetadata) {
    wrapped.kdf = kdfMetadata;
  }

  return wrapped;
}

/**
 * Unwraps (decrypts) the Data Encryption Key using AES-256-GCM.
 * Authenticates data tag and verifies encryption version.
 */
export function unwrapDek(wrapped, wrappingKey) {
  if (!wrapped || typeof wrapped !== 'object') {
    throw new Error('INVALID_WRAPPED_DEK');
  }

  const version = wrapped.encryptionVersion || wrapped.version || 1;
  if (version !== ENCRYPTION_VERSION) {
    throw new Error(`UNSUPPORTED_ENCRYPTION_VERSION: version ${version} is not supported`);
  }

  const iv = Buffer.from(wrapped.iv, 'base64');
  const authTag = Buffer.from(wrapped.authTag, 'base64');
  const ciphertext = Buffer.from(wrapped.ciphertext, 'base64');

  const decipher = crypto.createDecipheriv(CIPHER_ALGORITHM, wrappingKey, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

/**
 * Implements dual-envelope encryption for a mandate payload:
 * 1. Encrypts sensitive fields with a random 256-bit DEK.
 * 2. Wraps DEK for RIA/internal access using the Server Master Key (persists server KDF metadata).
 * 3. Wraps DEK for Client access using PBKDF2(PAN_last_4 + DOB, salt) (persists client KDF metadata).
 *
 * Explicit encryption versioning, algorithms, and KDF parameters are deterministically stored.
 * Neither the client password nor plaintext DEK is stored in the database.
 */
export function protectMandatePayload(sensitivePayload, clientPassword) {
  const dek = crypto.randomBytes(32);
  const encryptedPayload = encryptPayload(sensitivePayload, dek);

  const rounds = getDefaultKdfRounds();

  // RIA context wrapping
  const serverSalt = Buffer.from('finconsent_server_salt_v1').toString('base64');
  const serverKdf = {
    algorithm: KDF_ALGORITHM,
    digest: KDF_DIGEST,
    rounds,
    salt: serverSalt,
  };
  const serverMasterKey = getServerMasterKey(serverKdf);
  const serverWrappedDek = wrapDek(dek, serverMasterKey, serverKdf);

  // Client context wrapping
  let clientWrappedDek = null;
  if (clientPassword) {
    const saltBytes = crypto.randomBytes(16);
    const clientKdf = {
      algorithm: KDF_ALGORITHM,
      digest: KDF_DIGEST,
      rounds,
      salt: saltBytes.toString('base64'),
    };
    const clientDerivedKey = deriveClientKey(clientPassword, clientKdf);
    const wrapped = wrapDek(dek, clientDerivedKey, clientKdf);
    clientWrappedDek = {
      ...wrapped,
      salt: clientKdf.salt, // Top-level salt preserved for legacy compatibility
    };
  }

  return {
    encryptionVersion: ENCRYPTION_VERSION,
    encryptedPayload,
    serverWrappedDek,
    clientWrappedDek,
  };
}

/**
 * Decrypts mandate for authorized RIA using Server Master Key.
 * The RIA does not need to know the client's PAN or DOB.
 */
export function unlockMandateWithServerKey(mandate) {
  if (!mandate || !mandate.encryptedPayload || !mandate.serverWrappedDek) {
    return mandate; // Unencrypted legacy fallback
  }

  try {
    const kdfOptions = mandate.serverWrappedDek.kdf || null;
    const serverMasterKey = getServerMasterKey(kdfOptions);
    const dek = unwrapDek(mandate.serverWrappedDek, serverMasterKey);
    const decrypted = decryptPayload(mandate.encryptedPayload, dek);

    return {
      ...mandate,
      ...decrypted,
    };
  } catch (err) {
    return {
      ...mandate,
      _decryptionError: err.message,
    };
  }
}

/**
 * Unlocks and decrypts mandate for the client using the supplied password.
 * Verifies authenticity via AES-256-GCM authTag check on DEK unwrapping.
 * Throws an explicit error if the password is incorrect or corrupted.
 */
export function unlockMandateWithPassword(mandate, candidatePassword) {
  if (!mandate.clientWrappedDek || !mandate.encryptedPayload) {
    return mandate; // Legacy unencrypted fallback
  }

  const kdfOptions = mandate.clientWrappedDek.kdf || {
    salt: mandate.clientWrappedDek.salt,
    rounds: getDefaultKdfRounds(),
    digest: KDF_DIGEST,
    algorithm: KDF_ALGORITHM,
  };

  const candidateKey = deriveClientKey(candidatePassword, kdfOptions);

  try {
    const dek = unwrapDek(mandate.clientWrappedDek, candidateKey);
    const decrypted = decryptPayload(mandate.encryptedPayload, dek);
    return {
      ...mandate,
      ...decrypted,
    };
  } catch {
    throw new Error('INVALID_MANDATE_PASSWORD');
  }
}
