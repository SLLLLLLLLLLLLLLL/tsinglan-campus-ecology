// Tsinglan School Campus Ecology - Flora & Fauna Data
// 植物名录：基于学校真实植物清单；鸟类：基于微信文章《清澜山校园里的鸟类精灵》
// 可按相同结构继续补充或替换数据

const PLANTS = [
  {
    id: "jackfruit",
    type: "plant",
    nameCN: "波罗蜜",
    nameEN: "Jackfruit",
    aliases: ["木菠萝", "树菠萝"],
    family: "桑科 / 波罗蜜属 (Artocarpus heterophyllus)",
    origin: "原产印度至马来半岛一带热带地区，现广植于华南。",
    appearance: {
      form: "常绿大型乔木，高可达 20 m 以上，树冠宽阔如伞。",
      leavesAndFlowers: "叶革质、椭圆形或倒卵形，长 15–25 cm，深绿有光泽；花雌雄同株，柔荑花序生于老干和主枝上；聚合果巨大，表面密生圆锥状软刺，果肉金黄香甜。"
    },
    habits: { light: "喜充足阳光，幼树稍耐阴。", water: "喜湿润但忌积水，成年树较耐旱。", temperature: "热带至南亚热带树种，畏寒，0 °C 以下易受冻害。" },
    uniqueValue: "华南著名热带果树，果肉可鲜食或制甜品，种子亦可煮食；树冠浓密，是优良的遮荫行道树。",
    culture: "在南方有“聚宝”“多子多福”的吉祥寓意，因其一果多籽。",
    color: "#f6c85c"
  },
  {
    id: "osmanthus",
    type: "plant",
    nameCN: "木犀",
    nameEN: "Sweet Osmanthus",
    aliases: ["桂花", "九里香"],
    family: "木犀科 / 木犀属 (Osmanthus fragrans)",
    origin: "原产中国西南部，栽培历史逾 2 000 年。",
    appearance: {
      form: "常绿灌木或小乔木，树形圆整，高 3–8 m。",
      leavesAndFlowers: "叶对生，革质，椭圆形，深绿而有光泽；花簇生于叶腋，金黄、淡黄或橙红，香气浓郁，花期 9–10 月。"
    },
    habits: { light: "喜半阴至全日照，不耐烈日暴晒。", water: "喜湿润、排水良好的土壤，忌涝。", temperature: "亚热带树种，较耐寒，但幼苗需保护。" },
    uniqueValue: "中国传统名花，花可制茶、糕点和香料；四季常青，秋季飘香，是校园与庭院的经典绿化树种。",
    culture: "花语为“崇高、美好、吉祥”；常与“蟾宫折桂”联系，象征学业有成、出类拔萃。",
    color: "#f4d03f"
  },
  {
    id: "ficus_virens",
    type: "plant",
    nameCN: "黄葛树",
    nameEN: "White Fig / Virens Fig",
    aliases: ["黄葛榕", "大叶榕"],
    family: "桑科 / 榕属 (Ficus virens)",
    origin: "原产中国华南、台湾及东南亚热带、亚热带地区。",
    appearance: {
      form: "落叶或半落叶大乔木，高可达 15 m，板根或气生根发达，冠幅广展。",
      leavesAndFlowers: "叶互生，椭圆状披针形，薄革质，新叶红色或黄绿；隐花果球形，成对腋生，成熟时紫红或黄色。"
    },
    habits: { light: "阳性树种，喜光照充足。", water: "耐湿也耐短期干旱，适应性强。", temperature: "热带至南亚热带树种，不耐严寒。" },
    uniqueValue: "华南常见行道树与遮荫树，气生根垂地后可增粗成干，形成“独木成林”景观。",
    culture: "在南方被视为坚韧与庇护的象征，常作为村口、校园的古树名木。",
    color: "#7ed957"
  },
  {
    id: "bischofia",
    type: "plant",
    nameCN: "秋枫",
    nameEN: "Javanese Bishopwood",
    aliases: ["秋风", "红桐"],
    family: "大戟科 / 秋枫属 (Bischofia javanica)",
    origin: "原产中国南部、东南亚及太平洋岛屿。",
    appearance: {
      form: "常绿或半常绿大乔木，高可达 20 m，树干通直，树冠伞形。",
      leavesAndFlowers: "三出复叶，小叶卵形至椭圆状卵形，革质，全缘或浅锯齿，老叶深绿；圆锥花序腋生，花小，绿色；果球形，熟时蓝黑色。"
    },
    habits: { light: "喜光，幼树耐半阴。", water: "喜湿润肥沃土壤，耐水湿。", temperature: "热带、南亚热带树种，畏寒。" },
    uniqueValue: "生长迅速，抗风、抗污染，是优良的行道树和校园绿化树；木材坚硬耐腐。",
    culture: "因“枫”字常被寄予秋意与乡愁，校园中象征生机与守护。",
    color: "#5e9c68"
  },
  {
    id: "lagerstroemia_speciosa",
    type: "plant",
    nameCN: "大花紫薇",
    nameEN: "Queen's Crape-myrtle / Pride of India",
    aliases: ["大叶紫薇", "洋紫薇"],
    family: "千屈菜科 / 紫薇属 (Lagerstroemia speciosa)",
    origin: "原产印度、东南亚及中国南部。",
    appearance: {
      form: "落叶大乔木，高可达 25 m，树皮灰白，干形挺拔。",
      leavesAndFlowers: "叶对生，椭圆状矩圆形，大而有光泽；大型顶生圆锥花序，花径约 5 cm，紫红或淡粉，夏季盛开，花期 5–7 月。"
    },
    habits: { light: "强阳性树种，光照越足开花越盛。", water: "喜湿润，也能耐短期干旱。", temperature: "热带、南亚热带树种，不耐严寒。" },
    uniqueValue: "花朵大而艳丽，是华南城市行道树和校园景观树的优良选择，盛花期满树紫霞。",
    culture: "花语为“沉迷的爱”“好运”；花色浓艳，象征热烈与活力。",
    color: "#a85cc4"
  },
  {
    id: "bodhi",
    type: "plant",
    nameCN: "菩提树",
    nameEN: "Sacred Fig / Bo Tree",
    aliases: ["印度菩提树", "思维树"],
    family: "桑科 / 榕属 (Ficus religiosa)",
    origin: "原产印度、尼泊尔、斯里兰卡等南亚热带地区。",
    appearance: {
      form: "常绿大乔木，高可达 15–25 m，树干灰色，树冠开展如伞。",
      leavesAndFlowers: "叶三角状卵形或心形，长 10–17 cm，先端长尾尖，全缘，薄革质；隐花果球形，成熟时紫红色。"
    },
    habits: { light: "喜光，幼树稍耐阴。", water: "喜湿润土壤，需良好排水。", temperature: "热带、南亚热带树种，对低温敏感。" },
    uniqueValue: "热带著名宗教与文化树种，叶片潇洒别致，常作寺庙、纪念性绿化树。",
    culture: "佛教圣树，象征觉悟、智慧与宁静；传说释迦牟尼在菩提树下悟道。",
    color: "#6ab04c"
  },
  {
    id: "ceiba_speciosa",
    type: "plant",
    nameCN: "美丽异木棉",
    nameEN: "Floss Silk Tree / Silk Floss Tree",
    aliases: ["美人树", "酒瓶木棉"],
    family: "锦葵科 / 吉贝属 (Ceiba speciosa)",
    origin: "原产南美洲巴西、阿根廷一带。",
    appearance: {
      form: "落叶乔木，高 10–18 m，主干下部膨大呈酒瓶状，幼树常有绿色刺。",
      leavesAndFlowers: "掌状复叶，小叶 5–7 枚，椭圆状披针形；秋季开花，花粉红或洋红，五瓣，先叶开放或叶尽花繁。"
    },
    habits: { light: "强阳性，光照不足开花减少。", water: "耐旱不耐涝，忌积水。", temperature: "热带、南亚热带树种，畏寒。" },
    uniqueValue: "盛花期满树粉红，极具观赏性，是华南秋冬明星树种；果絮可作填充料。",
    culture: "花语为“孤傲美人”“绚丽”，象征独立与耀眼。",
    color: "#ff69b4"
  },
  {
    id: "wax_apple",
    type: "plant",
    nameCN: "洋蒲桃",
    nameEN: "Wax Apple / Java Apple",
    aliases: ["莲雾", "水翁", "天桃"],
    family: "桃金娘科 / 蒲桃属 (Syzygium samarangense)",
    origin: "原产马来群岛及安达曼群岛，华南广泛栽培。",
    appearance: {
      form: "常绿小乔木或中乔木，高 5–12 m，树冠圆锥形或圆头形。",
      leavesAndFlowers: "叶对生，薄革质，椭圆形，深绿光亮；花白色，聚伞花序顶生；果钟形，肉质多汁，粉红或深红。"
    },
    habits: { light: "喜光，幼树需适当遮阴。", water: "喜湿润，开花结果期需充足水分。", temperature: "热带、南亚热带水果树种，不耐寒。" },
    uniqueValue: "著名热带水果，果汁清甜；树形优美、四季常绿，也作校园绿化树。",
    culture: "在台湾被称为“莲雾”，有“平安果”之意，象征幸福与圆满。",
    color: "#ff6b81"
  },
  {
    id: "terminalia_mantaly",
    type: "plant",
    nameCN: "小叶榄仁",
    nameEN: "Madagascar Almond",
    aliases: ["细叶榄仁", "非洲榄仁"],
    family: "使君子科 / 榄仁树属 (Terminalia mantaly)",
    origin: "原产马达加斯加。",
    appearance: {
      form: "落叶大乔木，高 10–20 m，主干通直，树冠层状水平展开，极具热带风情。",
      leavesAndFlowers: "叶小，倒卵形或披针形，簇生于枝端；穗状花序，花小，淡绿或白色；核果椭圆形。"
    },
    habits: { light: "喜光，幼树耐阴。", water: "耐旱、耐瘠薄，不耐积水。", temperature: "热带、南亚热带树种，畏寒。" },
    uniqueValue: "树形优美、层次分明，是华南校园与道路绿化的常见行道树。",
    culture: "因冠如伞盖，象征庇护与秩序，给人以整洁、开阔之感。",
    color: "#55efc4"
  },
  {
    id: "plum",
    type: "plant",
    nameCN: "梅",
    nameEN: "Chinese Plum / Japanese Apricot",
    aliases: ["春梅", "干枝梅"],
    family: "蔷薇科 / 杏属 (Prunus mume)",
    origin: "原产中国，栽培历史超过 3 000 年。",
    appearance: {
      form: "落叶小乔木或灌木，高 4–10 m，枝干虬曲苍劲。",
      leavesAndFlowers: "叶卵形或广卵形，边缘具细锯齿；花单生或 2 朵并生，先叶开放，白、粉或红色，芳香，花期 12 月至翌年 3 月。"
    },
    habits: { light: "喜光，稍耐阴。", water: "耐旱怕涝，忌土壤过湿。", temperature: "温带至亚热带树种，需一定低温完成休眠。" },
    uniqueValue: "中国十大名花之一，花可观赏、果实可制梅脯、梅酒；老桩盆景极具艺术价值。",
    culture: "花语为“高洁、坚强、忠贞”；与兰、竹、菊并称“四君子”，象征不畏严寒的品格。",
    color: "#fab1a0"
  },
  {
    id: "bayberry",
    type: "plant",
    nameCN: "杨梅",
    nameEN: "Chinese Bayberry / Waxberry",
    aliases: ["珠红", "树梅"],
    family: "杨梅科 / 杨梅属 (Myrica rubra)",
    origin: "原产中国长江流域以南，栽培历史悠久。",
    appearance: {
      form: "常绿乔木，高 5–15 m，树冠圆球形。",
      leavesAndFlowers: "叶革质，倒披针形或长椭圆状倒卵形，深绿；花单性，雌雄异株，葇荑花序；核果球形，熟时紫红或深红，味酸甜多汁。"
    },
    habits: { light: "较耐阴，但也喜光。", water: "喜湿润，忌积水。", temperature: "亚热带常绿果树，较耐寒。" },
    uniqueValue: "江南名果，果可鲜食、制罐头、酿酒；树皮含单宁，可提取栲胶。",
    culture: "因“杨”与“扬”谐音，民间有“扬眉吐气”之吉祥说法。",
    color: "#d63031"
  },
  {
    id: "wampee",
    type: "plant",
    nameCN: "黄皮",
    nameEN: "Wampee",
    aliases: ["黄皮果", "黄弹子"],
    family: "芸香科 / 黄皮属 (Clausena lansium)",
    origin: "原产中国南部，华南地区广泛栽培。",
    appearance: {
      form: "常绿小乔木，高 3–8 m，树冠开张。",
      leavesAndFlowers: "叶为奇数羽状复叶，小叶卵形或披针形，叶背有油腺点；圆锥花序顶生，花白色；果球形或椭圆形，熟时淡黄或黄褐，皮肉酸甜。"
    },
    habits: { light: "喜光，稍耐阴。", water: "喜湿润但忌积水，稍耐旱。", temperature: "亚热带、热带果树，不耐严寒。" },
    uniqueValue: "华南传统水果，果肉可食，果皮可制蜜饯或入药，有消食化痰之效。",
    culture: "因“黄皮”谐音，广东有“黄皮树鹩哥——唔熟唔食”的俗语，寓意亲疏有度。",
    color: "#ffeaa7"
  },
  {
    id: "homalium",
    type: "plant",
    nameCN: "斯里兰卡天料木",
    nameEN: "Ceylon Homalium",
    aliases: ["天料木"],
    family: "天料木科 / 天料木属 (Homalium ceylanicum)",
    origin: "原产斯里兰卡及东南亚热带地区。",
    appearance: {
      form: "常绿小乔木或灌木，高 3–10 m，枝条纤细。",
      leavesAndFlowers: "叶互生，纸质或薄革质，椭圆形至长圆形，边缘有锯齿；总状花序腋生，花小，白色或淡绿色，夏秋开放。"
    },
    habits: { light: "喜半阴至散射光。", water: "喜湿润、排水良好的环境。", temperature: "热带、南亚热带树种，畏寒。" },
    uniqueValue: "热带观赏树种，花虽不艳但素雅清新，常用于热带植物园与校园景观。",
    culture: "树形清秀，花姿素净，象征谦逊与清雅。",
    color: "#dfe6e9"
  },
  {
    id: "senna_surattensis",
    type: "plant",
    nameCN: "黄槐决明",
    nameEN: "Glaucous Cassia / Bushy Cassia",
    aliases: ["黄槐", "粉叶决明"],
    family: "豆科 / 决明属 (Senna surattensis)",
    origin: "原产印度、斯里兰卡及东南亚，热带地区广植。",
    appearance: {
      form: "常绿灌木或小乔木，高 4–6 m，树冠开展。",
      leavesAndFlowers: "叶为羽状复叶，小叶倒卵形或椭圆形，叶面蓝绿；花亮黄色，伞房状总状花序，几乎全年开花。"
    },
    habits: { light: "强阳性，喜充足光照。", water: "耐旱，耐短期水湿。", temperature: "热带、南亚热带树种，畏寒。" },
    uniqueValue: "花色金黄亮丽，花期极长，是华南优良的观花灌木和行道树。",
    culture: "花语为“金色希望”“温暖”，象征活力与阳光。",
    color: "#f1c40f"
  },
  {
    id: "pomelo",
    type: "plant",
    nameCN: "柚",
    nameEN: "Pomelo / Pummelo",
    aliases: ["柚子", "文旦"],
    family: "芸香科 / 柑橘属 (Citrus maxima)",
    origin: "原产东南亚热带地区，中国栽培已有 2 000 多年。",
    appearance: {
      form: "常绿小乔木，高 5–10 m，树冠圆头形。",
      leavesAndFlowers: "单身复叶，叶片大而厚，翼叶明显；花白色，芳香；果大，球形或梨形，果皮黄绿，果肉粉红或白色。"
    },
    habits: { light: "喜光，幼树稍耐阴。", water: "喜湿润，忌积水。", temperature: "亚热带、热带果树，较不耐寒。" },
    uniqueValue: "世界最大的柑橘类水果，果肉清甜多汁，富含维生素 C；果皮可制蜜饯或入药。",
    culture: "“柚”与“佑”谐音，中秋食柚象征团圆、庇佑；柚叶在岭南民俗中用于辟邪祈福。",
    color: "#badc58"
  },
  {
    id: "hibiscus_tiliaceus",
    type: "plant",
    nameCN: "黄槿",
    nameEN: "Sea Hibiscus / Cottonwood",
    aliases: ["糕仔树", "桐花"],
    family: "锦葵科 / 木槿属 (Hibiscus tiliaceus)",
    origin: "原产亚洲热带、大洋洲及太平洋岛屿的海岸林。",
    appearance: {
      form: "常绿灌木或小乔木，高 3–10 m，树冠广展，海滨常见。",
      leavesAndFlowers: "叶近圆形或心形，革质，先端突尖；花黄色，中央紫红色，花径 8–10 cm，朝开暮谢。"
    },
    habits: { light: "喜光，极耐盐碱海风。", water: "耐旱耐湿，适应性强。", temperature: "热带、南亚热带海岸树种，畏寒。" },
    uniqueValue: "优良的海岸防风、固沙与行道树种；叶可制粿（糕点），故名“糕仔树”。",
    culture: "花朵向阳而开，象征坚韧与生命力，常被视为守护海岸的英雄树。",
    color: "#f9ca24"
  },
  {
    id: "heteropanax",
    type: "plant",
    nameCN: "幌伞枫",
    nameEN: "Fragrant Heteropanax",
    aliases: ["大蛇药", "五加通"],
    family: "五加科 / 幌伞枫属 (Heteropanax fragrans)",
    origin: "原产中国云南、广西及东南亚热带地区。",
    appearance: {
      form: "常绿大乔木，高 20 m 以上，树干通直，树冠如伞。",
      leavesAndFlowers: "大型掌状复叶，小叶 5–7 枚，椭圆状披针形；花小，淡黄绿色，组成大型圆锥花序。"
    },
    habits: { light: "喜半阴至全光照。", water: "喜湿润肥沃土壤。", temperature: "热带、南亚热带树种，畏寒。" },
    uniqueValue: "树姿优雅、叶大荫浓，是优良的庭院和校园遮荫树。",
    culture: "因树冠如张开的大伞，象征庇护与包容。",
    color: "#00b894"
  },
  {
    id: "maple",
    type: "plant",
    nameCN: "槭树",
    nameEN: "Maple",
    aliases: ["枫树", "槭"],
    family: "无患子科 / 槭属 (Acer spp.)",
    origin: "多分布于北半球温带至亚热带地区，种类繁多。",
    appearance: {
      form: "落叶乔木或灌木，高 2–30 m 不等，树冠圆整。",
      leavesAndFlowers: "叶多掌状分裂（少不裂），对生，秋日常转红、橙或黄；花小，黄绿或红，伞房花序。"
    },
    habits: { light: "多喜光，部分种类耐半阴。", water: "喜湿润而排水良好的土壤。", temperature: "多数温带或亚热带种类，耐寒性因种而异。" },
    uniqueValue: "秋叶绚丽，是世界著名观叶树种；木材优良，可制乐器、家具；枫糖即来自部分种类。",
    culture: "“红叶题诗”“霜叶红于二月花”，象征思念、热情与秋意。",
    color: "#e17055"
  },
  {
    id: "sweetgum",
    type: "plant",
    nameCN: "枫香树",
    nameEN: "Formosan Sweetgum",
    aliases: ["枫香", "路路通"],
    family: "蕈树科 / 枫香树属 (Liquidambar formosana)",
    origin: "原产中国长江流域以南及台湾。",
    appearance: {
      form: "落叶大乔木，高可达 30 m，树皮灰褐色，幼时光滑。",
      leavesAndFlowers: "叶掌状 3 裂，基部心形，边缘有锯齿，秋季变红；花单性同株，球形头状花序；果为聚合蒴果，球形带刺。"
    },
    habits: { light: "喜光，幼树耐阴。", water: "喜湿润，耐寒性较强。", temperature: "亚热带至温带树种，较耐寒。" },
    uniqueValue: "优良的秋色叶树种；树脂可作香料和药用；木材可供建筑。",
    culture: "因果实多孔如“路路通”，民间寓意财路亨通；红叶也寄托思乡之情。",
    color: "#d63031"
  },
  {
    id: "sterculia",
    type: "plant",
    nameCN: "假苹婆",
    nameEN: "Lance-leaf Sterculia",
    aliases: ["七姐果", "山木棉"],
    family: "锦葵科 / 苹婆属 (Sterculia lanceolata)",
    origin: "原产中国华南及东南亚。",
    appearance: {
      form: "常绿小乔木，高 4–8 m，树冠开展。",
      leavesAndFlowers: "叶椭圆形或披针形，革质；圆锥花序腋生，花淡红或紫红色；蓇葖果鲜红色，成熟后开裂，种子黑色有光泽。"
    },
    habits: { light: "喜光。", water: "耐旱，不耐涝。", temperature: "热带、南亚热带树种，畏寒。" },
    uniqueValue: "果荚鲜红奇特，是华南优良的观果树种；种子可食或榨油。",
    culture: "果形似眼，又称“凤眼果”，民间有吉祥、祈福之意。",
    color: "#ff4757"
  },
  {
    id: "camphor",
    type: "plant",
    nameCN: "樟",
    nameEN: "Camphor Tree",
    aliases: ["香樟", "樟树"],
    family: "樟科 / 樟属 (Cinnamomum camphora)",
    origin: "原产中国南方、日本、越南及朝鲜半岛。",
    appearance: {
      form: "常绿大乔木，高可达 30 m，树冠广卵形，寿命长。",
      leavesAndFlowers: "叶互生，卵形或椭圆状卵形，薄革质，离基三出脉，揉之有樟脑香气；花黄绿色，圆锥花序腋生。"
    },
    habits: { light: "喜光，幼树耐阴。", water: "喜湿润肥沃土壤，不耐水涝。", temperature: "亚热带常绿阔叶树种，较耐寒。" },
    uniqueValue: "中国传统乡土树种，可提取樟脑和樟油；树冠浓密，抗污染，是优秀的行道树和庭荫树。",
    culture: "象征长寿、坚韧与守护；常被选为古树名木和校园精神树。",
    color: "#2ecc71"
  },
  {
    id: "golden_shower",
    type: "plant",
    nameCN: "腊肠树",
    nameEN: "Golden Shower Tree / Indian Laburnum",
    aliases: ["阿勃勒", "金急雨"],
    family: "豆科 / 决明属 (Cassia fistula)",
    origin: "原产印度、斯里兰卡及东南亚热带地区。",
    appearance: {
      form: "落叶大乔木，高可达 20 m，树冠开展。",
      leavesAndFlowers: "叶为羽状复叶，小叶 4–8 对，卵状长圆形；总状花序下垂，长 30–60 cm，花金黄色，芳香；荚果圆柱状，黑褐，形似腊肠。"
    },
    habits: { light: "强阳性。", water: "耐旱，忌积水。", temperature: "热带、南亚热带树种，畏寒。" },
    uniqueValue: "泰国国花，盛夏满树金黄下垂花序，极具热带风情；果肉可作缓泻药。",
    culture: "泰国国花，象征金色、繁荣与皇室；花语为“金色的 shower”。",
    color: "#f1c40f"
  },
  {
    id: "rosewood",
    type: "plant",
    nameCN: "紫檀",
    nameEN: "Burma Padauk / Asian Rosewood",
    aliases: ["青龙木", "黄柏木"],
    family: "豆科 / 紫檀属 (Pterocarpus indicus)",
    origin: "原产东南亚及印度。",
    appearance: {
      form: "常绿大乔木，高 20–25 m，树皮灰色，树冠广圆形。",
      leavesAndFlowers: "奇数羽状复叶，小叶 7–9 枚，椭圆形；圆锥花序顶生，花黄色；荚果圆形，周边有翅。"
    },
    habits: { light: "喜光。", water: "耐旱，忌积水。", temperature: "热带、南亚热带树种，畏寒。" },
    uniqueValue: "珍贵红木树种，木材坚硬、纹理美观，是著名的“紫檀”来源之一；也常作行道树。",
    culture: "紫檀自古为名贵木材，象征尊贵、财富与长久。",
    color: "#a29bfe"
  },
  {
    id: "tallow_tree",
    type: "plant",
    nameCN: "乌桕",
    nameEN: "Chinese Tallow Tree",
    aliases: ["桕子树", "木子树"],
    family: "大戟科 / 乌桕属 (Triadica sebifera)",
    origin: "原产中国，分布极广。",
    appearance: {
      form: "落叶乔木，高可达 15 m，树冠近球形。",
      leavesAndFlowers: "叶菱形或菱状卵形，先端尾尖，秋季变红、橙；穗状花序顶生，花单性；蒴果梨状球形，成熟后黑色。"
    },
    habits: { light: "喜光，耐水湿。", water: "喜湿润，也能耐短期水淹。", temperature: "温带至亚热带树种，耐寒性较强。" },
    uniqueValue: "著名秋色叶树种；种子含油可制蜡烛、肥皂；根皮、叶可入药。",
    culture: "陆放翁诗“乌桕赤于枫”，秋叶如火如荼，象征成熟与热烈。",
    color: "#e84393"
  },
  {
    id: "bauhinia_variegata",
    type: "plant",
    nameCN: "宫粉羊蹄甲",
    nameEN: "Orchid Tree / Mountain Ebony",
    aliases: ["宫粉紫荆", "弯叶树"],
    family: "豆科 / 羊蹄甲属 (Bauhinia variegata)",
    origin: "原产印度、缅甸、东南亚。",
    appearance: {
      form: "落叶乔木，高 6–15 m，树冠开展。",
      leavesAndFlowers: "叶阔卵形至近圆形，先端 2 裂呈羊蹄状；花粉红至淡紫，芳香，冬春盛开。"
    },
    habits: { light: "喜光。", water: "耐旱，不耐积水。", temperature: "热带、南亚热带树种，畏寒。" },
    uniqueValue: "华南冬春观花行道树，花开满树粉紫，极具浪漫气息。",
    culture: "香港市花洋紫荆的近亲，象征亲情、团圆与繁荣。",
    color: "#fd79a8"
  },
  {
    id: "jacaranda",
    type: "plant",
    nameCN: "蓝花楹",
    nameEN: "Jacaranda",
    aliases: ["蓝雾树", "巴西紫葳"],
    family: "紫葳科 / 蓝花楹属 (Jacaranda mimosifolia)",
    origin: "原产南美洲阿根廷、玻利维亚、巴西。",
    appearance: {
      form: "落叶乔木，高可达 15 m，树冠伞形或圆头形。",
      leavesAndFlowers: "叶对生，二回羽状复叶，小叶细小密集；圆锥花序顶生，花冠蓝紫色，钟状，春末夏初盛开。"
    },
    habits: { light: "强阳性。", water: "耐旱，忌积水。", temperature: "热带、南亚热带树种，畏寒。" },
    uniqueValue: "世界著名蓝紫色花乔木，盛花期如梦似幻，是校园“网红”观花树种。",
    culture: "花语为“宁静、深远、梦幻”；蓝紫色花海象征毕业季的离愁与期许。",
    color: "#6c5ce7"
  },
  {
    id: "cockspur_coral",
    type: "plant",
    nameCN: "鸡冠刺桐",
    nameEN: "Cockspur Coral Tree",
    aliases: ["象牙红", "鸡冠豆"],
    family: "豆科 / 刺桐属 (Erythrina crista-galli)",
    origin: "原产南美洲阿根廷、巴西、乌拉圭。",
    appearance: {
      form: "落叶小乔木，高 4–8 m，树干和枝条有刺。",
      leavesAndFlowers: "叶为三出复叶，小叶菱形；总状花序腋生，花鲜红色，旗瓣弯曲如鸡冠，花期春至夏。"
    },
    habits: { light: "强阳性。", water: "耐旱，不耐寒。", temperature: "热带、南亚热带树种，畏寒。" },
    uniqueValue: "花色鲜红、花序密集如鸡冠，是优良的观花行道树。",
    culture: "阿根廷国花，象征热情、勇敢与生命力。",
    color: "#d63031"
  },
  {
    id: "mango",
    type: "plant",
    nameCN: "杧果",
    nameEN: "Mango",
    aliases: ["芒果", "檬果"],
    family: "漆树科 / 杧果属 (Mangifera indica)",
    origin: "原产印度和马来西亚，世界热带水果之王。",
    appearance: {
      form: "常绿大乔木，高 10–25 m，树冠圆头形。",
      leavesAndFlowers: "叶革质，长椭圆状披针形，常集生枝顶；圆锥花序顶生，花小，黄白或淡红色；核果大，椭圆形，熟时黄色或红色。"
    },
    habits: { light: "喜光，幼树稍耐阴。", water: "喜湿润，忌积水。", temperature: "热带树种，对低温敏感。" },
    uniqueValue: "世界著名热带水果，果肉香甜多汁，可鲜食、制干、榨汁；树冠浓密可作遮荫树。",
    culture: "在印度被称为“水果之王”，象征爱情、丰收与繁荣。",
    color: "#fdcb6e"
  },
  {
    id: "lacebark",
    type: "plant",
    nameCN: "槭叶酒瓶树",
    nameEN: "Flame Tree / Australian Flame Tree",
    aliases: ["澳洲火焰木", "槭叶瓶干树"],
    family: "锦葵科 / 瓶干树属 (Brachychiton acerifolius)",
    origin: "原产澳大利亚东部的热带雨林。",
    appearance: {
      form: "落叶乔木，高可达 30 m，主干粗壮，基部膨大呈瓶状。",
      leavesAndFlowers: "叶掌状 3–5 裂，似槭叶；春季新叶落尽后开满橙红至朱红色钟形花，极为壮观。"
    },
    habits: { light: "喜光。", water: "耐旱，较耐贫瘠。", temperature: "热带、南亚热带树种，畏寒。" },
    uniqueValue: "春季满树红花，是优良的观花行道树；膨大的茎干可储存水分。",
    culture: "花语为“热情似火”，象征昂扬的生命力。",
    color: "#e74c3c"
  },
  {
    id: "frangipani",
    type: "plant",
    nameCN: "鸡蛋花",
    nameEN: "Frangipani / Plumeria",
    aliases: ["缅栀子", "蛋黄花"],
    family: "夹竹桃科 / 鸡蛋花属 (Plumeria rubra)",
    origin: "原产美洲热带地区，现广植于热带、亚热带。",
    appearance: {
      form: "落叶小乔木，高 4–8 m，枝干粗壮肉质。",
      leavesAndFlowers: "叶大，长椭圆形，聚生于枝端；花冠漏斗状，外白内黄，似荷包蛋，极香，花期 5–10 月。"
    },
    habits: { light: "强阳性。", water: "耐旱，忌积水。", temperature: "热带、南亚热带树种，畏寒。" },
    uniqueValue: "热带庭院经典香花树种，花朵可串成花环、制作香水；老挝国花。",
    culture: "老挝国花，象征复活、新生与希望；在广东被称为“鸡蛋花”，常作凉茶原料。",
    color: "#ffeaa7"
  },
  {
    id: "kudingcha",
    type: "plant",
    nameCN: "铁冬青",
    nameEN: "Round-leaved Holly",
    aliases: ["救必应", "熊胆木"],
    family: "冬青科 / 冬青属 (Ilex rotunda)",
    origin: "原产中国、日本、朝鲜半岛等地。",
    appearance: {
      form: "常绿乔木，高 5–15 m，树冠浓密。",
      leavesAndFlowers: "叶薄革质，椭圆形或倒卵形，边缘浅波状；花淡黄白色，腋生；浆果球形，熟时鲜红，经冬不落。"
    },
    habits: { light: "喜光，幼树耐阴。", water: "喜湿润，也耐干旱。", temperature: "亚热带常绿阔叶树种，较耐寒。" },
    uniqueValue: "优良的观果和药用树种，树皮入药称“救必应”；红果可吸引鸟类，是生态校园常用树种。",
    culture: "红果象征喜庆与坚韧，冬季尤为醒目。",
    color: "#c0392b"
  },
  {
    id: "hackberry",
    type: "plant",
    nameCN: "朴",
    nameEN: "Chinese Hackberry",
    aliases: ["朴树", "沙朴"],
    family: "大麻科 / 朴属 (Celtis sinensis)",
    origin: "原产中国、日本、朝鲜半岛。",
    appearance: {
      form: "落叶乔木，高可达 20 m，树皮灰白，树冠开展。",
      leavesAndFlowers: "叶互生，卵形或椭圆状卵形，基部不对称，边缘中部以上有锯齿；花小，淡绿色；核果球形，熟时橙红或蓝黑。"
    },
    habits: { light: "喜光，稍耐阴。", water: "耐旱、耐湿、耐瘠薄，适应性强。", temperature: "温带至亚热带树种，耐寒性强。" },
    uniqueValue: "乡土树种，抗污染、抗烟尘，是优秀的行道树和庭荫树；木材细致可供农具。",
    culture: "“朴”有质朴、本真之意，象征朴素、坚韧的生命力。",
    color: "#74b9ff"
  },
  {
    id: "yellow_trumpet",
    type: "plant",
    nameCN: "黄花风铃木",
    nameEN: "Golden Trumpet Tree",
    aliases: ["黄钟木", "巴西风铃木"],
    family: "紫葳科 / 风铃木属 (Handroanthus chrysanthus)",
    origin: "原产中南美洲。",
    appearance: {
      form: "落叶乔木，高 4–8 m，树冠圆伞形。",
      leavesAndFlowers: "掌状复叶，小叶 3–5 枚；早春开花，花冠金黄、钟形，花序密集，先叶开放。"
    },
    habits: { light: "强阳性。", water: "耐旱，不耐涝。", temperature: "热带、南亚热带树种，畏寒。" },
    uniqueValue: "华南春季明星树种，满树金黄钟形花，观赏性极强。",
    culture: "花语为“感恩、感谢”，金黄花海象征希望与活力。",
    color: "#f1c40f"
  },
  {
    id: "pink_trumpet",
    type: "plant",
    nameCN: "紫花风铃木",
    nameEN: "Pink Trumpet Tree / Pink Poui",
    aliases: ["红花风铃木", "粉花风铃木"],
    family: "紫葳科 / 风铃木属 (Handroanthus impetiginosus)",
    origin: "原产中南美洲。",
    appearance: {
      form: "落叶乔木，高 6–12 m，树冠开阔。",
      leavesAndFlowers: "掌状复叶，小叶 5 枚；春季开花，花冠粉红至紫红，喇叭状，先叶开放，满树粉霞。"
    },
    habits: { light: "强阳性。", water: "耐旱，不耐涝。", temperature: "热带、南亚热带树种，畏寒。" },
    uniqueValue: "花色娇艳，花期壮观，是近年流行的观花行道树。",
    culture: "花语为“浪漫、温柔”，象征春天的问候。",
    color: "#e056fd"
  },
  {
    id: "white_trumpet",
    type: "plant",
    nameCN: "白花风铃木",
    nameEN: "White Trumpet Tree",
    aliases: ["白风铃", "白花风铃"],
    family: "紫葳科 / 风铃木属 (Handroanthus albus)",
    origin: "原产中南美洲热带地区。",
    appearance: {
      form: "落叶乔木，高 5–10 m，树形开展。",
      leavesAndFlowers: "掌状复叶，小叶 3–5 枚；春末开花，花冠白色或淡黄白色，钟形，先叶开放。"
    },
    habits: { light: "强阳性。", water: "耐旱，忌积水。", temperature: "热带、南亚热带树种，畏寒。" },
    uniqueValue: "花色素雅清新，常与其他色风铃木混植，营造层次丰富的校园景观。",
    culture: "白色风铃木象征纯洁、宁静与新的开始。",
    color: "#dfe6e9"
  },
  {
    id: "barringtonia",
    type: "plant",
    nameCN: "玉蕊",
    nameEN: "Common Barringtonia",
    aliases: ["水茄苳", "棋盘脚"],
    family: "玉蕊科 / 玉蕊属 (Barringtonia racemosa)",
    origin: "原产亚洲热带、非洲东部及大洋洲滨海地区。",
    appearance: {
      form: "常绿小乔木，高 4–8 m，常生于水边或湿地。",
      leavesAndFlowers: "叶聚生枝顶，倒卵形或椭圆形，革质；总状花序下垂，长可达 50 cm，花白色，花瓣 4 枚，花丝细长红色，夜间开放，芳香。"
    },
    habits: { light: "喜光，幼树耐半阴。", water: "极喜湿润，耐短期水淹。", temperature: "热带、南亚热带树种，畏寒。" },
    uniqueValue: "夜间香花树种，花姿奇特，是水岸和湿地绿化的特色树种。",
    culture: "因花序下垂如流苏、夜间吐香，象征神秘与优雅。",
    color: "#81ecec"
  },
  {
    id: "flamboyant",
    type: "plant",
    nameCN: "凤凰木",
    nameEN: "Royal Poinciana / Flamboyant",
    aliases: ["红花楹", "火树"],
    family: "豆科 / 凤凰木属 (Delonix regia)",
    origin: "原产马达加斯加。",
    appearance: {
      form: "落叶大乔木，高可达 20 m，树冠宽阔伞形，姿态优美。",
      leavesAndFlowers: "二回羽状复叶，小叶细小，叶柄红色；伞房状总状花序，花鲜红至橙红，夏初盛开，满树似火。"
    },
    habits: { light: "强阳性。", water: "耐旱，不耐涝。", temperature: "热带、南亚热带树种，畏寒。" },
    uniqueValue: "世界著名热带观花树种，盛花期满树红霞，是校园毕业季的经典背景。",
    culture: "花语为“离别、思念、火热的青春”；常与毕业季、凤凰花开的路口相关联。",
    color: "#ff3838"
  }
];

const BIRDS = [
  {
    id: "white_wagtail",
    type: "bird",
    nameCN: "白鹡鸰",
    nameEN: "White Wagtail",
    aliases: ["白面鸟", "点水雀"],
    family: "鹡鸰科 / 鹡鸰属 (Motacilla alba)",
    origin: "分布广泛，繁殖于欧亚大陆北部，华南地区常见于冬候鸟或留鸟。",
    appearance: {
      form: "小型雀鸟，体长约 18 cm，体型纤细，尾长常上下摆动。",
      feathersAndFeatures: "繁殖期雄鸟头后至腰部深黑色，胸带黑色，其余白色；雌鸟黑色区域较淡，背部常带褐色。喙细长，脚黑。"
    },
    habits: { diet: "以昆虫、蚯蚓、小型无脊椎动物为主。", habitat: "开阔草地、操场、水边、农田。", activity: "常在地面快速行走觅食，受惊时飞起并发出“吱吱”声，尾羽不停摆动。" },
    uniqueValue: "校园草地与操场最常见的小鸟之一，能帮助控制昆虫数量，是天然“害虫管理员”。",
    culture: "因常在水边或湿地活动，古诗中多与春水、田园相伴，象征灵动与机警。",
    color: "#dfe6e9"
  },
  {
    id: "light_vented_bulbul",
    type: "bird",
    nameCN: "白头鹎",
    nameEN: "Light-vented Bulbul",
    aliases: ["白头翁", "白头公"],
    family: "鹎科 / 鹎属 (Pycnonotus sinensis)",
    origin: "中国东部、南部及台湾常见留鸟，华南校园极常见。",
    appearance: {
      form: "中小型雀鸟，体长约 19 cm，体态圆润。",
      feathersAndFeatures: "额至头顶黑色，眼周至后枕形成明显白色“白枕环”；背、翼橄榄绿，腹白色带黄绿色纵纹。"
    },
    habits: { diet: "杂食，喜食果实、花蜜、昆虫。", habitat: "果园、树林、校园绿地、灌丛。", activity: "性格活泼，常成群活动，清晨常在枝头高声鸣唱。" },
    uniqueValue: "华南校园最常见鸟类之一，食性广，对植物种子传播有帮助。",
    culture: "因头顶“白发”，被亲切地称为“白头翁”，象征长寿与活泼。",
    color: "#a8e063"
  },
  {
    id: "red_whiskered_bulbul",
    type: "bird",
    nameCN: "红耳鹎",
    nameEN: "Red-whiskered Bulbul",
    aliases: ["高冠鸟", "高髻冠"],
    family: "鹎科 / 鹎属 (Pycnonotus jocosus)",
    origin: "原产中国南方及东南亚，华南留鸟。",
    appearance: {
      form: "中小型雀鸟，体长约 20 cm，头顶具高耸的黑色羽冠。",
      feathersAndFeatures: "眼后下方有鲜红色羽簇，形成醒目红斑；背、翼橄榄褐色，腹白色。羽冠高耸似戴高帽。"
    },
    habits: { diet: "以果实、花蜜、昆虫为主。", habitat: "果园、校园树林、公园绿地。", activity: "常集群活动，夏季午后喜躲树荫鸣叫，性格大胆。" },
    uniqueValue: "造型时尚、叫声多变，是校园观鸟的“入门明星”；食果习性有助于种子传播。",
    culture: "头顶高冠、耳缀红羽，象征喜庆与高贵。",
    color: "#ff6b81"
  },
  {
    id: "sooty_headed_bulbul",
    type: "bird",
    nameCN: "白喉红臀鹎",
    nameEN: "Sooty-headed Bulbul",
    aliases: ["红臀鹎"],
    family: "鹎科 / 鹎属 (Pycnonotus aurigaster)",
    origin: "原产东南亚及中国云南、华南等地。",
    appearance: {
      form: "中型鹎类，体长约 20 cm，体态结实。",
      feathersAndFeatures: "前额至头顶黑色具光泽；喉部白色；尾下覆羽鲜红或橙红（“红臀”特征）；背、翼褐色，腹灰白色。"
    },
    habits: { diet: "杂食，喜食果实、种子、昆虫。", habitat: "校园树林、果园、公园。", activity: "常小群活动，鸣声粗犷响亮，辨识度高。" },
    uniqueValue: "以醒目的红色臀部为识别特征，是华南校园较常见的鹎类。",
    culture: "红臀鲜艳，民间视为吉祥、活泼的象征。",
    color: "#e17055"
  },
  {
    id: "common_blackbird",
    type: "bird",
    nameCN: "乌鸫",
    nameEN: "Chinese Blackbird",
    aliases: ["百舌鸟", "黑鸫"],
    family: "鸫科 / 鸫属 (Turdus mandarinus)",
    origin: "中国常见留鸟，分布于华东、华南、西南等地。",
    appearance: {
      form: "中型雀鸟，体长约 25–29 cm，体型圆胖。",
      feathersAndFeatures: "通体乌黑或黑褐色；眼圈和喙部鲜黄色，为其最醒目特征；雌雄相似。"
    },
    habits: { diet: "以昆虫、蚯蚓、果实为主。", habitat: "校园大树下草坪、公园、林地。", activity: "常在地面跳跃觅食，受惊先翘尾再飞；歌声嘹亮悦耳，能模仿其他鸟鸣。" },
    uniqueValue: "被称为“百舌鸟”，歌声优美复杂；喜在草坪翻动落叶捕食蚯蚓，是自然的“除虫高手”。",
    culture: "古诗中“百舌鸟”即指乌鸫，象征才华与多变的歌喉；因低调外表与华丽歌声反差，寓意“藏锋”。",
    color: "#2d3436"
  },
  {
    id: "oriental_magpie_robin",
    type: "bird",
    nameCN: "鹊鸲",
    nameEN: "Oriental Magpie-robin",
    aliases: ["四喜", "猪屎渣"],
    family: "鹟科 / 鹊鸲属 (Copsychus saularis)",
    origin: "南亚、东南亚及中国南方常见留鸟。",
    appearance: {
      form: "小型雀鸟，体长约 20 cm，尾长常翘起。",
      feathersAndFeatures: "雄鸟头、背至中央尾羽亮黑色带蓝紫光泽，翅有白色翼斑，腹白色；雌鸟上体暗灰褐，下体偏白或淡棕。"
    },
    habits: { diet: "以昆虫、小型无脊椎动物为主，也吃果实。", habitat: "校园开阔地面、咖啡厅前、花坛边缘。", activity: "常翘起尾巴在地面上跳跃觅食，受惊时飞入灌丛。" },
    uniqueValue: "常在校园空地、建筑前活动，喜欢翻动落叶找虫子，是与人亲近的“校园清洁工”。",
    culture: "古称“四喜”，民间视为报喜鸟，象征吉祥与喜悦。",
    color: "#74b9ff"
  },
  {
    id: "swinhoe_white_eye",
    type: "bird",
    nameCN: "暗绿绣眼鸟",
    nameEN: "Swinhoe's White-eye",
    aliases: ["绣眼", "相思仔"],
    family: "绣眼鸟科 / 绣眼鸟属 (Zosterops simplex)",
    origin: "东亚、东南亚及中国南方常见留鸟或候鸟。",
    appearance: {
      form: "小型雀鸟，体长约 10 cm，体型娇小活泼。",
      feathersAndFeatures: "通体黄绿色；眼周具明显的白色眼圈，似画眼线；喙小而尖，适合吸食花蜜。"
    },
    habits: { diet: "主要以花蜜、小型昆虫和浆果为食。", habitat: "花树、灌丛、校园绿化带。", activity: "常成小群在花丛中穿梭，动作敏捷，悬停吸食花蜜。" },
    uniqueValue: "体型虽小，却是重要的“传粉使者”，吸食花蜜时帮助植物传播花粉。",
    culture: "因眼圈似绣线，被视为灵动可爱的象征；常与相思、精巧联系。",
    color: "#b8e994"
  },
  {
    id: "fork_tailed_sunbird",
    type: "bird",
    nameCN: "叉尾太阳鸟",
    nameEN: "Fork-tailed Sunbird",
    aliases: ["太阳鸟", "燕尾太阳鸟"],
    family: "太阳鸟科 / 太阳鸟属 (Aethopyga christinae)",
    origin: "中国南方及东南亚常见留鸟。",
    appearance: {
      form: "小型鸟类，体长约 10 cm，雄鸟具金属光泽。",
      feathersAndFeatures: "雄鸟头顶辉绿，喉部鲜红，上体泛金属绿或紫，中央尾羽延长；雌鸟较朴素，橄榄绿带黄色。喙细长下弯，适合取食花蜜。"
    },
    habits: { diet: "以花蜜为主，也捕食小型昆虫。", habitat: "开花的树木、灌丛、校园花园。", activity: "喜在花丛中悬停吸食花蜜，飞行迅速灵巧。" },
    uniqueValue: "被誉为“中国蜂鸟”，是重要的传粉鸟类；羽毛绚丽，是校园观鸟的亮点。",
    culture: "羽色如阳光般灿烂，象征活力、希望与自然之美的精灵。",
    color: "#f9ca24"
  }
];

// Expose globally for the game
if (typeof window !== "undefined") {
  window.PLANTS = PLANTS;
  window.BIRDS = BIRDS;
}
