# Design: Coach and Hybrid Modes Technical Architecture

## Context

**Background**:
- Phase 1 + Phase 2 已实现 Express 模式(全自动生成)
- Express 模式基于 `scene-splitter` + `camera-optimizer` + `ai-storyboard` 生成器
- 用户反馈需要更多交互和掌控权

**Constraints**:
- 必须保持 CLI 界面(不做 GUI)
- 必须兼容现有 Storyboard 数据结构
- 必须复用 Phase 2 的智能算法

**Stakeholders**:
- 新手创作者(需要学习指导)
- 专业创作者(需要创意控制)
- 独立开发者(自学分镜技能)

## Goals / Non-Goals

### Goals
1. ✅ **教育性**: Coach 模式提供分镜理论教学
2. ✅ **灵活性**: Hybrid 模式允许用户完全定制
3. ✅ **可用性**: 交互式流程简单直观
4. ✅ **复用性**: 最大程度复用 Phase 2 代码

### Non-Goals
1. ❌ **GUI 界面**: Phase 3.1 不做图形界面
2. ❌ **实时预览**: 不做分镜画面的可视化渲染
3. ❌ **多人协作**: 不支持多人同时编辑
4. ❌ **版本控制**: 不做分镜历史版本管理(留待 Phase 4)

## Decisions

### Decision 1: 状态机架构 - 模式隔离

**选择**: 每个模式独立实现,继承统一基类

**理由**:
- ✅ **模式隔离**: 避免 Coach/Hybrid/Express 逻辑混杂
- ✅ **可维护性**: 修改一个模式不影响其他模式
- ✅ **可测试性**: 每个模式独立测试
- ✅ **可扩展性**: 未来新增模式只需实现接口

**架构设计**:
```typescript
// 基类
abstract class BaseMode {
  abstract name: string;
  abstract generate(productionPack, options): Promise<Storyboard>;

  protected validate(storyboard: Storyboard): ValidationResult {
    // 通用验证逻辑
  }

  protected saveProgress(state: any): void {
    // 保存进度(支持中断恢复)
  }
}

// Coach 模式
class CoachMode extends BaseMode {
  name = 'coach';

  async generate(productionPack, options) {
    // 1. 初始化状态
    const state: CoachModeState = this.initState(productionPack);

    // 2. 逐场景引导
    for (const scene of productionPack.scenes) {
      await this.guideScene(scene, state);
    }

    // 3. 组装分镜
    return this.assembleStoryboard(state);
  }

  private async guideScene(scene, state) {
    // 提问: 氛围/情绪
    const mood = await this.askMood(scene);

    // 提问: 镜头数量
    const shotCount = await this.askShotCount(scene);

    // 逐镜头引导
    for (let i = 0; i < shotCount; i++) {
      const shot = await this.guideShot(scene, i, state);
      state.generated_shots.push(shot);
    }
  }
}

// Hybrid 模式
class HybridMode extends BaseMode {
  name = 'hybrid';

  async generate(productionPack, options) {
    // 1. 生成框架
    const framework = await this.generateFramework(productionPack);

    // 2. 用户填充
    const filledShots = await this.fillFramework(framework);

    // 3. 合并和优化
    return this.mergeAndOptimize(filledShots);
  }

  private async fillFramework(framework) {
    const shots: Shot[] = [];

    for (const frameShot of framework) {
      // 用户填充每个镜头
      const filledShot = await this.promptUserFill(frameShot);

      // 实时验证
      const validation = this.validateShot(filledShot);
      if (!validation.valid) {
        console.log(`⚠ 建议: ${validation.suggestions.join(', ')}`);
      }

      shots.push(filledShot);
    }

    return shots;
  }
}

// Express 模式 (已有)
class ExpressMode extends BaseMode {
  name = 'express';

  async generate(productionPack, options) {
    // 全自动生成(Phase 2 已实现)
    return generateExpressStoryboard(productionPack, options);
  }
}
```

**替代方案考虑**:
- ❌ **单一类 + Flag**: 用 `if (mode === 'coach')` 判断 → 代码混杂,难维护
- ❌ **函数式**: 每个模式是独立函数 → 缺少状态管理和代码复用

### Decision 2: 交互式 CLI - inquirer.js

**选择**: 使用 `inquirer.js` 实现交互式问答

**理由**:
- ✅ **成熟稳定**: npm 下载量 5M+/week
- ✅ **功能丰富**: list/checkbox/input/editor/confirm 等多种问题类型
- ✅ **用户体验好**: 支持箭头键选择、输入验证、条件问题
- ✅ **已集成**: Storyboardify 已安装 inquirer

**交互模式设计**:
```typescript
import inquirer from 'inquirer';

// Coach 模式 - 氛围选择
const { mood } = await inquirer.prompt([
  {
    type: 'list',
    name: 'mood',
    message: `场景「${scene.name}」想营造什么氛围?`,
    choices: [
      { name: '😰 紧张 - 快节奏,短镜头', value: 'tense' },
      { name: '💖 温馨 - 慢节奏,长镜头', value: 'warm' },
      { name: '😢 悲伤 - 特写为主,情绪镜头', value: 'sad' },
      { name: '😄 欢快 - 动态运镜,多角度', value: 'happy' },
      new inquirer.Separator(),
      { name: '❓ 让AI决定', value: 'auto' }
    ]
  }
]);

// Hybrid 模式 - 镜头填充
const shotDetails = await inquirer.prompt([
  {
    type: 'list',
    name: 'shot_type',
    message: `镜头 ${index + 1} - 景别:`,
    choices: ['远景', '全景', '中景', '近景', '特写', '大特写'],
    default: framework.suggested_shot_type
  },
  {
    type: 'list',
    name: 'camera_angle',
    message: '角度:',
    choices: ['平视', '俯视', '仰视', '斜角', '鸟瞰', '虫视'],
    default: framework.suggested_angle
  },
  {
    type: 'editor',
    name: 'content',
    message: '画面内容描述 (打开编辑器):',
    default: framework.content_suggestion || ''
  },
  {
    type: 'confirm',
    name: 'add_dialogue',
    message: '是否添加对话?',
    default: false
  },
  {
    type: 'input',
    name: 'dialogue',
    message: '对话内容:',
    when: (answers) => answers.add_dialogue
  }
]);

// 进度提示
const progressBar = new inquirer.ui.BottomBar();
progressBar.updateBottomBar(`进度: ${completed}/${total} 镜头完成`);
```

**替代方案考虑**:
- ❌ **prompts**: 功能较少,社区较小
- ❌ **readline**: 原生API,需要自己实现UI逻辑
- ❌ **blessed**: 过于复杂,适合全屏TUI,不适合CLI

### Decision 3: 框架生成器 - 复用 + 扩展

**选择**: Hybrid 框架生成器复用 Phase 2 的 scene-splitter,扩展 "建议" 字段

**理由**:
- ✅ **代码复用**: scene-splitter 已实现复杂度分析和镜头数估算
- ✅ **一致性**: 框架生成逻辑和 Express 模式一致
- ✅ **可扩展**: 扩展 ShotPlan 添加 "建议" 字段,不破坏现有结构

**框架生成流程**:
```typescript
export interface ShotFramework {
  shot_number: number;
  suggested_shot_type: Shot['shot_type'];  // AI 建议的景别
  suggested_angle: Shot['camera_angle'];   // AI 建议的角度
  suggested_movement: CameraMovement['type']; // AI 建议的运镜
  content_suggestion: string;              // AI 建议的内容描述
  rationale: string;                       // 建议理由
  is_user_filled: boolean;                 // 用户是否已填充
}

export function generateFramework(
  productionPack: ProductionPack,
  options: AIStoryboardOptions
): ShotFramework[] {
  const frameworks: ShotFramework[] = [];

  for (const scene of productionPack.source_data.scenes) {
    // 1. 复用 scene-splitter 分析场景
    const splitResult = splitSceneIntoShots(scene, findSceneSheet(scene));

    // 2. 为每个镜头生成建议
    for (const shotPlan of splitResult.shot_plans) {
      // 3. 复用 camera-optimizer 生成运镜建议
      const cameraParams = optimizeCameraParameters({
        shot_type: shotPlan.suggested_shot_type,
        scene_pacing: splitResult.pacing,
        // ...
      });

      // 4. 生成框架
      frameworks.push({
        shot_number: frameworks.length + 1,
        suggested_shot_type: shotPlan.suggested_shot_type,
        suggested_angle: shotPlan.suggested_angle,
        suggested_movement: cameraParams.movement.type,
        content_suggestion: generateContentSuggestion(scene, shotPlan),
        rationale: `${shotPlan.rationale}; ${cameraParams.rationale}`,
        is_user_filled: false
      });
    }
  }

  return frameworks;
}
```

**替代方案考虑**:
- ❌ **完全重写**: 不必要,scene-splitter 逻辑已验证有效
- ❌ **简化框架**: 只提供镜头数,不提供建议 → 失去 AI 辅助价值

### Decision 4: 进度保存 - JSON 文件

**选择**: 将模式状态保存到 `.storyboardify/mode-state.json`,支持中断恢复

**理由**:
- ✅ **用户友好**: Coach/Hybrid 模式耗时长(10-30分钟),需要支持中断
- ✅ **简单实现**: JSON 文件易于读写,无需数据库
- ✅ **可调试**: 用户和开发者都可以查看状态文件

**状态保存设计**:
```typescript
interface ModeState {
  mode: 'coach' | 'hybrid' | 'express';
  started_at: string;
  last_saved_at: string;
  current_scene_index: number;
  current_shot_index: number;
  data: CoachModeState | HybridModeState;
}

// 保存状态
function saveState(state: ModeState): void {
  const statePath = path.join(projectDir, '.storyboardify', 'mode-state.json');
  fs.writeJSONSync(statePath, state, { spaces: 2 });
}

// 恢复状态
function loadState(): ModeState | null {
  const statePath = path.join(projectDir, '.storyboardify', 'mode-state.json');
  if (fs.existsSync(statePath)) {
    return fs.readJSONSync(statePath);
  }
  return null;
}

// 启动时检查
async function generate(options) {
  const savedState = loadState();

  if (savedState) {
    const { resume } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'resume',
        message: `检测到未完成的 ${savedState.mode} 模式进度,是否继续?`,
        default: true
      }
    ]);

    if (resume) {
      return resumeFromState(savedState);
    }
  }

  // 正常启动...
}
```

**替代方案考虑**:
- ❌ **不保存状态**: 用户中断后需要从头开始 → 用户体验差
- ❌ **SQLite 数据库**: 过度设计,增加复杂度
- ❌ **内存状态**: 进程退出后丢失

### Decision 5: 教育内容 - 内嵌 Prompt 模板

**选择**: 将分镜理论教学内容作为 Prompt 模板存储在代码中

**理由**:
- ✅ **快速迭代**: 教学内容直接在代码中,易于更新
- ✅ **无外部依赖**: 不需要额外的内容管理系统
- ✅ **可定制**: 不同场景可以有不同的教学提示

**教育内容设计**:
```typescript
const EDUCATION_TIPS = {
  shot_types: {
    '远景': '远景用于建立空间关系,展示角色与环境的关系。适合开场或场景切换。',
    '全景': '全景展示角色全身和周围环境,适合动作场景和对话场景。',
    '中景': '中景从腰部以上拍摄,适合对话和人物互动,最常用的景别。',
    '近景': '近景从胸部以上拍摄,强调表情和情绪。',
    '特写': '特写聚焦面部或物体细节,用于情绪高潮或重要信息展示。',
    '大特写': '大特写拍摄眼睛或物体局部,极强的情绪冲击力。'
  },

  camera_movements: {
    '推': '推镜逐渐靠近主体,引导观众注意力,营造紧张感或揭示细节。',
    '拉': '拉镜逐渐远离主体,展示更大范围,常用于场景切换或展示空间关系。',
    '摇': '摇镜水平移动,跟随动作或展示环境,自然流畅。',
    '移': '移镜跟随角色移动,保持视角连贯,适合动作场景。',
    '跟': '跟镜紧跟角色,营造代入感,适合追逐或探索场景。'
  },

  pacing: {
    'fast': '快节奏场景建议:\n- 更多短镜头(2-3秒)\n- 动态运镜(推/摇/移)\n- 多角度切换\n- 少用静止镜头',
    'medium': '中等节奏场景建议:\n- 镜头时长 3-6 秒\n- 静止和运镜结合\n- 平视和仰俯视混合',
    'slow': '慢节奏场景建议:\n- 更多长镜头(5-10秒)\n- 静止或缓慢运镜\n- 多用特写展示情绪\n- 少切换角度'
  }
};

// 在 Coach 模式中使用
function showEducationTip(context: string, key: string): void {
  const tip = EDUCATION_TIPS[context]?.[key];
  if (tip) {
    console.log(chalk.blue(`\n💡 分镜技巧: ${tip}\n`));
  }
}
```

**替代方案考虑**:
- ❌ **外部 Markdown 文件**: 增加文件读取逻辑,不易定制
- ❌ **在线内容库**: 需要网络请求,增加依赖
- ❌ **无教育内容**: 失去 Coach 模式的教育价值

## Risks / Trade-offs

### Risk 1: 交互流程过长导致用户放弃

**风险**: Coach/Hybrid 模式需要 10-30 分钟,用户可能中途放弃

**影响**: Medium-High

**缓解措施**:
1. 实现进度保存和恢复机制
2. 提供"快速模式"跳过部分问题
3. 显示进度条和预估剩余时间
4. 允许用户随时切换到 Express 模式

**Trade-off**: 进度保存增加代码复杂度,但提升用户体验

### Risk 2: Hybrid 模式用户填充质量不稳定

**风险**: 用户填充的内容可能不符合分镜规范

**影响**: Medium

**缓解措施**:
1. 实时验证和建议(非强制)
2. 提供"AI 优化"选项,修正明显问题
3. 在导出前进行完整性检查

**Trade-off**: 验证逻辑增加计算开销,但保证输出质量

### Risk 3: 教育内容准确性和全面性

**风险**: 内嵌的分镜理论可能不够专业或全面

**影响**: Low-Medium

**缓解措施**:
1. 参考专业分镜教材和实践经验
2. 提供"了解更多"链接到外部资源
3. 收集用户反馈持续更新

**Trade-off**: 内容维护需要时间,但教育价值高

## Migration Plan

### Week 1-2: Coach 模式实现

**Day 1-2**: 搭建基础架构
- 创建 `BaseMode` 基类
- 创建 `CoachMode` 类框架
- 实现状态机和状态保存

**Day 3-5**: 实现核心交互流程
- 实现场景引导逻辑
- 实现交互式问答(inquirer.js)
- 添加教育提示

**Day 6-7**: 集成和测试
- 集成到 `/generate` 命令
- 端到端测试
- 用户体验优化

### Week 3-4: Hybrid 模式实现

**Day 8-9**: 框架生成器
- 实现 `generateFramework` 函数
- 复用 scene-splitter 和 camera-optimizer
- 添加建议字段

**Day 10-12**: 用户填充流程
- 实现镜头填充交互
- 实现实时验证
- 实现合并和优化逻辑

**Day 13-14**: 集成和测试
- 集成到 `/generate` 命令
- 端到端测试
- 性能优化

### Week 5: 集成测试和文档

**Day 15-16**: 集成测试
- 三模式切换测试
- 进度保存/恢复测试
- 边界情况测试

**Day 17-18**: 文档和示例
- 更新 README.md
- 创建 Coach/Hybrid 模式示例
- 录制演示视频

**Deliverables**:
- ✅ Coach 模式完整实现
- ✅ Hybrid 模式完整实现
- ✅ 三模式系统完成
- ✅ 用户文档和示例

## Open Questions

### Q1: Coach 模式的问题粒度

**问题**: 每个场景问 3 个核心问题,还是 5 个详细问题?

**Options**:
- A: 3 个核心问题(氛围/镜头数/特殊要求)- 快速但可能不够细致
- B: 5 个详细问题(+景别偏好/运镜风格)- 细致但耗时
- C: 3 个核心 + 2 个可选(默认跳过)- 平衡

**建议**: 选择 C - 平衡速度和细致度,让用户选择详细程度

### Q2: Hybrid 模式的 AI 优化范围

**问题**: AI "优化"用户填充的内容到什么程度?

**Options**:
- A: 仅修正明显错误(如镜头时长过长)
- B: 优化所有内容(景别/角度/运镜)
- C: 提供建议但不自动修改

**建议**: 选择 C - 尊重用户意图,提供建议但不强制修改

### Q3: 进度保存的触发时机

**问题**: 何时保存状态?

**Options**:
- A: 每个镜头填充后自动保存
- B: 每个场景完成后保存
- C: 用户手动保存(Ctrl+S)

**建议**: 选择 A - 自动保存,防止意外丢失,同时提供手动保存快捷键

### Q4: 教育内容的展示方式

**问题**: 教育提示如何展示?

**Options**:
- A: 自动显示相关提示
- B: 用户主动询问时显示("帮助"命令)
- C: 在选择后显示简短提示,提供"了解更多"选项

**建议**: 选择 C - 不打断流程,但提供学习机会

## Conclusion

**核心决策总结**:
1. ✅ 状态机架构 - 模式隔离,基类统一接口
2. ✅ inquirer.js - 成熟的交互式 CLI 库
3. ✅ 复用 Phase 2 - 框架生成器复用 scene-splitter
4. ✅ JSON 状态保存 - 支持中断恢复
5. ✅ 内嵌教育内容 - 快速迭代,易于定制

**下一步**:
- 完成 `tasks.md` 详细任务清单
- 编写 spec deltas for `three-mode-system` 和 `storyboard-generation`
- 运行 `openspec validate --strict`
- 开始实施
