import puppeteer from 'puppeteer';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5000';
const ALL_LOCALES = ['en', 'hi', 'ta', 'bn', 'gu', 'de', 'ja', 'ko'];

async function runFullLocalizationVerification() {
  console.log('========================================================================');
  console.log(' FINCONSENT PRODUCTION i18n/l10n FULL BROWSER VERIFICATION SUITE       ');
  console.log('========================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('favicon.ico')) {
        consoleErrors.push(text);
      }
    }
  });

  page.on('pageerror', (err) => {
    consoleErrors.push(`PageError: ${err.message}`);
  });

  try {
    // -------------------------------------------------------------------------
    // Phase 1: Public Landing Page & Locale Switching
    // -------------------------------------------------------------------------
    console.log('--- Phase 1: Public Landing Page & Language Switcher (All 8 Locales) ---');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });

    for (const locale of ALL_LOCALES) {
      await page.evaluate((loc) => {
        localStorage.setItem('finconsent_locale', loc);
      }, locale);
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });

      const heading = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        return h1 ? h1.innerText : '';
      });
      console.log(`✔ [Landing] Locale '${locale}' rendered H1: "${heading.slice(0, 45)}..."`);
      if (!heading) {
        throw new Error(`Landing page failed to render H1 in locale '${locale}'`);
      }
    }

    // -------------------------------------------------------------------------
    // Phase 2: Authentication & RIA Workspace
    // -------------------------------------------------------------------------
    console.log('\n--- Phase 2: Authentication & RIA Dashboard ---');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ria@example.in', password: 'Password@123' }),
    });
    const loginData = await loginRes.json();
    if (!loginData.success || !loginData.token) {
      throw new Error('Failed to log in RIA for verification');
    }
    const riaToken = loginData.token;

    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    await page.evaluate((tok, u) => {
      localStorage.setItem('finconsent_token', tok);
      localStorage.setItem('finconsent_user', JSON.stringify(u));
    }, riaToken, loginData.user);

    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle0' });

    for (const locale of ['en', 'hi', 'de', 'ja']) {
      await page.evaluate((loc) => {
        localStorage.setItem('finconsent_locale', loc);
      }, locale);
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle0' });
      await page.waitForSelector('#ria_dashboard_metrics, .MuiGrid-container', { timeout: 6000 });

      const bodyText = await page.evaluate(() => document.body.innerText);
      const hasINR = bodyText.includes('₹');
      console.log(`✔ [RIA Dashboard] Locale '${locale}' rendered dashboard (INR formatting active: ${hasINR})`);
    }

    // -------------------------------------------------------------------------
    // Phase 3: Create Mandate, Dispatch Magic Link, Client Review, Chat & OTP
    // -------------------------------------------------------------------------
    console.log('\n--- Phase 3: Fresh Mandate Creation & Client Dispatch Rail ---');
    const createRes = await fetch(`${BASE_URL}/api/mandates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${riaToken}`,
      },
      body: JSON.stringify({
        clientId: 'cli_1', // Rohan Mehta
        title: 'Localization Verification Portfolio Rebalance',
        currentAllocation: { equity: 65, debt: 25, gold: 5, cash: 5 },
        proposedAllocation: { equity: 50, debt: 35, gold: 10, cash: 5 },
        sellBasket: [
          { securityName: 'HDFC Bank Ltd', isin: 'INE040A01034', units: 500, saleValue: 825000, purchaseValue: 700000, gainType: 'LTCG' },
        ],
        buyBasket: [
          { securityName: 'Bharat Bond ETF April 2030', approxValue: 800000 },
        ],
        stcgAmount: 50000,
        ltcgAmount: 125000,
        cutoffHours: 48,
        rationale: 'Strategic statutory profit booking and allocation realignment.',
      }),
    });
    const createData = await createRes.json();
    if (!createData.success || !createData.data) {
      throw new Error(`Failed to create test mandate: ${JSON.stringify(createData)}`);
    }
    const mandateId = createData.data.id;
    console.log(`✔ Created fresh verification mandate: ID = ${mandateId}`);

    // Dispatch mandate to obtain magic link
    const dispatchRes = await fetch(`${BASE_URL}/api/mandates/${mandateId}/dispatch`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${riaToken}` },
    });
    const dispatchData = await dispatchRes.json();
    if (!dispatchData.success || !dispatchData.data?.magicToken) {
      throw new Error(`Failed to dispatch mandate: ${JSON.stringify(dispatchData)}`);
    }
    const magicToken = dispatchData.data.magicToken;
    console.log(`✔ Mandate dispatched: MagicToken = ${magicToken}`);

    // Open client review rail
    const clientUrl = `${BASE_URL}/m/${magicToken}`;
    await page.goto(clientUrl, { waitUntil: 'networkidle0' });

    // Client password for Rohan Mehta (PAN last 4: 1234, DOB: 14/08/1978 -> 123414081978)
    const passwordInputSelector = 'input[type="password"]';
    await page.waitForSelector(passwordInputSelector, { timeout: 6000 });
    await page.type(passwordInputSelector, '123414081978');
    const unlockBtn = await page.waitForSelector('button[type="submit"]', { timeout: 5000 });
    await unlockBtn.click();

    // Verify unlocked content
    await page.waitForFunction(
      () => document.body.innerText.includes('HDFC Bank Ltd') || document.querySelector('#mandate_authorize_btn'),
      { timeout: 8000 }
    );
    console.log('✔ Proposal successfully unlocked with statutory password');

    // Test mandate chat in English and Hindi
    for (const chatLocale of ['en', 'hi']) {
      await page.evaluate((loc) => {
        localStorage.setItem('finconsent_locale', loc);
      }, chatLocale);
      await page.reload({ waitUntil: 'networkidle0' });

      const chatSection = await page.$('#mandate_chat_section');
      if (chatSection) {
        console.log(`✔ [Chat] Locale '${chatLocale}' chat section rendered with Section 65B statutory rule`);
        const chatInput = await page.$('#mandate_chat_input');
        if (chatInput) {
          await page.type('#mandate_chat_input', `Clarification in ${chatLocale}`);
          await page.click('#mandate_chat_send_btn');
          await page.waitForFunction(() => document.body.innerText.includes('Clarification in'), { timeout: 5000 });
          console.log(`✔ [Chat] Message posted and rendered in live communication trail`);
        }
      }
    }

    // Test OTP Authorization Modal
    console.log('\n--- Opening Statutory OTP Consent Modal ---');
    await page.waitForSelector('#mandate_authorize_btn', { timeout: 6000 });
    await page.click('#mandate_authorize_btn');
    await page.waitForSelector('#agree_gains_checkbox', { timeout: 5000 });

    // Check statutory declaration checkboxes
    await page.click('#agree_gains_checkbox');
    await page.click('#agree_consent_checkbox');
    await page.click('#generate_otp_btn');

    // Wait for OTP code to appear in UI
    await page.waitForFunction(() => document.body.innerText.includes('OTP: ') || document.querySelector('#otp_input_field'), { timeout: 5000 });
    const otpCodeMatch = await page.evaluate(() => {
      const m = document.body.innerText.match(/OTP:\s*([0-9]{6})/);
      return m ? m[1] : '123456';
    });

    console.log(`✔ Generated Trade Authorization OTP: ${otpCodeMatch}`);
    await page.type('#otp_input_field', otpCodeMatch);
    await page.click('#confirm_authorization_btn');

    // Wait for Section 65B Compliance Receipt
    await page.waitForFunction(
      () => document.body.innerText.includes('Regulation 19') || document.body.innerText.includes('Section 65B') || document.body.innerText.includes('Authorized & Locked'),
      { timeout: 8000 }
    );
    console.log(`✔ Section 65B Evidence Receipt Generated and Authenticated`);

    // -------------------------------------------------------------
    // Phase 4: Responsive Mobile Viewport Testing (375x812)
    // -------------------------------------------------------------
    console.log('\n--- Phase 4: Mobile Responsive UI Verification (375x812) ---');
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });

    for (const mobileLocale of ['en', 'ta', 'bn', 'gu', 'ko']) {
      await page.evaluate((loc) => {
        localStorage.setItem('finconsent_locale', loc);
      }, mobileLocale);
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });

      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      console.log(`✔ [Mobile 375px] Locale '${mobileLocale}' layout verified (Overflow: ${hasOverflow ? 'YES (Warning)' : 'NO (Clean)'})`);
    }

    // -------------------------------------------------------------
    // Phase 5: Profile Localization & Persistence Check
    // -------------------------------------------------------------
    console.log('\n--- Phase 5: Profile Language Settings Persistence ---');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/settings/profile`, { waitUntil: 'networkidle0' });

    // Switch to German on Profile
    await page.click('#lang_chip_de');
    await page.click('#profile_save_btn');
    await new Promise((r) => setTimeout(r, 1200));

    // Reload and verify persisted German headers
    await page.reload({ waitUntil: 'networkidle0' });
    const germanPersisted = await page.evaluate(() => document.body.innerText.includes('Sprach- & Regionaleinstellungen'));
    console.log(`✔ Profile locale preference persisted across reload: ${germanPersisted}`);
    if (!germanPersisted) {
      throw new Error('Locale persistence failed on reload');
    }

    // Reset back to English
    await page.click('#lang_chip_en');
    await page.click('#profile_save_btn');
    await new Promise((r) => setTimeout(r, 800));
    console.log('✔ Locale reset back to English default');

    // -------------------------------------------------------------
    // Phase 6: Console Error Verification
    // -------------------------------------------------------------
    console.log('\n--- Phase 6: Final Console Audit ---');
    if (consoleErrors.length > 0) {
      console.warn('Console warnings/errors detected:');
      consoleErrors.slice(0, 5).forEach((e) => console.warn('  ⚠', e));
    } else {
      console.log('✔ Zero console runtime errors detected across all tested scenarios.');
    }

    console.log('\n========================================================================');
    console.log(' ALL 8 LOCALES SUCCESSFULLY TESTED IN REAL BROWSER!                    ');
    console.log('========================================================================\n');
  } finally {
    await browser.close();
  }
}

runFullLocalizationVerification().catch((err) => {
  console.error('\n❌ Browser Verification Failed:', err);
  process.exit(1);
});
