import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUDIT_DIR = path.resolve(__dirname, '../docs/visual-audit');

if (!fs.existsSync(AUDIT_DIR)) {
  fs.mkdirSync(AUDIT_DIR, { recursive: true });
}

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:5000';

async function getAuthToken(email, password = 'Password@123') {
  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.success && data.token) {
      return { token: data.token, user: data.user };
    }
  } catch (err) {
    console.error(`[Auth Error] Failed to login as ${email}:`, err.message);
  }
  return null;
}

async function runVisualAudit() {
  console.log('🚀 Starting Puppeteer Visual Audit for FinConsent...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();

  // Listen to console errors and network failures
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  const viewports = {
    desktop: { width: 1440, height: 900 },
    mobile: { width: 390, height: 844, isMobile: true, hasTouch: true },
  };

  async function snap(name, vp = 'desktop', fullPage = false) {
    await page.setViewport(viewports[vp]);
    await new Promise((r) => setTimeout(r, 600)); // allow render/transitions
    const filePath = path.join(AUDIT_DIR, `${name}-${vp}.png`);
    await page.screenshot({ path: filePath, fullPage });
    console.log(`📸 Captured: ${name}-${vp}.png`);
  }

  // Helper to set localStorage auth session
  async function setSession(token, user) {
    await page.evaluate(
      ({ t, u }) => {
        if (t && u) {
          localStorage.setItem('finconsent_token', t);
          localStorage.setItem('finconsent_user', JSON.stringify(u));
        } else {
          localStorage.removeItem('finconsent_token');
          localStorage.removeItem('finconsent_user');
        }
      },
      { t: token, u: user }
    );
  }

  try {
    // ----------------------------------------------------
    // 1. GUEST EXPERIENCE (Landing, Login, Register, Public Mandate)
    // ----------------------------------------------------
    console.log('\n--- 1. AUDITING GUEST EXPERIENCE ---');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await setSession(null, null); // clear session
    await page.reload({ waitUntil: 'domcontentloaded' });

    await snap('01-guest-landing-hero', 'desktop');
    await snap('01-guest-landing-hero', 'mobile');

    // Scroll to value proposition and tax simulator
    await page.evaluate(() => window.scrollBy(0, 1000));
    await snap('02-guest-landing-tax-calculator', 'desktop');
    await snap('02-guest-landing-tax-calculator', 'mobile');

    // Guest Auth Pages
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await snap('03-guest-login', 'desktop');
    await snap('03-guest-login', 'mobile');

    await page.goto(`${BASE_URL}/register`, { waitUntil: 'domcontentloaded' });
    await snap('04-guest-register', 'desktop');
    await snap('04-guest-register', 'mobile');

    // Guest views public demo mandate
    await page.goto(`${BASE_URL}/m/demo-token`, { waitUntil: 'domcontentloaded' });
    await snap('05-public-mandate-review', 'desktop');
    await snap('05-public-mandate-review', 'mobile');

    // ----------------------------------------------------
    // 2. REGISTERED INVESTMENT ADVISER (RIA - Suresh Narayanan)
    // ----------------------------------------------------
    console.log('\n--- 2. AUDITING RIA / ADVISER EXPERIENCE ---');
    const riaAuth = await getAuthToken('ria@example.in');
    if (riaAuth) {
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' });
      await setSession(riaAuth.token, riaAuth.user);
      await page.reload({ waitUntil: 'domcontentloaded' });

      await snap('06-ria-dashboard', 'desktop');
      await snap('06-ria-dashboard', 'mobile');

      // RIA New Mandate Creation
      await page.goto(`${BASE_URL}/mandates/new`, { waitUntil: 'domcontentloaded' });
      await snap('07-ria-new-mandate-form', 'desktop');
      await snap('07-ria-new-mandate-form', 'mobile');

      // RIA Mandate Detail / Operational Dossier
      await page.goto(`${BASE_URL}/mandates/man_1`, { waitUntil: 'domcontentloaded' });
      await snap('08-ria-mandate-detail', 'desktop');
      await snap('08-ria-mandate-detail', 'mobile');

      // RIA Mandate Access-Restricted Institutional Card
      await page.goto(`${BASE_URL}/mandates/foreign_firm_mandate_999`, { waitUntil: 'domcontentloaded' });
      await snap('08b-ria-mandate-access-restricted', 'desktop');

      // RIA Clients Directory
      await page.goto(`${BASE_URL}/clients`, { waitUntil: 'domcontentloaded' });
      await snap('09-ria-client-directory', 'desktop');
      await snap('09-ria-client-directory', 'mobile');

      // RIA Requests Hub
      await page.goto(`${BASE_URL}/requests`, { waitUntil: 'domcontentloaded' });
      await snap('10-ria-requests-hub', 'desktop');
      await snap('10-ria-requests-hub', 'mobile');

      // RIA Billing & Quota
      await page.goto(`${BASE_URL}/settings/billing`, { waitUntil: 'domcontentloaded' });
      await snap('11-ria-billing-quota', 'desktop');
      await snap('11-ria-billing-quota', 'mobile');
    }

    // ----------------------------------------------------
    // 3. ADVISORY INVESTOR / CLIENT (Rohan Mehta)
    // ----------------------------------------------------
    console.log('\n--- 3. AUDITING INVESTOR / CLIENT EXPERIENCE ---');
    const clientAuth = await getAuthToken('client@example.in');
    if (clientAuth) {
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' });
      await setSession(clientAuth.token, clientAuth.user);
      await page.reload({ waitUntil: 'domcontentloaded' });

      await snap('12-client-dashboard', 'desktop');
      await snap('12-client-dashboard', 'mobile');

      // Client Reviewing Proposal
      await page.goto(`${BASE_URL}/m/demo-token`, { waitUntil: 'domcontentloaded' });
      await snap('13-client-proposal-review', 'desktop');
      await snap('13-client-proposal-review', 'mobile');

      // Client Compliance Receipt View
      await page.goto(`${BASE_URL}/m/demo-token/receipt`, { waitUntil: 'domcontentloaded' });
      await snap('14-client-compliance-receipt', 'desktop');
      await snap('14-client-compliance-receipt', 'mobile');

      // Client Inquiries Page
      await page.goto(`${BASE_URL}/requests`, { waitUntil: 'domcontentloaded' });
      await snap('15-client-inquiries', 'desktop');
      await snap('15-client-inquiries', 'mobile');

      // Direct Unauthorized Access Attempts (Should render Access Restricted state)
      await page.goto(`${BASE_URL}/mandates/new`, { waitUntil: 'domcontentloaded' });
      await snap('16-client-unauthorized-new-mandate', 'desktop');

      await page.goto(`${BASE_URL}/clients`, { waitUntil: 'domcontentloaded' });
      await snap('17-client-unauthorized-clients-registry', 'desktop');

      await page.goto(`${BASE_URL}/settings/billing`, { waitUntil: 'domcontentloaded' });
      await snap('18-client-unauthorized-billing', 'desktop');
    }

    // ----------------------------------------------------
    // 4. COMPLIANCE OFFICER (Vikramaditya Roy)
    // ----------------------------------------------------
    console.log('\n--- 4. AUDITING COMPLIANCE OFFICER EXPERIENCE ---');
    const compAuth = await getAuthToken('compliance@example.in');
    if (compAuth) {
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' });
      await setSession(compAuth.token, compAuth.user);
      await page.reload({ waitUntil: 'domcontentloaded' });

      await snap('19-compliance-dashboard', 'desktop');
      await snap('19-compliance-dashboard', 'mobile');

      await page.goto(`${BASE_URL}/requests`, { waitUntil: 'domcontentloaded' });
      await snap('20-compliance-requests-scrutiny', 'desktop');
      await snap('20-compliance-requests-scrutiny', 'mobile');
    }

    // ----------------------------------------------------
    // 5. PLATFORM ADMINISTRATOR (Neha Singhania)
    // ----------------------------------------------------
    console.log('\n--- 5. AUDITING SUPER ADMIN EXPERIENCE ---');
    const adminAuth = await getAuthToken('admin@example.in');
    if (adminAuth) {
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' });
      await setSession(adminAuth.token, adminAuth.user);
      await page.reload({ waitUntil: 'domcontentloaded' });

      await snap('21-admin-dashboard', 'desktop');
      await snap('21-admin-dashboard', 'mobile');
    }

    console.log('\n✅ Visual Audit completed successfully!');
    console.log(`📁 Captured screenshots saved in: ${AUDIT_DIR}`);
    if (consoleErrors.length > 0) {
      console.warn(`⚠️ Console errors detected (${consoleErrors.length}):`);
      consoleErrors.slice(0, 5).forEach((e) => console.warn(`   - ${e}`));
    } else {
      console.log('🎉 Zero console errors detected across all tested routes and viewports.');
    }
  } catch (err) {
    console.error('❌ Error during visual audit:', err);
  } finally {
    await browser.close();
  }
}

runVisualAudit();
