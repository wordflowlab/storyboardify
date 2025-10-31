# Proposal: Add Storyboardify - Complete Storyboard Creation Tool

## Why

**Problem**: 当前生态中缺少从剧本到分镜的桥梁工具。创作者在 Scriptify 完成剧本后,需要:
- 手动创建人物/场景设定表(2-3小时/项目)
- 手动设计分镜脚本(2-3天/集,成本¥1000-3000)
- 手动编写AI绘图Prompt(1-2小时,且一致性难保证)
- 缺少运镜参数标准化工具

**Opportunity**:
- 短剧市场爆发(2024年GMV超300亿),编剧和分镜师需求旺盛
- AI绘图技术成熟(MidJourney/SD),但缺少生成优质Prompt的工具
- 动态漫画制作门槛降低(AE/Live2D/剪映),需要标准化的分镜输入
- Scriptify 已有 10,000+ 潜在用户,天然的数据源头

**Market Validation**:
- 目标用户: 短剧编剧、独立漫画家、短视频创作者、制作团队
- 预估 TAM: ¥10亿+/年
- 竞品分析: Final Draft(仅剧本)、Storyboard Pro(无AI辅助,¥500)
- 差异化优势: AI驱动 + 与Scriptify无缝衔接 + 三工作区适配

## What Changes

### 核心功能模块 (4个)

#### 1. 剧本转制作包生成 (P0)
- 导入 Scriptify JSON 导出数据
- 生成详细人物设定表(外观/性格/绘图Prompt)
- 生成场景设定表(环境/配色/光影/绘图Prompt)
- 自动提取角色关系网络和场景复用建议

#### 2. 分镜脚本生成系统 (P0)
- 支持三模式创作(教练/快速/混合模式)
- 场景智能拆分(分析时间/地点/角色变化)
- 镜头自动设计(景别/角度/运镜/时长)
- 分镜四要素标注(基础信息/运镜参数/情绪标注/动态效果)

#### 3. 三工作区系统 (P1)
- **漫画工作区**: 翻页位置、气泡/旁白、页数估算
- **短视频工作区**: 竖屏构图(9:16)、字幕/配音、时间轴
- **动态漫工作区**: 图层结构、3D参数、AE脚本生成

#### 4. 审校与多格式导出 (P0)
- 三遍审校(内容连贯性/风格一致性/细节完整性)
- 导出格式: Markdown, PDF, 剪映JSON, AE JSX脚本, PR XML
- 工作区特定导出(漫画→PSD模板, 短视频→剪映, 动态漫→AE项目结构)

### 技术架构 (继承 Scriptify)

**复用 Scriptify 架构**:
- ✅ Slash Command 三层架构(Markdown指令层 + AI执行层 + Bash脚本层)
- ✅ 13个AI平台命令生成(Claude Code/Cursor/Gemini等)
- ✅ 三模式系统框架(教练/快速/混合)
- ✅ TypeScript + Commander.js CLI
- ✅ Bash + PowerShell 跨平台脚本

**Storyboardify 特有扩展**:
- 🆕 工作区系统(根据目标平台动态调整输出格式)
- 🆕 分镜四要素规范引擎
- 🆕 Scriptify JSON 数据解析器
- 🆕 绘图 Prompt 生成引擎(MidJourney/SD/ControlNet)
- 🆕 多格式导出器(剪映JSON/AE JSX/PR XML)

### 核心 Slash Commands (10个)

1. `/specify` - 初始化分镜项目,选择工作区
2. `/import` - 导入 Scriptify 剧本(JSON格式)
3. `/characters-pack` - 生成人物设定表
4. `/scenes-pack` - 生成场景设定表
5. `/prompts-gen` - 生成绘图Prompt库
6. `/storyboard` - 生成分镜脚本(三模式)
7. `/camera` - 运镜参数优化建议
8. `/fill` - 填充混合模式框架细节
9. `/review` - 三遍审校检查
10. `/export` - 多格式导出

## Impact

### Affected Specs (新增 5个 capabilities)

1. **production-pack-generation** (ADDED)
   - Requirement: Import Scriptify Data
   - Requirement: Generate Character Design Sheets
   - Requirement: Generate Scene Design Sheets
   - Requirement: Generate Drawing Prompts

2. **storyboard-generation** (ADDED)
   - Requirement: Three-Mode Storyboard Creation
   - Requirement: Scene Splitting Algorithm
   - Requirement: Shot Design Automation
   - Requirement: Camera Movement Annotation

3. **three-mode-system** (ADDED)
   - Requirement: Coach Mode (AI-Guided)
   - Requirement: Express Mode (AI-Generated)
   - Requirement: Hybrid Mode (Collaborative)
   - Requirement: Mode Switching

4. **workspace-system** (ADDED)
   - Requirement: Manga Workspace
   - Requirement: Short-Video Workspace
   - Requirement: Dynamic-Manga Workspace
   - Requirement: Workspace-Specific Export

5. **scriptify-integration** (ADDED)
   - Requirement: JSON Import Parsing
   - Requirement: Data Schema Compatibility
   - Requirement: Bi-Directional Sync (Future)

### Affected Code

**新增项目**:
- `storyboardify/` - 独立npm包项目
  - `src/cli.ts` - CLI入口
  - `src/modes/` - 三模式实现
  - `src/utils/` - 工具函数
  - `src/exporters/` - 多格式导出器
  - `scripts/bash/` - POSIX脚本
  - `scripts/powershell/` - PowerShell脚本
  - `templates/commands/` - 10个命令模板

**数据流转**:
- Scriptify → JSON导出 → Storyboardify导入
- 标准格式: `scriptify_export v1.0`(包含project/characters/scenes/scripts)

### Breaking Changes

**NONE** - Storyboardify 是独立项目,不影响 Scriptify 现有功能。

### Migration Plan

**Phase 1**: Storyboardify MVP (2025 Q3)
- 核心功能: 制作包生成 + 分镜生成 + 单一工作区(漫画)
- 目标用户: 漫画工作室、独立漫画家

**Phase 2**: 完整三工作区 (2025 Q4)
- 新增: 短视频工作区、动态漫工作区
- 多格式导出完善(剪映JSON/AE脚本/PR XML)

**Phase 3**: 生态集成 (2026 Q1)
- Scriptify → Storyboardify 一键导入
- 素材库共享(角色/场景模板复用)
- 第三方工具集成(MidJourney/AE)

### User Impact

**Positive**:
- ⏱ 时间节省: 分镜制作从2-3天降至30-90分钟(快速模式)
- 💰 成本降低: 无需外包分镜师(¥1000-3000/集)
- 🎨 质量提升: AI辅助保证分镜规范性和一致性
- 🔗 数据衔接: 与Scriptify无缝集成,无需重复输入

**Considerations**:
- 学习曲线: 新工具需要1-2小时熟悉(提供示例项目和教程)
- AI依赖: 快速模式需要审校AI生成内容(提供审校检查清单)

### Dependencies

**External**:
- Scriptify v0.5.0+ (JSON导出格式兼容性)
- Node.js 18+
- TypeScript 5.3+
- @commander-js/extra-typings
- chalk, fs-extra, inquirer, ora

**Optional**:
- MidJourney API (Prompt生成后手动使用)
- Stable Diffusion (本地或API)
- Adobe After Effects (导入AE脚本)
- 剪映专业版 (导入JSON工程文件)

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| AI生成质量不稳定 | Medium | High | 三模式设计,用户可选择掌控度 |
| 分镜参数准确性 | Medium | Medium | 提供审校工具 + 参数验证 |
| 多格式导出兼容性 | Low | Medium | 严格遵循官方格式规范 |
| Scriptify数据格式变更 | Low | High | 版本兼容性检查,向下兼容 |

## Success Metrics

**6个月目标** (2025 Q4):
- 月活用户: 2,000
- 分镜生成量: 10,000个
- 时间节省: 60%
- 用户留存率: 30%

**12个月目标** (2026 Q2):
- 月活用户: 10,000
- 分镜生成量: 100,000个
- 付费转化率: 5%
- MRR: ¥50,000

## Open Questions

1. **定价策略**: 免费版功能范围?(建议: 基础分镜 + 50个/月限额)
2. **Scriptify集成深度**: 是否需要Scriptify内置导出按钮直接跳转Storyboardify?
3. **素材库**: 是否在MVP阶段实现素材库管理?(建议: Phase 2)
4. **第三方集成优先级**: MidJourney vs Stable Diffusion?(建议: MidJourney优先,用户量大)
