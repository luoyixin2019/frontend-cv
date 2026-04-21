const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const demos = [
  { lang: 'en', htmlPath: path.resolve(__dirname, '../res/demo/en/resume_en.html') },
  { lang: 'zh', htmlPath: path.resolve(__dirname, '../res/demo/zh/resume_zh.html') },
];

const themes = [
  { name: 'bold-signal', file: 'theme-bold-signal.png' },
  { name: 'terminal-green', file: 'theme-terminal-green.png' },
  { name: 'editorial', file: 'theme-editorial.png' },
];

const VIEWPORT_WIDTH = 1440;
const DEVICE_SCALE = 2;

(async () => {
  const browser = await chromium.launch();

  for (const demo of demos) {
    const outputDir = path.resolve(__dirname, '../docs', demo.lang);
    fs.mkdirSync(outputDir, { recursive: true });

    if (!fs.existsSync(demo.htmlPath)) {
      console.warn(`Skip ${demo.lang}: ${demo.htmlPath} not found`);
      continue;
    }

    const heights = [];
    for (const theme of themes) {
      const context = await browser.newContext({
        viewport: { width: VIEWPORT_WIDTH, height: 900 },
        deviceScaleFactor: DEVICE_SCALE,
      });
      const page = await context.newPage();
      await page.goto(`file://${demo.htmlPath}`);
      await page.evaluate((t) => {
        document.documentElement.setAttribute('data-theme', t);
        localStorage.setItem('cv-theme', t);
      }, theme.name);
      await page.waitForTimeout(500);
      const h = await page.evaluate(() => document.body.scrollHeight);
      heights.push(h);
      await context.close();
    }

    const unifiedHeight = Math.max(...heights);
    console.log(`${demo.lang}: unified height = ${unifiedHeight} (individual: ${heights.join(', ')})`);

    for (const theme of themes) {
      const context = await browser.newContext({
        viewport: { width: VIEWPORT_WIDTH, height: unifiedHeight },
        deviceScaleFactor: DEVICE_SCALE,
      });
      const page = await context.newPage();
      await page.goto(`file://${demo.htmlPath}`);
      await page.evaluate((t) => {
        document.documentElement.setAttribute('data-theme', t);
        localStorage.setItem('cv-theme', t);
      }, theme.name);
      await page.waitForTimeout(500);

      await page.screenshot({
        path: path.join(outputDir, theme.file),
        clip: { x: 0, y: 0, width: VIEWPORT_WIDTH, height: unifiedHeight },
      });
      console.log(`Captured: ${demo.lang}/${theme.file} (${VIEWPORT_WIDTH}x${unifiedHeight})`);
      await context.close();
    }
  }

  await browser.close();
  console.log('All screenshots captured.');
})();
