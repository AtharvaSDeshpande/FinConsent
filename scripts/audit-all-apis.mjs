import crypto from 'node:crypto';

const BASE_URL = process.env.API_URL || 'http://localhost:5000';

async function testAllApis() {
  console.log('========================================================================');
  console.log(` AUDITING ENTIRE FINCONSENT API SURFACE (${BASE_URL})`);
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;
  const failures = [];

  function assert(condition, name, details = '') {
    if (condition) {
      console.log(`  ✔ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  ✖ [FAIL] ${name} ${details ? `(${details})` : ''}`);
      failed++;
      failures.push({ name, details });
    }
  }

  // --- 1. HEALTH & SYSTEM ---
  console.log('--- 1. Health & Unmapped Routes ---');
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  const healthData = await healthRes.json();
  assert(healthRes.status === 200 && healthData.status === 'healthy', 'GET /api/health returns 200 healthy');

  const unmappedRes = await fetch(`${BASE_URL}/api/non-existent-route-xyz`);
  const unmappedData = await unmappedRes.json();
  assert(unmappedRes.status === 404 && unmappedData.success === false, 'GET /api/404 returns pure JSON 404');

  // --- 2. AUTHENTICATION & SESSIONS ---
  console.log('\n--- 2. Authentication & Sessions ---');
  // Login Suresh RIA
  const riaLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ria@example.in', password: 'Password@123' }),
  });
  const riaLogin = await riaLoginRes.json();
  assert(riaLoginRes.status === 200 && riaLogin.token && riaLogin.user.role === 'ria', 'POST /api/auth/login (RIA)', `Status: ${riaLoginRes.status}`);
  const riaToken = riaLogin.token;

  // Login Client Rohan
  const clientLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'client@example.in', password: 'Password@123' }),
  });
  const clientLogin = await clientLoginRes.json();
  assert(clientLoginRes.status === 200 && clientLogin.token && clientLogin.user.role === 'client', 'POST /api/auth/login (Client)', `Status: ${clientLoginRes.status}`);
  const clientToken = clientLogin.token;

  // Login Compliance Officer
  const compLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'compliance@example.in', password: 'Password@123' }),
  });
  const compLogin = await compLoginRes.json();
  assert(compLoginRes.status === 200 && compLogin.token && compLogin.user.role === 'compliance_officer', 'POST /api/auth/login (Compliance)', `Status: ${compLoginRes.status}`);
  const compToken = compLogin.token;

  // Login Admin
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@example.in', password: 'Password@123' }),
  });
  const adminLogin = await adminLoginRes.json();
  assert(adminLoginRes.status === 200 && adminLogin.token && adminLogin.user.role === 'admin', 'POST /api/auth/login (Admin)', `Status: ${adminLoginRes.status}`);
  const adminToken = adminLogin.token;

  // Login invalid credentials
  const badLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ria@example.in', password: 'WrongPassword999!' }),
  });
  assert(badLoginRes.status === 401, 'POST /api/auth/login rejects wrong password with 401');

  // Roles endpoint
  const rolesRes = await fetch(`${BASE_URL}/api/auth/roles`);
  const rolesData = await rolesRes.json();
  assert(rolesRes.status === 200 && rolesData.roles?.ria && rolesData.roles?.client, 'GET /api/auth/roles returns complete definitions');

  // Guest session endpoint
  const guestRes = await fetch(`${BASE_URL}/api/auth/guest-session`, { method: 'POST' });
  const guestData = await guestRes.json();
  assert(guestRes.status === 200 && guestData.token && guestData.user.isGuest, 'POST /api/auth/guest-session issues guest token');

  // /api/auth/me for RIA
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${riaToken}` },
  });
  const meData = await meRes.json();
  assert(meRes.status === 200 && meData.quota && typeof meData.quota.activeMandates === 'number', 'GET /api/auth/me returns user and quota status');

  // /api/auth/me unauthenticated -> 401
  const unauthMeRes = await fetch(`${BASE_URL}/api/auth/me`);
  assert(unauthMeRes.status === 401, 'GET /api/auth/me unauthenticated returns 401');

  // /api/auth/profile update preferredLanguage
  const profileRes = await fetch(`${BASE_URL}/api/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${riaToken}`,
    },
    body: JSON.stringify({ preferredLanguage: 'hi' }),
  });
  const profileData = await profileRes.json();
  assert(profileRes.status === 200 && profileData.user.preferredLanguage === 'hi', 'PUT /api/auth/profile updates language');

  // Restore language to 'en'
  await fetch(`${BASE_URL}/api/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${riaToken}`,
    },
    body: JSON.stringify({ preferredLanguage: 'en' }),
  });

  // Self privilege escalation blocked
  const escalateRes = await fetch(`${BASE_URL}/api/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${riaToken}`,
    },
    body: JSON.stringify({ role: 'admin' }),
  });
  assert(escalateRes.status === 403, 'PUT /api/auth/profile prevents non-admin role escalation (403)');

  // --- 3. CLIENTS REGISTRY & RBAC ---
  console.log('\n--- 3. Client Registry & RBAC ---');
  // RIA gets own clients
  const riaClientsRes = await fetch(`${BASE_URL}/api/clients`, {
    headers: { Authorization: `Bearer ${riaToken}` },
  });
  const riaClients = await riaClientsRes.json();
  assert(riaClientsRes.status === 200 && Array.isArray(riaClients.data), 'GET /api/clients (RIA)', `Count: ${riaClients.data?.length}`);

  // Client role accessing /api/clients must be 403 Forbidden
  const clientClientsRes = await fetch(`${BASE_URL}/api/clients`, {
    headers: { Authorization: `Bearer ${clientToken}` },
  });
  assert(clientClientsRes.status === 403, 'GET /api/clients (Client) returns 403 Forbidden');

  // Compliance officer gets full clients list
  const compClientsRes = await fetch(`${BASE_URL}/api/clients`, {
    headers: { Authorization: `Bearer ${compToken}` },
  });
  const compClients = await compClientsRes.json();
  assert(compClientsRes.status === 200 && compClients.data.length >= riaClients.data.length, 'GET /api/clients (Compliance) returns full directory');

  // Create new client by RIA
  const uniquePan = `ABCDE${Math.floor(1000 + Math.random() * 9000)}Z`;
  const createClientRes = await fetch(`${BASE_URL}/api/clients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${riaToken}`,
    },
    body: JSON.stringify({
      name: 'Test Investor',
      pan: uniquePan,
      mobile: '9820098200',
      email: `test.${Date.now()}@investor.in`,
      portfolioValue: 5000000,
    }),
  });
  const createdClient = await createClientRes.json();
  assert(createClientRes.status === 201 && createdClient.data.id, 'POST /api/clients creates new client');
  const testClientId = createdClient.data?.id;

  // Client role attempting POST /api/clients must be 403
  const badCreateClientRes = await fetch(`${BASE_URL}/api/clients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${clientToken}`,
    },
    body: JSON.stringify({
      name: 'Illegal Client',
      pan: 'ABCDE9999Z',
      mobile: '9820098200',
      email: 'illegal@investor.in',
    }),
  });
  assert(badCreateClientRes.status === 403, 'POST /api/clients (Client) forbidden (403)');

  // GET /api/clients/:id by owner RIA
  const getClientRes = await fetch(`${BASE_URL}/api/clients/${testClientId}`, {
    headers: { Authorization: `Bearer ${riaToken}` },
  });
  assert(getClientRes.status === 200, 'GET /api/clients/:id by owner RIA returns 200');

  // --- 4. MANDATES WORKFLOW ---
  console.log('\n--- 4. Mandates Creation, Dispatch & Encryption ---');
  // List mandates (RIA)
  const riaMandatesRes = await fetch(`${BASE_URL}/api/mandates?status=all`, {
    headers: { Authorization: `Bearer ${riaToken}` },
  });
  const riaMandates = await riaMandatesRes.json();
  assert(riaMandatesRes.status === 200 && Array.isArray(riaMandates.data), 'GET /api/mandates?status=all (RIA)');

  // List mandates (Client)
  const clientMandatesRes = await fetch(`${BASE_URL}/api/mandates?status=all`, {
    headers: { Authorization: `Bearer ${clientToken}` },
  });
  const clientMandates = await clientMandatesRes.json();
  assert(clientMandatesRes.status === 200 && Array.isArray(clientMandates.data), 'GET /api/mandates?status=all (Client)', `Count: ${clientMandates.data?.length}`);

  // Create mandate
  const createMandateRes = await fetch(`${BASE_URL}/api/mandates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${riaToken}`,
    },
    body: JSON.stringify({
      clientId: 'cli_1', // Rohan Mehta
      title: 'Audit Verification Mandate',
      rationale: 'Rebalancing into high-quality sovereign debt instruments',
      currentAllocation: { equity: 75, debt: 15, gold: 5, cash: 5 },
      proposedAllocation: { equity: 60, debt: 25, gold: 10, cash: 5 },
      stcgAmount: 180000,
      ltcgAmount: 250000,
      cutoffHours: 48,
    }),
  });
  const createdMandateData = await createMandateRes.json();
  assert(createMandateRes.status === 201 && createdMandateData.data?.id, 'POST /api/mandates creates draft mandate');
  const mandateId = createdMandateData.data?.id;

  // Client forbidden from creating mandate
  const badMandateCreateRes = await fetch(`${BASE_URL}/api/mandates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${clientToken}`,
    },
    body: JSON.stringify({
      clientId: 'cli_1',
      title: 'Illegal Mandate',
    }),
  });
  assert(badMandateCreateRes.status === 403, 'POST /api/mandates (Client) forbidden (403)');

  // Direct status mutation to consented rejected with 403
  const badStatusMutationRes = await fetch(`${BASE_URL}/api/mandates/${mandateId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${riaToken}`,
    },
    body: JSON.stringify({ status: 'consented' }),
  });
  assert(badStatusMutationRes.status === 403, 'PUT /api/mandates/:id rejects direct mutation to consented (403)');

  // Dispatch mandate
  const dispatchRes = await fetch(`${BASE_URL}/api/mandates/${mandateId}/dispatch`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${riaToken}` },
  });
  const dispatchData = await dispatchRes.json();
  assert(dispatchRes.status === 200 && dispatchData.data.magicToken && dispatchData.data.password, 'POST /api/mandates/:id/dispatch returns magicToken & password');
  const magicToken = dispatchData.data.magicToken;
  const testPassword = dispatchData.data.password;

  // GET /api/mandates/:id by RIA
  const getMandateRes = await fetch(`${BASE_URL}/api/mandates/${mandateId}`, {
    headers: { Authorization: `Bearer ${riaToken}` },
  });
  const getMandateData = await getMandateRes.json();
  assert(getMandateRes.status === 200 && getMandateData.data.id === mandateId, 'GET /api/mandates/:id by RIA returns mandate details');

  // GET /api/mandates/:id by Client Rohan (cli_1)
  const clientGetMandateRes = await fetch(`${BASE_URL}/api/mandates/${mandateId}`, {
    headers: { Authorization: `Bearer ${clientToken}` },
  });
  const clientGetMandateData = await clientGetMandateRes.json();
  assert(clientGetMandateRes.status === 200 && clientGetMandateData.data.id === mandateId, 'GET /api/mandates/:id by Client owner returns 200');

  // --- 5. PUBLIC CLIENT REVIEW & STATUTORY CONSENT ---
  console.log('\n--- 5. Public Token Inspection, Unlock & OTP Flow ---');
  // Inspect token before password unlock -> unlocked: false, requiresUnlock: true
  const publicInspectRes = await fetch(`${BASE_URL}/api/public/mandates/${magicToken}`);
  const publicInspectData = await publicInspectRes.json();
  assert(publicInspectRes.status === 200 && publicInspectData.unlocked === false && publicInspectData.requiresUnlock === true, 'GET /api/public/mandates/:token (locked) returns minimal metadata');

  // Unlock with wrong password -> 401
  const badUnlockRes = await fetch(`${BASE_URL}/api/public/mandates/${magicToken}/unlock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'wrongpassword999' }),
  });
  assert(badUnlockRes.status === 401, 'POST /api/public/mandates/:token/unlock rejects bad password (401)');

  // Unlock with valid password -> 200 + unlockToken + decrypted data
  const validUnlockRes = await fetch(`${BASE_URL}/api/public/mandates/${magicToken}/unlock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: testPassword }),
  });
  const validUnlockData = await validUnlockRes.json();
  assert(validUnlockRes.status === 200 && validUnlockData.unlocked === true && validUnlockData.unlockToken, 'POST /api/public/mandates/:token/unlock returns unlockToken');
  const unlockToken = validUnlockData.unlockToken;

  // Inspect token with x-unlock-token header -> unlocked: true
  const unlockedInspectRes = await fetch(`${BASE_URL}/api/public/mandates/${magicToken}`, {
    headers: { 'x-unlock-token': unlockToken },
  });
  const unlockedInspectData = await unlockedInspectRes.json();
  assert(unlockedInspectRes.status === 200 && unlockedInspectData.unlocked === true && unlockedInspectData.data.mandate.taxPayable > 0, 'GET /api/public/mandates/:token with x-unlock-token returns decrypted finances');

  // Chat message send via public unlocked session
  const clientChatSendRes = await fetch(`${BASE_URL}/api/public/mandates/${magicToken}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-unlock-token': unlockToken,
    },
    body: JSON.stringify({ message: 'Can you clarify the capital gains calculation?' }),
  });
  const clientChatSendData = await clientChatSendRes.json();
  assert(clientChatSendRes.status === 201 && clientChatSendData.data.sender === 'client', 'POST /api/public/mandates/:token/chat (Client) posts message');

  // Chat message retrieve via public unlocked session
  const clientChatGetRes = await fetch(`${BASE_URL}/api/public/mandates/${magicToken}/chat`, {
    headers: { 'x-unlock-token': unlockToken },
  });
  const clientChatGetData = await clientChatGetRes.json();
  assert(clientChatGetRes.status === 200 && clientChatGetData.data.length >= 1, 'GET /api/public/mandates/:token/chat returns chat messages');

  // Request OTP
  const otpReqRes = await fetch(`${BASE_URL}/api/public/mandates/${magicToken}/request-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-unlock-token': unlockToken,
    },
  });
  const otpReqData = await otpReqRes.json();
  assert(otpReqRes.status === 200 && otpReqData.demoOtp, 'POST /api/public/mandates/:token/request-otp generates OTP');
  const demoOtp = otpReqData.demoOtp;

  // Verify OTP with missing statutory declarations -> 400
  const badVerifyRes = await fetch(`${BASE_URL}/api/public/mandates/${magicToken}/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-unlock-token': unlockToken,
    },
    body: JSON.stringify({ otp: demoOtp, statutoryDeclarationsAccepted: false }),
  });
  assert(badVerifyRes.status === 400, 'POST /api/public/mandates/:token/verify-otp requires statutory declarations');

  // Verify OTP successfully -> 200 + Section 65B receipt
  const verifyRes = await fetch(`${BASE_URL}/api/public/mandates/${magicToken}/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-unlock-token': unlockToken,
    },
    body: JSON.stringify({ otp: demoOtp, statutoryDeclarationsAccepted: true }),
  });
  const verifyData = await verifyRes.json();
  assert(verifyRes.status === 200 && verifyData.data.auditCertificate?.sha256Hash, 'POST /api/public/mandates/:token/verify-otp completes Section 65B consent');

  // --- 6. ADVISORY REQUESTS API ---
  console.log('\n--- 6. Advisory Requests API ---');
  // Compose request by RIA
  const createReqRes = await fetch(`${BASE_URL}/api/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${riaToken}`,
    },
    body: JSON.stringify({
      title: 'Tax Loss Harvesting Advisory',
      description: 'Reviewing potential loss harvesting opportunities in current quarter.',
      clientId: 'cli_1',
      category: 'Tax Planning & Section 234B',
      priority: 'high',
    }),
  });
  const createReqData = await createReqRes.json();
  assert(createReqRes.status === 201 && createReqData.data.id, 'POST /api/requests (RIA) creates advisory request');
  const createdReqId = createReqData.data.id;

  // List requests by RIA
  const listReqRes = await fetch(`${BASE_URL}/api/requests`, {
    headers: { Authorization: `Bearer ${riaToken}` },
  });
  const listReqData = await listReqRes.json();
  assert(listReqRes.status === 200 && Array.isArray(listReqData.data), 'GET /api/requests (RIA) returns requests');

  // List requests by Client
  const clientListReqRes = await fetch(`${BASE_URL}/api/requests`, {
    headers: { Authorization: `Bearer ${clientToken}` },
  });
  const clientListReqData = await clientListReqRes.json();
  assert(clientListReqRes.status === 200 && Array.isArray(clientListReqData.data), 'GET /api/requests (Client) returns requests');

  // Update request response notes
  const updateReqRes = await fetch(`${BASE_URL}/api/requests/${createdReqId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${riaToken}`,
    },
    body: JSON.stringify({
      status: 'in_review',
      responseNotes: 'Under compliance evaluation.',
    }),
  });
  assert(updateReqRes.status === 200, 'PUT /api/requests/:id updates status & responseNotes');

  // --- 7. BILLING & CHECKOUT ---
  console.log('\n--- 7. Billing & Pro Tier ---');
  const checkoutRes = await fetch(`${BASE_URL}/api/billing/create-checkout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${riaToken}` },
  });
  const checkoutData = await checkoutRes.json();
  assert(checkoutRes.status === 200 && checkoutData.data?.orderId, 'POST /api/billing/create-checkout generates Pro order');

  const clientCheckoutRes = await fetch(`${BASE_URL}/api/billing/create-checkout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${clientToken}` },
  });
  assert(clientCheckoutRes.status === 403, 'POST /api/billing/create-checkout (Client) returns 403');

  // --- 8. COMPLIANCE DOSSIER ---
  console.log('\n--- 8. Compliance Dossier & Regulation 19 ---');
  const dossierRes = await fetch(`${BASE_URL}/api/mandates/${mandateId}/dossier`, {
    headers: { Authorization: `Bearer ${compToken}` },
  });
  const dossierData = await dossierRes.json();
  assert(dossierRes.status === 200 && dossierData.data.regulatoryAct, 'GET /api/mandates/:id/dossier returns Regulation 19 compliance dossier');

  const clientDossierRes = await fetch(`${BASE_URL}/api/mandates/${mandateId}/dossier`, {
    headers: { Authorization: `Bearer ${clientToken}` },
  });
  assert(clientDossierRes.status === 403, 'GET /api/mandates/:id/dossier (Client) forbidden (403)');

  console.log('\n========================================================================');
  console.log(` AUDIT SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) {
    console.error('FAILURES:');
    failures.forEach((f) => console.error(` - ${f.name}: ${f.details}`));
    process.exit(1);
  }
}

testAllApis().catch((err) => {
  console.error('Fatal API Audit Error:', err);
  process.exit(1);
});
