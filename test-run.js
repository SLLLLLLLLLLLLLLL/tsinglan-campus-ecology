// 视觉验收脚本：启动带 --no-sandbox 的 Chromium，加载游戏，截图并捕获控制台错误
const { chromium } = require('/root/.nvm/versions/node/v22.13.1/lib/node_modules/@playwright/cli/node_modules/playwright-core');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--window-size=1280,720']
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  const consoleMsgs = [];
  page.on('console', m => {
    consoleMsgs.push(`[${m.type()}] ${m.text()}`);
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));

  await page.goto('http://localhost:8080/index.html', { waitUntil: 'load' });
  // 让游戏跑一会儿
  await page.waitForTimeout(2000);

  // 测试按键移动：按 D 右移 + 跳跃
  await page.keyboard.down('KeyD');
  await page.waitForTimeout(600);
  await page.keyboard.up('KeyD');
  await page.keyboard.press('Space');
  await page.waitForTimeout(500);

  // 检查实体数量与玩家是否在画布内
  const status = await page.evaluate(() => {
    return {
      plants: (window.PLANTS || []).length,
      birds: (window.BIRDS || []).length,
      hasCanvas: !!document.getElementById('gameCanvas'),
      panelHidden: document.getElementById('infoPanel').classList.contains('hidden')
    };
  });

  await page.screenshot({ path: '/workspace/tsinglan-campus-ecology/preview-1.png' });

  // 尝试点击一个植物光晕：把玩家移到第一个植物附近再点击
  // 先获取第一个植物的世界坐标
  const firstPlant = await page.evaluate(() => {
    // 通过 game.js 作用域无法直接访问，改用 DOM 统计文字判断
    return document.getElementById('plantCount').textContent;
  });

  console.log('=== STATUS ===');
  console.log(JSON.stringify(status, null, 2));
  console.log('plantCount text:', firstPlant);
  console.log('=== CONSOLE (last 20) ===');
  console.log(consoleMsgs.slice(-20).join('\n'));
  console.log('=== ERRORS ===');
  console.log(errors.length ? errors.join('\n') : '(none)');

  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });