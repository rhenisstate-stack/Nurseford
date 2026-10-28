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
  await page1.goto('http://localhost:3003/dashboards/rn-nursing', { waitUntil: 'load', timeout: 30000 });
  await page1.waitForTimeout(8000);
  await page1.evaluate(() => document.querySelector('#__next')?.scrollIntoView());
  const buf1 = await page1.screenshot({ clip: { x: 0, y: 0, width: 1280, height: 900 }, timeout: 10000 });
  fs.writeFileSync(path.join(SCREENSHOT_DIR, 'rn-nursing-1280.png'), buf1);
  console.log('RN Desktop 1280px saved');

  const page2 = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await page2.goto('http://localhost:3003/dashboards/rn-nursing', { waitUntil: 'load', timeout: 30000 });
  await page2.waitForTimeout(8000);
  const buf2 = await page2.screenshot({ clip: { x: 0, y: 0, width: 375, height: 812 }, timeout: 10000 });
  fs.writeFileSync(path.join(SCREENSHOT_DIR, 'rn-nursing-375.png'), buf2);
  console.log('RN Mobile 375px saved');

  await browser.close();
  console.log('Done');
})();
