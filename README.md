# Storyboardify - AI 驱动的分镜创作工具

> **版本**: v1.0.0
> **状态**: ✅ 核心功能已实现
> **定位**: 专注分镜创作阶段的AI辅助工具

**核心价值**: 将 Scriptify 剧本转换为专业分镜脚本和完整制作包

## ⚠️ 产品边界

**Storyboardify 专注于分镜创作**,不涉及拍摄、制作、剪辑等后期环节。

✅ **做什么**:
- Scriptify 剧本导入
- 自动生成人物和场景设定表
- 智能分镜生成 (Express/Coach/Hybrid 三种模式)
- 多格式导出

❌ **不做什么**:
- 剧本创作 (请使用 Scriptify)
- 视觉资产生成
- 动态制作和剪辑
- 配音和视频渲染

💡 **如需完整制作流程**: 查看生态系统文档

---

## 🎯 核心功能

### 1. 制作包生成
- 自动生成人物设定表（外观、性格、绘画提示词）
- 自动生成场景设定表（布局、光源、色调、氛围）
- MidJourney/Stable Diffusion 提示词生成

### 2. 分镜脚本生成
- **Express 模式**: 全自动AI生成 (快速，1-2分钟)
- **Coach 模式**: AI引导式学习创作 (互动，10-20分钟，适合新手)
- **Hybrid 模式**: AI框架+用户精调 (专业，20-30分钟)
- 智能镜头规划：景别/角度/运镜方式/时长/转场

### 3. 三工作区支持
- **漫画工作区** (4:3)：翻页位置、气泡位置、页数估算
- **短视频工作区** (9:16)：时间轴、字幕、配音参数
- **动态漫工作区** (16:9)：帧数范围、图层结构、3D参数

---

## 📦 安装

```bash
npm install -g ai-storyboardify
```

或本地开发:

```bash
git clone https://github.com/wordflowlab/storyboardify.git
cd storyboardify
npm install
npm run build
```

---

## 🚀 快速开始

### 1. 在 AI 助手中使用 Slash Commands

**推荐用法** - 在 Claude/Cursor 等 AI 助手中使用：

```bash
/specify         # 定义项目规格（工作区、模式）
/import          # 导入 Scriptify 剧本
/preproduce      # 生成制作包（人物+场景设定表）
/generate-express   # Express 模式（全自动）
/generate-coach     # Coach 模式（AI引导）
/generate-hybrid    # Hybrid 模式（AI框架+用户）
/export          # 导出分镜脚本
```

**命令行用法**:

```bash
storyboardify specify
storyboardify import <scriptify.json>
storyboardify preproduce
storyboardify generate-express  # 或 generate-coach / generate-hybrid
storyboardify export
```

### 2. 完整工作流示例

```bash
# 1. 定义项目规格
/specify
# AI引导选择：工作区(manga/short-video/dynamic-manga)、生成模式(express/coach/hybrid)

# 2. 导入 Scriptify 剧本
/import examples/test-import.json

# 3. 生成制作包
/preproduce
# AI生成人物和场景设定表

# 4. 生成分镜脚本
/generate-coach    # Coach模式：AI逐步引导
# 或
/generate-express  # Express模式：全自动生成
# 或
/generate-hybrid   # Hybrid模式：AI框架+用户填充

# 5. 导出分镜
/export
# AI引导选择导出格式（Markdown/Excel/剪映JSON等）
```

---

## 📚 命令列表

### 项目管理
- `/specify` - 定义项目规格

### 数据导入
- `/import` - 导入 Scriptify 剧本

### 内容生成
- `/preproduce` - 生成制作包（人物+场景设定表）

### 分镜生成
- `/generate-express` - Express模式（全自动AI生成）
- `/generate-coach` - Coach模式（AI引导式学习创作）
- `/generate-hybrid` - Hybrid模式（AI框架+用户精调）

### 导出
- `/export` - 导出分镜脚本

---

## 🏗 架构设计

Storyboardify 基于 Slash Command 三层架构:

```
Markdown指令层 (templates/commands/*.md)
  → 定义"做什么" (检查标准和原则)
  → 不是对话脚本!

AI执行层
  → 决定"怎么做" (灵活理解和执行)
  → 不是机械执行预设流程!

Bash脚本层 (scripts/bash/*.sh)
  → 执行"具体操作" (文件操作 + 输出JSON)
  → 不包含业务逻辑!
```

详见: `openspec/changes/refactor-to-slash-command/`

---

## 📖 文档导航

### 🚀 快速开始
- **本文档** - 快速入门 ⭐ 新手必读

### 📚 技术文档
- **[架构说明](./openspec/changes/refactor-to-slash-command/proposal.md)** ⭐ 理解设计必读
- **[测试报告](./TEST_RESULTS.md)** - 测试结果
- **[OpenSpec 变更](./openspec/changes/)** - 详细变更提案

---

## 🛣 开发路线图

**Phase 1: MVP** (已完成 ✅)
- 核心命令实现
- 三层架构
- 基础功能

**Phase 2: 增强功能** (进行中 🚧)
- 多格式导出器
- 性能优化
- 用户体验改进

**Phase 3: 生态整合** (规划中 📋)
- 13个AI平台集成
- 在线协作功能
- 插件系统

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request!

---

## 📄 License

MIT License

---

## 🔗 相关项目

- [Scriptify](https://github.com/wordflowlab/scriptify) - AI驱动的剧本创作工具
- [WordFlowLab](https://github.com/wordflowlab) - 文字内容创作工具生态

---

**版本**: v1.0.0
**发布日期**: 2025-10-31
**状态**: ✅ 核心功能完成,Slash Command 架构
