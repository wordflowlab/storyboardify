# Storyboardify

> AI驱动的分镜脚本创作工具 - 从剧本到制作包的完整解决方案

[![MVP Phase 1](https://img.shields.io/badge/MVP-Phase%201%20Complete-brightgreen)](./IMPLEMENTATION_STATUS.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-green)](https://nodejs.org/)

Storyboardify 是一款专为漫画、短视频和动态漫制作设计的AI辅助分镜脚本创作工具。它能将Scriptify导出的剧本自动转换为详细的分镜脚本和完整的制作包。

## 📊 实施状态

**当前版本**: MVP Phase 1 + AI生成系统 (Phase 2) ✅
**核心功能完成度**: 90%
**可用命令**: 6个
**支持工作区**: 3个
**AI生成器**: ✅ 场景拆分 + 运镜优化 + Express模式

查看详细状态:
- [Phase 1 状态](./IMPLEMENTATION_STATUS.md)
- [Phase 2 AI系统实施报告](./PHASE2_AI_IMPLEMENTATION.md)

## ✨ 核心功能

### 1. 剧本转制作包 ✅
- ✅ 导入Scriptify JSON格式剧本
- ✅ 自动生成人物设定表（含外观、性格、绘画提示词）
- ✅ 自动生成场景设定表（含布局、光源、色调、氛围）
- ✅ MidJourney/Stable Diffusion提示词生成

### 2. 分镜脚本生成 ✅
- ✅ **四要素注释系统**：基础信息、运镜参数、情绪标注、动态效果
- ✅ **智能镜头规划**：景别/角度/运镜方式/时长/转场
- ✅ 支持对话/旁白/音效标注
- ✅ **AI驱动智能生成** (Phase 2完成)
  - 场景智能拆分 (复杂度分析 + 节奏检测)
  - 运镜参数优化 (类型/速度/角度/景深)
  - Express模式全自动生成

### 3. 三模式工作流 ✅
- ✅ **Coach模式**：AI引导式学习创作，适合新手（互动式，10-20分钟）
  - 逐步提问引导
  - 内置电影知识教育
  - 支持深度学习 (Learn More)
  - 可保存进度随时恢复
- ✅ **Express模式**：AI全自动生成完整分镜（快速，1-2分钟）
- ✅ **Hybrid模式**：AI生成框架+用户精调（专业，20-30分钟）
  - AI生成初始框架
  - 用户填充细节内容
  - 实时验证和建议
  - 支持跳过/跳转导航
  - 可保存进度随时恢复

### 4. 三工作区系统 ✅
- ✅ **漫画工作区** (4:3)：翻页位置、气泡位置、页数估算
- ✅ **短视频工作区** (9:16)：时间轴、字幕、配音参数
- ✅ **动态漫工作区** (16:9)：帧数范围、图层结构、3D参数

### 5. 导出系统 🚧
- ✅ **Markdown** - 通用文档格式
- 🚧 **PDF** - 打印友好格式 (Phase 2)
- 🚧 **Excel** - 漫画工作区专用 (Phase 2)
- 🚧 **剪映JSON** - 短视频/动态漫工作区 (Phase 2)
- 🚧 **After Effects JSX** - 动态漫工作区 (Phase 2)
- 🚧 **Premiere Pro XML** - 短视频/动态漫工作区 (Phase 2)

## 🚀 快速开始

### 安装

```bash
# 克隆仓库
git clone https://github.com/wordflowlab/storyboardify.git
cd storyboardify

# 安装依赖
npm install

# 构建项目
npm run build

# 链接到全局(可选)
npm link
```

### 完整工作流示例

```bash
# 1. 初始化新项目
storyboardify specify
# 按提示输入: 项目名称、选择工作区(漫画/短视频/动态漫)、选择模式(Express)

# 2. 导入Scriptify剧本
storyboardify import examples/test-import.json
# 自动检测缺失字段并生成报告

# 3. 生成制作包(人物+场景设定表)
storyboardify preproduce
# 输出: production-pack.json + docs/目录下的Markdown文档

# 4. 生成分镜脚本
storyboardify generate
# 系统会询问您的经验水平并推荐合适的模式:
# - Express 模式: 全自动AI生成 (快速，1-2分钟)
# - Coach 模式: AI引导式学习创作 (互动，10-20分钟，适合新手)
# - Hybrid 模式: AI框架+用户精调 (专业，20-30分钟)
# 
# 或直接指定模式:
# storyboardify generate --mode express
# storyboardify generate --mode coach
# storyboardify generate --mode hybrid
# 
# 输出: storyboard.json

# 5. 查看项目状态
storyboardify status
# 显示完整工作流状态和统计信息

# 6. 导出最终文件
storyboardify export --format markdown
# 输出: exports/storyboard.md
```

### 项目结构示例

执行完整工作流后,会生成如下目录结构:

```
projects/心理游戏/
├── .storyboardify/
│   └── config.json                   # 项目配置
├── scriptify-import.json             # 导入的原始数据
├── production-pack.json              # 制作包数据
├── storyboard.json                   # 分镜数据
├── docs/
│   ├── production-pack-overview.md   # 制作包总览
│   ├── characters/                   # 人物设定表
│   │   ├── char_001-李墨.md
│   │   ├── char_002-林雪.md
│   │   └── char_003-王队长.md
│   └── scenes/                       # 场景设定表
│       ├── scene_001-雨夜街头.md
│       ├── scene_002-心理诊所.md
│       └── scene_003-警局审讯室.md
└── exports/
    └── storyboard.md                 # 导出的分镜脚本
```

## 📖 命令参考

### `specify` - 初始化项目

交互式创建新的Storyboardify项目。

```bash
storyboardify specify
```

**功能**:
- 输入项目名称
- 选择工作区类型(漫画/短视频/动态漫)
- 选择生成模式(Express/Coach/Hybrid)
- 自动创建项目目录结构
- 生成项目配置和README

### `import <file>` - 导入剧本

导入Scriptify导出的JSON剧本文件。

```bash
storyboardify import <scriptify-export.json>
```

**功能**:
- 解析Scriptify JSON格式
- 验证数据完整性
- 检测缺失字段并生成报告
- 保存到项目目录

**示例输出**:
```
✓ 成功导入 3 个角色
✓ 成功导入 3 个场景
⚠ 检测到 7 个缺失字段
```

### `preproduce [project]` - 生成制作包

生成人物设定表和场景设定表。

```bash
storyboardify preproduce [项目路径]
```

**功能**:
- 自动扩展人物外观描述
- 推断人物性格特征
- 生成MidJourney/SD绘画提示词(全身/特写/侧面)
- 生成场景色彩方案(Hex色码)
- 生成光照设置和布局描述
- 导出JSON数据和Markdown文档

**输出文件**:
- `production-pack.json` - 完整制作包数据
- `docs/production-pack-overview.md` - 总览文档
- `docs/characters/*.md` - 各人物设定表
- `docs/scenes/*.md` - 各场景设定表

### `generate [project]` - 生成分镜

生成完整的分镜脚本。

```bash
storyboardify generate [项目路径] [选项]

选项:
  -m, --mode <mode>  生成模式: coach/express/hybrid (默认: express)
```

**功能**:
- 基于制作包生成分镜
- 智能分配景别(全景/中景/特写等)
- 自动规划运镜方式(推/拉/摇/移等)
- 生成情绪标注
- 估算页数/时长

**当前实现**: 使用Mock生成器(算法式),Phase 2将实现完整AI驱动生成

### `export [project]` - 导出文件

将分镜脚本导出为指定格式。

```bash
storyboardify export [项目路径] [选项]

选项:
  -f, --format <format>  导出格式: markdown/pdf/excel/jianying-json/ae-jsx/pr-xml
                         (默认: markdown)
  -o, --output <path>    输出文件路径(可选)
```

**当前支持格式**:
- ✅ `markdown` - Markdown文档(包含完整元数据和镜头表)

**Phase 2计划格式**:
- 🚧 `pdf` - PDF文档
- 🚧 `excel` - Excel表格(漫画工作区)
- 🚧 `jianying-json` - 剪映JSON(短视频/动态漫)
- 🚧 `ae-jsx` - After Effects脚本(动态漫)
- 🚧 `pr-xml` - Premiere XML(短视频/动态漫)

### `status [project]` - 查看状态

显示项目当前状态和统计信息。

```bash
storyboardify status [项目路径]
```

**显示内容**:
- 项目基本信息(名称、工作区、模式)
- 工作流完成状态(导入→制作包→分镜)
- 详细统计(角色数、场景数、镜头数、预估时长/页数)
- 已导出文件列表
- 建议的下一步操作

**示例输出**:
```
📊 项目状态

项目名称: 心理游戏
工作区: 漫画工作区 (4:3)
生成模式: 快速模式
项目路径: /Users/.../projects/心理游戏

📋 工作流状态

✅ 1. 导入剧本: 已完成
   文件: scriptify-import.json (15.23 KB)

✅ 2. 生成制作包: 已完成
   文件: production-pack.json (28.47 KB)

✅ 3. 生成分镜: 已完成
   文件: storyboard.json (45.12 KB)

📈 详细统计

导入数据:
  - 角色数: 3
  - 场景数: 3
  - 剧本集数: 1
  - 总字数: 15000

制作包:
  - 人物设定表: 3
  - 场景设定表: 3

分镜脚本:
  - 场景数: 3
  - 总镜头数: 12
  - 预估页数: 4 页

💡 建议的下一步操作

  ✓ 工作流已完成!
  → 运行 storyboardify export 导出最终文件
  → 或编辑 storyboard.json 手动调整分镜
```

### `review [project]` - 审校分镜

审校和优化分镜脚本。

```bash
storyboardify review [项目路径]
```

**状态**: 🚧 Phase 2功能,暂未实现

## 🛠️ 技术栈

- **语言**: TypeScript 5.3 (严格模式)
- **运行时**: Node.js ≥ 18.0.0
- **CLI框架**: Commander.js
- **交互式提示**: Inquirer.js
- **文件操作**: fs-extra
- **代码质量**: ESLint + Prettier + Husky
- **构建工具**: tsc

## 💻 开发

### 环境准备

```bash
# 克隆仓库
git clone https://github.com/wordflowlab/storyboardify.git
cd storyboardify

# 安装依赖
npm install
```

### 开发命令

```bash
# 构建项目
npm run build

# 开发模式(监听文件变化)
npm run dev

# 代码检查
npm run lint

# 代码格式化
npm run format

# 类型检查
npm run type-check

# 运行测试 (Phase 2)
npm test
```

### 本地测试

```bash
# 链接到全局
npm link

# 在任何目录使用
storyboardify --help

# 取消链接
npm unlink -g storyboardify
```

## 📂 项目结构

```
storyboardify/
├── src/
│   ├── cli.ts                    # CLI入口点
│   ├── types/
│   │   └── index.ts              # 核心类型定义
│   ├── commands/                 # 命令实现
│   │   ├── specify.ts            # /specify命令
│   │   ├── import.ts             # /import命令
│   │   ├── preproduce.ts         # /preproduce命令
│   │   ├── generate.ts           # /generate命令
│   │   ├── export.ts             # /export命令
│   │   └── status.ts             # /status命令
│   ├── importers/                # 数据导入器
│   │   └── scriptify.ts          # Scriptify导入器
│   ├── generators/               # 内容生成器
│   │   ├── character-sheet.ts    # 人物设定表生成
│   │   ├── scene-sheet.ts        # 场景设定表生成
│   │   └── mock-storyboard.ts    # Mock分镜生成器
│   ├── exporters/                # 导出器
│   │   ├── base.ts               # 导出器基类
│   │   ├── markdown.ts           # Markdown导出器
│   │   └── registry.ts           # 导出器注册表
│   ├── workspaces/               # 工作区配置
│   │   └── configs.ts            # 三工作区配置
│   └── utils/                    # 工具函数
│       ├── file.ts               # 文件操作
│       ├── format.ts             # 格式化
│       └── validation.ts         # 验证
├── openspec/                     # OpenSpec规范
│   └── changes/
│       └── add-storyboardify-complete/
│           ├── proposal.md       # 变更提案
│           ├── design.md         # 设计文档
│           ├── tasks.md          # 任务清单
│           └── IMPLEMENTATION_REPORT.md  # 实施报告
├── examples/                     # 示例文件
│   └── test-import.json          # 测试用Scriptify导出
├── docs/                         # 文档(Phase 2)
├── tests/                        # 测试(Phase 2)
├── IMPLEMENTATION_STATUS.md      # 实施状态
└── README.md                     # 本文件
```

## 🧪 测试

当前使用手动端到端测试验证功能。Phase 2将添加完整的自动化测试套件。

**手动测试流程**:
```bash
# 1. 使用示例数据测试完整工作流
storyboardify specify
# 输入: 心理游戏, 漫画工作区, Express模式

storyboardify import examples/test-import.json
storyboardify preproduce
storyboardify generate
storyboardify status
storyboardify export --format markdown

# 2. 验证输出文件
ls -lh projects/心理游戏/
cat projects/心理游戏/exports/storyboard.md
```

## 📋 实施路线图

### ✅ Phase 1: MVP (已完成)
- [x] 项目基础设施
- [x] Scriptify数据导入
- [x] 制作包生成(人物+场景设定表)
- [x] 工作区配置系统
- [x] Mock分镜生成器
- [x] Markdown导出
- [x] 项目管理命令(specify/status)

### ✅ Phase 2: AI驱动生成 (已完成)
- [x] 场景智能拆分算法
  - [x] 复杂度分析 (简单/中等/复杂)
  - [x] 节奏检测 (快/中/慢)
  - [x] 智能镜头数估算
- [x] 运镜参数优化器
  - [x] 智能选择运镜类型
  - [x] 自动优化速度和角度
  - [x] 景深和时长估算
- [x] Express模式完整实现
  - [x] 全自动生成流程
  - [x] 工作区特定字段生成
  - [x] 详细统计和预览

### 🚧 Phase 3: 高级功能(规划中)
- [ ] Coach和Hybrid模式
  - [ ] Coach模式(交互式引导)
- [ ] 多格式导出器
  - [ ] PDF导出器
  - [ ] Excel导出器(漫画工作区)
  - [ ] 剪映JSON导出器(短视频/动态漫)
  - [ ] After Effects JSX导出器(动态漫)
  - [ ] Premiere XML导出器(短视频/动态漫)
- [ ] 审校系统(/review命令)
  - [ ] 内容连贯性检查
  - [ ] 风格一致性检查
  - [ ] 细节完整性检查
- [ ] 测试覆盖
  - [ ] 单元测试(>70%覆盖率)
  - [ ] 集成测试
  - [ ] E2E测试
- [ ] 文档完善
  - [ ] API文档
  - [ ] 用户指南
  - [ ] 示例项目库

### 📅 Phase 3: 生态整合(未来)
- [ ] 13个AI平台集成(Claude Code/Cursor/Gemini等)
- [ ] 素材库管理系统
- [ ] 在线协作功能
- [ ] 插件系统

## 🤝 贡献

欢迎贡献! 请查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解详情。

### 开发流程
1. Fork本仓库
2. 创建特性分支(`git checkout -b feature/AmazingFeature`)
3. 提交更改(`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支(`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 📄 许可证

MIT © Storyboardify Team

查看 [LICENSE](./LICENSE) 文件了解详情。

## 🔗 相关项目

- [Scriptify](https://github.com/wordflowlab/scriptify) - AI驱动的剧本创作工具
- [WordFlowLab](https://github.com/wordflowlab) - 文字内容创作工具生态

## 📞 联系与支持

- **问题反馈**: [GitHub Issues](https://github.com/wordflowlab/storyboardify/issues)
- **功能请求**: [GitHub Discussions](https://github.com/wordflowlab/storyboardify/discussions)
- **文档**: [完整文档](./docs/) (Phase 2)

## 🙏 致谢

本项目遵循 [OpenSpec](https://openspec.dev) 规范进行开发,采用渐进式实施策略,优先实现最小可行产品(MVP),后续持续迭代增强功能。

---

**当前状态**: MVP Phase 1 ✅ **完成**
**最后更新**: 2025-10-30
**维护者**: WordFlowLab Team
