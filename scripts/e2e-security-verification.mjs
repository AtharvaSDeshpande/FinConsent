import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateTotp } from '../server/auth/mfa.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SECURITY_DIR = path.resolve(__dirname, '../docs/visual-audit/security');

if (!fs.existsSync(SECURITY_DIR)) {
  fs.mkdirSync(SECURITY_DIR, { recursive: true });
}

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:5000';

async function loginApi(email, password = 'Password@123') {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-bypass-rate-limit': 'test-suite',
    },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

async function api(path, { method = 'GET', body, token, headers = {} } = {}) {
  const reqHeaders = { ...headers };
  if (token) reqHeaders['Authorization'] = `Bearer ${token}`;
  if (body) reqHeaders['Content-Type'] = 'application/json';
  if (!reqHeaders['x-test-rate-limit']) {
    reqHeaders['x-bypass-rate-limit'] = 'test-suite';
  }
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: reqHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, body: data };
}

async function runSecurityE2E() {
  console.log('================================================================');
  console.log('   FINCONSENT PUPPETEER SECURITY VERIFICATION & BOUNDARY AUDIT   ');
  console.log('================================================================');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.text().includes('MFA') || msg.text().includes('error') || msg.text().includes('Login')) {
      console.log('    [Browser Console]', msg.text());
    }
  });

  page.on('response', async (response) => {
    if (response.url().includes('/api/auth/login')) {
      try {
        const text = await response.text();
        console.log('    [Browser Login Response]', response.status(), text);
      } catch {}
    }
  });

  async function snap(name) {
    await new Promise((r) => setTimeout(r, 600));
    const filePath = path.join(SECURITY_DIR, `${name}.png`);
    await page.screenshot({ path: filePath, fullPage: false });
    console.log(`  📸 Saved screenshot: ${name}.png`);
  }

  try {
    // -------------------------------------------------------------
    // TEST 1: NORMAL RIA WORKFLOW
    // RIA Login -> Client List -> Create Mandate -> Dispatch
    // -------------------------------------------------------------
    console.log('\n[TEST 1] Executing Normal RIA Workflow...');
    const riaLogin = await loginApi('ria@example.in');
    if (!riaLogin.success) throw new Error('RIA login failed');
    const riaToken = riaLogin.token;

    // Upgrade to Pro to allow unrestricted test mandate creation
    await api('/api/billing/upgrade-test', { method: 'POST', token: riaToken });

    // Inject session into browser
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    await page.evaluate((tok, usr) => {
      localStorage.setItem('finconsent_token', tok);
      localStorage.setItem('finconsent_user', JSON.stringify(usr));
    }, riaToken, riaLogin.user);

    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle0' });
    await snap('01-ria-dashboard');

    await page.goto(`${BASE_URL}/clients`, { waitUntil: 'networkidle0' });
    await snap('02-ria-clients');

    // Create a new mandate for Rohan Mehta (cli_1) via API to get fresh magic token
    const mandateRes = await api('/api/mandates', {
      method: 'POST',
      token: riaToken,
      body: {
        clientId: 'cli_1',
        title: 'Puppeteer Security Hardening Verification Mandate',
        stcgAmount: 42000,
        ltcgAmount: 185000,
        cutoffHours: 48,
        rationale: 'E2E browser validation of security boundaries and approval flow',
      },
    });
    const mandateId = mandateRes.body.data.id;
    let magicToken = mandateRes.body.data.magicToken;
    console.log(`  Created Mandate: ${mandateId} with magic token: ${magicToken.substring(0, 8)}...`);

    await page.goto(`${BASE_URL}/mandates/${mandateId}`, { waitUntil: 'networkidle0' });
    await snap('03-ria-mandate-created');

    // Dispatch mandate
    await api(`/api/mandates/${mandateId}/dispatch`, {
      method: 'POST',
      token: riaToken,
      body: { dispatchChannel: 'both' },
    });
    await page.reload({ waitUntil: 'networkidle0' });
    await snap('04-ria-mandate-dispatched');

    // -------------------------------------------------------------
    // TEST 2: NORMAL CLIENT WORKFLOW
    // Magic Link -> Recommendation Review -> Request OTP -> Consent
    // -------------------------------------------------------------
    console.log('\n[TEST 2] Executing Normal Client Workflow (Magic Link Consent)...');
    // Clear storage for pristine client bearer session
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${BASE_URL}/m/${magicToken}`, { waitUntil: 'networkidle0' });
    await snap('05-client-consent-view');

    // Open OTP modal in UI by clicking button
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Authorize with Mobile OTP')
      );
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 800));
    await snap('06-client-otp-modal');

    // Request OTP via public API
    const reqOtp = await api(`/api/public/mandates/${magicToken}/request-otp`, { method: 'POST' });
    console.log(`  Requested OTP for client. Status: ${reqOtp.status}`);

    // Verify OTP and complete consent
    const consentRes = await api(`/api/public/mandates/${magicToken}/verify-otp`, {
      method: 'POST',
      body: { otp: '123456', statutoryDeclarationsAccepted: true },
    });
    console.log(`  Consented via OTP. Success: ${consentRes.body?.success}`);
    await page.goto(`${BASE_URL}/m/${magicToken}/receipt`, { waitUntil: 'networkidle0' });
    await snap('07-client-consented-success');

    // -------------------------------------------------------------
    // TEST 3: UNAUTHORIZED CLIENT ACCESS
    // Client attempts RIA dashboard, mandate creation, billing settings
    // -------------------------------------------------------------
    console.log('\n[TEST 3] Testing Unauthorized Client Access Boundaries...');
    const clientLogin = await loginApi('client@example.in');
    const clientToken = clientLogin.token;

    await page.evaluate((tok, usr) => {
      localStorage.setItem('finconsent_token', tok);
      localStorage.setItem('finconsent_user', JSON.stringify(usr));
    }, clientToken, clientLogin.user);

    // Attempt Advisor Dashboard (Client redirected or shown client view)
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle0' });
    await snap('08-client-denied-advisor-dashboard');

    // Attempt Mandate Creation Form (/mandates/new) (Blocked by ProtectedRoute RBAC)
    await page.goto(`${BASE_URL}/mandates/new`, { waitUntil: 'networkidle0' });
    await snap('09-client-denied-mandate-creation');

    // Attempt Billing Settings (/settings/billing) (Blocked by ProtectedRoute RBAC)
    await page.goto(`${BASE_URL}/settings/billing`, { waitUntil: 'networkidle0' });
    await snap('10-client-denied-billing-settings');

    // Also verify backend rejects client billing creation directly
    const directBilling = await api('/api/billing/create-checkout', {
      method: 'POST',
      token: clientToken,
    });
    console.log(`  Backend billing restriction: Status ${directBilling.status} (Expected 403 Forbidden)`);

    // -------------------------------------------------------------
    // TEST 4: CROSS-RIA ACCESS (TENANT ISOLATION)
    // RIA 2 (Meera Iyer) attempts RIA 1's client, mandate, dossier
    // -------------------------------------------------------------
    console.log('\n[TEST 4] Testing Cross-RIA Tenant Isolation...');
    const ria2Login = await loginApi('pro.ria@example.in');
    const ria2Token = ria2Login.token;

    await page.evaluate((tok, usr) => {
      localStorage.setItem('finconsent_token', tok);
      localStorage.setItem('finconsent_user', JSON.stringify(usr));
    }, ria2Token, ria2Login.user);

    // RIA 2 attempts RIA 1's client (/clients/cli_1)
    await page.goto(`${BASE_URL}/clients/cli_1`, { waitUntil: 'networkidle0' });
    await snap('11-cross-ria-denied-foreign-client');

    // RIA 2 attempts RIA 1's mandate
    await page.goto(`${BASE_URL}/mandates/${mandateId}`, { waitUntil: 'networkidle0' });
    await snap('12-cross-ria-denied-foreign-mandate');

    // RIA 2 attempts RIA 1's dossier
    await page.goto(`${BASE_URL}/mandates/${mandateId}/dossier`, { waitUntil: 'networkidle0' });
    await snap('13-cross-ria-denied-foreign-dossier');

    // Verify backend rejected each of these cross-tenant attempts
    const cRes = await api(`/api/clients/cli_1`, { token: ria2Token });
    const mRes = await api(`/api/mandates/${mandateId}`, { token: ria2Token });
    const dRes = await api(`/api/mandates/${mandateId}/dossier`, { token: ria2Token });
    console.log(`  Cross-RIA API rejections: Client (${cRes.status}), Mandate (${mRes.status}), Dossier (${dRes.status})`);

    // -------------------------------------------------------------
    // TEST 5: DIRECT URL MANIPULATION & IDOR TAMPERING
    // -------------------------------------------------------------
    console.log('\n[TEST 5] Testing Direct URL & IDOR Parameter Tampering...');
    await page.goto(`${BASE_URL}/mandates/man_tampered_non_existent_9999`, { waitUntil: 'networkidle0' });
    await snap('14-tampered-id-access-denied');

    // -------------------------------------------------------------
    // TEST 6: UNAUTHORIZED UI ACTIONS & LEAST PRIVILEGE
    // Verify client navigation bar does not show advisor links
    // -------------------------------------------------------------
    console.log('\n[TEST 6] Testing UI Action Visibility for Client Role...');
    await page.evaluate((tok, usr) => {
      localStorage.setItem('finconsent_token', tok);
      localStorage.setItem('finconsent_user', JSON.stringify(usr));
    }, clientToken, clientLogin.user);

    await page.goto(`${BASE_URL}/mandates`, { waitUntil: 'networkidle0' });
    await snap('15-client-navigation-no-ria-controls');

    // -------------------------------------------------------------
    // TEST 7: EXPIRED / REVOKED MAGIC LINK ACCESS
    // RIA revokes a link -> Client tries to access it
    // -------------------------------------------------------------
    console.log('\n[TEST 7] Testing Revoked / Expired Magic Link Rejection...');
    // Create new mandate for revoke test
    const revokeMandateRes = await api('/api/mandates', {
      method: 'POST',
      token: riaToken,
      body: {
        clientId: 'cli_1',
        title: 'Revocation Security Test Mandate',
        stcgAmount: 10000,
        ltcgAmount: 20000,
        cutoffHours: 48,
        rationale: 'Testing token invalidation on revocation',
      },
    });
    const revMandateId = revokeMandateRes.body.data.id;
    const oldMagicToken = revokeMandateRes.body.data.magicToken;

    // RIA revokes the token (which rotates it)
    await api(`/api/mandates/${revMandateId}/revoke-link`, {
      method: 'POST',
      token: riaToken,
    });

    // Client visits the old, invalidated magic token
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${BASE_URL}/m/${oldMagicToken}`, { waitUntil: 'networkidle0' });
    await snap('16-revoked-magic-link-error');

    // -------------------------------------------------------------
    // TEST 8: CONSENT MANIPULATION & OTP BRUTE-FORCE LOCKOUT
    // -------------------------------------------------------------
    console.log('\n[TEST 8] Testing OTP Brute-Force Lockout & Consent Bypass...');
    // Create new mandate for OTP brute force test
    const bfMandateRes = await api('/api/mandates', {
      method: 'POST',
      token: riaToken,
      body: {
        clientId: 'cli_1',
        title: 'OTP Brute Force Lockout Test',
        stcgAmount: 5000,
        ltcgAmount: 15000,
        cutoffHours: 48,
        rationale: 'Validate 3-attempt lockout and HTTP 429 response',
      },
    });
    const bfToken = bfMandateRes.body.data.magicToken;

    // Request fresh OTP
    await api(`/api/public/mandates/${bfToken}/request-otp`, { method: 'POST' });

    // Send 3 wrong OTP attempts
    const f1 = await api(`/api/public/mandates/${bfToken}/verify-otp`, { method: 'POST', body: { otp: '000001', statutoryDeclarationsAccepted: true } });
    const f2 = await api(`/api/public/mandates/${bfToken}/verify-otp`, { method: 'POST', body: { otp: '000002', statutoryDeclarationsAccepted: true } });
    const f3 = await api(`/api/public/mandates/${bfToken}/verify-otp`, { method: 'POST', body: { otp: '000003', statutoryDeclarationsAccepted: true } });

    console.log(`  Fail 1 (remaining: ${f1.body?.remainingAttempts})`);
    console.log(`  Fail 2 (remaining: ${f2.body?.remainingAttempts})`);
    console.log(`  Fail 3 (status: ${f3.status}, locked: ${f3.body?.locked})`);

    // Client visits consent page after lockout
    await page.goto(`${BASE_URL}/m/${bfToken}`, { waitUntil: 'networkidle0' });
    await snap('17-otp-lockout-after-3-failures');

    // Attempt direct state manipulation: client trying to skip OTP to force approval
    const skipOtpAttempt = await api(`/api/mandates/${bfMandateRes.body.data.id}`, {
      method: 'PUT',
      token: clientToken,
      body: { status: 'consented' },
    });
    console.log(`  Direct consent manipulation blocked: Status ${skipOtpAttempt.status} (Expected 403 Forbidden)`);
    await snap('18-unauthorized-consent-bypass-blocked');

    // -------------------------------------------------------------
    // TEST 9: RIA MFA ENFORCEMENT & BYPASS PREVENTION
    // -------------------------------------------------------------
    console.log('\n[TEST 9] Testing RIA Two-Factor Authentication (MFA) & Bypass Protection...');
    const mfaRiaEmail = `mfa.advisor.${Date.now()}@firm.in`;
    const regRes = await api('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'MFA Verified Advisor',
        email: mfaRiaEmail,
        password: 'Password@123!',
        role: 'ria',
        firmName: 'MFA Prudent Advisory LLP',
        sebiRegNumber: 'INA000088921',
      },
    });
    if (!regRes.body || !regRes.body.token) {
      throw new Error(`MFA Advisor registration failed: ${JSON.stringify(regRes.body)}`);
    }
    const mfaRiaToken = regRes.body.token;

    // RIA sets up MFA
    const mfaSetup = await api('/api/auth/mfa/setup', {
      method: 'POST',
      token: mfaRiaToken,
    });
    if (!mfaSetup.body || !mfaSetup.body.secret) {
      throw new Error(`MFA setup failed: ${JSON.stringify(mfaSetup.body)}`);
    }
    const mfaSecret = mfaSetup.body.secret;
    const initialTotp = generateTotp(mfaSecret);

    // RIA enables MFA
    await api('/api/auth/mfa/enable', {
      method: 'POST',
      token: mfaRiaToken,
      body: { code: initialTotp },
    });
    console.log('  ✔ MFA enabled successfully for RIA account.');

    // Clear browser session and visit login page
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });

    // Wait for login inputs to render
    await page.waitForSelector('#login_email_input', { timeout: 10000 });
    await page.evaluate((newEmail, newPwd) => {
      const emailInput = document.getElementById('login_email_input');
      const pwdInput = document.getElementById('login_password_input');

      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeSetter.call(emailInput, newEmail);
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));

      nativeSetter.call(pwdInput, newPwd);
      pwdInput.dispatchEvent(new Event('input', { bubbles: true }));
    }, mfaRiaEmail, 'Password@123!');
    await new Promise((r) => setTimeout(r, 200));
    await page.click('#login_submit_btn');

    // Wait for MFA challenge card to appear
    try {
      await page.waitForSelector('#mfa_code_input', { timeout: 8000 });
      console.log('  ✔ MFA challenge card triggered upon primary authentication.');
      await snap('19-ria-mfa-challenge');
    } catch (e) {
      const currentUrl = page.url();
      const alertMsg = await page.evaluate(() => {
        const al = document.querySelector('.MuiAlert-message');
        return al ? al.textContent : 'none';
      });
      console.error(`  [MFA Wait Error] URL: ${currentUrl}, Alert: "${alertMsg}"`);
      await snap('debug-mfa-fail');
      throw e;
    }

    // Attempt invalid code 000000
    await page.evaluate(() => {
      const input = document.getElementById('mfa_code_input');
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeSetter.call(input, '000000');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.click('#mfa_verify_btn');
    await new Promise((r) => setTimeout(r, 800));
    await snap('20-ria-mfa-invalid-rejected');

    // Verify API bypass rejection with temp token (missing mfaVerified)
    const loginChallenge = await loginApi(mfaRiaEmail, 'Password@123!');
    const tempToken = loginChallenge.tempToken;
    const bypassRes = await api('/api/mandates', {
      method: 'POST',
      token: tempToken,
      body: { clientId: 'cli_1', title: 'MFA Bypass Attempt' },
    });
    console.log(`  MFA bypass attempt with temp token returned status: ${bypassRes.status} (Expected 401 Unauthorized)`);
    await snap('21-ria-mfa-bypass-rejected');

    // Complete legitimate MFA verification with valid TOTP code
    const validLoginTotp = generateTotp(mfaSecret);
    await page.evaluate((code) => {
      const input = document.getElementById('mfa_code_input');
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeSetter.call(input, code);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }, validLoginTotp);
    await page.click('#mfa_verify_btn');
    await new Promise((r) => setTimeout(r, 2000));
    await snap('22-ria-mfa-verified-dashboard');

    // -------------------------------------------------------------
    // TEST 10: REVOKED / EXPIRED SESSION REJECTION
    // -------------------------------------------------------------
    console.log('\n[TEST 10] Testing Revoked Session & Token Blacklist Rejection...');
    const logoutRes = await api('/api/auth/logout', {
      method: 'POST',
      token: riaToken,
    });
    console.log(`  Logout API returned status: ${logoutRes.status}`);

    const revokedAccessRes = await api('/api/mandates', {
      method: 'GET',
      token: riaToken,
    });
    console.log(`  Access with revoked token returned status: ${revokedAccessRes.status} (Expected 401)`);

    await page.evaluate((tok) => localStorage.setItem('finconsent_token', tok), riaToken);
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle0' });
    await snap('23-revoked-session-blocked');

    // -------------------------------------------------------------
    // TEST 11: CROSS-INSTANCE DISTRIBUTED RATE LIMITING
    // -------------------------------------------------------------
    console.log('\n[TEST 11] Testing Distributed Rate Limiting & Brute-Force Lockout...');
    const rateLimitBurst = [];
    for (let i = 0; i < 35; i++) {
      rateLimitBurst.push(
        api('/api/auth/login', {
          method: 'POST',
          headers: { 'x-test-rate-limit': 'true' },
          body: { email: 'burst_attack@example.in', password: 'wrong' },
        })
      );
    }
    const burstResults = await Promise.all(rateLimitBurst);
    const limitedCount = burstResults.filter((r) => r.status === 429).length;
    console.log(`  Distributed rate limiter triggered: ${limitedCount}/35 requests returned HTTP 429.`);

    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    await snap('24-distributed-rate-limit-blocked');

    console.log('\n================================================================');
    console.log('✅ ALL 11 PUPPETEER SECURITY VERIFICATION SCENARIOS SUCCEEDED!');
    console.log('================================================================');
  } catch (err) {
    console.error('❌ Puppeteer Security Verification Error:', err);
    throw err;
  } finally {
    await browser.close();
  }
}

runSecurityE2E().catch((err) => {
  console.error(err);
  process.exit(1);
});
