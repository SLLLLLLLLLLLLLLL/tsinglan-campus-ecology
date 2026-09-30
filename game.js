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
  // 配置
  // ---------------------------------------------------------------------------
  const WORLD_WIDTH = 5600;
  const WORLD_HEIGHT = 1800;
  const GROUND_Y = 1450;
  const VIEW_W = () => canvas.width;
  const VIEW_H = () => canvas.height;

  const PHYS = {
    gravity: 0.55,
    jumpVel: -14.5,
    wallJumpH: 9.5,
    wallJumpV: -13,
    moveAcc: 0.8,
    maxRun: 6.5,
    friction: 0.82,
    airFriction: 0.94,
    wallSlideSpeed: 2.5
  };

  // ---------------------------------------------------------------------------
  // 校园地图布局（基于 3D 等距校园图）
  // ---------------------------------------------------------------------------
  const buildings = [
    { label: 'H 明斋', x: 150, y: GROUND_Y, w: 380, h: 260, color: '#1a2230', glow: '#3d4d6b' },
    { label: 'G 和园', x: 620, y: GROUND_Y, w: 240, h: 160, color: '#1a2530', glow: '#3d556b' },
    { label: 'A 启超楼', x: 960, y: GROUND_Y, w: 520, h: 520, color: '#181f2a', glow: '#354760' },
    { label: 'B 元任楼', x: 1580, y: GROUND_Y, w: 540, h: 580, color: '#181f2a', glow: '#354760' },
    { label: 'C 寅恪楼', x: 1480, y: GROUND_Y - 420, w: 560, h: 420, color: '#151b25', glow: '#2e3d55' },
    { label: 'F 水木艺术中心', x: 2240, y: GROUND_Y - 40, w: 260, h: 220, color: '#1a2230', glow: '#3d4d6b' },
    { label: 'D 国维楼', x: 2600, y: GROUND_Y, w: 520, h: 540, color: '#181f2a', glow: '#354760' },
    { label: 'E 马约翰体育中心', x: 3240, y: GROUND_Y - 100, w: 700, h: 420, color: '#1a2030', glow: '#3d5273' }
  ];

  // 地面 / 平台 / 屋顶（可站立）
  const platforms = [
    // 左端入口区
    { x: 0, y: GROUND_Y, w: 900, h: 350 },
    // A 与 B 之间空地上略低的平台（连接/通道）
    { x: 900, y: GROUND_Y, w: 600, h: 220 },
    { x: 1500, y: GROUND_Y, w: 1000, h: 220 },
    // D 前方到 E
    { x: 2500, y: GROUND_Y, w: 900, h: 220 },
    // E 右侧下降连接运动场
    { x: 3400, y: GROUND_Y, w: 400, h: 220 },
    // 运动场区域（略抬高）
    { x: 3800, y: GROUND_Y - 40, w: 1600, h: 240 },
    // 右边界
    { x: 5400, y: GROUND_Y, w: 200, h: 350 },

    // A 屋顶平台
    { x: 980, y: GROUND_Y - 480, w: 460, h: 40 },
    // B 屋顶平台
    { x: 1620, y: GROUND_Y - 540, w: 480, h: 40 },
    // D 屋顶平台
    { x: 2640, y: GROUND_Y - 500, w: 460, h: 40 },
    // E 顶部平台（体育馆穹顶）
    { x: 3320, y: GROUND_Y - 480, w: 540, h: 40 },
    // 运动场看台小平台
    { x: 3900, y: GROUND_Y - 220, w: 200, h: 30 },
    { x: 4200, y: GROUND_Y - 320, w: 200, h: 30 },
    { x: 4500, y: GROUND_Y - 240, w: 200, h: 30 },
    { x: 4800, y: GROUND_Y - 360, w: 180, h: 30 },
    // 空中平台（增加探索感）
    { x: 1150, y: GROUND_Y - 720, w: 180, h: 30 },
    { x: 1900, y: GROUND_Y - 780, w: 220, h: 30 },
    { x: 2850, y: GROUND_Y - 720, w: 200, h: 30 },
    { x: 3550, y: GROUND_Y - 680, w: 240, h: 30 }
  ];

  // 墙体（用于蹬墙跳/墙滑）
  const walls = [
    { x: 0, y: 0, w: 60, h: WORLD_HEIGHT },            // 左边界墙
    { x: 5540, y: 0, w: 60, h: WORLD_HEIGHT },         // 右边界墙
    ...buildings.map(b => ({ x: b.x, y: b.y - b.h, w: 40, h: b.h })),        // 左墙
    ...buildings.map(b => ({ x: b.x + b.w - 40, y: b.y - b.h, w: 40, h: b.h })) // 右墙
  ];

  // 大门：校门关闭，不能出去，在画面左侧
  const gates = [
    { x: 40, y: GROUND_Y - 240, w: 20, h: 240, label: '校门 Gate 4' }
  ];

  // 所有实体碰撞盒（平台 + 墙 + 建筑主体），用于移动碰撞
  const solids = [];
  platforms.forEach(p => solids.push({ x: p.x, y: p.y, w: p.w, h: p.h }));
  buildings.forEach(b => solids.push({ x: b.x, y: b.y - b.h, w: b.w, h: b.h }));

  // ---------------------------------------------------------------------------
  // 实体：植物 / 鸟类
  // ---------------------------------------------------------------------------
  const PLANT_NAMES = window.PLANTS || [];
  const BIRD_NAMES = window.BIRDS || [];

  // 为植物分配合适的位置（地面/平台/建筑旁）
  const plantSpots = [
    { x: 120, y: GROUND_Y - 30 },     // H 旁
    { x: 430, y: GROUND_Y - 30 },
    { x: 720, y: GROUND_Y - 30 },     // G 旁
    { x: 980, y: GROUND_Y - 510 },    // A 屋顶
    { x: 1080, y: GROUND_Y - 30 },    // A 墙根
    { x: 1240, y: GROUND_Y - 750 },   // 空中平台
    { x: 1420, y: GROUND_Y - 30 },
    { x: 1640, y: GROUND_Y - 570 },   // B 屋顶
    { x: 1760, y: GROUND_Y - 30 },
    { x: 1880, y: GROUND_Y - 810 },   // 空中平台
    { x: 2020, y: GROUND_Y - 30 },
    { x: 2290, y: GROUND_Y - 260 },   // F 屋顶
    { x: 2380, y: GROUND_Y - 30 },
    { x: 2680, y: GROUND_Y - 530 },   // D 屋顶
    { x: 2800, y: GROUND_Y - 30 },
    { x: 2920, y: GROUND_Y - 720 },   // 空中平台
    { x: 3040, y: GROUND_Y - 30 },
    { x: 3380, y: GROUND_Y - 510 },   // E 屋顶
    { x: 3520, y: GROUND_Y - 30 },
    { x: 3620, y: GROUND_Y - 700 },   // 空中平台
    { x: 3750, y: GROUND_Y - 70 },    // 运动场
    { x: 3950, y: GROUND_Y - 250 },   // 看台
    { x: 4080, y: GROUND_Y - 70 },
    { x: 4250, y: GROUND_Y - 350 },   // 看台
    { x: 4420, y: GROUND_Y - 70 },
    { x: 4600, y: GROUND_Y - 270 },   // 看台
    { x: 4750, y: GROUND_Y - 70 },
    { x: 4880, y: GROUND_Y - 390 },   // 看台最高
    { x: 5040, y: GROUND_Y - 70 },
    { x: 5220, y: GROUND_Y - 70 },
    { x: 5400, y: GROUND_Y - 30 },
    { x: 1100, y: GROUND_Y - 210 },   // 随机建筑前平台
    { x: 1550, y: GROUND_Y - 570 },
    { x: 2100, y: GROUND_Y - 30 },
    { x: 3150, y: GROUND_Y - 130 },
    { x: 4980, y: GROUND_Y - 70 }
  ];

  // 若植物数量与位置不匹配，循环使用位置；但应合理
  const plants = PLANT_NAMES.map((data, i) => {
    const spot = plantSpots[i % plantSpots.length];
    return {
      type: 'plant',
      data,
      x: spot.x + (Math.random() * 40 - 20),
      y: spot.y,
      width: 36,
      height: 70,
      halo: false,
      discovered: false,
      bob: Math.random() * Math.PI * 2
    };
  });

  // 鸟类初始位置（地面平台附近）
  const birdSpots = [
    { x: 250, y: GROUND_Y - 20 },
    { x: 1150, y: GROUND_Y - 20 },
    { x: 1800, y: GROUND_Y - 20 },
    { x: 2400, y: GROUND_Y - 20 },
    { x: 3200, y: GROUND_Y - 20 },
    { x: 4100, y: GROUND_Y - 60 },
    { x: 4700, y: GROUND_Y - 60 },
    { x: 5100, y: GROUND_Y - 60 }
  ];

  const birds = BIRD_NAMES.map((data, i) => {
    const spot = birdSpots[i % birdSpots.length];
    return {
      type: 'bird',
      data,
      x: spot.x,
      y: spot.y,
      groundY: spot.y,
      width: 42,
      height: 36,
      halo: false,
      discovered: false,
      state: 'ground', // ground | takeoff | sky | landing
      timer: Math.random() * 200,
      skyX: spot.x + (Math.random() * 400 - 200),
      skyY: spot.y - 260 - Math.random() * 180,
      facing: Math.random() < 0.5 ? -1 : 1,
      wing: 0
    };
  });

  const entities = [...plants, ...birds];

  // ---------------------------------------------------------------------------
  // 玩家
  // ---------------------------------------------------------------------------
  const player = {
    x: 260,
    y: GROUND_Y - 120,
    w: 34,
    h: 48,
    vx: 0,
    vy: 0,
    onGround: false,
    canDoubleJump: false,
    wallSliding: false,
    wallDir: 0,
    facing: 1,
    trail: []
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
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      if (!keys.jump) keys.jumpPressed = true;
      keys.jump = true;
    }
  });

  window.addEventListener('keyup', e => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') keys.jump = false;
  });

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.worldX = mouse.x + camera.x;
    mouse.worldY = mouse.y + camera.y;
  });

  canvas.addEventListener('mousedown', e => {
    mouse.clicked = true;
  });

  // ---------------------------------------------------------------------------
  // 工具函数
  // ---------------------------------------------------------------------------
  function rectIntersect(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  // 获取实体中心点
  function entityCenter(e) {
    return { x: e.x, y: e.y - e.height / 2 };
  }

  // 检测鼠标是否悬停在实体光晕上
  function mouseHitsEntity(e) {
    const c = entityCenter(e);
    const dx = mouse.worldX - c.x;
    const dy = mouse.worldY - c.y;
    return Math.sqrt(dx * dx + dy * dy) < 70;
  }

  // ---------------------------------------------------------------------------
  // 物理：碰撞
  // ---------------------------------------------------------------------------
  function movePlayer() {
    // 水平移动
    if (keys.left) { player.vx -= PHYS.moveAcc; player.facing = -1; }
    if (keys.right) { player.vx += PHYS.moveAcc; player.facing = 1; }

    const f = player.onGround ? PHYS.friction : PHYS.airFriction;
    player.vx *= f;
    player.vx = clamp(player.vx, -PHYS.maxRun, PHYS.maxRun);

    // X 轴移动 + 墙体碰撞
    player.x += player.vx;
    for (const s of solids) {
      if (rectIntersect(player, s)) {
        if (player.vx > 0) {
          player.x = s.x - player.w;
          player.wallDir = -1;
        } else if (player.vx < 0) {
          player.x = s.x + s.w;
          player.wallDir = 1;
        }
        player.vx = 0;
      }
    }

    // 边界 clamp
    player.x = clamp(player.x, 0, WORLD_WIDTH - player.w);

    // 检测墙滑（必须贴着墙且下落，同时按下方向）
    const wasWallSlide = player.wallSliding;
    player.wallSliding = false;
    if (!player.onGround && player.vy > 0) {
      // 检查是否有一侧贴着墙
      const probeLeft = { x: player.x - 2, y: player.y, w: 2, h: player.h };
      const probeRight = { x: player.x + player.w, y: player.y, w: 2, h: player.h };
      let touchingWall = false;
      let wallSide = 0;
      for (const s of solids) {
        if (rectIntersect(probeLeft, s)) { touchingWall = true; wallSide = -1; }
        if (rectIntersect(probeRight, s)) { touchingWall = true; wallSide = 1; }
      }
      if (touchingWall) {
        player.wallSliding = true;
        player.wallDir = wallSide;
      }
    }

    if (player.wallSliding) {
      player.vy = Math.min(player.vy, PHYS.wallSlideSpeed);
      player.canDoubleJump = true;
    }

    // 跳跃 / 二段跳 / 蹬墙跳
    if (keys.jumpPressed) {
      if (player.onGround) {
        player.vy = PHYS.jumpVel;
        player.onGround = false;
        player.canDoubleJump = true;
        spawnDust(player.x + player.w / 2, player.y + player.h);
      } else if (player.wallSliding) {
        player.vy = PHYS.wallJumpV;
        player.vx = PHYS.wallJumpH * -player.wallDir;
        player.facing = -player.wallDir;
        player.wallSliding = false;
        player.canDoubleJump = true;
        spawnDust(player.x + (player.wallDir === 1 ? player.w : 0), player.y + player.h / 2);
      } else if (player.canDoubleJump) {
        player.vy = PHYS.jumpVel * 0.92;
        player.canDoubleJump = false;
        spawnDust(player.x + player.w / 2, player.y + player.h);
      }
      keys.jumpPressed = false;
    }

    // Y 轴移动 + 平台碰撞
    player.vy += PHYS.gravity;
    if (player.wallSliding && player.vy > PHYS.wallSlideSpeed) {
      player.vy = PHYS.wallSlideSpeed;
    }

    player.onGround = false;
    player.y += player.vy;

    for (const s of solids) {
      if (rectIntersect(player, s)) {
        if (player.vy > 0) {
          player.y = s.y - player.h;
          player.onGround = true;
          player.canDoubleJump = true;
          player.wallSliding = false;
        } else if (player.vy < 0) {
          player.y = s.y + s.h;
        }
        player.vy = 0;
      }
    }

    // 防止掉出世界底部
    if (player.y > WORLD_HEIGHT) {
      player.x = 260;
      player.y = GROUND_Y - 120;
      player.vx = 0;
      player.vy = 0;
    }

    // 拖尾
    player.trail.push({ x: player.x + player.w / 2, y: player.y + player.h / 2, age: 0 });
    player.trail.forEach(p => p.age++);
    player.trail = player.trail.filter(p => p.age < 12);
  }

  // ---------------------------------------------------------------------------
  // 粒子（尘埃/萤火）
  // ---------------------------------------------------------------------------
  let particles = [];
  function spawnDust(x, y) {
    for (let i = 0; i < 6; i++) {
      particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 30 + Math.random() * 20,
        color: '#5fe8c8',
        size: 1 + Math.random() * 2
      });
    }
  }

  function updateParticles() {
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
    });
    particles = particles.filter(p => p.life > 0);
  }

  // ---------------------------------------------------------------------------
  // 鸟类 AI
  // ---------------------------------------------------------------------------
  function updateBirds() {
    birds.forEach(b => {
      b.wing += 0.25;
      b.timer++;

      switch (b.state) {
        case 'ground':
          // 在地面上小范围走动
          b.x += Math.sin(gameTime * 0.02 + b.timer * 0.01) * 0.5;
          b.y = b.groundY;
          if (b.timer > 300 + Math.random() * 200) {
            b.state = 'takeoff';
            b.timer = 0;
            b.skyX = clamp(b.x + (Math.random() - 0.5) * 600, 120, WORLD_WIDTH - 120);
            b.skyY = b.groundY - 250 - Math.random() * 200;
          }
          break;
        case 'takeoff':
        case 'sky':
        case 'landing': {
          const targetX = b.state === 'landing' ? (typeof b.homeX === 'number' ? b.homeX : b.x) : b.skyX;
          const targetY = b.state === 'landing' ? b.groundY : b.skyY;
          const dx = targetX - b.x;
          const dy = targetY - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const speed = b.state === 'takeoff' ? 3 : (b.state === 'landing' ? 3 : 2.5);
          b.x += (dx / dist) * speed;
          b.y += (dy / dist) * speed;
          b.facing = dx < 0 ? -1 : 1;

          if (b.state === 'takeoff' && dist < 40) {
            b.state = 'sky';
            b.timer = 0;
          } else if (b.state === 'sky' && b.timer > 400 + Math.random() * 300) {
            b.state = 'landing';
            b.homeX = clamp(b.x + (Math.random() - 0.5) * 300, 120, WORLD_WIDTH - 120);
            b.timer = 0;
          } else if (b.state === 'landing' && Math.abs(dy) < 6) {
            b.state = 'ground';
            b.timer = 0;
            b.y = b.groundY;
          }
          break;
        }
      }

      // 靠近人物时看向玩家
      const pc = entityCenter(playerAsEntity());
      const bc = entityCenter(b);
      const d = Math.hypot(pc.x - bc.x, pc.y - bc.y);
      b.haloRange = d < 220;
      if (b.haloRange) {
        b.facing = pc.x < bc.x ? -1 : 1;
      }
    });
  }

  function playerAsEntity() {
    return { x: player.x + player.w / 2, y: player.y + player.h, width: player.w, height: player.h };
  }

  // ---------------------------------------------------------------------------
  // 实体交互
  // ---------------------------------------------------------------------------
  function updateEntities() {
    let hovered = null;
    entities.forEach(e => {
      const c = entityCenter(e);
      const pc = entityCenter(playerAsEntity());
      const dist = Math.hypot(c.x - pc.x, c.y - pc.y);
      e.halo = dist < 180;
      if (e.halo && (!hovered || dist < hovered.dist)) {
        hovered = { e, dist };
      }
    });

    // 鼠标提示与光标
    const mouseHover = entities.find(e => e.halo && mouseHitsEntity(e));
    canvas.style.cursor = mouseHover ? 'pointer' : 'crosshair';
    if (mouseHover) {
      hoverTip.classList.remove('hidden');
      hoverTip.style.left = mouse.x + 'px';
      hoverTip.style.top = mouse.y + 'px';
      hoverTip.textContent = '点击查看：' + mouseHover.data.nameCN;
    } else {
      hoverTip.classList.add('hidden');
    }

    // 鼠标点击
    if (mouse.clicked) {
      mouse.clicked = false;
      const clicked = entities.find(e => e.halo && mouseHitsEntity(e));
      if (clicked) {
        openInfo(clicked);
        clicked.discovered = true;
      }
    }

    // 统计
    plantCountEl.textContent = `已发现植物：${plants.filter(p => p.discovered).length} / ${plants.length}`;
    birdCountEl.textContent = `已发现鸟类：${birds.filter(b => b.discovered).length} / ${birds.length}`;
  }

  // ---------------------------------------------------------------------------
  // 信息卡
  // ---------------------------------------------------------------------------
  function openInfo(entity) {
    const d = entity.data;
    let html = '';

    if (entity.type === 'plant') {
      html = `
        <h2>${d.nameCN}</h2>
        <div class="subtitle">${d.nameEN}</div>
        <div class="aliases"><strong>别名：</strong>${d.aliases.join('、')}</div>
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
        <div class="info-section">
          <h3>独特价值与用途</h3>
          <p>${d.uniqueValue}</p>
        </div>
        <div class="info-section">
          <h3>花语与文化寓意</h3>
          <p>${d.culture}</p>
        </div>
      `;
    } else {
      html = `
        <h2>${d.nameCN}</h2>
        <div class="subtitle">${d.nameEN}</div>
        <div class="aliases"><strong>别名：</strong>${d.aliases.join('、')}</div>
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
        <div class="info-section">
          <h3>独特价值与用途</h3>
          <p>${d.uniqueValue}</p>
        </div>
        <div class="info-section">
          <h3>文化寓意</h3>
          <p>${d.culture}</p>
        </div>
      `;
    }

    infoContent.innerHTML = html;
    infoPanel.classList.remove('hidden');
  }

  closePanel.addEventListener('click', () => infoPanel.classList.add('hidden'));
  infoPanel.addEventListener('click', e => {
    if (e.target === infoPanel) infoPanel.classList.add('hidden');
  });

  // ---------------------------------------------------------------------------
  // 相机
  // ---------------------------------------------------------------------------
  function updateCamera() {
    const targetX = player.x + player.w / 2 - VIEW_W() / 2;
    const targetY = player.y + player.h / 2 - VIEW_H() * 0.55;
    camera.x += (targetX - camera.x) * 0.08;
    camera.y += (targetY - camera.y) * 0.06;
    camera.x = clamp(camera.x, 0, WORLD_WIDTH - VIEW_W());
    camera.y = clamp(camera.y, 0, WORLD_HEIGHT - VIEW_H());
  }

  // ---------------------------------------------------------------------------
  // 渲染
  // ---------------------------------------------------------------------------
  function drawBackground() {
    // 黑色天空 + 极微弱的中心光晕（Ori 感）
    const grd = ctx.createRadialGradient(
      VIEW_W() / 2, VIEW_H() / 2, 100,
      VIEW_W() / 2, VIEW_H() / 2, VIEW_H() * 1.3
    );
    grd.addColorStop(0, '#080b12');
    grd.addColorStop(1, '#000000');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, VIEW_W(), VIEW_H());

    // 远景星星 / 萤火（缓慢视差）
    ctx.save();
    ctx.globalAlpha = 0.6;
    for (let i = 0; i < 80; i++) {
      const baseX = (i * 137) % WORLD_WIDTH;
      const parallaxX = baseX - camera.x * 0.03;
      const sx = (parallaxX % WORLD_WIDTH + WORLD_WIDTH) % WORLD_WIDTH;
      const sy = ((i * 73) % (VIEW_H() * 0.75));
      const twinkle = 0.4 + 0.6 * Math.sin(gameTime * 0.04 + i);
      ctx.fillStyle = `rgba(149, 230, 255, ${twinkle * 0.55})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 1 + (i % 2), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 远景建筑剪影（视差）
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#0d1320';
    const farX = -camera.x * 0.15;
    for (let i = 0; i < 12; i++) {
      const bx = farX + i * 500;
      const bw = 220 + (i % 3) * 60;
      const bh = 200 + (i * 53) % 300;
      ctx.fillRect(bx % WORLD_WIDTH + (bx < 0 ? WORLD_WIDTH : 0), GROUND_Y - 120 - bh, bw, bh + 120);
    }
    ctx.restore();
  }

  function drawBuildings() {
    ctx.save();
    ctx.shadowBlur = 0;
    for (const b of buildings) {
      const bx = b.x - camera.x;
      const by = b.y - b.h - camera.y;

      // 建筑主体
      ctx.fillStyle = b.color;
      ctx.fillRect(bx, by, b.w, b.h);

      // 柔和边缘发光
      ctx.strokeStyle = b.glow;
      ctx.lineWidth = 2;
      ctx.shadowColor = b.glow;
      ctx.shadowBlur = 18;
      ctx.strokeRect(bx + 2, by + 2, b.w - 4, b.h - 4);
      ctx.shadowBlur = 0;

      // 窗户微光
      ctx.fillStyle = 'rgba(180, 210, 255, 0.12)';
      const rows = Math.floor(b.h / 90);
      const cols = Math.floor(b.w / 70);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if ((r + c + Math.floor(b.x / 100)) % 3 === 0) continue;
          ctx.fillRect(bx + 24 + c * 58, by + 30 + r * 80, 28, 42);
        }
      }

      // 标签
      ctx.fillStyle = 'rgba(150, 200, 255, 0.35)';
      ctx.font = '13px "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(b.label, bx + b.w / 2, by - 12);
    }
    ctx.restore();
  }

  function drawPlatforms() {
    ctx.save();
    for (const p of platforms) {
      const px = p.x - camera.x;
      const py = p.y - camera.y;
      // 平台本体
      ctx.fillStyle = '#0c1018';
      ctx.fillRect(px, py, p.w, p.h);
      // 顶部发光边
      ctx.strokeStyle = 'rgba(95, 232, 200, 0.28)';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(95, 232, 200, 0.35)';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + p.w, py);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    ctx.restore();
  }

  function drawGates() {
    ctx.save();
    for (const g of gates) {
      const gx = g.x - camera.x;
      const gy = g.y - camera.y;
      // 关闭的大门
      ctx.fillStyle = '#11151d';
      ctx.fillRect(gx, gy, g.w, g.h);
      ctx.strokeStyle = 'rgba(255, 226, 122, 0.35)';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(255, 226, 122, 0.3)';
      ctx.shadowBlur = 10;
      ctx.strokeRect(gx, gy, g.w, g.h);
      ctx.shadowBlur = 0;

      ctx.fillStyle = 'rgba(255, 226, 122, 0.5)';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(g.label, gx + g.w / 2, gy - 10);
    }
    ctx.restore();
  }

  function drawParticles() {
    ctx.save();
    for (const p of particles) {
      const px = p.x - camera.x;
      const py = p.y - camera.y;
      const alpha = p.life / 50;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawPlayer() {
    const px = player.x - camera.x;
    const py = player.y - camera.y;

    // 拖尾
    ctx.save();
    for (let i = 0; i < player.trail.length; i++) {
      const t = player.trail[i];
      const alpha = (1 - i / player.trail.length) * 0.4;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#5fe8c8';
      ctx.beginPath();
      ctx.arc(t.x - camera.x, t.y - camera.y, 3 + i * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 主体：单色发光生物（无性别/种族/年龄特征）
    ctx.save();
    ctx.shadowColor = '#5fe8c8';
    ctx.shadowBlur = 22;
    ctx.fillStyle = '#8af0ff';
    ctx.beginPath();
    const bodyX = px + player.w / 2;
    const bodyY = py + player.h / 2;
    ctx.arc(bodyX, bodyY, 16, 0, Math.PI * 2);
    ctx.fill();

    // 小耳朵/触角，增加生物感
    ctx.strokeStyle = '#8af0ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bodyX - 6, bodyY - 10);
    ctx.lineTo(bodyX - 10, bodyY - 22);
    ctx.moveTo(bodyX + 6, bodyY - 10);
    ctx.lineTo(bodyX + 10, bodyY - 22);
    ctx.stroke();

    // 眼部微光
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(bodyX + player.facing * 5, bodyY - 2, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawPlants() {
    for (const p of plants) {
      const cx = p.x - camera.x;
      const cy = p.y - camera.y - 35;

      if (p.halo) {
        drawHalo(p.x, p.y - 35, 70, '#ffe27a');
      }

      ctx.save();
      const bob = Math.sin(gameTime * 0.05 + p.bob) * 2;

      // 茎
      ctx.strokeStyle = 'rgba(150, 220, 170, 0.7)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx, cy + 35);
      ctx.lineTo(cx + bob * 0.3, cy - 10);
      ctx.stroke();

      // 叶片
      ctx.fillStyle = 'rgba(120, 210, 150, 0.6)';
      ctx.beginPath();
      ctx.ellipse(cx - 10, cy + 10, 8, 4, -0.5, 0, Math.PI * 2);
      ctx.ellipse(cx + 10, cy + 16, 8, 4, 0.5, 0, Math.PI * 2);
      ctx.fill();

      // 花朵发光
      ctx.shadowColor = p.data.color;
      ctx.shadowBlur = 16;
      ctx.fillStyle = p.data.color;
      ctx.beginPath();
      ctx.arc(cx + bob * 0.5, cy - 14, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawBirds() {
    for (const b of birds) {
      const cx = b.x - camera.x;
      const cy = b.y - camera.y - 10;

      if (b.halo) {
        drawHalo(b.x, b.y - 10, 65, '#ffe27a');
      }

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(b.facing, 1);

      ctx.shadowColor = b.data.color;
      ctx.shadowBlur = 14;
      ctx.fillStyle = b.data.color;

      // 身体
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      // 头
      ctx.beginPath();
      ctx.arc(10, -6, 8, 0, Math.PI * 2);
      ctx.fill();

      // 眼睛（看向玩家）
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(12, -7, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // 翅膀拍打
      const wingY = Math.sin(b.wing) * (b.state === 'ground' ? 3 : 10);
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-4, -2);
      ctx.quadraticCurveTo(-14, -6 - wingY, -18, 4 + wingY);
      ctx.stroke();

      ctx.restore();
    }
  }

  function drawHalo(worldX, worldY, radius, color) {
    const cx = worldX - camera.x;
    const cy = worldY - camera.y;
    const pulse = 0.8 + 0.2 * Math.sin(gameTime * 0.08);
    ctx.save();
    ctx.globalAlpha = 0.55 * pulse;
    const grd = ctx.createRadialGradient(cx, cy, radius * 0.3, cx, cy, radius);
    grd.addColorStop(0, color);
    grd.addColorStop(1, 'rgba(255, 226, 122, 0)');
    ctx.fillStyle = grd;
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
