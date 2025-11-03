# Storyboardify 优化路线图 v1.1.0-v1.3.0

> **版本**: v1.0 (Planning)
> **日期**: 2025-11-02
> **状态**: 📋 规划阶段

---

## 📌 文档目的

本文档是 Storyboardify v1.1.0-v1.3.0 优化方案的**完整技术实施指南**,用于指导开发团队完成从"分镜脚本工具"到"分镜→图片完整桥接平台"的升级。

---

## 🎯 总体目标

### 核心使命
填补 AI 漫剧制作流程中"分镜→图片"的关键空白,将 Storyboardify 打造成完整的分镜到图片桥接平台。

### 对标完整流程
```
小说原文 → 剧本 → 分镜脚本 → 分镜图 → 视频 → 配音+音效+字幕 → 最终漫剧
          [Scriptify]  [Storyboardify v1.0]  [v1.1.0 新增]
```

### 关键指标
- ✅ **角色一致性准确率**: 60% → 90%+
- ✅ **分镜到图片转化效率**: 提升 80%
- ✅ **单集制作成本**: 降低 ¥500-2000
- ✅ **用户工作流完整度**: 40% → 85%

---

## 📅 版本规划总览

| 版本 | 时间周期 | 核心功能 | 优先级 |
|------|---------|---------|--------|
| **v1.1.0** | Week 1-3 (2-3周) | 图片生成桥接 | 🔴 最高 |
| **v1.2.0** | Week 4-5 (1-2周) | 导出增强 | 🟡 中等 |
| **v1.3.0** | Week 6-8 (2-3周) | 智能优化 | 🟢 中等 |

**总工期**: 5-8 周
**建议团队**: 1-2 人
**技术栈**: TypeScript, Node.js, REST API

---

## 🚀 v1.1.0 - 图片生成桥接 (第 1-3 周)

### 功能概述

**核心能力**:
- 集成火山引擎/阿里云文生图 API
- 实现角色一致性追踪系统
- 构建智能提示词生成引擎
- 批量图片生成调度器

**新增命令**:
- `/generate-images` - 分镜图片生成

### 架构扩展

```
src/
├── api/                          ← 新增
│   ├── volcano-engine.ts         # 火山引擎 SDK 封装
│   ├── aliyun-client.ts          # 阿里云 SDK 封装
│   └── api-manager.ts            # 统一 API 调用管理
├── generators/
│   ├── image/                    ← 新增
│   │   ├── prompt-builder.ts     # 提示词构建引擎
│   │   ├── consistency-tracker.ts # 一致性追踪系统
│   │   ├── batch-generator.ts    # 批量生成调度器
│   │   └── quality-checker.ts    # 质量检查器
└── utils/
    └── image/                    ← 新增
        ├── image-downloader.ts   # 图片下载管理
        └── image-utils.ts        # 图片处理工具
```

### Week 1: 基础设施搭建

#### Day 1-2: 环境配置与依赖安装

**任务清单**:
1. 更新 `package.json` 添加新依赖
2. 创建 `.env.template` 环境配置模板
3. 创建新目录结构
4. 编写 API 配置指南

**新增依赖**:
```json
{
  "dependencies": {
    "@volcengine/openapi": "^1.0.0",
    "@alicloud/openapi-client": "^0.4.8",
    "@alicloud/tea-util": "^1.4.7",
    "axios": "^1.6.0",
    "p-queue": "^8.0.1",
    "p-retry": "^6.2.0",
    "sharp": "^0.33.0",
    "dotenv": "^16.4.0"
  }
}
```

**环境配置模板** (`.env.template`):
```bash
# 火山引擎配置
VOLCANO_ACCESS_KEY_ID=
VOLCANO_ACCESS_KEY_SECRET=
VOLCANO_REGION=cn-beijing

# 阿里云配置
ALIYUN_ACCESS_KEY_ID=
ALIYUN_ACCESS_KEY_SECRET=
ALIYUN_REGION=cn-hangzhou

# API 配置
API_TIMEOUT=60000
API_MAX_RETRIES=3
API_CONCURRENT_LIMIT=5

# 成本控制
MAX_DAILY_COST_CNY=500
ENABLE_COST_ALERT=true
```

**验收标准**:
- ✅ 所有依赖安装成功,无版本冲突
- ✅ TypeScript 编译通过
- ✅ 目录结构符合架构设计

---

#### Day 3-4: API 客户端封装

**任务清单**:
1. 实现火山引擎客户端 (`src/api/volcano-engine.ts`)
2. 实现阿里云客户端 (`src/api/aliyun-client.ts`)
3. 实现 API 管理器 (`src/api/api-manager.ts`)

**核心接口**:
```typescript
// volcano-engine.ts
export class VolcanoEngineClient {
  async generateImage(request: VolcanoImageGenRequest): Promise<VolcanoImageGenResponse>;
  async generateImageBatch(requests: VolcanoImageGenRequest[]): Promise<VolcanoImageGenResponse[]>;
}

// aliyun-client.ts
export class AliyunClient {
  async generateImage(request: AliyunImageGenRequest): Promise<AliyunImageGenResponse>;
}

// api-manager.ts
export class APIManager {
  async generateImage(request: ImageGenerationRequest): Promise<any>;
  async generateImageBatch(requests: ImageGenerationRequest[]): Promise<any[]>;
  getCostStats(): CostStats;
  resetDailyCost(): void;
}
```

**验收标准**:
- ✅ 单元测试覆盖率 ≥ 80%
- ✅ API 调用成功率 ≥ 95%
- ✅ 成本追踪准确无误
- ✅ 错误重试机制正常工作

---

#### Day 5-7: 提示词构建引擎

**任务清单**:
1. 实现一致性追踪器 (`src/generators/image/consistency-tracker.ts`)
2. 实现提示词构建器 (`src/generators/image/prompt-builder.ts`)
3. 扩展类型定义 (`src/types/index.ts`)

**核心接口**:
```typescript
// consistency-tracker.ts
export class ConsistencyTracker {
  async initializeCharacterReference(character: Character): Promise<CharacterReference>;
  async recordSuccessfulGeneration(characterId: string, ...): Promise<void>;
  getBestSeed(characterId: string): number | undefined;
}

// prompt-builder.ts
export class PromptBuilder {
  buildPrompt(shot: Shot, character: Character, scene: Scene): string;
  buildNegativePrompt(): string;
  buildAngleVariants(shot: Shot, ...): Record<string, string>;
}
```

**提示词示例**:
```
正面提示词:
年轻女性, 长黑发扎马尾, 蓝眼睛, 白色衬衫, 黑色包臀裙,
站立姿态, 尴尬表情, 现代办公室, 白天, 自然光,
anime style, high quality, detailed

负面提示词:
low quality, blurry, distorted, ugly, deformed, bad anatomy, watermark
```

**验收标准**:
- ✅ 提示词格式符合最佳实践
- ✅ 角色特征提取准确率 ≥ 90%
- ✅ 一致性追踪系统正常保存/加载

---

### Week 2: 批量生成调度器

#### Day 8-10: 批量生成核心逻辑

**任务清单**:
1. 实现批量生成调度器 (`src/generators/image/batch-generator.ts`)
2. 实现质量检查器 (`src/generators/image/quality-checker.ts`)
3. 实现图片下载管理 (`src/utils/image/image-downloader.ts`)

**核心接口**:
```typescript
// batch-generator.ts
export class BatchGenerator {
  async generateStoryboardImages(
    storyboard: Storyboard,
    productionPack: ProductionPack,
    config: BatchGenerationConfig
  ): Promise<BatchGenerationResult>;

  async generateShotImages(
    shot: Shot,
    character: Character,
    scene: Scene,
    config: ShotGenerationConfig
  ): Promise<ShotImageResult>;
}

// quality-checker.ts
export class QualityChecker {
  async checkCharacterConsistency(
    images: GeneratedImage[],
    characterRef: CharacterReference
  ): Promise<ConsistencyScore>;
}
```

**文件组织结构**:
```
project/
├── .storyboardify/
│   ├── images/
│   │   ├── characters/        # 角色参考图
│   │   │   ├── char_001_ref_01.png
│   │   │   └── char_001_ref_02.png
│   │   ├── shots/             # 分镜图片
│   │   │   ├── scene_001/
│   │   │   │   ├── shot_001_v1.png
│   │   │   │   └── shot_001_v2.png
│   │   └── index.json         # 图片索引
│   └── references/
│       └── consistency-refs.json
```

**验收标准**:
- ✅ 批量生成支持暂停/恢复
- ✅ 图片下载失败自动重试
- ✅ 本地文件组织清晰
- ✅ 进度追踪准确

---

#### Day 11-14: 新命令实现

**任务清单**:
1. 创建 `/generate-images` 命令模板
2. 创建 bash 脚本 (`scripts/bash/generate-images.sh`)
3. 注册命令到 CLI (`src/cli.ts`)
4. 创建交互式配置界面

**命令模板** (`templates/commands/generate-images.md`):
```markdown
---
description: 分镜图片生成
scripts:
  sh: ../../scripts/bash/generate-images.sh
---

# /generate-images - 分镜图片生成

> **模式**: AI辅助的批量图片生成

## 第一步: 运行脚本

bash scripts/bash/generate-images.sh

## 第二步: 建立角色档案

为每个主要角色生成参考图...

## 第三步: 批量生成分镜图

按场景顺序生成,自动选择服务商...

## 第四步: 一致性检查

AI自动检查角色外貌一致性...

## 第五步: 保存图片集

按镜头编号组织文件...
```

**交互式配置**:
```typescript
export async function selectImageGenerationConfig(): Promise<ImageGenerationConfig> {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'provider',
      message: '选择图片生成服务商:',
      choices: [
        { name: '火山引擎 (高质量)', value: 'volcano' },
        { name: '阿里云 (性价比)', value: 'aliyun' },
        { name: '混合模式 (推荐)', value: 'hybrid' },
      ],
    },
    // ...
  ]);
  return answers;
}
```

**验收标准**:
- ✅ 命令在所有 13 个 AI 平台正常运行
- ✅ 交互式配置流程流畅
- ✅ 错误提示清晰准确

---

### Week 3: 集成测试与文档

#### Day 15-17: 端到端测试

**任务清单**:
1. 创建完整工作流测试
2. 性能基准测试
3. 错误场景测试

**集成测试示例**:
```typescript
describe('Image Generation Flow', () => {
  it('should complete full workflow from storyboard to images', async () => {
    // 1. 初始化项目
    await initProject();

    // 2. 导入剧本
    await importScript();

    // 3. 生成制作包
    await generateProductionPack();

    // 4. 生成分镜
    await generateStoryboard();

    // 5. 生成图片
    const result = await generateImages();

    expect(result.totalImages).toBeGreaterThan(0);
    expect(result.consistency.character).toBeGreaterThan(0.9);
  });
});
```

**性能基准**:
- 单张图片生成时间 < 30 秒
- 批量生成 100 张图片 < 1 小时
- 成本计算误差 < 5%

**验收标准**:
- ✅ 所有集成测试通过
- ✅ 性能达到基准要求
- ✅ 错误恢复机制正常

---

#### Day 18-21: 文档编写

**任务清单**:
1. 编写 API 配置指南 (`docs/API_SETUP_GUIDE.md`)
2. 编写图片生成使用指南 (`docs/IMAGE_GENERATION_GUIDE.md`)
3. 更新主 README.md
4. 创建示例项目 (`examples/with-image-generation/`)

**文档结构**:
```
docs/
├── API_SETUP_GUIDE.md          # API 密钥获取和配置
├── IMAGE_GENERATION_GUIDE.md   # 图片生成完整教程
└── OPTIMIZATION_ROADMAP.md     # 本文档

examples/
└── with-image-generation/
    ├── README.md
    ├── .env.example
    ├── spec.json
    ├── storyboard.json
    └── sample-output/
```

**验收标准**:
- ✅ 文档覆盖所有新功能
- ✅ 新手能在 30 分钟内完成配置
- ✅ FAQ 覆盖 90% 常见问题
- ✅ 示例项目可直接运行

---

## 📊 v1.2.0 - 导出增强 (第 4-5 周)

### 功能概述

**核心能力**:
- 图片提示词 CSV 导出
- 批量配置导出 (火山引擎/阿里云)
- ComfyUI 工作流导出
- Markdown 导出增强

**新增导出格式**:
- `image-prompt-csv` - 图片提示词 CSV
- `volcano-batch-json` - 火山引擎批量配置
- `aliyun-batch-json` - 阿里云批量配置
- `comfyui-workflow` - ComfyUI 工作流

### 架构扩展

```
src/exporters/
├── image-prompts.ts          # 图片提示词导出
├── batch-configs.ts          # 批量配置导出
└── workflow-exporters.ts     # 工作流导出
```

### Week 4: 新导出格式实现

#### Day 22-24: 图片提示词导出

**CSV 格式示例**:
```csv
镜号,角色,场景,正面提示词,负面提示词,种子值,尺寸,质量
001,女主,办公室,"年轻女性,长黑发...","low quality...","12345",1024x1024,high
002,女主,办公室,"年轻女性,长黑发,尴尬表情...","low quality...","12345",1024x1024,high
```

**验收标准**:
- ✅ CSV 可直接导入 Excel
- ✅ 提示词完整准确
- ✅ 支持批量编辑

---

#### Day 25-26: 批量配置导出

**火山引擎批量配置示例**:
```json
{
  "batch_id": "batch_001",
  "tasks": [
    {
      "task_id": "shot_001",
      "prompt": "年轻女性...",
      "negative_prompt": "low quality...",
      "seed": 12345,
      "width": 1024,
      "height": 1024
    }
  ]
}
```

**验收标准**:
- ✅ 批量配置可直接导入 API 平台
- ✅ ComfyUI 工作流可正常运行

---

### Week 5: 测试与发布

**任务清单**:
1. 导出功能测试
2. 性能优化
3. Bug 修复
4. 更新 CHANGELOG
5. 发布 v1.2.0

---

## 🧠 v1.3.0 - 智能优化 (第 6-8 周)

### 功能概述

**核心能力**:
- 题材适配系统 (沙雕漫/甜宠剧/虐渣类)
- 分镜质量评估工具
- 镜头优化建议引擎
- 成本预估计算器

**新增命令**:
- `/validate-storyboard` - 分镜质量评估
- `/optimize-shots` - 镜头优化建议

### 架构扩展

```
src/generators/storyboard/
├── genre-adapter.ts          # 题材适配器
├── shot-optimizer.ts         # 镜头优化引擎
└── quality-validator.ts      # 质量评估器

src/utils/
└── cost-calculator.ts        # 成本计算器
```

### Week 6-7: 题材适配与质量评估

#### 题材适配规则

**沙雕漫优化规则**:
- 夸张表情特写增加 30%
- 添加搞笑音效提示
- 建议反差镜头组合

**甜宠剧优化规则**:
- 增加甜蜜特写镜头
- 建议粉色调色板
- 添加氛围光效提示

**虐渣类优化规则**:
- 打脸镜头节奏加快
- 添加冲击音效标注
- 建议震撼运镜方式

**验收标准**:
- ✅ 支持 5 种主流题材
- ✅ 优化建议准确率 ≥ 85%

---

### Week 8: 最终测试与发布

**任务清单**:
1. 完整回归测试
2. 性能压力测试
3. 用户验收测试
4. 编写完整文档
5. 发布 v1.3.0

---

## ✅ 总体验收标准

### 技术指标
- ✅ 代码测试覆盖率 ≥ 80%
- ✅ API 调用成功率 ≥ 95%
- ✅ 单张图片生成时间 < 30 秒
- ✅ 批量生成 100 张 < 1 小时

### 质量指标
- ✅ 角色一致性准确率 ≥ 90%
- ✅ 场景一致性准确率 ≥ 85%
- ✅ 分镜质量评分系统准确率 ≥ 85%

### 用户体验指标
- ✅ 新手配置完成时间 < 30 分钟
- ✅ 完整工作流程流畅度 ≥ 90%
- ✅ 文档覆盖率 100%

### 商业指标
- ✅ 单集制作成本降低 70-85%
- ✅ 制作效率提升 80%
- ✅ 用户工作流完整度 85%

---

## 🚨 风险管理

### 高风险项

**1. API 稳定性依赖**
- **风险**: 第三方 API 服务中断
- **缓解**: 实现多提供商降级机制
- **应对**: 本地缓存 + 重试机制

**2. 成本控制失效**
- **风险**: 超出预算限制
- **缓解**: 严格的成本追踪和预警
- **应对**: 硬性每日限额保护

**3. 一致性准确率不达标**
- **风险**: 角色一致性 < 90%
- **缓解**: 加强参考档案系统
- **应对**: 人工筛选 + AI 辅助

### 中等风险项
1. 性能瓶颈
2. 文档完整度
3. 用户学习曲线

---

## 📚 交付物清单

### v1.1.0
- [x] 源代码 (API 集成 + 图片生成)
- [x] 单元测试 (≥80% 覆盖率)
- [x] 集成测试
- [x] API 配置指南
- [x] 用户使用指南
- [x] 示例项目

### v1.2.0
- [ ] 源代码 (导出增强)
- [ ] 导出格式文档
- [ ] 格式规范说明

### v1.3.0
- [ ] 源代码 (智能优化)
- [ ] 完整技术文档
- [ ] 最佳实践指南
- [ ] 成本优化建议

---

## 🎓 团队能力要求

### 必需技能
- ✅ TypeScript/Node.js 开发
- ✅ REST API 集成
- ✅ 异步编程 (Promise/async/await)
- ✅ 单元测试编写

### 推荐技能
- ✅ AI 提示词工程经验
- ✅ 图片处理基础知识
- ✅ CLI 工具开发经验

### 团队配置建议
- **单人团队**: 8-10 周完成
- **2 人团队**: 5-6 周完成
- **3 人团队**: 4-5 周完成

---

## 📞 下一步行动

### 立即开始 (本周内)
1. ✅ **确认技术方案** - 审阅本文档,提出疑问
2. ✅ **注册 API 服务** - 火山引擎 + 阿里云账号
3. ✅ **搭建开发环境** - 安装依赖,配置 IDE

### 第 1 周启动
1. ✅ **创建开发分支** - `feature/image-generation`
2. ✅ **开始 Task 1.1** - 更新依赖包
3. ✅ **建立看板** - GitHub Projects 或 Trello

---

## 📖 参考资料

### 项目文档
- [Storyboardify README](../README.md)
- [AI 漫剧制作完整流程](./AI漫剧制作完整流程.md)
- [AI 漫剧制作流程图](./AI漫剧制作流程图.md)

### 技术文档
- [火山引擎文生图 API](https://www.volcengine.com/docs/api/)
- [阿里云通义万相 API](https://help.aliyun.com/)
- [ComfyUI 文档](https://github.com/comfyanonymous/ComfyUI)

### 相关项目
- [Scriptify](https://github.com/wordflowlab/scriptify)
- [WordFlowLab](https://github.com/wordflowlab)

---

**文档版本**: v1.0
**最后更新**: 2025-11-02
**维护者**: Storyboardify Team
**状态**: ✅ 计划已批准,准备开始实施
