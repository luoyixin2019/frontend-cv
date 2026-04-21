const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const demos = [
  { lang: 'zh', htmlPath: path.resolve(__dirname, '../res/demo/zh/resume_zh.html') },
  { lang: 'en', htmlPath: path.resolve(__dirname, '../res/demo/en/resume_en.html') },
];

const outputDir = path.resolve(__dirname, '../docs');
const framesDir = path.join(outputDir, '_frames');

const VIEWPORT_WIDTH = 1440;
const VIEWPORT_HEIGHT = 900;
const DEVICE_SCALE = 1.5; 
const FPS = 24; 

let frameIndex = 0;
let cursorX = VIEWPORT_WIDTH / 2;
let cursorY = VIEWPORT_HEIGHT / 2;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// 注入模拟光标和特效的 CSS 与 DOM
async function injectCursor(page) {
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.textContent = `
      #demo-cursor {
        position: fixed;
        top: 0;
        left: 0;
        width: 32px;
        height: 32px;
        pointer-events: none;
        z-index: 999999;
        transform: translate(calc(var(--cx) * 1px), calc(var(--cy) * 1px));
        transition: transform 0s linear;
      }
      #demo-cursor svg {
        width: 100%;
        height: 100%;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        transform-origin: 0 0;
        transition: transform 0.1s ease;
      }
      #demo-cursor.clicking svg {
        transform: scale(0.85);
      }
      .demo-ripple {
        position: fixed;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.2);
        border: 2px solid rgba(0, 0, 0, 0.4);
        pointer-events: none;
        z-index: 999998;
        transform: translate(-50%, -50%) scale(0.5);
        opacity: 1;
        animation: ripple-anim 0.4s ease-out forwards;
      }
      @keyframes ripple-anim {
        100% {
          transform: translate(-50%, -50%) scale(2);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);

    const cursor = document.createElement('div');
    cursor.id = 'demo-cursor';
    // macOS 风格的光标 SVG
    cursor.innerHTML = `<svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 1L22 10.4737L13.8947 13.8947L20.2105 23.3684L17.0526 25.4737L10.7368 16L4 21V1Z" fill="black" stroke="white" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
    document.body.appendChild(cursor);
  });
}

// 更新光标在页面上的位置
async function updateCursorPos(page, x, y) {
  await page.evaluate(({ cx, cy }) => {
    const el = document.getElementById('demo-cursor');
    if (el) {
      el.style.setProperty('--cx', cx);
      el.style.setProperty('--cy', cy);
    }
  }, { cx: x, cy: y });
}

async function captureFrame(page) {
  const framePath = path.join(framesDir, `frame_${String(frameIndex).padStart(5, '0')}.png`);
  await page.screenshot({ path: framePath, type: 'png' });
  frameIndex++;
}

async function hold(page, frames) {
  for (let i = 0; i < frames; i++) {
    await captureFrame(page);
  }
}

// 缓动函数 (easeInOutCubic)
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// 平滑移动光标
async function moveCursorTo(page, targetX, targetY, frames) {
  const startX = cursorX;
  const startY = cursorY;
  
  for (let i = 1; i <= frames; i++) {
    const t = i / frames;
    const eased = easeInOutCubic(t);
    cursorX = startX + (targetX - startX) * eased;
    cursorY = startY + (targetY - startY) * eased;
    
    await updateCursorPos(page, cursorX, cursorY);
    await captureFrame(page);
  }
}

// 触发点击动效
async function clickEffect(page) {
  await page.evaluate(({ cx, cy }) => {
    const cursor = document.getElementById('demo-cursor');
    if (cursor) cursor.classList.add('clicking');
    
    const ripple = document.createElement('div');
    ripple.className = 'demo-ripple';
    ripple.style.left = cx + 'px';
    ripple.style.top = cy + 'px';
    document.body.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 400);
  }, { cx: cursorX, cy: cursorY });
  
  await hold(page, 3); // 按下的保持帧
  
  await page.evaluate(() => {
    const cursor = document.getElementById('demo-cursor');
    if (cursor) cursor.classList.remove('clicking');
  });
}

// 移动到目标元素并点击
async function clickElement(page, selector, postHoldFrames) {
  // 获取元素在视口中的位置
  const box = await page.locator(selector).boundingBox();
  if (!box) {
    console.warn(`Cannot find element: ${selector}`);
    return;
  }
  
  // 目标坐标：元素中心点
  const targetX = box.x + box.width / 2;
  const targetY = box.y + box.height / 2;
  
  // 计算距离决定移动帧数 (速度控制)
  const dist = Math.hypot(targetX - cursorX, targetY - cursorY);
  const moveFrames = Math.max(12, Math.min(30, Math.round(dist / 20))); // 0.5s 到 1.25s 之间
  
  // 移动光标
  await moveCursorTo(page, targetX, targetY, moveFrames);
  
  // 停顿一下
  await hold(page, 4);
  
  // 触发视觉特效
  await clickEffect(page);
  
  // 触发真实点击
  await page.locator(selector).click();
  
  // 点击后的效果展示帧
  await hold(page, postHoldFrames);
}

// 页面平滑滚动 (同时光标相对视口位置不变，但要考虑其实在屏幕上是固定的)
async function smoothScroll(page, fromY, toY, frames) {
  for (let i = 1; i <= frames; i++) {
    const t = i / frames;
    const eased = easeInOutCubic(t);
    const y = Math.round(fromY + (toY - fromY) * eased);
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
    // 滚动时光标的 fixed 坐标不需要更新，只需捕获帧
    await captureFrame(page);
  }
}

(async () => {
  const browser = await chromium.launch();

  for (const demo of demos) {
    if (!fs.existsSync(demo.htmlPath)) {
      console.warn(`Skip ${demo.lang}: ${demo.htmlPath} not found`);
      continue;
    }

    console.log(`\n=== Recording ${demo.lang.toUpperCase()} version with Cursor ===`);
    frameIndex = 0;
    cursorX = VIEWPORT_WIDTH / 2;
    cursorY = VIEWPORT_HEIGHT / 2;
    
    fs.mkdirSync(framesDir, { recursive: true });
    for (const f of fs.readdirSync(framesDir).filter(f => f.endsWith('.png'))) {
      fs.unlinkSync(path.join(framesDir, f));
    }

    const context = await browser.newContext({
      viewport: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT },
      deviceScaleFactor: DEVICE_SCALE,
    });

    const page = await context.newPage();

    await page.goto(`file://${demo.htmlPath}`);
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'bold-signal');
      localStorage.setItem('cv-theme', 'bold-signal');
      window.scrollTo(0, 0);
    });
    
    await injectCursor(page);
    await updateCursorPos(page, cursorX, cursorY);
    
    await sleep(1000);

    console.log('Start recording frames...');
    await hold(page, 24);

    const pageHeight = await page.evaluate(() => document.body.scrollHeight);
    const scrollMid = Math.min(pageHeight - VIEWPORT_HEIGHT, 500);

    // 滚动展示
    await smoothScroll(page, 0, scrollMid, 30);
    await hold(page, 12);
    await smoothScroll(page, scrollMid, 0, 20);
    await hold(page, 12);

    // 切换主题 1
    await clickElement(page, '.theme-btn[data-target="terminal-green"]', 16);
    await smoothScroll(page, 0, scrollMid, 24);
    await hold(page, 12);
    await smoothScroll(page, scrollMid, 0, 16);
    await hold(page, 12);

    // 切换主题 2
    await clickElement(page, '.theme-btn[data-target="editorial"]', 16);
    await smoothScroll(page, 0, scrollMid, 24);
    await hold(page, 12);
    await smoothScroll(page, scrollMid, 0, 16);
    await hold(page, 12);

    // 切回默认
    await clickElement(page, '.theme-btn[data-target="bold-signal"]', 12);

    // 布局切换
    await clickElement(page, '.layout-btn[data-layout="single"]', 24);
    await clickElement(page, '.layout-btn[data-layout="double"]', 24);

    // 架构图弹窗
    await clickElement(page, '.diagram-trigger[data-modal="modal-agentforge"]', 36);
    await clickElement(page, '#modal-agentforge .diagram-modal-close', 12);

    await clickElement(page, '.diagram-trigger[data-modal="modal-memoryos"]', 36);
    await clickElement(page, '#modal-memoryos .diagram-modal-close', 12);

    await clickElement(page, '.diagram-trigger[data-modal="modal-codepilot"]', 36);
    
    // 按 Esc 关弹窗前，光标移开一点显得自然
    await moveCursorTo(page, cursorX - 100, cursorY + 50, 15);
    await hold(page, 5);
    await page.keyboard.press('Escape');
    await hold(page, 12);

    // 水印展示 (移动到角落模拟鼠标移出)
    await moveCursorTo(page, VIEWPORT_WIDTH - 50, VIEWPORT_HEIGHT - 50, 20);
    const watermarkText = demo.lang === 'zh' ? '字节跳动' : 'ByteDance';
    await page.evaluate((wm) => {
      window.location.hash = '#wm=' + wm;
      window.dispatchEvent(new Event('hashchange'));
    }, watermarkText);
    await hold(page, 36);

    await page.evaluate(() => {
      window.location.hash = '#wm=clear';
      window.dispatchEvent(new Event('hashchange'));
    });
    await hold(page, 12);

    // 滚动到底部
    await smoothScroll(page, 0, pageHeight, 32);
    await hold(page, 16);
    await smoothScroll(page, pageHeight, 0, 32);
    await hold(page, 16);

    await context.close();

    console.log(`Total frames captured for ${demo.lang}: ${frameIndex}`);

    const mp4File = path.join(outputDir, `demo-video-${demo.lang}.mp4`);
    console.log(`Encoding MP4 for ${demo.lang} with FFmpeg...`);
    
    execSync(
      `ffmpeg -y -framerate ${FPS} -i "${framesDir}/frame_%05d.png" ` +
      `-c:v libx264 -preset veryslow -crf 24 -pix_fmt yuv420p ` +
      `-movflags +faststart "${mp4File}"`,
      { stdio: 'inherit' }
    );

    const stats = fs.statSync(mp4File);
    console.log(`Done! Video saved to ${mp4File} (${(stats.size / 1024 / 1024).toFixed(1)}MB)`);
  }

  fs.rmSync(framesDir, { recursive: true, force: true });
  await browser.close();
})();
