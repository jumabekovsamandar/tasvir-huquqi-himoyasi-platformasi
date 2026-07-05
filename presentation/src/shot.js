const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const pages = [
    ['dashboard','/dashboard'],
    ['registry','/dashboard/registry'],
    ['consent','/dashboard/consent'],
    ['deepfake','/dashboard/deepfake'],
    ['monitoring','/dashboard/monitoring'],
    ['evidence','/dashboard/evidence'],
    ['legal','/dashboard/legal-assistant'],
    ['marketplace','/dashboard/marketplace'],
    ['landing','/'],
  ];
  const out = process.env.OUT;
  for (const [name, path] of pages) {
    await page.goto('http://localhost:3100'+path, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${out}/${name}.png` });
    console.log('shot', name);
  }
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
