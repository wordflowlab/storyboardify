# Design: Storyboardify Technical Architecture

## Context

**Background**:
- Scriptify (v0.5.0) 已成功实现剧本创作阶段,采用 Slash Command 三层架构
- 用户需要从剧本(Scriptify输出)无缝过渡到分镜制作(Storyboardify输入)
- 目标用户包含不同制作平台需求:漫画工作室(快看/腾讯动漫)、短视频创作者(抖音/快手)、动态漫制作团队(AE/Live2D)

**Constraints**:
- 必须保持与 Scriptify 数据格式兼容(JSON v1.0)
- 必须支持跨平台(macOS/Linux/Windows)
- 必须支持 13个AI编程助手(Claude Code/Cursor/Gemini等)
- CLI工具,不做GUI(降低开发复杂度)

**Stakeholders**:
- 短剧编剧(已有剧本,需要快速分镜)
- 漫画工作室(需要标准化分镜流程)
- 短视频UP主(追求效率,9:16竖屏)
- 独立创作者(全流程使用 Scriptify → Storyboardify)

## Goals / Non-Goals

### Goals
1. ✅ **架构复用**: 继承 Scriptify 的 Slash Command 三层架构,降低开发成本
2. ✅ **数据衔接**: 无缝导入 Scriptify JSON,保证人物/场景一致性
3. ✅ **多平台适配**: 三工作区系统动态调整输出格式
4. ✅ **AI辅助**: 三模式系统(教练/快速/混合),满足不同掌控度需求
5. ✅ **标准化输出**: 分镜四要素规范,保证制作包质量

### Non-Goals
1. ❌ **AI绘图执行**: 只生成 Prompt,不调用 MidJourney/SD API(避免成本和API限制)
2. ❌ **视频渲染**: 不做AE/剪映的执行,只导出工程文件
3. ❌ **实时协作**: MVP阶段不支持多人协作(Phase 2考虑)
4. ❌ **素材库**: MVP阶段不实现素材库管理(Phase 2功能)

## Decisions

### Decision 1: 架构选择 - 继承 Scriptify 三层架构

**选择**: 完全复用 Scriptify 的 Slash Command 架构

**理由**:
- ✅ **成熟验证**: Scriptify 已验证可行性,降低风险
- ✅ **用户熟悉**: Scriptify 用户无学习成本
- ✅ **开发效率**: 复用代码(utils/interactive/bash-runner),节省50%开发时间
- ✅ **一致性**: 两个工具相同的交互模式,降低维护成本

**三层架构**:
```
Layer 1: Markdown 指令层 (templates/commands/*.md)
  → 定义"做什么"(检查标准和原则)
  → 不硬编码对话流程

Layer 2: AI 执行层
  → 决定"怎么做"(灵活理解和执行Markdown指令)
  → 根据上下文生成个性化反馈

Layer 3: Bash 脚本层 (scripts/bash/*.sh)
  → 执行"具体操作"(文件操作 + 输出JSON)
  → 不包含业务逻辑
```

**替代方案考虑**:
- ❌ **GUI应用**: 开发周期长(3-6个月),不符合快速MVP目标
- ❌ **Web服务**: 需要后端/数据库,增加复杂度和成本
- ❌ **纯AI对话**: 缺少结构化输出,难以导出标准格式

### Decision 2: 数据流转 - JSON 标准格式

**选择**: 使用JSON作为 Scriptify → Storyboardify 的数据交换格式

**JSON Schema v1.0**:
```json
{
  "meta": {
    "version": "1.0",
    "type": "scriptify_export | storyboardify_export",
    "created_at": "ISO 8601",
    "tool": "scriptify | storyboardify",
    "tool_version": "0.5.0"
  },
  "project": {
    "name": "项目名",
    "type": "短剧 | 电影 | 漫画",
    "episodes": 10,
    "genre": ["悬疑", "言情"]
  },
  "characters": [
    {
      "id": "char_001",
      "name": "李墨",
      "age": 30,
      "role": "主角",
      "appearance": {
        "height": "180cm",
        "hair": "黑色短发",
        "clothing": ["黑色风衣", "白衬衫"]
      },
      "personality": ["孤僻", "敏锐", "正义感"],
      "drawing_prompt": "Detective in black trench coat..."
    }
  ],
  "scenes": [
    {
      "id": "scene_001",
      "name": "雨夜街头",
      "location": "城市街道",
      "time": "夜晚22:00",
      "weather": "下雨",
      "atmosphere": "孤独、压抑",
      "color_scheme": ["暗蓝", "灰黑", "霓虹色"],
      "drawing_prompt": "Rainy night city street..."
    }
  ],
  "scripts": [
    {
      "episode": 1,
      "content": "Markdown格式剧本",
      "word_count": 5000,
      "format": "markdown"
    }
  ]
}
```

**理由**:
- ✅ **标准化**: JSON易于解析和验证
- ✅ **可扩展**: 易于添加新字段而不破坏兼容性
- ✅ **版本管理**: meta.version 支持未来格式演进

**替代方案考虑**:
- ❌ **Markdown直接解析**: 缺少结构化元数据(角色ID/场景ID)
- ❌ **SQL数据库**: 过度设计,增加复杂度
- ❌ **YAML**: 解析库支持度不如JSON

### Decision 3: 工作区系统 - 配置驱动的动态字段

**选择**: 使用配置文件定义工作区差异,运行时动态添加字段

**工作区配置** (`src/workspaces/config.ts`):
```typescript
interface WorkspaceConfig {
  id: 'manga' | 'short-video' | 'dynamic-manga';
  displayName: string;
  aspectRatio: '4:3' | '16:9' | '9:16' | '1:1';
  additionalFields: FieldConfig[];
  exportFormats: ExportFormat[];
}

const workspaces: WorkspaceConfig[] = [
  {
    id: 'manga',
    displayName: '📱 漫画工作区',
    aspectRatio: '4:3',
    additionalFields: [
      { key: 'pageBreak', type: 'boolean', label: '翻页位置' },
      { key: 'bubblePosition', type: 'select', options: ['左上','右上','左下','右下'] },
      { key: 'pageEstimate', type: 'string', label: '页数估算' }
    ],
    exportFormats: ['markdown', 'pdf', 'psd-template', 'excel']
  },
  {
    id: 'short-video',
    displayName: '📹 短视频工作区',
    aspectRatio: '9:16',
    additionalFields: [
      { key: 'timeline', type: 'string', label: '时间轴(MM:SS)' },
      { key: 'subtitle', type: 'string', label: '字幕内容' },
      { key: 'subtitleStyle', type: 'object', label: '字幕样式' },
      { key: 'voiceover', type: 'object', label: '配音参数' }
    ],
    exportFormats: ['markdown', '剪映json', 'pr-xml', 'pdf']
  },
  {
    id: 'dynamic-manga',
    displayName: '🎬 动态漫工作区',
    aspectRatio: '16:9',
    additionalFields: [
      { key: 'frameRange', type: 'string', label: '帧数范围' },
      { key: 'layerStructure', type: 'array', label: '图层结构' },
      { key: '3dParams', type: 'object', label: '3D参数' },
      { key: 'vfxParams', type: 'object', label: '特效参数' }
    ],
    exportFormats: ['markdown', 'ae-jsx', 'pr-xml', '剪映json', 'project-folder']
  }
];
```

**理由**:
- ✅ **可维护性**: 新增工作区只需添加配置,无需修改核心代码
- ✅ **类型安全**: TypeScript配置提供编译时检查
- ✅ **易测试**: 配置驱动逻辑易于单元测试

**替代方案考虑**:
- ❌ **硬编码if-else**: 每个工作区独立实现,代码重复度高
- ❌ **插件系统**: 过度设计,MVP阶段不需要

### Decision 4: 三模式实现 - 状态机 + Prompt模板

**选择**: 使用状态机管理模式流程,Prompt模板生成AI指令

**状态机设计** (`src/modes/state-machine.ts`):
```typescript
type ModeState = 'init' | 'analyzing' | 'generating' | 'reviewing' | 'completed';

interface CoachModeState {
  currentScene: number;
  currentShot: number;
  questionsAsked: Question[];
  userAnswers: Answer[];
}

interface ExpressModeState {
  generationProgress: number; // 0-100
  generatedShots: Shot[];
  pendingReview: boolean;
}

interface HybridModeState {
  frameworkGenerated: boolean;
  scenesCompleted: number[];
  currentFillStep: 'framework' | 'fill' | 'integrate';
}
```

**Prompt模板示例** (`templates/prompts/coach-mode.md`):
```markdown
## 教练模式 - 引导提问

你是专业的分镜教练。根据用户的剧本,逐步引导他们设计每个镜头。

**当前场景**: {scene.name}
**剧本内容**: {scene.content}

**提问流程**:
1. 询问场景情绪/氛围
2. 建议镜头数量(根据场景长度)
3. 逐个镜头设计:
   - 想展示什么内容?
   - 建议景别(远景/中景/特写)
   - 运镜方式?(静止/推/拉/摇)
   - 镜头角度?(平视/仰视/俯视)

**分镜理论提示**:
- 远景适合交代环境
- 中景适合对话和动作
- 特写适合情绪高潮
```

**理由**:
- ✅ **模式隔离**: 每个模式独立状态,避免相互影响
- ✅ **Prompt可调**: 模板化Prompt易于优化和AB测试
- ✅ **进度追踪**: 状态机清晰记录当前进度

**替代方案考虑**:
- ❌ **单一流程**: 三模式共用流程,通过flag控制 → 逻辑复杂,难维护
- ❌ **硬编码Prompt**: Prompt写在代码里 → 难以调整和优化

### Decision 5: 导出系统 - 插件化导出器

**选择**: 每种导出格式实现为独立导出器插件

**导出器接口** (`src/exporters/base.ts`):
```typescript
interface Exporter {
  name: string;
  extensions: string[]; // ['.json', '.jsx', '.xml']

  export(data: StoryboardData, options: ExportOptions): Promise<ExportResult>;
  validate(data: StoryboardData): ValidationResult;
}

class JianyingExporter implements Exporter {
  name = '剪映JSON导出器';
  extensions = ['.json'];

  async export(data: StoryboardData, options: ExportOptions) {
    // 转换为剪映工程文件格式
    const jianyingProject = this.transformToJianying(data);
    return { filePath: '...', success: true };
  }

  validate(data: StoryboardData) {
    // 检查必填字段(时间轴/字幕等)
  }
}

class AEScriptExporter implements Exporter {
  name = 'After Effects JSX导出器';
  extensions = ['.jsx'];

  async export(data: StoryboardData, options: ExportOptions) {
    // 生成AE脚本
    const aeScript = this.generateAEScript(data);
    return { filePath: '...', success: true };
  }
}
```

**导出器注册** (`src/exporters/registry.ts`):
```typescript
const exporters = new Map<string, Exporter>();

// 注册导出器
exporters.set('jianying', new JianyingExporter());
exporters.set('ae-jsx', new AEScriptExporter());
exporters.set('pr-xml', new PremiereXMLExporter());
exporters.set('markdown', new MarkdownExporter());
exporters.set('pdf', new PDFExporter());

export function getExporter(format: string): Exporter | null {
  return exporters.get(format) || null;
}
```

**理由**:
- ✅ **易扩展**: 新增格式只需实现 Exporter 接口
- ✅ **独立测试**: 每个导出器独立测试
- ✅ **按需加载**: 只加载用户选择的导出器

**替代方案考虑**:
- ❌ **单一export函数**: if-else判断格式 → 代码臃肿,难维护
- ❌ **模板引擎**: 所有格式用模板生成 → 复杂格式(JSON/JSX)不适合

## Risks / Trade-offs

### Risk 1: AI生成质量不稳定

**风险**: 快速模式依赖AI生成,可能出现不合理的镜头设计

**影响**: Medium-High (影响用户信任)

**缓解措施**:
1. 提供三模式选择,用户可控制AI参与度
2. 快速模式后强制进入审校环节
3. 内置分镜规范验证器(景别分布/运镜合理性)
4. 提供"重新生成单个镜头"功能

**Trade-off**: 增加审校步骤会略微降低效率,但提高质量

### Risk 2: Scriptify 数据格式变更

**风险**: 未来 Scriptify 升级可能修改 JSON 格式

**影响**: High (导入失败,用户流失)

**缓解措施**:
1. 在导入时检查 `meta.version` 字段
2. 实现版本适配器(`v1.0 → v2.0` converter)
3. 保持向下兼容至少2个大版本
4. 导入失败时提供详细错误信息和升级建议

**Trade-off**: 版本兼容增加代码复杂度,但保证用户体验

### Risk 3: 多格式导出兼容性

**风险**: 剪映/AE/PR 官方格式可能变更

**影响**: Medium (导出文件无法导入)

**缓解措施**:
1. 基于官方最新文档实现导出器
2. 在导出时标注格式版本(如 "剪映 3.5.0格式")
3. 提供格式验证工具
4. 社区反馈机制,快速修复兼容性问题

**Trade-off**: 需要持续维护导出器,增加长期成本

## Migration Plan

### Phase 1: MVP 发布 (2025 Q3)

**Week 1-2: 项目脚手架**
- 初始化项目结构
- 配置 TypeScript/ESLint/Prettier
- 实现核心 utils (bash-runner/interactive)
- 13个AI平台命令配置

**Week 3-4: 数据导入与制作包生成**
- Scriptify JSON 解析器
- `/import` 命令
- `/characters-pack` 命令
- `/scenes-pack` 命令
- `/prompts-gen` 命令

**Week 5-7: 分镜生成系统**
- 三模式状态机
- `/storyboard` 命令(三模式)
- `/camera` 运镜优化
- `/fill` 混合模式填充

**Week 8: 审校与导出**
- `/review` 三遍审校
- `/export` Markdown/PDF导出
- 分镜规范验证器

**Week 9: 测试与文档**
- 单元测试(覆盖率>70%)
- E2E测试(完整流程)
- README/QUICKSTART文档
- 示例项目(3个)

**Deliverables**:
- ✅ Storyboardify v0.1.0 (独立npm包)
- ✅ 核心功能: 导入 → 制作包 → 分镜生成 → 导出
- ✅ 单一工作区: 漫画工作区
- ✅ 导出格式: Markdown, PDF

### Phase 2: 三工作区完整版 (2025 Q4)

**Week 10-11: 短视频工作区**
- 9:16竖屏适配
- 字幕/配音参数
- 剪映JSON导出器

**Week 12-13: 动态漫工作区**
- 图层结构设计
- 3D参数支持
- AE JSX脚本导出器
- PR XML导出器

**Week 14: 工作区切换**
- 工作区配置系统
- 动态字段注入
- 多格式导出验证

**Deliverables**:
- ✅ Storyboardify v0.2.0
- ✅ 三工作区完整支持
- ✅ 导出格式: Markdown, PDF, 剪映JSON, AE JSX, PR XML

### Phase 3: 生态集成 (2026 Q1)

**Week 15-16: Scriptify 深度集成**
- Scriptify 内置导出按钮
- 一键导入到 Storyboardify
- 双向同步(角色/场景修改)

**Week 17-18: 素材库系统**
- 公共素材库(角色/场景模板)
- 私有素材库(用户自定义)
- 素材导入/复用功能

**Week 19-20: 第三方工具集成**
- MidJourney Prompt 优化器
- ControlNet 线框图工作流
- AE脚本增强(自动图层命名)

**Deliverables**:
- ✅ Storyboardify v1.0.0
- ✅ Scriptify集成完成
- ✅ 素材库管理
- ✅ 第三方工具集成

## Open Questions

### Q1: 分镜参数标准化程度

**问题**: 分镜四要素(景别/角度/运镜/情绪)是否需要严格枚举值?还是允许用户自由输入?

**Options**:
- A: 严格枚举(如景别只能选"远景/全景/中景/近景/特写")
- B: 半开放(提供常用选项 + "自定义"输入框)
- C: 完全自由输入

**建议**: 选择 B - 平衡规范性和灵活性,常用场景用枚举(快速选择),特殊场景用自定义(如"荷兰角"、"虫视")

### Q2: AI Prompt 优化策略

**问题**: 绘图 Prompt 生成器应该优化到什么程度?

**Options**:
- A: 基础生成(仅描述内容,用户自行优化)
- B: 中级优化(添加风格/光影/质量关键词)
- C: 高级优化(根据平台(MJ/SD)差异化生成,支持多语言)

**建议**: 选择 B → MVP阶段,未来可升级到C(根据用户反馈)

### Q3: 数据持久化方式

**问题**: 用户项目数据如何存储?

**Options**:
- A: 纯文件系统(Markdown + JSON)
- B: SQLite本地数据库
- C: 云端存储(需要后端服务)

**建议**: 选择 A → 与Scriptify保持一致,降低复杂度,MVP阶段足够

### Q4: 定价与免费版功能

**问题**: 免费版应该包含哪些功能?

**Options**:
- A: 核心功能全免费,仅限额(50个分镜/月)
- B: 基础工作区免费(漫画),高级工作区付费(短视频/动态漫)
- C: 全功能免费,高级导出格式付费(AE/PR)

**建议**: 选择 A → 降低用户门槛,通过限额推动付费转化

## Conclusion

**核心决策总结**:
1. ✅ 架构: 完全复用 Scriptify 三层架构,加速开发
2. ✅ 数据: JSON v1.0 标准格式,保证兼容性
3. ✅ 工作区: 配置驱动,易扩展
4. ✅ 三模式: 状态机 + Prompt模板
5. ✅ 导出: 插件化导出器

**下一步**:
- 完成 `tasks.md` 详细实现清单
- 完成 5个 capability 的 spec 规范
- 运行 `openspec validate --strict`
- 开始代码实现
