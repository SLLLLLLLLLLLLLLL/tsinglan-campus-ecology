# 清澜山校园花鸟漫游 | Tsinglan Campus Ecology

一个受《奥日（Ori）》启发的 2D 横版平台跳跃“浏览游戏”。玩家操控一只无性别/种族/年龄特征的发光小生物，在黑夜版的清澜山校园中自由跑动、跳跃、二段跳和蹬墙跳，靠近校园植物与鸟类时它们会泛起淡黄色光晕，点击即可查看详细的生态资料。

---

## 在线体验

> 部署到 GitHub Pages 后即可访问：
> `https://你的GitHub用户名.github.io/tsinglan-campus-ecology/`

---

## 操作方式

| 按键 | 动作 |
|------|------|
| `A` / `←` | 向左移动 |
| `D` / `→` | 向右移动 |
| `SPACE` / `W` / `↑` | 跳跃；在空中再次按下触发**二段跳** |
| 贴墙时按 `SPACE` | **蹬墙跳**（同时获得二段跳能力） |
| 鼠标移动到淡黄色光晕上 | 显示“点击查看：xxx” |
| 鼠标点击光晕 | 弹出植物 / 鸟类信息卡 |

---

## 数据来源

- **植物**：根据学校提供的 37 种真实植物清单整理，字段包含中文（英文）名、别名、科属、原产地、整体形态、叶片与花朵特征、生长习性（光照 / 水分 / 温度）、独特价值与用途、花语与文化寓意。
- **鸟类**：根据微信文章《清澜山校园里的鸟类精灵，您认识几种？》总结，共收录 8 种校园常见鸟类：白鹡鸰、白头鹎、红耳鹎、白喉红臀鹎、乌鸫、鹊鸲、暗绿绣眼鸟、叉尾太阳鸟。
- **校园场景**：基于你更喜欢的第一张 3D 等距校园地图进行风格化 2D 重构，包含明斋（H）、和园（G）、启超楼（A）、元任楼（B）、寅恪楼（C）、水木艺术中心（F）、国维楼（D）、马约翰体育中心（E）以及运动场、校门等标志性区域。

---

## 项目结构

```
.
├── index.html      # 页面入口
├── style.css       # Ori 风格 UI、信息卡样式
├── game.js         # 2D 平台跳跃引擎、校园场景、实体交互
├── data.js         # 植物 + 鸟类数据（可直接编辑替换）
└── README.md       # 本说明
```

---

## 本地预览

```bash
cd /workspace/tsinglan-campus-ecology
python3.11 -m http.server 8080
# 然后浏览器打开 http://localhost:8080
```

---

## 部署到 GitHub Pages

1. 在 GitHub 新建一个空仓库，命名为 `tsinglan-campus-ecology`（或你喜欢的名字）。
2. 在本地项目目录执行：

```bash
cd /workspace/tsinglan-campus-ecology
git init
git add .
git commit -m "Initial: Tsinglan campus ecology game site"
git branch -M main
git remote add origin https://github.com/你的GitHub用户名/tsinglan-campus-ecology.git
git push -u origin main
```

3. 打开仓库页面 → `Settings` → `Pages` → `Build and deployment`。
4. `Source` 选择 `Deploy from a branch`，`Branch` 选择 `main`，文件夹选择 `/(root)`，点击 Save。
5. 等待 1-3 分钟，即可通过 `https://你的GitHub用户名.github.io/tsinglan-campus-ecology/` 访问。

---

## 如何修改植物 / 鸟类数据

直接编辑 `data.js` 中的 `PLANTS` 或 `BIRDS` 数组即可，结构保持现有字段一致：

```js
{
  id: "唯一标识",
  type: "plant" | "bird",
  nameCN: "中文名",
  nameEN: "英文名",
  aliases: ["别名1", "别名2"],
  family: "科 / 属",
  origin: "原产地或分布",
  appearance: { ... },
  habits: { ... },
  uniqueValue: "独特价值与用途",
  culture: "花语或文化寓意",
  color: "#十六进制颜色" // 决定游戏内发光颜色
}
```

---

## 设计说明

- **风格**：选择 Ori（奥日）风格，因为“天空保持黑色 + 建筑微微发光 + 淡黄色光晕”的需求与 Ori 的生物发光暗色美学高度契合。
- **角色**：一个单色发光的柔和小生物，无性别、种族、年龄特征，满足操作流畅、可二段跳与蹬墙跳的需求。
- **天空**：始终保持深色（近黑），无季节变化。
- **边界**：校门与围墙均关闭，玩家无法离开校园。
- **建筑**：以低饱和剪影 + 微光描边呈现，仅作为可上墙/站立的平台，不可进入。

---

## 已知说明

- 植物清单中实际列出了 37 种（ school list 中“38 种”可能为口误 / 笔误）。
- 鸟类资料根据指定微信文章总结；如需补充更多鸟类，按同样结构加入 `data.js` 即可。

---

## 技术栈

- HTML5 Canvas
- 原生 JavaScript（无框架、无构建步骤）
- CSS 自定义属性
- 纯静态站点，无需后端，天然适配 GitHub Pages。
