import puppeteer from 'puppeteer';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5000';

async function verifyLocalization() {
  console.log('========================================================================');
  console.log(' FINCONSENT LOCALIZATION (i18n & l10n) REAL BROWSER VERIFICATION       ');
  console.log('========================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    // 1. Authenticate RIA via API
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ria@example.in', password: 'Password@123' }),
    });
    const loginData = await loginRes.json();
    if (!loginData.success || !loginData.token) {
      throw new Error('Failed to login RIA');
    }

    console.log('✔ Authenticated RIA Suresh Narayanan');

    // 2. Set token in browser localStorage & navigate to profile
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    await page.evaluate((tok, u) => {
      localStorage.setItem('finconsent_token', tok);
      localStorage.setItem('finconsent_user', JSON.stringify(u));
    }, loginData.token, loginData.user);

    await page.goto(`${BASE_URL}/settings/profile`, { waitUntil: 'networkidle0' });

    // 3. Verify Default Language is English
    const initialText = await page.evaluate(() => document.body.innerText);
    const hasEnglishTitle = initialText.includes('RIA Credentials & Advisory Profile');
    const hasLangCard = initialText.includes('Language & Localization Preferences');
    console.log(`✔ Default Language verified as English: ${hasEnglishTitle && hasLangCard}`);
    if (!hasEnglishTitle || !hasLangCard) {
      throw new Error('Default English language UI not found on Profile page');
    }

    // 4. Test Switching to Hindi via Chip
    console.log('\n>>> Testing Language Switch to Hindi (hi)...');
    await page.click('#lang_chip_hi');
    await page.waitForFunction(() => document.body.innerText.includes('भाषा एवं क्षेत्रीय प्राथमिकताएँ'), { timeout: 4000 });
    const hindiText = await page.evaluate(() => document.body.innerText);
    const hasHindiHeader = hindiText.includes('आरआईए साख एवं सलाहकार प्रोफ़ाइल');
    console.log(`✔ Static text localized to Hindi: ${hasHindiHeader}`);
    if (!hasHindiHeader) throw new Error('Hindi static text failed to render');

    // 5. Test Switching to Tamil via Chip
    console.log('\n>>> Testing Language Switch to Tamil (ta)...');
    await page.click('#lang_chip_ta');
    await page.waitForFunction(() => document.body.innerText.includes('மொழி மற்றும் பிராந்திய விருப்பத்தேர்வுகள்'), { timeout: 4000 });
    const tamilText = await page.evaluate(() => document.body.innerText);
    const hasTamilHeader = tamilText.includes('RIA சான்றுகள் மற்றும் ஆலோசனை சுயவிவரம்');
    console.log(`✔ Static text localized to Tamil: ${hasTamilHeader}`);
    if (!hasTamilHeader) throw new Error('Tamil static text failed to render');

    // 6. Test Switching to German via Chip
    console.log('\n>>> Testing Language Switch to German (de)...');
    await page.click('#lang_chip_de');
    await page.waitForFunction(() => document.body.innerText.includes('Sprach- & Regionaleinstellungen'), { timeout: 4000 });
    const germanText = await page.evaluate(() => document.body.innerText);
    const hasGermanHeader = germanText.includes('RIA-Anmeldedaten & Beraterprofil');
    console.log(`✔ Static text localized to German: ${hasGermanHeader}`);
    if (!hasGermanHeader) throw new Error('German static text failed to render');

    // 7. Test Switching to Japanese via Chip
    console.log('\n>>> Testing Language Switch to Japanese (ja)...');
    await page.click('#lang_chip_ja');
    await page.waitForFunction(() => document.body.innerText.includes('言語および地域設定'), { timeout: 4000 });
    const jaText = await page.evaluate(() => document.body.innerText);
    const hasJaHeader = jaText.includes('RIA認証情報および助言者プロフィール');
    console.log(`✔ Static text localized to Japanese: ${hasJaHeader}`);
    if (!hasJaHeader) throw new Error('Japanese static text failed to render');

    // 8. Test Switching to Korean via Chip
    console.log('\n>>> Testing Language Switch to Korean (ko)...');
    await page.click('#lang_chip_ko');
    await page.waitForFunction(() => document.body.innerText.includes('언어 및 지역 설정'), { timeout: 4000 });
    const koText = await page.evaluate(() => document.body.innerText);
    const hasKoHeader = koText.includes('RIA 자격 증명 및 자문사 프로필');
    console.log(`✔ Static text localized to Korean: ${hasKoHeader}`);
    if (!hasKoHeader) throw new Error('Korean static text failed to render');

    // 9. Verify English-only numbers & dynamic data guarantee
    console.log('\n>>> Verifying Numbers and Dynamic Data Guarantee...');
    const bodyText = await page.evaluate(() => document.body.innerText);
    // Dynamic user name and email must remain strictly in English
    const hasUserName = bodyText.includes('Suresh Narayanan');
    const hasUserEmail = bodyText.includes('ria@example.in');
    console.log(`✔ Dynamic client/adviser data preserved in English: ${hasUserName && hasUserEmail}`);
    if (!hasUserName || !hasUserEmail) throw new Error('Dynamic user data was lost or improperly transformed');

    // Check that numbers are English digits (0-9)
    const hasDevanagariDigits = /[\u0966-\u096F]/.test(bodyText);
    const hasBengaliDigits = /[\u09E6-\u09EF]/.test(bodyText);
    const hasGujaratiDigits = /[\u0AE6-\u0AEF]/.test(bodyText);
    console.log(`✔ Zero localized numerals detected (Devanagari: ${hasDevanagariDigits}, Bengali: ${hasBengaliDigits}, Gujarati: ${hasGujaratiDigits})`);
    if (hasDevanagariDigits || hasBengaliDigits || hasGujaratiDigits) {
      throw new Error('Illegal localized numerals detected in UI');
    }

    // 10. Save Profile with Japanese selected and verify Persistence after Page Reload
    console.log('\n>>> Saving Language Preference and Verifying Persistence...');
    await page.click('#lang_chip_ja');
    await page.click('#profile_save_btn');
    await page.waitForFunction(() => document.body.innerText.includes('プロフィールおよび言語設定が正常に更新されました') || document.body.innerText.includes('正常に更新'), { timeout: 5000 });
    console.log('✔ Profile changes successfully submitted and saved via PUT /api/auth/profile');

    // Reload page
    await page.reload({ waitUntil: 'networkidle0' });
    const reloadedText = await page.evaluate(() => document.body.innerText);
    const persisted = reloadedText.includes('言語および地域設定') && reloadedText.includes('RIA認証情報および助言者プロフィール');
    console.log(`✔ Language preference persisted across reload: ${persisted}`);
    if (!persisted) throw new Error('Language preference failed to persist across reload');

    // Reset back to English
    await page.click('#lang_chip_en');
    await page.click('#profile_save_btn');
    await new Promise((r) => setTimeout(r, 1000));
    console.log('✔ Language reset back to English (default)');

    console.log('\n========================================================================');
    console.log(' ALL LOCALIZATION (i18n & l10n) BROWSER CHECKS PASSED SUCCESSFULLY     ');
    console.log('========================================================================');
  } finally {
    await browser.close();
  }
}

verifyLocalization().catch((err) => {
  console.error('\n[FATAL ERROR]:', err);
  process.exit(1);
});
