(() => {
  'use strict';

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const infoPanel = document.getElementById('infoPanel');
  const infoContent = document.getElementById('infoContent');
  const closePanel = document.getElementById('closePanel');
  const hoverTip = document.getElementById('hoverTip');
  const plantCountEl = document.getElementById('plantCount');
  const birdCountEl = document.getElementById('birdCount');

  // ---------------------------------------------------------------------------
  // 世界配置
  // ---------------------------------------------------------------------------
  const WORLD_WIDTH = 5600;
  const WORLD_HEIGHT = 1800;
  const GROUND_Y = 1450;
  const VIEW_W = () => canvas.width;
  const VIEW_H = () => canvas.height;

  const PHYS = {
    gravity: 0.62, jumpVel: -15.5, wallJumpH: 11, wallJumpV: -14,
    moveAcc: 1.5, maxRun: 9.5, friction: 0.80, airFriction: 0.93,
    wallSlideSpeed: 2.6, accelBoost: 1.8
  };

  // ---------------------------------------------------------------------------
  // 校园建筑：DBCA 连体建筑群 + H/G/F/E 独立。
  // 颜色取真实校园偏暖色调（米黄/砖红/灰白），不再全黑；窗户大幅减少。
  // ---------------------------------------------------------------------------
  // 连体基座（DBCA 共用裙楼）
  const blockBase = { x: 740, w: 1380, h: 60, y: GROUND_Y, color: '#2a2620', glow: '#5a4a35' };
  const buildings = [
    { label: 'H 明斋',           x: 120,  w: 300, h: 280, color: '#3a3428', glow: '#7a6a4a', win:'#caa86a', roof:'#4a3f2e' },
    { label: 'G 和园',           x: 460,  w: 220, h: 170, color: '#384042', glow: '#6a7a80', win:'#a8c0d0', roof:'#4a5258' },
    { label: 'A 启超楼',         x: 740,  w: 420, h: 460, color: '#5a4a3a', glow: '#9a8a6a', win:'#e8d8a8', roof:'#6a5a48', linked:true },
    { label: 'B 元任楼',         x: 1160, w: 440, h: 520, color: '#6a4038', glow: '#a06a5a', win:'#e8b8a0', roof:'#7a4a40', linked:true },
    { label: 'C 寅恪楼',         x: 1600, w: 400, h: 440, color: '#4a4450', glow: '#7a7088', win:'#c0b8d8', roof:'#5a5260', linked:true },
    { label: 'D 国维楼',         x: 2000, w: 440, h: 500, color: '#3a4848', glow: '#6a8080', win:'#a8c8c8', roof:'#4a5a58', linked:true },
    { label: 'F 水木艺术中心',   x: 2480, w: 300, h: 230, color: '#484048', glow: '#807088', win:'#c8b8d0', roof:'#585058' },
    { label: 'E 马约翰体育中心', x: 2840, w: 560, h: 380, color: '#4a4438', glow: '#7a6e5a', win:'#d0c0a0', roof:'#5a5048' }
  ].map(b => ({ ...b, y: GROUND_Y }));

  // 连廊（DBCA 之间的天桥，连通四栋楼）
  const linkways = [
    { x: 1160, y: GROUND_Y - 200, w: 60, h: 40, color: '#3a3026', glow: '#6a5a40' }, // A-B 连廊
    { x: 1600, y: GROUND_Y - 180, w: 60, h: 40, color: '#3a3026', glow: '#6a5a40' }, // B-C 连廊
    { x: 2000, y: GROUND_Y - 200, w: 60, h: 40, color: '#3a3026', glow: '#6a5a40' }  // C-D 连廊
  ];

  // 地面 / 屋顶 / 平台
  const platforms = [
    { x: 0, y: GROUND_Y, w: WORLD_WIDTH, h: 400, ground: true },   // 全图地面
    // 各楼屋顶（可上去）
    { x: 140,  y: GROUND_Y - 280, w: 260, h: 12, roof: true },
    { x: 760,  y: GROUND_Y - 460, w: 380, h: 12, roof: true },
    { x: 1180, y: GROUND_Y - 520, w: 400, h: 12, roof: true },
    { x: 1620, y: GROUND_Y - 440, w: 360, h: 12, roof: true },
    { x: 2020, y: GROUND_Y - 500, w: 400, h: 12, roof: true },
    { x: 2500, y: GROUND_Y - 230, w: 260, h: 12, roof: true },
    { x: 2860, y: GROUND_Y - 380, w: 520, h: 12, roof: true },
    // 草坡土台（有厚度、不悬浮、颜色提亮，便于站立与区分背景）
    { x: 600,  y: GROUND_Y - 180, w: 120, h: 180, mound: true },
    { x: 3700, y: GROUND_Y - 140, w: 140, h: 140, mound: true },
    { x: 4040, y: GROUND_Y - 220, w: 130, h: 220, mound: true },
    { x: 4400, y: GROUND_Y - 160, w: 130, h: 160, mound: true }
  ];

  // 墙体（蹬墙跳用）—— 仅楼体两侧
  const walls = [];
  buildings.forEach(b => {
    walls.push({ x: b.x, y: b.y - b.h, w: 16, h: b.h });
    walls.push({ x: b.x + b.w - 16, y: b.y - b.h, w: 16, h: b.h });
  });
  // 连廊也作为可蹬墙的实心
  linkways.forEach(l => walls.push({ x: l.x, y: l.y, w: l.w, h: l.h }));
  // 边界
  walls.push({ x: 0, y: 0, w: 40, h: WORLD_HEIGHT });
  walls.push({ x: WORLD_WIDTH - 40, y: 0, w: 40, h: WORLD_HEIGHT });

  const gates = [{ x: 40, y: GROUND_Y - 220, w: 16, h: 220, label: '校门 Gate' }];

  // 全部碰撞体
  const solids = [];
  platforms.forEach(p => solids.push({ x: p.x, y: p.y, w: p.w, h: p.h }));
  buildings.forEach(b => solids.push({ x: b.x, y: b.y - b.h, w: b.w, h: b.h }));
  walls.forEach(w => solids.push(w));

  // ---------------------------------------------------------------------------
  // 实体
  // ---------------------------------------------------------------------------
  const PLANT_NAMES = (typeof PLANTS !== 'undefined' ? PLANTS : window.PLANTS || []);
  const BIRD_NAMES  = (typeof BIRDS  !== 'undefined' ? BIRDS  : window.BIRDS  || []);

  // 植物分类：乔木（大树）vs 灌木/小乔（灌草丛）。依据真实形态。
  const TREE_KEYWORDS = /波罗蜜|黄葛|秋枫|大花紫薇|菩提|美丽异木棉|小叶榄仁|杨梅|幌伞|枫香|樟|腊肠|紫檀|乌桕|蓝花楹|杧果|酒瓶|铁冬青|朴|凤凰|宫粉|刺桐|风铃|玉蕊|斯里兰卡|木棉/;

  // 楼体 x 范围（用于把植物点严格排除在楼体内部）
  const buildingRanges = buildings.map(b => [b.x, b.x + b.w]);

  function inAnyBuilding(x, pad = 6) {
    return buildingRanges.some(([a, b]) => x > a - pad && x < b + pad);
  }

  // 生成"楼外空地"候选 x 列表（步长 60，排除楼体与边界）
  function groundSlots() {
    const slots = [];
    for (let x = 60; x < WORLD_WIDTH - 60; x += 60) {
      if (!inAnyBuilding(x)) slots.push(x);
    }
    return slots;
  }

  // 37 个均匀点位：全部在地面或土台上（无屋顶），避免树上屋顶
  function buildPlantSpots() {
    const slots = groundSlots();
    const groundCount = 33; // 与 mound 4 合计 37
    const step = Math.floor(slots.length / groundCount);
    const groundPts = [];
    for (let i = 0; i < groundCount && i * step < slots.length; i++) {
      groundPts.push({ x: slots[i * step], y: GROUND_Y, kind: 'ground' });
    }
    const moundPts = [
      { x: 660,  y: GROUND_Y - 180, kind: 'mound' },
      { x: 3760, y: GROUND_Y - 140, kind: 'mound' },
      { x: 4100, y: GROUND_Y - 220, kind: 'mound' },
      { x: 4460, y: GROUND_Y - 160, kind: 'mound' }
    ];
    return [...groundPts, ...moundPts];
  }

  const plantSpots = buildPlantSpots();

  const plants = PLANT_NAMES.map((data, i) => {
    const spot = plantSpots[i % plantSpots.length];
    const isTree = TREE_KEYWORDS.test(data.nameCN);
    return {
      type: 'plant',
      data,
      x: spot.x,
      y: spot.y,
      baseY: spot.y,
      kind: spot.kind,            // ground | mound
      isTree,                     // 乔木（大树）vs 灌木/小乔（灌草丛）
      width: isTree ? 54 : 40,
      height: isTree ? 116 : 56,
      halo: false,
      haloAlpha: 0,
      discovered: false,
      bob: Math.random() * Math.PI * 2
    };
  });

  // 鸟类：8 只，均匀分布在楼外空地上
  const birdSlots = groundSlots();
  const birdStep = Math.floor(birdSlots.length / 8);
  const birdSpots = [];
  for (let i = 0; i < 8 && i * birdStep < birdSlots.length; i++) {
    birdSpots.push({ x: birdSlots[i * birdStep], y: GROUND_Y });
  }

  const birds = BIRD_NAMES.map((data, i) => {
    const spot = birdSpots[i % birdSpots.length];
    return {
      type: 'bird', data,
      x: spot.x, y: spot.y, groundY: spot.y,
      width: 38, height: 30,
      halo: false, haloAlpha: 0, discovered: false,
      state: 'ground',           // ground | fly
      timer: Math.random() * 300,
      stateDur: 0,
      // 飞行路径：贝塞尔两个控制点 + 进度
      flyPath: null,             // {x0,y0,x1,y1,cx,cy,dur,progress,speed}
      facing: Math.random() < 0.5 ? -1 : 1,
      wing: Math.random() * Math.PI * 2
    };
  });

  const entities = [...plants, ...birds];

  // ---------------------------------------------------------------------------
  // 玩家（移动/跳跃时形体变形更明显）
  // ---------------------------------------------------------------------------
  const player = {
    x: 260, y: GROUND_Y - 60, w: 30, h: 42,
    vx: 0, vy: 0,
    onGround: false, canDoubleJump: false, wallSliding: false, wallDir: 0,
    facing: 1, trail: [],
    squashX: 1, squashY: 1,        // x/y 独立缩放，变形更明显
    squashVX: 0, squashVY: 0,
    breath: 0, antenna: 0
  };

  // ---------------------------------------------------------------------------
  // 输入
  // ---------------------------------------------------------------------------
  const keys = { left: false, right: false, jump: false, jumpPressed: false };
  const mouse = { x: 0, y: 0, worldX: 0, worldY: 0, clicked: false };
  let camera = { x: 0, y: 0 };
  let gameTime = 0;

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();

  window.addEventListener('keydown', e => {
    if (['ArrowLeft','KeyA'].includes(e.code)) keys.left = true;
    if (['ArrowRight','KeyD'].includes(e.code)) keys.right = true;
    if (['Space','ArrowUp','KeyW'].includes(e.code)) {
      if (!keys.jump) keys.jumpPressed = true;
      keys.jump = true; e.preventDefault();
    }
  });
  window.addEventListener('keyup', e => {
    if (['ArrowLeft','KeyA'].includes(e.code)) keys.left = false;
    if (['ArrowRight','KeyD'].includes(e.code)) keys.right = false;
    if (['Space','ArrowUp','KeyW'].includes(e.code)) keys.jump = false;
  });
  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    mouse.worldX = mouse.x + camera.x; mouse.worldY = mouse.y + camera.y;
  });
  canvas.addEventListener('mousedown', () => { mouse.clicked = true; });

  // ---------------------------------------------------------------------------
  // 工具
  // ---------------------------------------------------------------------------
  function rectIntersect(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function entityCenter(e) { return { x: e.x, y: e.y - e.height / 2 }; }
  function mouseHitsEntity(e) {
    const c = entityCenter(e);
    return Math.hypot(mouse.worldX - c.x, mouse.worldY - c.y) < 72;
  }
  // 二次贝塞尔
  function bezier(p0, p1, p2, t) {
    const u = 1 - t;
    return u*u*p0 + 2*u*t*p1 + t*t*p2;
  }

  // ---------------------------------------------------------------------------
  // 玩家移动
  // ---------------------------------------------------------------------------
  function movePlayer() {
    const boost = (Math.abs(player.vx) < 1) ? PHYS.accelBoost : 1;
    if (keys.left)  { player.vx -= PHYS.moveAcc * boost; player.facing = -1; }
    if (keys.right) { player.vx += PHYS.moveAcc * boost; player.facing = 1; }

    const f = player.onGround ? PHYS.friction : PHYS.airFriction;
    player.vx *= f;
    player.vx = clamp(player.vx, -PHYS.maxRun, PHYS.maxRun);

    // X
    player.x += player.vx;
    for (const s of solids) {
      if (rectIntersect(player, s)) {
        if (player.vx > 0) { player.x = s.x - player.w; player.wallDir = -1; }
        else if (player.vx < 0) { player.x = s.x + s.w; player.wallDir = 1; }
        player.vx = 0;
      }
    }
    player.x = clamp(player.x, 40, WORLD_WIDTH - 40 - player.w);

    // 墙滑
    player.wallSliding = false;
    if (!player.onGround && player.vy > 0) {
      const pl = { x: player.x - 3, y: player.y, w: 3, h: player.h };
      const pr = { x: player.x + player.w, y: player.y, w: 3, h: player.h };
      for (const s of solids) {
        if (rectIntersect(pl, s)) { player.wallSliding = true; player.wallDir = -1; }
        if (rectIntersect(pr, s)) { player.wallSliding = true; player.wallDir = 1; }
      }
    }
    if (player.wallSliding) { player.vy = Math.min(player.vy, PHYS.wallSlideSpeed); player.canDoubleJump = true; }

    // 跳跃
    if (keys.jumpPressed) {
      if (player.onGround) {
        player.vy = PHYS.jumpVel; player.onGround = false; player.canDoubleJump = true;
        player.squashX = 0.7; player.squashY = 1.45;       // 起跳：瘦高
        spawnDust(player.x + player.w/2, player.y + player.h, 6);
      } else if (player.wallSliding) {
        player.vy = PHYS.wallJumpV; player.vx = PHYS.wallJumpH * -player.wallDir;
        player.facing = -player.wallDir; player.wallSliding = false; player.canDoubleJump = true;
        player.squashX = 0.8; player.squashY = 1.3;
        spawnDust(player.x + (player.wallDir === 1 ? player.w : 0), player.y + player.h/2, 8);
      } else if (player.canDoubleJump) {
        player.vy = PHYS.jumpVel * 0.95; player.canDoubleJump = false;
        player.squashX = 0.75; player.squashY = 1.38;
        spawnDust(player.x + player.w/2, player.y + player.h, 5);
      }
      keys.jumpPressed = false;
    }

    // Y
    player.vy += PHYS.gravity;
    if (player.wallSliding && player.vy > PHYS.wallSlideSpeed) player.vy = PHYS.wallSlideSpeed;
    player.onGround = false;
    player.y += player.vy;
    for (const s of solids) {
      if (rectIntersect(player, s)) {
        if (player.vy > 0) {
          player.y = s.y - player.h; player.onGround = true; player.canDoubleJump = true; player.wallSliding = false;
          if (player.vy > 6) { player.squashX = 1.4; player.squashY = 0.65; spawnDust(player.x + player.w/2, player.y + player.h, 8); } // 落地：矮胖
        } else if (player.vy < 0) { player.y = s.y + s.h; }
        player.vy = 0;
      }
    }
    if (player.y > WORLD_HEIGHT) { player.x = 260; player.y = GROUND_Y - 60; player.vx = 0; player.vy = 0; }

    // 形变弹性回归（x/y 独立）
    player.squashVX += (1 - player.squashX) * 0.22; player.squashVX *= 0.70; player.squashX += player.squashVX;
    player.squashVY += (1 - player.squashY) * 0.22; player.squashVY *= 0.70; player.squashY += player.squashVY;
    // 移动中轻微前后倾
    if (Math.abs(player.vx) > 1) {
      player.squashX = lerp(player.squashX, 1.12, 0.08);
      player.squashY = lerp(player.squashY, 0.92, 0.08);
    }

    player.breath += 0.06;
    player.antenna = Math.sin(gameTime * 0.08) * (Math.abs(player.vx) * 0.18 + 1.2);

    if (Math.abs(player.vx) > 0.3 || !player.onGround) {
      player.trail.push({ x: player.x + player.w/2, y: player.y + player.h/2, age: 0 });
    }
    player.trail.forEach(p => p.age++);
    player.trail = player.trail.filter(p => p.age < 14);
  }

  // ---------------------------------------------------------------------------
  // 粒子
  // ---------------------------------------------------------------------------
  let particles = [];
  function spawnDust(x, y, n) {
    for (let i = 0; i < n; i++) particles.push({
      x, y, vx: (Math.random()-0.5)*4, vy: (Math.random()-0.5)*3-1,
      life: 25 + Math.random()*15, color: '#7fffd4', size: 1.2 + Math.random()*2
    });
  }
  function updateParticles() {
    particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.06; p.life--; });
    particles = particles.filter(p => p.life > 0);
  }

  // ---------------------------------------------------------------------------
  // 鸟类 AI：真连续贝塞尔飞行，绝不瞬移
  //   ground: 地面停留小范围走动
  //   fly  : 沿一条随机贝塞尔曲线连续飞到新地点，飞完落地
  // ---------------------------------------------------------------------------
  function startFlight(b) {
    const x0 = b.x, y0 = b.y;
    const destX = clamp(b.groundY === GROUND_Y ? b.x + (Math.random() < 0.5 ? -1 : 1) * (300 + Math.random()*500) : b.x,
                        120, WORLD_WIDTH - 120);
    const destY = b.groundY;
    // 控制点：中点上方，形成弧线
    const cx = (x0 + destX) / 2 + (Math.random()-0.5)*200;
    const cy = Math.min(y0, destY) - 220 - Math.random()*160;
    b.flyPath = { x0, y0, x1: destX, y1: destY, cx, cy, t: 0, speed: 0.006 + Math.random()*0.004 };
    b.state = 'fly';
  }

  function updateBirds() {
    birds.forEach((b, idx) => {
      b.wing += b.state === 'ground' ? 0.10 : 0.34;
      b.timer++;
      b.stateDur++;

      if (b.state === 'ground') {
        // 地面小范围走动（sin 平滑）
        b.x += Math.sin(gameTime * 0.015 + idx) * 0.25;
        b.y = b.groundY;
        // 停留 4~8 秒后起飞
        if (b.timer > 240 + Math.random()*240) {
          b.timer = 0; b.stateDur = 0;
          startFlight(b);
        }
      } else if (b.state === 'fly') {
        const p = b.flyPath;
        p.t += p.speed;
        const t = clamp(p.t, 0, 1);
        const nx = bezier(p.x0, p.cx, p.x1, t);
        const ny = bezier(p.y0, p.cy, p.y1, t);
        // 朝向按水平速度
        const prevX = b.x;
        b.x = nx; b.y = ny;
        if (Math.abs(nx - prevX) > 0.05) b.facing = nx > prevX ? 1 : -1;
        if (t >= 1) {
          b.state = 'ground'; b.timer = 0; b.stateDur = 0;
          b.x = p.x1; b.y = p.y1; b.groundY = p.y1;
        }
      }

      // 靠近玩家时看向玩家
      const pc = entityCenter(playerAsEntity());
      const bc = entityCenter(b);
      const d = Math.hypot(pc.x - bc.x, pc.y - bc.y);
      if (d < 200) b.facing = pc.x < bc.x ? -1 : 1;
    });
  }

  function playerAsEntity() { return { x: player.x + player.w/2, y: player.y + player.h, width: player.w, height: player.h }; }

  // ---------------------------------------------------------------------------
  // 实体交互（光晕渐显）
  // ---------------------------------------------------------------------------
  const HALO_RANGE = 200;
  function updateEntities() {
    const pc = entityCenter(playerAsEntity());
    entities.forEach(e => {
      const c = entityCenter(e);
      const dist = Math.hypot(c.x - pc.x, c.y - pc.y);
      const target = dist < HALO_RANGE ? clamp(1 - dist / HALO_RANGE, 0, 1) : 0;
      e.haloAlpha = lerp(e.haloAlpha, target, 0.12);
      e.halo = e.haloAlpha > 0.05;
    });
    const mouseHover = entities.find(e => e.halo && mouseHitsEntity(e));
    canvas.style.cursor = mouseHover ? 'pointer' : 'default';
    if (mouseHover) {
      hoverTip.classList.remove('hidden');
      hoverTip.style.left = (mouse.x + 14) + 'px';
      hoverTip.style.top = (mouse.y + 14) + 'px';
      hoverTip.textContent = '点击查看：' + mouseHover.data.nameCN;
    } else hoverTip.classList.add('hidden');
    if (mouse.clicked) {
      mouse.clicked = false;
      const clicked = entities.find(e => e.halo && mouseHitsEntity(e));
      if (clicked) { openInfo(clicked); clicked.discovered = true; }
    }
    plantCountEl.textContent = `已发现植物：${plants.filter(p => p.discovered).length} / ${plants.length}`;
    birdCountEl.textContent  = `已发现鸟类：${birds.filter(b => b.discovered).length} / ${birds.length}`;
  }

  // ---------------------------------------------------------------------------
  // 信息卡
  // ---------------------------------------------------------------------------
  function openInfo(entity) {
    const d = entity.data; let html;
    if (entity.type === 'plant') {
      html = `
        <h2>${d.nameCN}</h2>
        <div class="subtitle">${d.nameEN}</div>
        <div class="aliases"><strong>别名：</strong>${(d.aliases||[]).join('、')}</div>
        <div class="info-grid">
          <div class="info-row"><span class="label">科属</span><span class="value">${d.family}</span></div>
          <div class="info-row"><span class="label">原产地</span><span class="value">${d.origin}</span></div>
        </div>
        <div class="info-section"><h3>外貌特征</h3>
          <p><strong>整体形态：</strong>${d.appearance.form}</p>
          <p><strong>叶片与花朵：</strong>${d.appearance.leavesAndFlowers}</p>
        </div>
        <div class="info-section"><h3>生长习性</h3>
          <p><strong>光照：</strong>${d.habits.light}</p>
          <p><strong>水分：</strong>${d.habits.water}</p>
          <p><strong>温度：</strong>${d.habits.temperature}</p>
        </div>
        <div class="info-section"><h3>独特价值与用途</h3><p>${d.uniqueValue}</p></div>
        <div class="info-section"><h3>花语与文化寓意</h3><p>${d.culture}</p></div>`;
    } else {
      html = `
        <h2>${d.nameCN}</h2>
        <div class="subtitle">${d.nameEN}</div>
        <div class="aliases"><strong>别名：</strong>${(d.aliases||[]).join('、')}</div>
        <div class="info-grid">
          <div class="info-row"><span class="label">科属</span><span class="value">${d.family}</span></div>
          <div class="info-row"><span class="label">分布</span><span class="value">${d.origin}</span></div>
        </div>
        <div class="info-section"><h3>外貌特征</h3>
          <p><strong>整体形态：</strong>${d.appearance.form}</p>
          <p><strong>羽毛与特征：</strong>${d.appearance.feathersAndFeatures}</p>
        </div>
        <div class="info-section"><h3>生活习性</h3>
          <p><strong>食性：</strong>${d.habits.diet}</p>
          <p><strong>栖息地：</strong>${d.habits.habitat}</p>
          <p><strong>活动：</strong>${d.habits.activity}</p>
        </div>
        <div class="info-section"><h3>独特价值与用途</h3><p>${d.uniqueValue}</p></div>
        <div class="info-section"><h3>文化寓意</h3><p>${d.culture}</p></div>`;
    }
    infoContent.innerHTML = html;
    infoPanel.classList.remove('hidden');
  }
  closePanel.addEventListener('click', () => infoPanel.classList.add('hidden'));
  infoPanel.addEventListener('click', e => { if (e.target === infoPanel) infoPanel.classList.add('hidden'); });

  // ---------------------------------------------------------------------------
  // 相机
  // ---------------------------------------------------------------------------
  function updateCamera() {
    const tx = player.x + player.w/2 - VIEW_W()/2;
    const ty = player.y + player.h/2 - VIEW_H()*0.58;
    camera.x = lerp(camera.x, tx, 0.10);
    camera.y = lerp(camera.y, ty, 0.08);
    camera.x = clamp(camera.x, 0, WORLD_WIDTH - VIEW_W());
    camera.y = clamp(camera.y, 0, WORLD_HEIGHT - VIEW_H());
  }

  // ---------------------------------------------------------------------------
  // 渲染
  // ---------------------------------------------------------------------------
  function drawBackground() {
    const grd = ctx.createRadialGradient(VIEW_W()/2, VIEW_H()*0.42, 120, VIEW_W()/2, VIEW_H()*0.5, VIEW_H()*1.3);
    grd.addColorStop(0, '#070a12'); grd.addColorStop(1, '#000000');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, VIEW_W(), VIEW_H());

    ctx.save();
    for (let i = 0; i < 90; i++) {
      const bx = (i * 137) % WORLD_WIDTH;
      const sx = ((bx - camera.x * 0.03) % WORLD_WIDTH + WORLD_WIDTH) % WORLD_WIDTH;
      const sy = ((i * 73) % (VIEW_H() * 0.78));
      const tw = 0.35 + 0.55 * Math.sin(gameTime * 0.035 + i);
      ctx.globalAlpha = tw * 0.55; ctx.fillStyle = '#95e6ff';
      ctx.beginPath(); ctx.arc(sx, sy, 1 + (i % 2) * 0.7, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = 0.22; ctx.fillStyle = '#0b1120';
    const fx = -camera.x * 0.15;
    for (let i = 0; i < 14; i++) {
      const x = ((fx + i * 460) % WORLD_WIDTH + WORLD_WIDTH) % WORLD_WIDTH;
      const bw = 200 + (i % 3) * 70, bh = 180 + (i * 53) % 280;
      ctx.fillRect(x, GROUND_Y - 60 - bh, bw, bh + 60);
    }
    ctx.restore();
  }

  // 建筑：真实暖色调 + 屋顶 + 极少窗户 + 连体基座 + 连廊
  function drawBuildings() {
    // DBCA 连体基座
    const bb = blockBase;
    ctx.save();
    const bg = ctx.createLinearGradient(0, bb.y - camera.y, 0, bb.y - camera.y + bb.h);
    bg.addColorStop(0, bb.color); bg.addColorStop(1, '#1a1610');
    ctx.fillStyle = bg;
    ctx.fillRect(bb.x - camera.x, bb.y - bb.h - camera.y, bb.w, bb.h);
    ctx.strokeStyle = bb.glow; ctx.lineWidth = 1.5;
    ctx.shadowColor = bb.glow; ctx.shadowBlur = 8;
    ctx.strokeRect(bb.x - camera.x + 1, bb.y - bb.h - camera.y + 1, bb.w - 2, bb.h - 2);
    ctx.restore();

    // 连廊
    for (const l of linkways) {
      const lx = l.x - camera.x, ly = l.y - camera.y;
      ctx.save();
      ctx.fillStyle = l.color;
      ctx.fillRect(lx, ly, l.w, l.h);
      ctx.strokeStyle = l.glow; ctx.lineWidth = 1.2;
      ctx.shadowColor = l.glow; ctx.shadowBlur = 6;
      ctx.strokeRect(lx + 1, ly + 1, l.w - 2, l.h - 2);
      ctx.restore();
    }

    for (const b of buildings) {
      const bx = b.x - camera.x, by = b.y - b.h - camera.y;

      // 主体渐变（上浅下深，暖色）
      const g = ctx.createLinearGradient(0, by, 0, by + b.h);
      g.addColorStop(0, b.color);
      g.addColorStop(1, '#1a1410');
      ctx.fillStyle = g;
      ctx.fillRect(bx, by, b.w, b.h);

      // 屋顶（顶部一条深色檐口 + 发光带）
      ctx.fillStyle = b.roof;
      ctx.fillRect(bx, by, b.w, 8);
      ctx.fillStyle = b.glow;
      ctx.globalAlpha = 0.5;
      ctx.fillRect(bx, by + 8, b.w, 2);
      ctx.globalAlpha = 1;

      // 窗户：极少，只画少量竖条窗
      const cols = Math.max(3, Math.floor(b.w / 90));
      for (let c = 0; c < cols; c++) {
        const wx = bx + 24 + c * (b.w - 48) / (cols - 1) - 8;
        const wy = by + 30;
        const ww = 16, wh = b.h - 50;
        ctx.fillStyle = b.win;
        ctx.globalAlpha = 0.10 + 0.05 * Math.sin(gameTime * 0.02 + c);
        ctx.fillRect(wx, wy, ww, wh);
        ctx.globalAlpha = 1;
      }

      // 楼体柔光描边
      ctx.save();
      ctx.strokeStyle = b.glow; ctx.lineWidth = 1.5;
      ctx.shadowColor = b.glow; ctx.shadowBlur = 12;
      ctx.strokeRect(bx + 1, by + 1, b.w - 2, b.h - 2);
      ctx.restore();

      // 楼名
      ctx.fillStyle = 'rgba(220, 210, 190, 0.55)';
      ctx.font = '13px "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(b.label, bx + b.w/2, by - 10);
    }
  }

  // 平台：地面/屋顶/土台分别画，土台有厚度不悬浮
  function drawPlatforms() {
    for (const p of platforms) {
      const px = p.x - camera.x, py = p.y - camera.y;
      if (p.ground) {
        // 地面：画一条发光顶线 + 下方深色土层
        ctx.save();
        ctx.fillStyle = '#0a0e14';
        ctx.fillRect(0, py, VIEW_W(), p.h);
        ctx.strokeStyle = 'rgba(120, 200, 170, 0.45)';  // 提亮，与背景区分
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(120, 200, 170, 0.5)';
        ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(VIEW_W(), py); ctx.stroke();
        ctx.restore();
        continue;
      }
      if (p.roof) {
        // 屋顶平台：薄板，顶面发光
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(px, py, p.w, p.h);
        ctx.save();
        ctx.strokeStyle = 'rgba(140, 210, 180, 0.4)';
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(140, 210, 180, 0.45)';
        ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + p.w, py); ctx.stroke();
        ctx.restore();
        continue;
      }
      if (p.mound) {
        // 土台：有厚度的草坡，颜色明亮，绝不悬浮
        ctx.save();
        const g = ctx.createLinearGradient(0, py, 0, py + p.h);
        g.addColorStop(0, '#1e3a2a');     // 顶面草绿
        g.addColorStop(0.15, '#163020');
        g.addColorStop(1, '#0a1410');     // 底部深土
        ctx.fillStyle = g;
        ctx.fillRect(px, py, p.w, p.h);
        // 顶面发光草线
        ctx.strokeStyle = 'rgba(120, 220, 160, 0.5)';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = 'rgba(120, 220, 160, 0.55)';
        ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + p.w, py); ctx.stroke();
        ctx.restore();
        continue;
      }
    }
  }

  function drawGates() {
    for (const g of gates) {
      const gx = g.x - camera.x, gy = g.y - camera.y;
      ctx.fillStyle = '#11151d'; ctx.fillRect(gx, gy, g.w, g.h);
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 226, 122, 0.4)'; ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(255, 226, 122, 0.35)'; ctx.shadowBlur = 10;
      ctx.strokeRect(gx, gy, g.w, g.h);
      ctx.restore();
      ctx.fillStyle = 'rgba(255, 226, 122, 0.55)'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(g.label, gx + g.w/2, gy - 8);
    }
  }

  function drawParticles() {
    ctx.save();
    for (const p of particles) {
      const a = clamp(p.life / 40, 0, 1);
      ctx.globalAlpha = a; ctx.fillStyle = p.color;
      ctx.shadowColor = p.color; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(p.x - camera.x, p.y - camera.y, p.size, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  // 玩家：x/y 独立形变，移动跳跃时明显变形
  function drawPlayer() {
    const px = player.x - camera.x, py = player.y - camera.y;

    // 拖尾
    ctx.save();
    for (let i = 0; i < player.trail.length; i++) {
      const t = player.trail[i];
      const a = (1 - i / player.trail.length) * 0.35;
      ctx.globalAlpha = a; ctx.fillStyle = '#7fffd4';
      ctx.beginPath(); ctx.arc(t.x - camera.x, t.y - camera.y, 2.5 + i * 0.25, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

    const cx = px + player.w/2, cy = py + player.h/2;
    const sx = player.squashX, sy = player.squashY;
    const breathY = Math.sin(player.breath) * 0.6;
    const r = 14;

    ctx.save();
    ctx.translate(cx, cy + breathY);
    ctx.scale(sx, sy);
    ctx.shadowColor = '#5fe8c8'; ctx.shadowBlur = 24;
    ctx.fillStyle = '#8af0ff';
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.beginPath(); ctx.arc(-3, -4, r * 0.45, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // 触角
    ctx.save();
    ctx.translate(cx, cy + breathY);
    ctx.strokeStyle = '#8af0ff'; ctx.lineWidth = 2.4;
    ctx.shadowColor = '#5fe8c8'; ctx.shadowBlur = 12;
    const sway = player.antenna;
    ctx.beginPath();
    ctx.moveTo(-5, -10); ctx.quadraticCurveTo(-9 + sway, -18, -11 + sway, -24);
    ctx.moveTo( 5, -10); ctx.quadraticCurveTo( 9 + sway, -18, 11 + sway, -24);
    ctx.stroke();
    ctx.fillStyle = '#8af0ff';
    ctx.beginPath(); ctx.arc(-11 + sway, -24, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc( 11 + sway, -24, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // 眼
    ctx.save();
    ctx.translate(cx, cy + breathY);
    ctx.fillStyle = '#0a1a22';
    ctx.beginPath(); ctx.arc(player.facing * 5, -1, 2.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(player.facing * 5.6, -1.6, 1, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // 植物：乔木画大树（树干+多层叶冠+花），灌木/小乔画灌草丛（多茎+叶丛+小花），区分两类
  function drawPlants() {
    for (const p of plants) {
      const cx = p.x - camera.x;
      const by = p.y - camera.y;        // 底部贴地
      const bob = Math.sin(gameTime * 0.04 + p.bob) * 1.4;

      if (p.haloAlpha > 0.02) drawHalo(p.x, p.y - p.height * 0.55, 70, '#ffe27a', p.haloAlpha);

      const flowerCol = p.data.color || '#f4d03f';

      if (p.isTree) {
        // —— 乔木：树干 + 多层叶冠 + 花朵 ——
        const trunkH = p.height * 0.5;
        const trunkTop = by - trunkH;
        const crownCY = by - p.height * 0.72;
        ctx.save();
        // 树干
        ctx.strokeStyle = 'rgba(110, 85, 60, 0.9)';
        ctx.lineWidth = 6; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(cx, by); ctx.lineTo(cx + bob*0.25, trunkTop); ctx.stroke();
        // 叶冠多层
        const r = 26;
        ctx.fillStyle = 'rgba(60, 120, 80, 0.78)';
        for (let i = 0; i < 5; i++) {
          const a = (i/5)*Math.PI*2 + p.bob;
          ctx.beginPath();
          ctx.ellipse(cx + Math.cos(a)*r*0.5 + bob*0.2, crownCY + Math.sin(a)*r*0.35 - 4, r, r*0.85, a, 0, Math.PI*2);
          ctx.fill();
        }
        ctx.fillStyle = 'rgba(100, 170, 120, 0.6)';
        for (let i = 0; i < 4; i++) {
          const a = (i/4)*Math.PI*2 - p.bob;
          ctx.beginPath();
          ctx.ellipse(cx + Math.cos(a)*r*0.35 + bob*0.15, crownCY + Math.sin(a)*r*0.25 - 6, r*0.7, r*0.6, a, 0, Math.PI*2);
          ctx.fill();
        }
        // 花朵点缀
        ctx.shadowColor = flowerCol; ctx.shadowBlur = 12; ctx.fillStyle = flowerCol;
        for (let i = 0; i < 7; i++) {
          const a = (i/7)*Math.PI*2 + p.bob*0.5;
          ctx.beginPath(); ctx.arc(cx + Math.cos(a)*r*0.7 + bob*0.2, crownCY + Math.sin(a)*r*0.5 - 2, 3.4, 0, Math.PI*2); ctx.fill();
        }
        ctx.restore();
      } else {
        // —— 灌木/小乔：多茎 + 叶丛 + 小花，贴地成丛 ——
        ctx.save();
        const stems = 3, stemH = p.height * 0.6;
        ctx.strokeStyle = 'rgba(100, 80, 55, 0.85)';
        ctx.lineWidth = 2.4; ctx.lineCap = 'round';
        for (let i = 0; i < stems; i++) {
          const ox = (i - 1) * 10;
          ctx.beginPath();
          ctx.moveTo(cx + ox, by);
          ctx.quadraticCurveTo(cx + ox + bob*0.3, by - stemH*0.6, cx + ox + bob*0.5, by - stemH);
          ctx.stroke();
        }
        // 叶丛（多个椭圆堆叠）
        const r = 16;
        ctx.fillStyle = 'rgba(70, 135, 90, 0.75)';
        for (let i = 0; i < 5; i++) {
          const a = (i/5)*Math.PI*2 + p.bob;
          ctx.beginPath();
          ctx.ellipse(cx + Math.cos(a)*r*0.5 + bob*0.2, by - stemH + Math.sin(a)*r*0.3 - 4, r, r*0.8, a, 0, Math.PI*2);
          ctx.fill();
        }
        ctx.fillStyle = 'rgba(110, 175, 130, 0.6)';
        for (let i = 0; i < 4; i++) {
          const a = (i/4)*Math.PI*2 - p.bob;
          ctx.beginPath();
          ctx.ellipse(cx + Math.cos(a)*r*0.35 + bob*0.15, by - stemH + Math.sin(a)*r*0.22 - 6, r*0.65, r*0.55, a, 0, Math.PI*2);
          ctx.fill();
        }
        // 小花
        ctx.shadowColor = flowerCol; ctx.shadowBlur = 10; ctx.fillStyle = flowerCol;
        for (let i = 0; i < 5; i++) {
          const a = (i/5)*Math.PI*2 + p.bob*0.5;
          ctx.beginPath(); ctx.arc(cx + Math.cos(a)*r*0.6 + bob*0.2, by - stemH + Math.sin(a)*r*0.4 - 2, 2.8, 0, Math.PI*2); ctx.fill();
        }
        ctx.restore();
      }
    }
  }

  // 鸟：贝塞尔身体 + 翅膀，飞行连续平滑
  function drawBirds() {
    for (const b of birds) {
      const cx = b.x - camera.x;
      const cy = b.y - camera.y - 12;

      if (b.haloAlpha > 0.02) drawHalo(b.x, b.y - 12, 60, '#ffe27a', b.haloAlpha);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(b.facing, 1);

      const col = b.data.color || '#e8e8e8';
      ctx.shadowColor = col; ctx.shadowBlur = 10; ctx.fillStyle = col;

      // 身体
      ctx.beginPath();
      ctx.moveTo(-14, 0);
      ctx.quadraticCurveTo(-6, -10, 6, -7);
      ctx.quadraticCurveTo(14, -4, 14, 2);
      ctx.quadraticCurveTo(6, 8, -6, 6);
      ctx.quadraticCurveTo(-14, 4, -14, 0);
      ctx.fill();

      // 头
      ctx.beginPath(); ctx.arc(11, -6, 6, 0, Math.PI * 2); ctx.fill();

      // 喙
      ctx.fillStyle = '#ffb84d'; ctx.shadowBlur = 0;
      ctx.beginPath(); ctx.moveTo(16, -6); ctx.lineTo(22, -5); ctx.lineTo(16, -3); ctx.fill();

      // 眼
      ctx.fillStyle = '#0a0a0a';
      ctx.beginPath(); ctx.arc(12, -7, 1.6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(12.4, -7.4, 0.5, 0, Math.PI * 2); ctx.fill();

      // 翅膀
      const amp = b.state === 'ground' ? 3 : 9;
      const wy = Math.sin(b.wing) * amp;
      ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 2.4;
      ctx.shadowColor = col; ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(-2, -4);
      ctx.quadraticCurveTo(-10, -8 - wy, -18, 2 + wy * 0.5);
      ctx.stroke();
      // 尾
      ctx.beginPath();
      ctx.moveTo(-14, 0);
      ctx.quadraticCurveTo(-20, -2, -22, 2);
      ctx.stroke();

      ctx.restore();
    }
  }

  function drawHalo(worldX, worldY, radius, color, alpha) {
    const cx = worldX - camera.x, cy = worldY - camera.y;
    if (alpha <= 0.02) return;
    ctx.save();
    ctx.globalAlpha = 0.6 * alpha;
    const g = ctx.createRadialGradient(cx, cy, radius * 0.25, cx, cy, radius);
    g.addColorStop(0, color);
    g.addColorStop(0.6, 'rgba(255, 226, 122, 0.35)');
    g.addColorStop(1, 'rgba(255, 226, 122, 0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // 主循环
  // ---------------------------------------------------------------------------
  function loop() {
    gameTime++;
    movePlayer();
    updateBirds();
    updateEntities();
    updateParticles();
    updateCamera();

    drawBackground();
    drawBuildings();
    drawPlatforms();
    drawGates();
    drawPlants();
    drawBirds();
    drawPlayer();
    drawParticles();

    requestAnimationFrame(loop);
  }
  loop();
})();
