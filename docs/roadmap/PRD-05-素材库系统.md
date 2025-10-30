# PRD-05: Scriptify 素材库系统

**版本**: v1.0
**日期**: 2025-10-29
**依赖**: PRD-01, PRD-04
**状态**: 草案

---

## 一、设计理念

### 1.1 为什么需要素材库?

**核心问题**: 每次创作都从零开始,大量重复劳动

| 重复内容 | 示例 | 浪费时间 |
|---------|------|---------|
| **角色设定** | 每次都要重新描述主角外观 | 10-20 分钟/角色 |
| **场景描述** | 常用场景(办公室/街道)反复定义 | 5-10 分钟/场景 |
| **剧情桥段** | 经典情节(追逐/对峙)重复设计 | 30-60 分钟 |
| **运镜参数** | 每次手动标注景别、角度 | 5 分钟/镜头 |

**解决方案**: 借鉴 **article-writer 的素材库设计**,建立可复用的素材管理系统。

---

## 二、素材库结构

### 2.1 目录组织

```
materials/                          # 素材库根目录
├── characters/                     # 角色库
│   ├── protagonists/               # 主角
│   │   ├── detective-male.md       # 男性侦探原型
│   │   ├── detective-female.md     # 女性侦探原型
│   │   └── student-teen.md         # 青少年学生原型
│   ├── antagonists/                # 反派
│   │   ├── crime-boss.md           # 犯罪头目原型
│   │   └── corrupt-official.md     # 腐败官员原型
│   └── supporting/                 # 配角
│       ├── sidekick.md             # 助手原型
│       └── mentor.md               # 导师原型
│
├── scenes/                         # 场景库
│   ├── urban/                      # 都市场景
│   │   ├── street-night.md         # 夜晚街道
│   │   ├── office.md               # 办公室
│   │   └── cafe.md                 # 咖啡馆
│   ├── indoor/                     # 室内场景
│   │   ├── living-room.md          # 客厅
│   │   └── bedroom.md              # 卧室
│   └── special/                    # 特殊场景
│       ├── underground.md          # 地下室/密室
│       └── rooftop.md              # 天台
│
├── plot-templates/                 # 剧情模板库
│   ├── confrontation.md            # 对峙桥段
│   ├── chase.md                    # 追逐戏
│   ├── revelation.md               # 真相揭晓
│   └── flashback.md                # 闪回
│
├── camera-presets/                 # 运镜预设
│   ├── emotional/                  # 情绪类运镜
│   │   ├── tension-build.md        # 紧张感营造
│   │   └── romantic.md             # 浪漫氛围
│   └── action/                     # 动作类运镜
│       ├── fast-paced.md           # 快节奏剪辑
│       └── slow-motion.md          # 慢动作
│
├── prompts/                        # 绘图提示词库
│   ├── characters/                 # 角色提示词
│   ├── scenes/                     # 场景提示词
│   └── effects/                    # 特效提示词
│
└── index/                          # 索引系统
    ├── tags.json                   # 标签索引
    ├── search-index.db             # 搜索索引 (SQLite)
    └── usage-stats.json            # 使用统计
```

### 2.2 素材文件格式

#### 角色素材示例: `characters/protagonists/detective-male.md`

```markdown
---
type: character
category: protagonist
archetype: detective
gender: male
tags: [侦探, 孤独, 正义, 沧桑, 黑色电影]
created: 2025-10-29
lastUsed: 2025-10-29
usageCount: 5
rating: 4.5
---

# 角色原型: 男性侦探

## 基本信息

**原型名称**: 经典黑色电影侦探
**适用场景**: 悬疑、犯罪、黑色电影类故事

## 外观模板

**年龄**: 30-40 岁
**身高**: 175-185cm
**体型**: 精瘦,有肌肉线条

**服装**:
- 标志性: 黑色/灰色风衣
- 上装: 白衬衫或深色衬衫
- 下装: 黑色/深灰长裤
- 鞋子: 皮鞋(略显磨损)
- 配饰: 可选怀表/打火机

**发型**:
- 短发,略显凌乱
- 颜色: 黑色/深棕色
- 风格: 不刻意打理,自然

**面部特征**:
- 眼神: 犀利,沧桑
- 表情: 常皱眉,严肃
- 胡须: 可选短须/胡茬

## 性格模板

**核心特质**:
1. 孤僻: 不善交际,独来独往
2. 敏锐: 观察力强,逻辑缜密
3. 执着: 一旦接手,绝不放弃
4. 沧桑: 经历过背叛,对世界失望
5. 正义感: 内心仍相信正义

**对话风格**:
- 简短,直接
- 少废话,切中要害
- 偶尔冷幽默

## 背景模板

**职业经历**:
- 前警察/私家侦探/记者 (可选)
- 因某个事件离开原职业
- 现在独立工作

**创伤事件** (可选):
- 亲人去世
- 被背叛
- 案件失败

## 标志性元素

**道具**:
- 怀表/打火机/笔记本 (三选一)
- 象征过去或信念

**习惯动作**:
- 思考时皱眉
- 烦躁时点烟(或假装点烟)
- 整理风衣领子

## 绘图提示词

```
Detective character, male, 30-40 years old, black trench coat,
short dark hair, sharp eyes, serious expression, film noir style,
standing in rain, cinematic lighting, moody atmosphere,
holding a pocket watch, mysterious and brooding
```

## 使用案例

**项目**: 暗巷谜案
**角色名**: 李墨
**调整**: 添加怀表(母亲遗物),强化孤独感

**项目**: 迷雾追踪
**角色名**: 陈峰
**调整**: 改为前记者,增加社交技能

## 变体建议

1. **年轻版**: 25-30 岁,更冲动,经验不足
2. **老练版**: 45-55 岁,更沉稳,疲惫感
3. **女性版**: 保留核心特质,调整外观和背景
```

#### 场景素材示例: `scenes/urban/street-night.md`

```markdown
---
type: scene
category: urban
subcategory: outdoor
timeOfDay: night
weather: [clear, rain, fog]
tags: [街道, 夜晚, 霓虹灯, 黑色电影, 都市]
mood: [孤独, 压抑, 神秘, 紧张]
created: 2025-10-29
usageCount: 8
rating: 4.8
---

# 场景原型: 夜晚城市街道

## 基本信息

**场景名称**: 雨夜街头 / 霓虹街道
**适用类型**: 悬疑、犯罪、科幻、赛博朋克

## 环境描述模板

**地点**: 城市商业区街道
**时间**: 夜晚 20:00-02:00
**天气**: 晴/雨/雾 (三选一)

**核心元素**:
1. **霓虹灯牌**: 商店招牌,五颜六色
2. **路灯**: 昏暗,间隔 10-15 米
3. **建筑**: 高楼,窗户有灯光
4. **地面**: 湿润(如下雨),反射灯光
5. **车辆**: 偶尔经过,尾灯拖影

**氛围关键词**:
- 孤独
- 压抑
- 神秘
- 黑色电影风

## 配色方案

**主色调**:
- 暗蓝 (#0A1929)
- 深灰 (#2C3E50)
- 黑色 (#000000)

**强调色**:
- 霓虹粉 (#FF006E)
- 霓虹青 (#00FFFF)
- 霓虹黄 (#FFD60A)

**光源**:
- 霓虹灯: 高饱和度,强对比
- 路灯: 暖黄色,微弱
- 车灯: 白色/黄色

## 分镜建议

**开场镜头**:
1. 远景: 展示街道全貌,霓虹灯林立
2. 中景: 主角走在街上,背影
3. 特写: 霓虹灯反射在水洼中

**常用构图**:
- 对称构图: 街道中央,建筑对称
- 三分法: 主角在画面 1/3 处
- 低角度: 仰拍,强调高楼压迫感

**运镜建议**:
- 推镜: 从远景推至中景,聚焦主角
- 跟镜: 跟随主角行走
- 摇镜: 展示街道环境

## 音效建议

**环境音**:
- 雨声(如下雨): 持续,中等音量
- 车流声: 远处,偶尔经过
- 霓虹灯嗡鸣声: 微弱

**特殊音效**:
- 脚步声: 主角行走
- 水溅声: 踩水坑(如下雨)

**BGM 建议**:
- 电子音乐(赛博朋克)
- 爵士乐(黑色电影)
- 氛围音乐(悬疑)

## 绘图提示词

**基础版**:
```
Night city street, neon lights, wet pavement, reflections,
film noir style, dark and moody, cinematic lighting,
high contrast, urban environment
```

**下雨版**:
```
Rainy night city street, neon lights reflection on wet ground,
puddles, dramatic lighting, film noir, moody atmosphere,
lone figure walking, cinematic composition
```

**赛博朋克版**:
```
Cyberpunk city street at night, neon signs, holographic ads,
wet streets with reflections, futuristic buildings,
atmospheric fog, high tech low life aesthetic
```

## 使用案例

**项目**: 暗巷谜案
**场景用途**: 开场,主角接电话
**调整**: 添加雨,强化孤独感

**项目**: 赛博侦探
**场景用途**: 追逐戏
**调整**: 增加全息广告,科幻元素

## 变体建议

1. **白天版**: 阳光刺眼,人群拥挤,现代都市感
2. **雾霾版**: 能见度低,神秘压抑
3. **废土版**: 破败,垃圾,末日感
```

#### 剧情模板示例: `plot-templates/confrontation.md`

```markdown
---
type: plot-template
category: conflict
duration: medium
shotCount: 8-12
tags: [对峙, 冲突, 紧张, 对话]
difficulty: medium
created: 2025-10-29
usageCount: 12
rating: 4.6
---

# 剧情模板: 对峙场景

## 模板信息

**适用场景**: 主角与反派/对手的正面冲突
**情绪**: 紧张、对抗、剑拔弩张
**建议时长**: 1-2 分钟 (漫画 8-12 分镜)

## 结构框架

### 阶段 1: 相遇 (2-3 分镜)

**目标**: 建立对峙氛围

**镜头 1**: 远景
- 双方从两个方向走来
- 环境空旷,突出孤立感

**镜头 2**: 中景
- 双方停步,相距 5-10 米
- 对视,眼神交锋

**镜头 3** (可选): 特写
- 主角/反派眼睛特写
- 眼神犀利,杀气

### 阶段 2: 对话交锋 (4-6 分镜)

**目标**: 语言交锋,揭示冲突

**镜头 4-5**: 交替近景
- 主角说话 → 反派回应
- 采用正反打 (Shot/Reverse Shot)

**镜头 6**: 中景
- 反派挑衅动作(如掏枪/亮刀)
- 主角反应

**镜头 7**: 特写
- 武器/道具特写
- 强调危险

### 阶段 3: 升级 (2-3 分镜)

**目标**: 冲突升级,物理对抗或情绪爆发

**镜头 8**: 全景
- 双方开始行动(打斗/逃跑/开枪)

**镜头 9-10**: 快速剪辑
- 动作特写(拳头/枪口/刀刃)
- 制造紧张节奏

**镜头 11**: 中景/远景
- 结果展示(一方占上风/僵持)

## 运镜建议

**阶段 1**: 静止或缓慢推镜
- 营造压迫感
- 逐渐聚焦

**阶段 2**: 正反打 + 轻微抖动
- 模拟紧张情绪
- 快速切换

**阶段 3**: 快速剪辑 + 手持效果
- 混乱感
- 高能量

## 对话模板

**主角** (冷静,试探):
"我没想到会在这里见到你。"

**反派** (挑衅):
"惊喜吗?你以为我会让你安全离开?"

**主角** (警觉):
"那要看你有没有本事。"

**反派** (掏枪/亮刀):
"试试?"

**主角** (准备迎战):
"来吧。"

(冲突爆发)

## 音效建议

**环境音**:
- 风声(强化紧张)
- 脚步声(清晰)

**特殊音效**:
- 武器出鞘声
- 扳机扣动声
- 呼吸声(加重)

**BGM**:
- 阶段 1: 低频,压抑
- 阶段 2: 逐渐增强
- 阶段 3: 高潮,快节奏

## 使用示例

**项目**: 暗巷谜案
**对峙双方**: 李墨 vs 神秘杀手
**地点**: 天台
**调整**: 添加雨,武器改为匕首

**项目**: 校园侦探
**对峙双方**: 学生侦探 vs 校长
**地点**: 办公室
**调整**: 无武器,纯语言交锋

## 变体

1. **心理战**: 纯对话,无物理冲突
2. **快速对峙**: 省略对话,直接开打
3. **群体对峙**: 双方各有帮手
```

---

## 三、素材管理系统

### 3.1 创建素材

```bash
# 创建角色素材
$ scriptify /materials create character --name "李墨" --archetype detective

【AI】: 检测到角色原型"侦探",是否基于模板创建?(Y/n)
> Y

【AI】: 找到模板: detective-male.md
   应用模板?(Y/n)
> Y

【AI】: 请补充角色个性化信息...

(用户填写具体细节)

✅ 角色"李墨"已创建并保存到素材库
```

### 3.2 搜索素材

```bash
# 按标签搜索
$ scriptify /materials search --tags "侦探,孤独"

【AI】: 找到 3 个匹配素材:

1. [角色] 男性侦探原型
   标签: 侦探,孤独,正义,沧桑
   使用次数: 5 次
   评分: 4.5/5

2. [角色] 李墨 (项目: 暗巷谜案)
   标签: 侦探,孤独,怀表,前警察
   使用次数: 1 次
   评分: 未评分

3. [场景] 雨夜街头
   标签: 街道,夜晚,孤独,黑色电影
   使用次数: 8 次
   评分: 4.8/5

# 按类型搜索
$ scriptify /materials search --type character --category protagonist

# 全文搜索
$ scriptify /materials search "黑色风衣"
```

### 3.3 导入素材

```bash
$ scriptify /materials import --id detective-male --to current-project

【AI】: 将"男性侦探原型"导入当前项目?
   1. 直接复制
   2. 创建副本并自定义
   3. 仅作为参考

> 2

【AI】: 请输入新角色名称
> 陈峰

【AI】: 已创建角色"陈峰"(基于侦探原型)
   请使用 /characters edit 进行自定义
```

### 3.4 复用与变体

```bash
$ scriptify /materials reuse --id "李墨" --variant "年轻版"

【AI】: 创建"李墨"的年轻版变体...
   - 年龄: 30 → 25
   - 性格: 执着 → 冲动
   - 经验: 老练 → 新手

✅ 已创建变体"李墨(年轻版)"
```

---

## 四、智能推荐系统

### 4.1 基于上下文推荐

```bash
$ scriptify /storyboard

【AI】: 分析剧本...
   - 场景: 夜晚街道
   - 情绪: 孤独,压抑

💡 推荐素材:

[场景] 雨夜街头 (匹配度 95%)
  理由: 场景类型匹配,情绪契合

[运镜] 紧张感营造 (匹配度 88%)
  理由: 适合悬疑类型,营造氛围

是否应用推荐素材?(Y/n) Y

✅ 已应用 2 个推荐素材
```

### 4.2 基于历史使用

```bash
【AI】: 检测到你在之前项目中使用过"侦探原型"
   是否继续使用相同风格?(Y/n)
```

---

## 五、素材索引与搜索

### 5.1 SQLite 索引

```sql
-- 素材索引表
CREATE TABLE materials (
  id TEXT PRIMARY KEY,
  type TEXT,  -- character/scene/plot-template/camera-preset
  name TEXT,
  category TEXT,
  tags TEXT,  -- JSON array
  file_path TEXT,
  created_at DATETIME,
  last_used DATETIME,
  usage_count INTEGER,
  rating REAL
);

-- 标签表
CREATE TABLE tags (
  id INTEGER PRIMARY KEY,
  tag TEXT UNIQUE,
  count INTEGER
);

-- 全文搜索
CREATE VIRTUAL TABLE materials_fts USING fts5(
  name,
  content,
  tags
);
```

### 5.2 搜索实现

```typescript
// src/materials/search-engine.ts

class MaterialSearchEngine {
  async search(query: SearchQuery): Promise<Material[]> {
    const results = await this.db.query(`
      SELECT * FROM materials
      WHERE tags LIKE ?
      ORDER BY usage_count DESC, rating DESC
      LIMIT 10
    `, [`%${query.tag}%`]);

    return results.map(r => this.parseMaterial(r));
  }

  async fullTextSearch(keyword: string): Promise<Material[]> {
    return this.db.query(`
      SELECT * FROM materials_fts
      WHERE materials_fts MATCH ?
      ORDER BY rank
    `, [keyword]);
  }
}
```

---

## 六、素材评分与推荐

### 6.1 使用后评分

```bash
$ scriptify /export

【AI】: 导出成功! 🎉

📊 本次项目使用了以下素材:
   1. [角色] 男性侦探原型
   2. [场景] 雨夜街头
   3. [剧情] 对峙场景

请对素材进行评分(1-5星,可跳过):

素材 1: 男性侦探原型
> 5

素材 2: 雨夜街头
> 5

素材 3: 对峙场景
> 4

✅ 感谢反馈! 评分已记录
```

### 6.2 推荐算法

```typescript
function recommendMaterials(context: ProjectContext): Material[] {
  // 1. 基于标签相似度
  const tagMatches = searchByTags(context.tags);

  // 2. 基于历史使用
  const historyMatches = getUserHistory(context.userId);

  // 3. 基于评分
  const topRated = getTopRated(context.type);

  // 4. 综合评分
  return mergeAndRank([tagMatches, historyMatches, topRated]);
}
```

---

## 七、素材同步与共享

### 7.1 本地素材库

```
~/.scriptify/materials/
  └── (用户个人素材)
```

### 7.2 云端素材库 (未来功能)

```bash
# 上传到云端
$ scriptify /materials upload --id "李墨"

# 从云端下载
$ scriptify /materials download --id "community/detective-template"

# 浏览社区素材
$ scriptify /materials browse --community
```

---

## 八、总结

- [x] **PRD-05**: 素材库系统 (本文档)
- [ ] **PRD-06**: 分镜脚本规范
- [ ] **PRD-07**: 多平台命令生成

---

**文档版本历史**:
- v1.0 (2025-10-29): 初始版本,定义素材库系统
