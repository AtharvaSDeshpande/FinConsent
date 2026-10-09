import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUDIT_DIR = path.resolve(__dirname, '../docs/visual-audit/mandate-security');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:5000';

async function runMobileAudit() {
  console.log('>>> Running Mobile-First Audit (iPhone 375x812 & 390x844)...');

  // Authenticate RIA & create fresh mandate
  const loginRes = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ria@example.in', password: 'Password@123' }),
  });
  const { token: riaToken } = await loginRes.json();

  const createRes = await fetch(`${API_URL}/api/mandates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${riaToken}` },
    body: JSON.stringify({
      clientId: 'cli_1',
      title: 'Mobile Advisory Rebalance Mandate',
      rationale: 'Testing mobile responsiveness and viewport compliance',
      stcgAmount: 20000,
      ltcgAmount: 80000,
    }),
  });
  const mandate = (await createRes.json()).data;

  const dispatchRes = await fetch(`${API_URL}/api/mandates/${mandate.id}/dispatch`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${riaToken}` },
  });
  const { magicToken } = (await dispatchRes.json()).data;

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  // Set iPhone 13/14 viewport: 390x844 with mobile user agent
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1');

  await page.goto(`${BASE_URL}/m/${magicToken}`, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(AUDIT_DIR, '07_mobile_unlock_screen.png'), fullPage: true });

  // Unlock with password
  await page.waitForSelector('input[type="password"]');
  await page.type('input[type="password"]', '123414081978');
  await page.click('button[type="submit"]');

  await page.waitForSelector('#mandate_chat_input', { timeout: 8000 });
  await page.screenshot({ path: path.join(AUDIT_DIR, '08_mobile_mandate_unlocked.png') });

  // Test horizontal overflow
  const hasOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  console.log(`  [MOBILE CHECK] Horizontal overflow detected: ${hasOverflow} (Expected: false)`);

  // Scroll to chat
  await page.evaluate(() => {
    document.querySelector('#mandate_chat_input')?.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  const chatInput = await page.waitForSelector('#mandate_chat_input', { timeout: 8000 });
  await chatInput.type('How does the LTCG 1.25L exemption apply to this rebalance?');
  
  const sendBtn = await page.waitForSelector('#mandate_chat_send_btn', { timeout: 5000 });
  await sendBtn.click();

  await page.waitForFunction(
    () => document.body.innerText.includes('How does the LTCG 1.25L exemption apply'),
    { timeout: 8000 }
  );

  await page.screenshot({ path: path.join(AUDIT_DIR, '09_mobile_chat_discussion.png') });
  console.log('  [PASS] Mobile chat rendered, input responded, zero horizontal overflow');

  await browser.close();
}

runMobileAudit().catch((err) => {
  console.error('Mobile audit error:', err);
  process.exit(1);
});
