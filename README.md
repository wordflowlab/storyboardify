# Storyboardify

> AI驱动的分镜脚本创作工具 - 从剧本到制作包的完整解决方案

Storyboardify 是一款专为漫画、短视频和动态漫制作设计的AI辅助分镜脚本创作工具。它能将Scriptify导出的剧本自动转换为详细的分镜脚本和完整的制作包。

## 核心功能

### 1. 剧本转制作包
- 导入Scriptify JSON格式剧本
- 自动生成人物设定表（含外观、性格、绘画提示词）
- 自动生成场景设定表（含布局、光源、色调、氛围）

### 2. 分镜脚本生成
- **四要素注释系统**：基础信息、运镜参数、情绪标注、动态效果
- **智能镜头规划**：景别/角度/运镜方式/时长/转场
- 支持对话/旁白/音效标注

### 3. 三模式工作流
- **Coach模式**：AI提问引导，用户手动创建
- **Express模式**：AI全自动生成完整分镜
- **Hybrid模式**：AI生成框架，用户补充细节

### 4. 三工作区系统
- **漫画工作区** (4:3)：翻页位置、气泡位置、页数估算
- **短视频工作区** (9:16)：时间轴、字幕、配音参数
- **动态漫工作区** (16:9)：帧数范围、图层结构、3D参数

## 快速开始

### 安装

```bash
npm install -g ai-storyboardify
```

### 基本使用

```bash
# 初始化项目
storyboardify /specify

# 导入Scriptify剧本
storyboardify /import scriptify-export.json

# 生成制作包
storyboardify /preproduce

# 生成分镜（Express模式）
storyboardify /generate --mode express

# 导出分镜
storyboardify /export --format markdown
```

## 导出格式

- **Markdown** - 通用文档格式
- **PDF** - 打印友好格式
- **Excel** - 漫画工作区专用
- **剪映JSON** - 短视频/动态漫工作区
- **After Effects JSX** - 动态漫工作区
- **Premiere Pro XML** - 短视频/动态漫工作区

## 系统要求

- Node.js >= 18.0.0
- 推荐使用Claude Code、Cursor等AI编程环境

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 测试
npm test

# 代码检查
npm run lint
npm run format
```

## 文档

- [完整文档](./docs/)
- [使用示例](./docs/examples/)
- [API参考](./docs/api/)

## 许可证

MIT © Storyboardify Team

## 相关项目

- [Scriptify](https://github.com/wordflowlab/scriptify) - AI驱动的剧本创作工具
