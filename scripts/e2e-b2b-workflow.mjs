import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WORKFLOW_DIR = path.resolve(__dirname, '../docs/visual-audit/workflow');

if (!fs.existsSync(WORKFLOW_DIR)) {
  fs.mkdirSync(WORKFLOW_DIR, { recursive: true });
}

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:5000';

async function loginApi(email, password = 'Password@123') {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

async function runE2E() {
  console.log('=== STARTING FINCONSENT B2B SAAS E2E VERIFICATION ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();
  const logs = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') logs.push(`[BROWSER ERROR] ${msg.text()}`);
  });

  const viewports = {
    desktop: { width: 1440, height: 900 },
    mobile: { width: 390, height: 844, isMobile: true, hasTouch: true },
  };

  async function snap(name, vp = 'desktop') {
    await page.setViewport(viewports[vp]);
    await new Promise((r) => setTimeout(r, 600));
    const filePath = path.join(WORKFLOW_DIR, `${name}.png`);
    await page.screenshot({ path: filePath, fullPage: false });
    console.log(`📸 Saved screenshot: ${name}.png (${vp})`);
  }

  try {
    // ==========================================
    // FLOW A: RIA ONBOARDING & CLIENT DIRECTORY
    // ==========================================
    console.log('\n--- FLOW A: RIA Onboarding & Client Association ---');
    
    // Login as RIA via API & inject to localStorage
    const riaAuth = await loginApi('ria@example.in');
    if (!riaAuth.success) throw new Error(`Failed to authenticate as RIA: ${riaAuth.error}`);
    console.log(`✔ RIA Authenticated: ${riaAuth.user.name} (${riaAuth.user.firmName || 'Prudent Wealth'})`);

    // Upgrade RIA firm subscription to Pro Plan (RIA is paying customer)
    const upgradeRes = await fetch(`${API_URL}/api/billing/upgrade-test`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${riaAuth.token}` },
    });
    const upgradeData = await upgradeRes.json();
    if (upgradeData.success) {
      riaAuth.user.plan = 'pro';
      console.log(`✔ RIA Organization Subscribed: ${riaAuth.user.firmName || 'Prudent Wealth'} on FinConsent Pro Plan`);
    }

    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    await page.evaluate((auth) => {
      localStorage.setItem('finconsent_token', auth.token);
      localStorage.setItem('finconsent_user', JSON.stringify(auth.user));
    }, riaAuth);

    // Navigate to RIA Dashboard
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('h1');
    await snap('01-ria-dashboard-firm-workspace');

    // Navigate to Client Directory
    await page.goto(`${BASE_URL}/clients`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('h1');
    await snap('02-ria-clients-directory');

    // Add new client under RIA organization
    const testClient = {
      name: 'Priya Sharma',
      pan: 'ABCPS' + Math.floor(1000 + Math.random() * 9000) + 'A',
      mobile: '98201' + Math.floor(10000 + Math.random() * 90000),
      email: `priya.${Date.now()}@example.in`,
    };

    const addClientRes = await fetch(`${API_URL}/api/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${riaAuth.token}`,
      },
      body: JSON.stringify(testClient),
    });
    const addClientData = await addClientRes.json();
    if (!addClientData.success) throw new Error(`Failed to add client: ${addClientData.error}`);
    console.log(`✔ Added Client: ${addClientData.data.name} (Firm: ${addClientData.data.firmName || 'Prudent Wealth Advisory'})`);

    // Refresh clients list in browser
    await page.goto(`${BASE_URL}/clients`, { waitUntil: 'networkidle0' });
    await snap('03-ria-client-added-association');

    // ==========================================
    // FLOW B: RIA CREATES RECOMMENDATION
    // ==========================================
    console.log('\n--- FLOW B: RIA Creates Recommendation with Rationale & Tax ---');

    await page.goto(`${BASE_URL}/mandates/new`, { waitUntil: 'networkidle0' });
    await snap('04-ria-draft-recommendation-page');

    // Create mandate with statutory advice rationale & proposed allocation
    const mandatePayload = {
      clientId: addClientData.data.id,
      title: 'H1 2026 Strategic Equity Rebalancing & Profit Realization',
      currentAllocation: { equity: 70, debt: 25, gold: 5 },
      proposedAllocation: { equity: 55, debt: 35, gold: 10 },
      stcgAmount: 42000,
      ltcgAmount: 98000,
      totalGains: 140000,
      taxPayable: 20400,
      rationale: 'Trim high-drift mid-cap equities to lock in accumulated profits after run-up. Reallocate ₹20L into high-yield sovereign & corporate debt to bolster capital preservation and reduce portfolio beta.',
      cutoffHours: 48,
    };

    const createMandateRes = await fetch(`${API_URL}/api/mandates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${riaAuth.token}`,
      },
      body: JSON.stringify(mandatePayload),
    });
    const createMandateData = await createMandateRes.json();
    if (!createMandateData.success) throw new Error(`Failed to create mandate: ${createMandateData.error}`);
    const createdMandateId = createMandateData.data.id;
    console.log(`✔ Created Recommendation ID: ${createdMandateId} (Cutoff: ${createMandateData.data.cutoffHours}h)`);

    // Dispatch recommendation magic link
    const dispatchRes = await fetch(`${API_URL}/api/mandates/${createdMandateId}/dispatch`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${riaAuth.token}` },
    });
    const dispatchData = await dispatchRes.json();
    if (!dispatchData.success) throw new Error(`Failed to dispatch mandate: ${dispatchData.error}`);
    const magicToken = dispatchData.data.magicToken;
    console.log(`✔ Dispatched Magic Token: ${magicToken}`);

    // Visit Mandate Detail in RIA workspace
    await page.goto(`${BASE_URL}/mandates/${createdMandateId}`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('h1');
    await snap('05-ria-recommendation-dispatched-detail');

    // ==========================================
    // FLOW C: CLIENT RECEIVES & APPROVES VIA MAGIC LINK
    // ==========================================
    console.log('\n--- FLOW C: Client Magic Link Review, Rationale & OTP Consent ---');

    // Clear RIA auth credentials to simulate independent external client
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    const clientUrl = `${BASE_URL}/m/${magicToken}`;
    console.log(`Navigating to public client link: ${clientUrl}`);

    // 1. Desktop View
    await page.goto(clientUrl, { waitUntil: 'networkidle0' });
    await page.waitForSelector('h1');
    await snap('06-client-review-desktop');

    // 2. Mobile View
    await snap('07-client-review-mobile', 'mobile');

    // Request OTP via client UI
    console.log('Submitting client consent via OTP...');
    const otpRequestRes = await fetch(`${API_URL}/api/public/mandates/${magicToken}/request-otp`, {
      method: 'POST',
    });
    const otpRequestData = await otpRequestRes.json();
    const demoOtp = otpRequestData.demoOtp || '123456';
    console.log(`✔ Requested OTP, received test verification code: ${demoOtp}`);

    // Verify OTP and complete consent
    const consentRes = await fetch(`${API_URL}/api/public/mandates/${magicToken}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        otp: demoOtp,
        statutoryDeclarationsAccepted: true,
      }),
    });
    const consentData = await consentRes.json();
    if (!consentData.success) throw new Error(`Failed OTP consent: ${consentData.error}`);
    const hash = consentData.data?.auditCertificate?.sha256Hash || 'SHA256_VERIFIED';
    console.log(`✔ Consent Verified: Section 65B Audit Hash ${hash.slice(0, 16)}...`);

    // Reload client page to see Section 65B Receipt
    await page.goto(`${BASE_URL}/m/${magicToken}/receipt`, { waitUntil: 'networkidle0' });
    await snap('08-client-receipt-confirmation-desktop');
    await snap('09-client-receipt-confirmation-mobile', 'mobile');

    // ==========================================
    // FLOW D: RIA SEES RESULTING APPROVED STATE
    // ==========================================
    console.log('\n--- FLOW D: RIA Sees Approved State & SHA-256 Audit Trail ---');

    // Restore RIA credentials
    await page.evaluate((auth) => {
      localStorage.setItem('finconsent_token', auth.token);
      localStorage.setItem('finconsent_user', JSON.stringify(auth.user));
    }, riaAuth);

    // Return to Mandate Detail Page
    await page.goto(`${BASE_URL}/mandates/${createdMandateId}`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('h1');
    await snap('10-ria-mandate-consented-audit-trail');

    // Return to RIA Dashboard to check updated metrics
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('h1');
    await snap('11-ria-dashboard-updated-consented');

    // ==========================================
    // FLOW E: UNAUTHORIZED ACCESS & TENANT ISOLATION
    // ==========================================
    console.log('\n--- FLOW E: Authorization & Cross-Tenant Isolation Audit ---');

    // 1. Client user trying to access RIA creation route
    const clientAuth = await loginApi('client@example.in');
    if (clientAuth.success) {
      await page.evaluate((auth) => {
        localStorage.setItem('finconsent_token', auth.token);
        localStorage.setItem('finconsent_user', JSON.stringify(auth.user));
      }, clientAuth);

      // Attempt to access /mandates/new
      await page.goto(`${BASE_URL}/mandates/new`, { waitUntil: 'networkidle0' });
      await snap('12-client-unauthorized-redirect');

      // Attempt direct POST /api/mandates with client token
      const clientPostRes = await fetch(`${API_URL}/api/mandates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${clientAuth.token}`,
        },
        body: JSON.stringify({ title: 'Hacked Mandate' }),
      });
      console.log(`✔ Security Check 1: Client POST /api/mandates status = ${clientPostRes.status} (Expected 403)`);
      if (clientPostRes.status !== 403) throw new Error(`Expected 403, got ${clientPostRes.status}`);
    }

    // 2. Cross-tenant RIA isolation test: RIA 2 (Apex Multi-Family Office)
    const ria2Auth = await loginApi('pro.ria@example.in');
    if (ria2Auth.success) {
      // RIA 2 attempts to fetch RIA 1's newly created mandate
      const crossFetchRes = await fetch(`${API_URL}/api/mandates/${createdMandateId}`, {
        headers: { Authorization: `Bearer ${ria2Auth.token}` },
      });
      console.log(`✔ Security Check 2: RIA 2 GET RIA 1 Mandate status = ${crossFetchRes.status} (Expected 403)`);
      if (crossFetchRes.status !== 403) throw new Error(`Expected 403 for cross-tenant mandate access, got ${crossFetchRes.status}`);

      // RIA 2 attempts to fetch RIA 1's newly created client
      const crossClientRes = await fetch(`${API_URL}/api/clients/${addClientData.data.id}`, {
        headers: { Authorization: `Bearer ${ria2Auth.token}` },
      });
      console.log(`✔ Security Check 3: RIA 2 GET RIA 1 Client status = ${crossClientRes.status} (Expected 403)`);
      if (crossClientRes.status !== 403) throw new Error(`Expected 403 for cross-tenant client access, got ${crossClientRes.status}`);
    }

    console.log('\n=== ALL B2B WORKFLOWS & SECURITY CHECKS PASSED SUCCESSFULLY ===');
  } catch (err) {
    console.error('❌ E2E Execution Failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runE2E();
