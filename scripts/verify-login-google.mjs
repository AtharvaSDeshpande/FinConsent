import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));

  // Capture screenshot of login page
  const screenshotPath = 'docs/visual-audit/03-guest-login-desktop-updated.png';
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`Screenshot saved to ${screenshotPath}`);

  // Inspect buttons on page
  const buttons = await page.evaluate(() => {
    const list = [];
    document.querySelectorAll('button, #g_id_signin_btn, .MuiButton-root').forEach(el => {
      const text = (el.innerText || el.textContent || '').trim();
      if (text) list.push({ tag: el.tagName, id: el.id, text });
    });
    return list;
  });

  console.log('Detected buttons on /login:', JSON.stringify(buttons, null, 2));

  // Check how many Google elements exist
  const googleItems = buttons.filter(b => b.text.toLowerCase().includes('google'));
  console.log('Google items count:', googleItems.length, JSON.stringify(googleItems, null, 2));

  await browser.close();
})();
