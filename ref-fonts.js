const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('https://rhenisnursing.com/ati-teas-dashboard', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(5000);

  // Extract all computed font sizes from visible text elements
  const fontData = await page.evaluate(() => {
    const results = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.textContent.trim()) continue;
      const el = node.parentElement;
      if (!el) continue;
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      results.push({
        tag: el.tagName,
        text: node.textContent.trim().substring(0, 60),
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        className: el.className?.substring?.(0, 80) || '',
      });
    }
    return results;
  });

  // Print unique font sizes with examples
  const bySize = {};
  fontData.forEach(d => {
    if (!bySize[d.fontSize]) bySize[d.fontSize] = [];
    if (bySize[d.fontSize].length < 3) bySize[d.fontSize].push(d);
  });

  console.log('=== Font sizes found on reference page ===');
  Object.keys(bySize).sort((a,b) => parseFloat(a) - parseFloat(b)).forEach(size => {
    console.log(`\n${size}:`);
    bySize[size].forEach(d => {
      console.log(`  <${d.tag}> (${d.fontWeight}) "${d.text}" class="${d.className}"`);
    });
  });

  // Also take a proper screenshot with longer wait
  await page.waitForTimeout(3000);
  fs.writeFileSync(path.join(__dirname, 'screenshots', 'reference-1280-full.png'), await page.screenshot({ fullPage: true }));
  console.log('\nFull screenshot saved');

  await browser.close();
})();
