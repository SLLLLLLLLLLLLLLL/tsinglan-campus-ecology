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
  // 配置（提速）
  // ---------------------------------------------------------------------------
  const WORLD_WIDTH = 5600;
  const WORLD_HEIGHT = 1800;
  const GROUND_Y = 1450;
  const VIEW_W = () => canvas.width;
  const VIEW_H = () => canvas.height;

  const PHYS = {
    gravity: 0.62,
    jumpVel: -15.5,
    wallJumpH: 11,
    wallJumpV: -14,
    moveAcc: 1.5,        // 提速
    maxRun: 9.5,         // 提速（原 6.5）
    friction: 0.80,
    airFriction: 0.93,
    wallSlideSpeed: 2.6,
    accelBoost: 1.8      // 起步额外加速度，让响应更灵敏
  };

  // ---------------------------------------------------------------------------
  // 校园建筑（重排，消除重叠；按校园布局从左到右合理紧凑分布）
  // ---------------------------------------------------------------------------
  const buildings = [
    { label: 'H 明斋',           x: 120,  w: 300, h: 280, color: '#152030', glow: '#3a4d6b', win:'#9bb8e6' },
    { label: 'G 和园',           x: 460,  w: 220, h: 170, color: '#162530', glow: '#3d556b', win:'#9bb8e6' },
    { label: 'A 启超楼',         x: 740,  w: 420, h: 460, color: '#141d2a', glow: '#354760', win:'#a8c0e8' },
    { label: 'B 元任楼',         x: 1220, w: 440, h: 520, color: '#161f2c', glow: '#3a4d68', win:'#a8c0e8' },
    { label: 'C 寅恪楼',         x: 1720, w: 400, h: 440, color: '#121a26', glow: '#2e3d55', win:'#9ab0d8' },
    { label: 'F 水木艺术中心',   x: 2180, w: 260, h: 230, color: '#1a2638', glow: '#4a5e80', win:'#b8d0f0' },
    { label: 'D 国维楼',         x: 2500, w: 440, h: 500, color: '#141d2a', glow: '#354760', win:'#a8c0e8' },
    { label: 'E 马约翰体育中心', x: 3000, w: 560, h: 380, color: '#1a2030', glow: '#3d5273', win:'#b0c8e8' }
  ].map(b => ({ ...b, y: GROUND_Y }));

  // 地面 / 屋顶 / 平台（可站立）
  const platforms = [
    { x: 0,    y: GROUND_Y,      w: 5600, h: 400 },            // 全图地面
    // 各楼屋顶（可上去）
    { x: 140,  y: GROUND_Y - 280, w: 260, h: 14 },
    { x: 760,  y: GROUND_Y - 460, w: 380, h: 14 },
    { x: 1240, y: GROUND_Y - 520, w: 400, h: 14 },
    { x: 1740, y: GROUND_Y - 440, w: 360, h: 14 },
    { x: 2200, y: GROUND_Y - 230, w: 220, h: 14 },
    { x: 2520, y: GROUND_Y - 500, w: 400, h: 14 },
    { x: 3020, y: GROUND_Y - 380, w: 520, h: 14 },
    // 空中浮岛（探索感 + 二段跳目标）
    { x: 600,  y: GROUND_Y - 300, w: 150, h: 14 },
    { x: 1180, y: GROUND_Y - 360, w: 140, h: 14 },
    { x: 1560, y: GROUND_Y - 720, w: 170, h: 14 },
    { x: 2160, y: GROUND_Y - 540, w: 140, h: 14 },
    { x: 2700, y: GROUND_Y - 680, w: 170, h: 14 },
    { x: 3600, y: GROUND_Y - 260, w: 180, h: 14 },
    { x: 3900, y: GROUND_Y - 360, w: 160, h: 14 },
    { x: 4240, y: GROUND_Y - 280, w: 160, h: 14 }
  ];

  // 墙体（蹬墙跳/墙滑用）—— 每栋楼左右两面
  const walls = [];
  buildings.forEach(b => {
    walls.push({ x: b.x, y: b.y - b.h, w: 18, h: b.h });
    walls.push({ x: b.x + b.w - 18, y: b.y - b.h, w: 18, h: b.h });
  });
  // 左右边界
  walls.push({ x: 0, y: 0, w: 40, h: WORLD_HEIGHT });
  walls.push({ x: WORLD_WIDTH - 40, y: 0, w: 40, h: WORLD_HEIGHT });

  // 大门（关闭，左侧）
  const gates = [
    { x: 40, y: GROUND_Y - 220, w: 16, h: 220, label: '校门 Gate' }
  ];

  // 全部实心碰撞体（地面 + 楼体 + 屋顶 + 墙）
  const solids = [];
  platforms.forEach(p => solids.push({ x: p.x, y: p.y, w: p.w, h: p.h }));
  buildings.forEach(b => solids.push({ x: b.x, y: b.y - b.h, w: b.w, h: b.h }));
  walls.forEach(w => solids.push(w));

  // ---------------------------------------------------------------------------
  // 实体：植物 / 鸟类
  // ---------------------------------------------------------------------------
  const PLANT_NAMES = (typeof PLANTS !== 'undefined' ? PLANTS : window.PLANTS || []);
  const BIRD_NAMES = (typeof BIRDS !== 'undefined' ? BIRDS : window.BIRDS || []);

  // 植物点位：37 个，均匀分布在全图地面 + 各屋顶 + 浮岛，
  // 每个点 y 都精确等于所在平台顶面（GROUND_Y 或 屋顶/浮岛 y），绝不悬空、绝不进楼体内部
  const plantSpots = [
    // —— 左段地面（H、G 周围，避开楼体）——
    { x: 60,   y: GROUND_Y },       // 校门旁
    { x: 420,  y: GROUND_Y },       // H 与 G 之间
    { x: 700,  y: GROUND_Y },       // G 右侧
    // —— A 段 ——
    { x: 675,  y: GROUND_Y - 300 }, // A 左侧浮岛
    { x: 800,  y: GROUND_Y - 460 }, // A 屋顶左
    { x: 1100, y: GROUND_Y - 460 }, // A 屋顶右
    { x: 1180, y: GROUND_Y },       // A、B 间地面
    // —— B 段 ——
    { x: 1280, y: GROUND_Y - 520 }, // B 屋顶
    { x: 1560, y: GROUND_Y - 720 }, // B 上方浮岛
    { x: 1680, y: GROUND_Y },       // B 右侧地面
    // —— C 段 ——
    { x: 1780, y: GROUND_Y - 440 }, // C 屋顶
    { x: 1940, y: GROUND_Y },       // C 前
    // —— F 段 ——
    { x: 2220, y: GROUND_Y - 230 }, // F 屋顶
    { x: 2320, y: GROUND_Y },       // F 前
    // —— D 段 ——
    { x: 2560, y: GROUND_Y - 500 }, // D 屋顶
    { x: 2700, y: GROUND_Y - 680 }, // D 上方浮岛
    { x: 2820, y: GROUND_Y },       // D 前
    // —— E 段 ——
    { x: 3080, y: GROUND_Y - 380 }, // E 屋顶左
    { x: 3480, y: GROUND_Y - 380 }, // E 屋顶右
    { x: 3600, y: GROUND_Y },       // E 右侧地面
    // —— 右段地面与浮岛（均匀，不堆积）——
    { x: 3700, y: GROUND_Y - 260 }, // 浮岛
    { x: 3780, y: GROUND_Y },
    { x: 3900, y: GROUND_Y - 360 }, // 浮岛
    { x: 4000, y: GROUND_Y },
    { x: 4240, y: GROUND_Y - 280 }, // 浮岛
    { x: 4320, y: GROUND_Y },
    { x: 4500, y: GROUND_Y },
    // —— 补充若干地面点，均匀插在楼间空地 ——
    { x: 300,  y: GROUND_Y },
    { x: 560,  y: GROUND_Y },
    { x: 960,  y: GROUND_Y },
    { x: 1400, y: GROUND_Y },
    { x: 2120, y: GROUND_Y },
    { x: 2440, y: GROUND_Y },
    { x: 2940, y: GROUND_Y },
    { x: 3320, y: GROUND_Y },
    { x: 3880, y: GROUND_Y },
    { x: 4420, y: GROUND_Y }
  ];

  const plants = PLANT_NAMES.map((data, i) => {
    const spot = plantSpots[i % plantSpots.length];
    // 大型乔木用更大尺寸，其余中等
    const big = /波罗蜜|榕|葛|秋枫|菩提|木棉|榄仁|幌伞|樟|腊肠|紫檀|乌桕|羊蹄甲|蓝花楹|刺桐|杧果|酒瓶|凤凰|枫香|朴|冬青|槭/.test(data.nameCN);
    return {
      type: 'plant',
      data,
      x: spot.x,
      y: spot.y,            // 底部贴住平台顶面
      baseY: spot.y,
      width: big ? 56 : 38,
      height: big ? 110 : 78,
      halo: false,
      haloAlpha: 0,         // 渐显，不闪
      discovered: false,
      bob: Math.random() * Math.PI * 2,
      big
    };
  });

  // 鸟类点位（地面均匀分布，避开楼体内部）
  const birdSpots = [
    { x: 260,  y: GROUND_Y },
    { x: 620,  y: GROUND_Y },
    { x: 1060, y: GROUND_Y },
    { x: 1500, y: GROUND_Y },
    { x: 1960, y: GROUND_Y },
    { x: 2400, y: GROUND_Y },
    { x: 2860, y: GROUND_Y },
    { x: 3800, y: GROUND_Y }
  ];

  const birds = BIRD_NAMES.map((data, i) => {
    const spot = birdSpots[i % birdSpots.length];
    return {
      type: 'bird',
      data,
      x: spot.x,
      y: spot.y,
      groundY: spot.y,
      targetX: spot.x,
      targetY: spot.y,
      width: 38,
      height: 30,
      halo: false,
      haloAlpha: 0,
      discovered: false,
      state: 'ground',
      timer: Math.random() * 200,
      skyX: spot.x,
      skyY: spot.y - 280,
      facing: Math.random() < 0.5 ? -1 : 1,
      wing: Math.random() * Math.PI * 2,
      lerp: 0.12           // 平滑插值系数
    };
  });

  const entities = [...plants, ...birds];

  // ---------------------------------------------------------------------------
  // 玩家（更灵动：身体压扁拉伸、呼吸、触角摆动）
  // ---------------------------------------------------------------------------
  const player = {
    x: 260, y: GROUND_Y - 60,
    w: 30, h: 42,
    vx: 0, vy: 0,
    onGround: false,
    canDoubleJump: false,
    wallSliding: false,
    wallDir: 0,
    facing: 1,
    trail: [],
    squash: 1,           // y 缩放（落地压扁、起跳拉长）
    squashVel: 0,
    breath: 0,
    antenna: 0
  };

  // ---------------------------------------------------------------------------
  // 输入
  // ---------------------------------------------------------------------------
  const keys = { left: false, right: false, jump: false, jumpPressed: false };
  const mouse = { x: 0, y: 0, worldX: 0, worldY: 0, clicked: false };
  let camera = { x: 0, y: 0 };
  let gameTime = 0;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('keydown', e => {
    if (['ArrowLeft','KeyA'].includes(e.code)) keys.left = true;
    if (['ArrowRight','KeyD'].includes(e.code)) keys.right = true;
    if (['Space','ArrowUp','KeyW'].includes(e.code)) {
      if (!keys.jump) keys.jumpPressed = true;
      keys.jump = true;
      e.preventDefault();
    }
  });
  window.addEventListener('keyup', e => {
    if (['ArrowLeft','KeyA'].includes(e.code)) keys.left = false;
    if (['ArrowRight','KeyD'].includes(e.code)) keys.right = false;
    if (['Space','ArrowUp','KeyW'].includes(e.code)) keys.jump = false;
  });

  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
    mouse.worldX = mouse.x + camera.x;
    mouse.worldY = mouse.y + camera.y;
  });
  canvas.addEventListener('mousedown', () => { mouse.clicked = true; });

  // ---------------------------------------------------------------------------
  // 工具
  // ---------------------------------------------------------------------------
  function rectIntersect(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function entityCenter(e) { return { x: e.x, y: e.y - e.height / 2 }; }
  function mouseHitsEntity(e) {
    const c = entityCenter(e);
    return Math.hypot(mouse.worldX - c.x, mouse.worldY - c.y) < 72;
  }

  // ---------------------------------------------------------------------------
  // 物理：玩家移动（轴分离 + 墙滑 + 二段跳 + 蹬墙跳）
  // ---------------------------------------------------------------------------
  function movePlayer() {
    // 起步 boost，响应更灵敏
    const boost = (player.vx * (player.vx > 0 ? 1 : -1) < 1) ? PHYS.accelBoost : 1;
    if (keys.left)  { player.vx -= PHYS.moveAcc * boost; player.facing = -1; }
    if (keys.right) { player.vx += PHYS.moveAcc * boost; player.facing = 1; }

    const f = player.onGround ? PHYS.friction : PHYS.airFriction;
    player.vx *= f;
    player.vx = clamp(player.vx, -PHYS.maxRun, PHYS.maxRun);

    // X 轴
    player.x += player.vx;
    for (const s of solids) {
      if (rectIntersect(player, s)) {
        if (player.vx > 0) { player.x = s.x - player.w; player.wallDir = -1; }
        else if (player.vx < 0) { player.x = s.x + s.w; player.wallDir = 1; }
        player.vx = 0;
      }
    }
    player.x = clamp(player.x, 40, WORLD_WIDTH - 40 - player.w);

    // 墙滑检测
    player.wallSliding = false;
    if (!player.onGround && player.vy > 0) {
      const pl = { x: player.x - 3, y: player.y, w: 3, h: player.h };
      const pr = { x: player.x + player.w, y: player.y, w: 3, h: player.h };
      for (const s of solids) {
        if (rectIntersect(pl, s)) { player.wallSliding = true; player.wallDir = -1; }
        if (rectIntersect(pr, s)) { player.wallSliding = true; player.wallDir = 1; }
      }
    }
    if (player.wallSliding) {
      player.vy = Math.min(player.vy, PHYS.wallSlideSpeed);
      player.canDoubleJump = true;
    }

    // 跳跃
    if (keys.jumpPressed) {
      if (player.onGround) {
        player.vy = PHYS.jumpVel;
        player.onGround = false;
        player.canDoubleJump = true;
        player.squash = 1.35;       // 起跳拉长
        spawnDust(player.x + player.w/2, player.y + player.h, 6);
      } else if (player.wallSliding) {
        player.vy = PHYS.wallJumpV;
        player.vx = PHYS.wallJumpH * -player.wallDir;
        player.facing = -player.wallDir;
        player.wallSliding = false;
        player.canDoubleJump = true;
        player.squash = 1.25;
        spawnDust(player.x + (player.wallDir === 1 ? player.w : 0), player.y + player.h/2, 8);
      } else if (player.canDoubleJump) {
        player.vy = PHYS.jumpVel * 0.95;
        player.canDoubleJump = false;
        player.squash = 1.3;
        spawnDust(player.x + player.w/2, player.y + player.h, 5);
      }
      keys.jumpPressed = false;
    }

    // Y 轴
    player.vy += PHYS.gravity;
    if (player.wallSliding && player.vy > PHYS.wallSlideSpeed) player.vy = PHYS.wallSlideSpeed;
    player.onGround = false;
    player.y += player.vy;
    for (const s of solids) {
      if (rectIntersect(player, s)) {
        if (player.vy > 0) {
          player.y = s.y - player.h;
          player.onGround = true;
          player.canDoubleJump = true;
          player.wallSliding = false;
          if (player.vy > 6) { player.squash = 0.7; spawnDust(player.x + player.w/2, player.y + player.h, 8); } // 落地压扁
        } else if (player.vy < 0) {
          player.y = s.y + s.h;
        }
        player.vy = 0;
      }
    }
    if (player.y > WORLD_HEIGHT) {
      player.x = 260; player.y = GROUND_Y - 60; player.vx = 0; player.vy = 0;
    }

    // squash 弹性回归
    player.squashVel += (1 - player.squash) * 0.25;
    player.squashVel *= 0.72;
    player.squash += player.squashVel;

    // 呼吸 / 触角
    player.breath += 0.06;
    player.antenna = Math.sin(gameTime * 0.08) * (Math.abs(player.vx) * 0.15 + 1);

    // 拖尾
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
    for (let i = 0; i < n; i++) {
      particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 3 - 1,
        life: 25 + Math.random() * 15,
        color: '#7fffd4',
        size: 1.2 + Math.random() * 2
      });
    }
  }
  function updateParticles() {
    particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.06; p.life--; });
    particles = particles.filter(p => p.life > 0);
  }

  // ---------------------------------------------------------------------------
  // 鸟类 AI（平滑插值，杜绝抖动）
  // ---------------------------------------------------------------------------
  function updateBirds() {
    birds.forEach(b => {
      b.wing += b.state === 'ground' ? 0.12 : 0.32;
      b.timer++;

      switch (b.state) {
        case 'ground': {
          // 地面小范围走动（sin，平滑）
          b.targetX = b.groundY === b.y ? b.x + Math.sin(gameTime * 0.015 + b.timer * 0.005) * 24 : b.x;
          b.targetY = b.groundY;
          if (b.timer > 320 + (b.id || 0) * 30 + Math.random() * 180) {
            b.state = 'takeoff';
            b.timer = 0;
            b.skyX = clamp(b.x + (Math.random() - 0.5) * 500, 120, WORLD_WIDTH - 120);
            b.skyY = b.groundY - 260 - Math.random() * 160;
            b.targetX = b.skyX;
            b.targetY = b.skyY;
          }
          break;
        }
        case 'takeoff':
        case 'sky':
        case 'landing': {
          if (b.state === 'landing') {
            b.targetX = (typeof b.homeX === 'number' ? b.homeX : b.x);
            b.targetY = b.groundY;
          } else {
            b.targetX = b.skyX;
            b.targetY = b.skyY;
          }
          if (b.state === 'takeoff' && Math.hypot(b.targetX - b.x, b.targetY - b.y) < 40) {
            b.state = 'sky'; b.timer = 0;
          } else if (b.state === 'sky' && b.timer > 360 + Math.random() * 280) {
            b.state = 'landing';
            b.homeX = clamp(b.x + (Math.random() - 0.5) * 280, 120, WORLD_WIDTH - 120);
            b.timer = 0;
          } else if (b.state === 'landing' && Math.abs(b.y - b.groundY) < 4 && Math.abs(b.x - b.homeX) < 4) {
            b.state = 'ground'; b.timer = 0; b.y = b.groundY; b.x = b.homeX;
          }
          break;
        }
      }

      // 平滑插值移动（关键：用 lerp，杜绝抖动/卡顿）
      b.x = lerp(b.x, b.targetX, b.lerp);
      b.y = lerp(b.y, b.targetY, b.lerp);

      // 朝向：靠近玩家时看玩家，否则按移动方向
      const pc = entityCenter(playerAsEntity());
      const bc = entityCenter(b);
      const d = Math.hypot(pc.x - bc.x, pc.y - bc.y);
      if (d < 200) {
        b.facing = pc.x < bc.x ? -1 : 1;
      } else if (Math.abs(b.targetX - b.x) > 0.5) {
        b.facing = b.targetX < b.x ? -1 : 1;
      }
    });
  }

  function playerAsEntity() {
    return { x: player.x + player.w/2, y: player.y + player.h, width: player.w, height: player.h };
  }

  // ---------------------------------------------------------------------------
  // 实体交互（光晕随距离渐显，不闪）
  // ---------------------------------------------------------------------------
  const HALO_RANGE = 200;
  function updateEntities() {
    const pc = entityCenter(playerAsEntity());
    entities.forEach(e => {
      const c = entityCenter(e);
      const dist = Math.hypot(c.x - pc.x, c.y - pc.y);
      // 距离越近 alpha 越高（线性渐显），不闪
      const target = dist < HALO_RANGE ? clamp(1 - dist / HALO_RANGE, 0, 1) : 0;
      e.haloAlpha = lerp(e.haloAlpha, target, 0.12);
      e.halo = e.haloAlpha > 0.05;
    });

    // 鼠标悬停提示
    const mouseHover = entities.find(e => e.halo && mouseHitsEntity(e));
    canvas.style.cursor = mouseHover ? 'pointer' : 'default';
    if (mouseHover) {
      hoverTip.classList.remove('hidden');
      hoverTip.style.left = (mouse.x + 14) + 'px';
      hoverTip.style.top = (mouse.y + 14) + 'px';
      hoverTip.textContent = '点击查看：' + mouseHover.data.nameCN;
    } else hoverTip.classList.add('hidden');

    // 点击
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
    const d = entity.data;
    let html;
    if (entity.type === 'plant') {
      html = `
        <h2>${d.nameCN}</h2>
        <div class="subtitle">${d.nameEN}</div>
        <div class="aliases"><strong>别名：</strong>${(d.aliases||[]).join('、')}</div>
        <div class="info-grid">
          <div class="info-row"><span class="label">科属</span><span class="value">${d.family}</span></div>
          <div class="info-row"><span class="label">原产地</span><span class="value">${d.origin}</span></div>
        </div>
        <div class="info-section">
          <h3>外貌特征</h3>
          <p><strong>整体形态：</strong>${d.appearance.form}</p>
          <p><strong>叶片与花朵：</strong>${d.appearance.leavesAndFlowers}</p>
        </div>
        <div class="info-section">
          <h3>生长习性</h3>
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
        <div class="info-section">
          <h3>外貌特征</h3>
          <p><strong>整体形态：</strong>${d.appearance.form}</p>
          <p><strong>羽毛与特征：</strong>${d.appearance.feathersAndFeatures}</p>
        </div>
        <div class="info-section">
          <h3>生活习性</h3>
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
    grd.addColorStop(0, '#070a12');
    grd.addColorStop(1, '#000000');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, VIEW_W(), VIEW_H());

    // 星点 / 萤火（缓慢视差）
    ctx.save();
    for (let i = 0; i < 90; i++) {
      const bx = (i * 137) % WORLD_WIDTH;
      const sx = ((bx - camera.x * 0.03) % WORLD_WIDTH + WORLD_WIDTH) % WORLD_WIDTH;
      const sy = ((i * 73) % (VIEW_H() * 0.78));
      const tw = 0.35 + 0.55 * Math.sin(gameTime * 0.035 + i);
      ctx.globalAlpha = tw * 0.55;
      ctx.fillStyle = '#95e6ff';
      ctx.beginPath();
      ctx.arc(sx, sy, 1 + (i % 2) * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 远景剪影
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = '#0b1120';
    const fx = -camera.x * 0.15;
    for (let i = 0; i < 14; i++) {
      const x = ((fx + i * 460) % WORLD_WIDTH + WORLD_WIDTH) % WORLD_WIDTH;
      const bw = 200 + (i % 3) * 70;
      const bh = 180 + (i * 53) % 280;
      ctx.fillRect(x, GROUND_Y - 60 - bh, bw, bh + 60);
    }
    ctx.restore();
  }

  function drawBuildings() {
    for (const b of buildings) {
      const bx = b.x - camera.x;
      const by = b.y - b.h - camera.y;

      // 主体渐变（上深下浅，立体感）
      const g = ctx.createLinearGradient(0, by, 0, by + b.h);
      g.addColorStop(0, b.color);
      g.addColorStop(1, '#070a10');
      ctx.fillStyle = g;
      ctx.fillRect(bx, by, b.w, b.h);

      // 顶部女儿墙发光带
      ctx.fillStyle = b.glow;
      ctx.globalAlpha = 0.55;
      ctx.fillRect(bx, by, b.w, 5);
      ctx.globalAlpha = 1;

      // 窗户网格（多层，部分亮）
      const cols = Math.max(3, Math.floor(b.w / 58));
      const rows = Math.max(2, Math.floor(b.h / 72));
      const cw = (b.w - 40) / cols;
      const rh = (b.h - 30) / rows;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const lit = ((r * 7 + c * 3 + Math.floor(b.x / 13)) % 5) < 2;
          if (!lit) continue;
          const wx = bx + 20 + c * cw + cw * 0.18;
          const wy = by + 20 + r * rh + rh * 0.18;
          const ww = cw * 0.64, wh = rh * 0.6;
          ctx.fillStyle = b.win;
          ctx.globalAlpha = 0.10 + 0.08 * Math.sin(gameTime * 0.02 + r + c);
          ctx.fillRect(wx, wy, ww, wh);
          ctx.globalAlpha = 1;
        }
      }

      // 外发光描边
      ctx.save();
      ctx.strokeStyle = b.glow;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = b.glow;
      ctx.shadowBlur = 14;
      ctx.strokeRect(bx + 1, by + 1, b.w - 2, b.h - 2);
      ctx.restore();

      // 楼名
      ctx.fillStyle = 'rgba(160, 200, 240, 0.45)';
      ctx.font = '13px "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(b.label, bx + b.w/2, by - 14);
    }
  }

  function drawPlatforms() {
    for (const p of platforms) {
      if (p.w >= 5600) {
        // 主地面：画一条顶面发光线即可，避免遮挡
        const py = p.y - camera.y;
        ctx.save();
        ctx.strokeStyle = 'rgba(95, 232, 200, 0.22)';
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(95, 232, 200, 0.3)';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(0, py); ctx.lineTo(VIEW_W(), py);
        ctx.stroke();
        ctx.restore();
        continue;
      }
      const px = p.x - camera.x;
      const py = p.y - camera.y;
      ctx.fillStyle = '#0c1118';
      ctx.fillRect(px, py, p.w, p.h);
      ctx.save();
      ctx.strokeStyle = 'rgba(95, 232, 200, 0.32)';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(95, 232, 200, 0.4)';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(px, py); ctx.lineTo(px + p.w, py);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawGates() {
    for (const g of gates) {
      const gx = g.x - camera.x;
      const gy = g.y - camera.y;
      ctx.fillStyle = '#11151d';
      ctx.fillRect(gx, gy, g.w, g.h);
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 226, 122, 0.4)';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(255, 226, 122, 0.35)';
      ctx.shadowBlur = 10;
      ctx.strokeRect(gx, gy, g.w, g.h);
      ctx.restore();
      ctx.fillStyle = 'rgba(255, 226, 122, 0.55)';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(g.label, gx + g.w/2, gy - 8);
    }
  }

  function drawParticles() {
    ctx.save();
    for (const p of particles) {
      const a = clamp(p.life / 40, 0, 1);
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.x - camera.x, p.y - camera.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 玩家：灵动单色生物（呼吸、压扁拉伸、触角摆、拖尾）
  function drawPlayer() {
    const px = player.x - camera.x;
    const py = player.y - camera.y;

    // 拖尾
    ctx.save();
    for (let i = 0; i < player.trail.length; i++) {
      const t = player.trail[i];
      const a = (1 - i / player.trail.length) * 0.35;
      ctx.globalAlpha = a;
      ctx.fillStyle = '#7fffd4';
      ctx.beginPath();
      ctx.arc(t.x - camera.x, t.y - camera.y, 2.5 + i * 0.25, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    const cx = px + player.w/2;
    const cy = py + player.h/2;
    const sq = player.squash;
    const breathY = Math.sin(player.breath) * 0.6;
    const r = 14;

    ctx.save();
    ctx.translate(cx, cy + breathY);
    ctx.scale(2 - sq, sq);  // 拉长时变瘦，压扁时变宽
    ctx.shadowColor = '#5fe8c8';
    ctx.shadowBlur = 24;
    ctx.fillStyle = '#8af0ff';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // 内核高光
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.beginPath();
    ctx.arc(-3, -4, r * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 触角（随速度与呼吸摆动）
    ctx.save();
    ctx.translate(cx, cy + breathY);
    ctx.strokeStyle = '#8af0ff';
    ctx.lineWidth = 2.4;
    ctx.shadowColor = '#5fe8c8';
    ctx.shadowBlur = 12;
    const sway = player.antenna;
    ctx.beginPath();
    ctx.moveTo(-5, -10); ctx.quadraticCurveTo(-9 + sway, -18, -11 + sway, -24);
    ctx.moveTo( 5, -10); ctx.quadraticCurveTo( 9 + sway, -18, 11 + sway, -24);
    ctx.stroke();
    // 触角末端小球
    ctx.fillStyle = '#8af0ff';
    ctx.beginPath(); ctx.arc(-11 + sway, -24, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc( 11 + sway, -24, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // 眼睛（朝向）
    ctx.save();
    ctx.translate(cx, cy + breathY);
    ctx.fillStyle = '#0a1a22';
    ctx.beginPath();
    ctx.arc(player.facing * 5, -1, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.facing * 5.6, -1.6, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 植物：更精致的树/灌草（分层叶冠 + 树干 + 花朵）
  function drawPlants() {
    for (const p of plants) {
      const cx = p.x - camera.x;
      const by = p.y - camera.y;          // 底部（地面/平台顶）
      const bob = Math.sin(gameTime * 0.04 + p.bob) * 1.4;

      // 光晕（渐显，不闪）
      if (p.haloAlpha > 0.02) drawHalo(p.x, p.y - p.height * 0.55, 70, '#ffe27a', p.haloAlpha);

      const trunkH = p.big ? p.height * 0.5 : p.height * 0.35;
      const trunkX = cx;
      const trunkTop = by - trunkH;
      const crownCY = by - p.height * 0.7;

      ctx.save();
      // 树干
      ctx.strokeStyle = 'rgba(120, 95, 70, 0.85)';
      ctx.lineWidth = p.big ? 6 : 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(trunkX, by);
      ctx.lineTo(trunkX + bob * 0.25, trunkTop);
      ctx.stroke();

      // 叶冠（多层椭圆，半透明叠加，更立体）
      const leafCol = p.data.color || '#5cba6e';
      // 用一个偏暗的绿做底，花朵色做点缀
      const leafBase = 'rgba(70, 130, 90, 0.7)';
      const leafHi   = 'rgba(110, 180, 130, 0.55)';
      ctx.fillStyle = leafBase;
      const r = p.big ? 26 : 18;
      for (let i = 0; i < (p.big ? 5 : 3); i++) {
        const ang = (i / (p.big ? 5 : 3)) * Math.PI * 2 + p.bob;
        const ox = Math.cos(ang) * r * 0.5;
        const oy = Math.sin(ang) * r * 0.35 - 4;
        ctx.beginPath();
        ctx.ellipse(trunkX + ox + bob * 0.2, crownCY + oy, r, r * 0.85, ang, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = leafHi;
      for (let i = 0; i < (p.big ? 4 : 2); i++) {
        const ang = (i / (p.big ? 4 : 2)) * Math.PI * 2 - p.bob;
        const ox = Math.cos(ang) * r * 0.35;
        const oy = Math.sin(ang) * r * 0.25 - 6;
        ctx.beginPath();
        ctx.ellipse(trunkX + ox + bob * 0.15, crownCY + oy - 4, r * 0.7, r * 0.6, ang, 0, Math.PI * 2);
        ctx.fill();
      }

      // 花朵点缀（用植物自身 color，发光）
      ctx.shadowColor = leafCol;
      ctx.shadowBlur = 12;
      ctx.fillStyle = leafCol;
      const fn = p.big ? 7 : 5;
      for (let i = 0; i < fn; i++) {
        const ang = (i / fn) * Math.PI * 2 + p.bob * 0.5;
        const fx = trunkX + Math.cos(ang) * r * 0.7 + bob * 0.2;
        const fy = crownCY + Math.sin(ang) * r * 0.5 - 2;
        ctx.beginPath();
        ctx.arc(fx, fy, p.big ? 3.4 : 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // 鸟：平滑曲线身体 + 翅膀贝塞尔，飞行不抖
  function drawBirds() {
    for (const b of birds) {
      const cx = b.x - camera.x;
      const cy = b.y - camera.y - 12;

      if (b.haloAlpha > 0.02) drawHalo(b.x, b.y - 12, 60, '#ffe27a', b.haloAlpha);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(b.facing, 1);

      const col = b.data.color || '#e8e8e8';
      ctx.shadowColor = col;
      ctx.shadowBlur = 10;
      ctx.fillStyle = col;

      // 身体（平滑贝塞尔）
      ctx.beginPath();
      ctx.moveTo(-14, 0);
      ctx.quadraticCurveTo(-6, -10, 6, -7);
      ctx.quadraticCurveTo(14, -4, 14, 2);
      ctx.quadraticCurveTo(6, 8, -6, 6);
      ctx.quadraticCurveTo(-14, 4, -14, 0);
      ctx.fill();

      // 头
      ctx.beginPath();
      ctx.arc(11, -6, 6, 0, Math.PI * 2);
      ctx.fill();

      // 喙
      ctx.fillStyle = '#ffb84d';
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.moveTo(16, -6); ctx.lineTo(22, -5); ctx.lineTo(16, -3); ctx.fill();

      // 眼
      ctx.fillStyle = '#0a0a0a';
      ctx.beginPath(); ctx.arc(12, -7, 1.6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(12.4, -7.4, 0.5, 0, Math.PI * 2); ctx.fill();

      // 翅膀（贝塞尔，振幅由状态决定）
      const amp = b.state === 'ground' ? 3 : 9;
      const wy = Math.sin(b.wing) * amp;
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 2.4;
      ctx.shadowColor = col;
      ctx.shadowBlur = 6;
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

  // 光晕：渐显（用 alpha 参数，不再脉冲闪动）
  function drawHalo(worldX, worldY, radius, color, alpha) {
    const cx = worldX - camera.x;
    const cy = worldY - camera.y;
    if (alpha <= 0.02) return;
    ctx.save();
    ctx.globalAlpha = 0.6 * alpha;
    const g = ctx.createRadialGradient(cx, cy, radius * 0.25, cx, cy, radius);
    g.addColorStop(0, color);
    g.addColorStop(0.6, 'rgba(255, 226, 122, 0.35)');
    g.addColorStop(1, 'rgba(255, 226, 122, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
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
