const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('https://rhenisnursing.com/ati-teas-dashboard', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(4000);
  fs.writeFileSync(path.join(SCREENSHOT_DIR, 'reference-1280.png'), await page.screenshot({ fullPage: true }));
  console.log('Reference saved');

  await browser.close();
})();
