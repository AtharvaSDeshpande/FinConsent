import crypto from 'node:crypto';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

// Encode buffer into Base32 string (RFC 4648)
export function base32Encode(buffer) {
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

// Decode Base32 string into Buffer
export function base32Decode(base32Str) {
  if (!base32Str || typeof base32Str !== 'string') return Buffer.alloc(0);
  const cleanStr = base32Str.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  let bits = 0;
  let value = 0;
  const bytes = [];

  for (let i = 0; i < cleanStr.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(cleanStr[i]);
    if (idx === -1) continue;

    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

// Generate RFC 6238 TOTP code (6 digits, HMAC-SHA1, 30s period)
export function generateTotp(secretBase32, timeOffsetSteps = 0, stepSeconds = 30) {
  const key = base32Decode(secretBase32);
  const epoch = Math.floor(Date.now() / 1000);
  const counter = Math.floor(epoch / stepSeconds) + timeOffsetSteps;

  const counterBuf = Buffer.alloc(8);
  counterBuf.writeBigInt64BE(BigInt(counter));

  const hmac = crypto.createHmac('sha1', key).update(counterBuf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
}

// Verify TOTP code with time drift window tolerance (-1, 0, +1 steps)
export function verifyTotp(inputCode, secretBase32, windowSteps = 1) {
  if (!inputCode || !secretBase32) return false;
  const cleanCode = String(inputCode).trim();
  if (cleanCode.length !== 6) return false;

  for (let offset = -windowSteps; offset <= windowSteps; offset++) {
    const expected = generateTotp(secretBase32, offset);
    if (crypto.timingSafeEqual(Buffer.from(cleanCode), Buffer.from(expected))) {
      return true;
    }
  }

  return false;
}

// Generate new random TOTP secret and recovery codes
export function generateMfaSecret(accountEmail = 'ria@finconsent.in') {
  const randomBytes = crypto.randomBytes(20);
  const secret = base32Encode(randomBytes);

  // Generate 5 single-use 8-character recovery backup codes
  const backupCodes = Array.from({ length: 5 }, () =>
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );

  const otpauthUrl = `otpauth://totp/FinConsent:${encodeURIComponent(accountEmail)}?secret=${secret}&issuer=FinConsent&algorithm=SHA1&digits=6&period=30`;

  return {
    secret,
    backupCodes,
    otpauthUrl,
  };
}
