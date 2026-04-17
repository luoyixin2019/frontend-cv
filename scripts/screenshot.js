const { chromium } = require('playwright');
const path = require('path');

const htmlPath = path.resolve(__dirname, '../res/demo/resume.html');
const outputDir = path.resolve(__dirname, '../docs');

const themes = [
  { name: 'bold-signal', file: 'theme-bold-signal.png' },
  { name: 'terminal-green', file: 'theme-terminal-green.png' },
  { name: 'editorial', file: 'theme-editorial.png' },
];

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  for (const theme of themes) {
    const page = await context.newPage();
    await page.goto(`file://${htmlPath}`);
    await page.evaluate((t) => {
      document.documentElement.setAttribute('data-theme', t);
      localStorage.setItem('cv-theme', t);
    }, theme.name);
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(outputDir, theme.file),
      fullPage: true,
    });
    console.log(`Captured: ${theme.file}`);
    await page.close();
  }

  await browser.close();
  console.log('All screenshots captured.');
})();
