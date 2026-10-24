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

  const page1 = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page1.goto('http://localhost:3003/dashboards/ati-teas', { waitUntil: 'networkidle', timeout: 60000 });
  await page1.waitForTimeout(5000);
  fs.writeFileSync(path.join(SCREENSHOT_DIR, 'ati-teas-1280.png'), await page1.screenshot({ fullPage: true }));
  console.log('Desktop 1280px saved');

  const page2 = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await page2.goto('http://localhost:3003/dashboards/ati-teas', { waitUntil: 'networkidle', timeout: 60000 });
  await page2.waitForTimeout(5000);
  fs.writeFileSync(path.join(SCREENSHOT_DIR, 'ati-teas-375.png'), await page2.screenshot({ fullPage: true }));
  console.log('Mobile 375px saved');

  await browser.close();
  console.log('Done');
})();
