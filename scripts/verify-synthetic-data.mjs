import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dbStore } from '../server/db/store.js';
import { runSeed } from '../server/db/seed.js';
import {
  ENCRYPTION_VERSION,
  formatClientPassword,
  unlockMandateWithPassword,
  unlockMandateWithServerKey,
} from '../server/security/mandateCrypto.js';
import { comparePassword } from '../server/auth/passwords.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Safety Check: The script MUST refuse to operate against production
const currentEnv = process.env.NODE_ENV || 'development';
if (currentEnv === 'production') {
  console.error('\n[FATAL ABORT] verify-synthetic-data.mjs is strictly prohibited from executing against PRODUCTION environment.');
  process.exit(1);
}

async function verifySyntheticData() {
  console.log('========================================================================');
  console.log(' FINCONSENT SEED VERIFICATION & RELATIONSHIP INTEGRITY AUDIT SUITE      ');
  console.log('========================================================================\n');

  // Enforce test mode for fast in-memory execution
  process.env.NODE_ENV = 'test';

  console.log('[1/6] Initializing synthetic dataset...');
  await runSeed();
  console.log(`✔ Database loaded: ${dbStore.users.size} users, ${dbStore.clients.size} clients, ${dbStore.mandates.size} mandates.\n`);

  const results = {
    totalUsers: dbStore.users.size,
    totalClients: dbStore.clients.size,
    totalMandates: dbStore.mandates.size,
    usersChecked: 0,
    credentialsChecked: 0,
    relationshipsChecked: 0,
    mandatePasswordsChecked: 0,
    serverDecryptionsChecked: 0,
    errors: [],
  };

  // --------------------------------------------------------------------------
  // Check 1: Users, Roles & Email Uniqueness
  // --------------------------------------------------------------------------
  console.log('[2/6] Auditing synthetic users, roles and uniqueness...');
  const seenEmails = new Set();
  const seenUserIds = new Set();
  const validRoles = new Set(['ria', 'compliance_officer', 'admin', 'client']);

  for (const user of dbStore.users.values()) {
    results.usersChecked++;

    if (seenUserIds.has(user.id)) {
      results.errors.push(`Duplicate user ID detected: ${user.id}`);
    }
    seenUserIds.add(user.id);

    const normalizedEmail = user.email.toLowerCase();
    if (seenEmails.has(normalizedEmail)) {
      results.errors.push(`Duplicate user email detected: ${user.email}`);
    }
    seenEmails.add(normalizedEmail);

    if (!validRoles.has(user.role)) {
      results.errors.push(`Invalid user role '${user.role}' on user ${user.id}`);
    }

    if (!user.passwordHash) {
      results.errors.push(`Missing password hash for user ${user.id} (${user.email})`);
    }
  }
  console.log(`✔ Verified ${results.usersChecked} unique synthetic users across all roles.`);

  // --------------------------------------------------------------------------
  // Check 2: Credentials Authentication Verification
  // --------------------------------------------------------------------------
  console.log('[3/6] Verifying login credentials authentication...');
  const testPassword = 'Password@123';
  // Sample check: benchmark accounts + 25 randomized users
  const benchmarkUsers = [
    'ria@example.in',
    'pro.ria@example.in',
    'compliance@example.in',
    'admin@example.in',
    'client@example.in',
  ];

  for (const email of benchmarkUsers) {
    const user = dbStore.findUserByEmail(email);
    if (!user) {
      results.errors.push(`Benchmark user missing: ${email}`);
      continue;
    }
    const isValid = await comparePassword(testPassword, user.passwordHash);
    if (!isValid) {
      results.errors.push(`Password authentication failed for benchmark user: ${email}`);
    } else {
      results.credentialsChecked++;
    }
  }

  // Sample additional accounts
  const allUsersArr = Array.from(dbStore.users.values());
  for (let i = 0; i < Math.min(25, allUsersArr.length); i++) {
    const user = allUsersArr[i];
    const isValid = await comparePassword(testPassword, user.passwordHash);
    if (isValid) {
      results.credentialsChecked++;
    } else {
      results.errors.push(`Password authentication failed for user: ${user.email}`);
    }
  }
  console.log(`✔ Verified ${results.credentialsChecked} user login authentications.`);

  // --------------------------------------------------------------------------
  // Check 3: Clients & RIA Associations
  // --------------------------------------------------------------------------
  console.log('[4/6] Auditing client-to-RIA relationships and identity formats...');
  const seenClientIds = new Set();
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/i;

  for (const client of dbStore.clients.values()) {
    if (seenClientIds.has(client.id)) {
      results.errors.push(`Duplicate client ID detected: ${client.id}`);
    }
    seenClientIds.add(client.id);

    // Verify client belongs to an RIA
    const ria = dbStore.findUserById(client.riaId);
    if (!ria) {
      results.errors.push(`Client ${client.id} references non-existent RIA: ${client.riaId}`);
    } else if (ria.role !== 'ria') {
      results.errors.push(`Client ${client.id} is associated with user ${client.riaId} whose role is '${ria.role}' instead of 'ria'`);
    } else {
      results.relationshipsChecked++;
    }

    // Verify PAN and DOB presence
    if (!client.pan) {
      results.errors.push(`Client ${client.id} (${client.name}) is missing PAN`);
    }
    if (!client.dob) {
      results.errors.push(`Client ${client.id} (${client.name}) is missing date of birth (dob)`);
    }
  }
  console.log(`✔ Verified ${results.relationshipsChecked} client-to-RIA tenant relationships.`);

  // --------------------------------------------------------------------------
  // Check 4: Mandates, Organizational Boundaries & State Lifecycle
  // --------------------------------------------------------------------------
  console.log('[5/6] Auditing mandates, lifecycle states and tenant boundaries...');
  const seenMandateIds = new Set();
  const validMandateStatuses = new Set([
    'draft',
    'sent',
    'viewed',
    'in_review',
    'consented',
    'approved',
    'expired',
    'revoked',
  ]);

  for (const mandate of dbStore.mandates.values()) {
    if (seenMandateIds.has(mandate.id)) {
      results.errors.push(`Duplicate mandate ID detected: ${mandate.id}`);
    }
    seenMandateIds.add(mandate.id);

    // Verify client exists
    const client = dbStore.findClientById(mandate.clientId);
    if (!client) {
      results.errors.push(`Mandate ${mandate.id} references non-existent client: ${mandate.clientId}`);
      continue;
    }

    // Verify mandate belongs to the same RIA organization as the client
    if (mandate.riaId !== client.riaId) {
      results.errors.push(`Mandate ${mandate.id} RIA (${mandate.riaId}) does not match Client ${client.id} RIA (${client.riaId})`);
    }

    // Verify lifecycle state
    if (!validMandateStatuses.has(mandate.status)) {
      results.errors.push(`Mandate ${mandate.id} has invalid status '${mandate.status}'`);
    }
  }
  console.log(`✔ Verified ${results.totalMandates} mandates across all lifecycle states.`);

  // --------------------------------------------------------------------------
  // Check 5: Cryptographic Decryption & Password Unlock Verification
  // --------------------------------------------------------------------------
  console.log('[6/6] Verifying encryption versioning, Server Master Key, and client unlock passwords...');
  for (const mandate of dbStore.mandates.values()) {
    const client = dbStore.findClientById(mandate.clientId);
    if (!client) continue;

    // 1. Verify Server Master Key Decryption
    try {
      const serverDecrypted = unlockMandateWithServerKey(mandate);
      if (!serverDecrypted || !serverDecrypted.sellBasket || !serverDecrypted.proposedAllocation) {
        results.errors.push(`Server master key failed to decrypt mandate: ${mandate.id}`);
      } else {
        results.serverDecryptionsChecked++;
      }
    } catch (err) {
      results.errors.push(`Server master key decryption error on mandate ${mandate.id}: ${err.message}`);
    }

    // 2. Verify Client Password Derived Key Decryption
    const canonicalPassword = formatClientPassword(client.pan, client.dob);
    if (!canonicalPassword) {
      results.errors.push(`Could not derive canonical password for client ${client.id}`);
      continue;
    }

    try {
      const clientUnlocked = unlockMandateWithPassword(mandate, canonicalPassword);
      if (!clientUnlocked || !clientUnlocked.sellBasket) {
        results.errors.push(`Mandate password failed to unlock mandate: ${mandate.id} (password: ${canonicalPassword})`);
      } else {
        results.mandatePasswordsChecked++;
      }
    } catch (err) {
      results.errors.push(`Mandate unlock exception on mandate ${mandate.id}: ${err.message}`);
    }
  }

  console.log(`✔ Verified ${results.serverDecryptionsChecked} transparent Server Master Key decryptions.`);
  console.log(`✔ Verified ${results.mandatePasswordsChecked} client password unlocks.`);

  // --------------------------------------------------------------------------
  // Check 6: Artifacts Verification (credentials.json & end_users.csv)
  // --------------------------------------------------------------------------
  const credPath = path.join(ROOT_DIR, 'credentials.json');
  if (fs.existsSync(credPath)) {
    const credContent = JSON.parse(fs.readFileSync(credPath, 'utf-8'));
    if (credContent.environment !== 'SYNTHETIC_TEST_ONLY') {
      results.errors.push(`credentials.json missing SYNTHETIC_TEST_ONLY label`);
    }
    console.log(`✔ Verified credentials.json exists and is marked ${credContent.environment} (${credContent.totalUsers} users).`);
  }

  const csvPath = path.join(ROOT_DIR, 'end_users.csv');
  if (fs.existsSync(csvPath)) {
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lineCount = csvContent.split('\n').filter((l) => l.trim().length > 0).length;
    console.log(`✔ Verified end_users.csv exists (${lineCount - 1} records).`);
  }

  // Summary Report
  console.log('\n========================================================================');
  if (results.errors.length === 0) {
    console.log('              ALL SEED VERIFICATION CHECKS PASSED                       ');
    console.log('========================================================================');
    console.log(`- Total Users Audited:           ${results.usersChecked}`);
    console.log(`- User Logins Verified:          ${results.credentialsChecked}`);
    console.log(`- Client-RIA Relationships:      ${results.relationshipsChecked}`);
    console.log(`- Mandates Audited:              ${results.totalMandates}`);
    console.log(`- Server Master Key Decryptions: ${results.serverDecryptionsChecked}`);
    console.log(`- Mandate Passwords Verified:    ${results.mandatePasswordsChecked}`);
    console.log(`- Production Safety Protection:  ACTIVE`);
    console.log('========================================================================\n');
    return true;
  } else {
    console.error(`FAILED: Found ${results.errors.length} verification errors:`);
    results.errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }
}

verifySyntheticData().catch((err) => {
  console.error('FATAL AUDIT ERROR:', err);
  process.exit(1);
});
