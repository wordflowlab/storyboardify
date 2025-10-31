# Proposal: Add Coach and Hybrid Modes for Interactive Storyboard Creation

## Why

**Problem**: Phase 2 已完成 Express 模式(全自动生成),但缺少**交互式创作模式**:
- **新手创作者**需要 AI 引导学习分镜理论和最佳实践
- **专业创作者**希望保留掌控权,只让 AI 辅助框架生成
- **当前 Express 模式**虽然快速,但用户无法参与创作过程,缺少学习和定制机会

**User Pain Points**:
1. Express 模式生成的分镜可能不符合创作者的特定风格偏好
2. 新手不了解分镜理论,需要逐步引导而非直接给出结果
3. 专业用户希望 AI 生成框架,自己填充创意细节

**Opportunity**:
- 完善三模式系统,覆盖不同技能水平和创作偏好的用户
- 提供教育价值,帮助新手学习专业分镜技能
- 增强用户粘性,通过交互式创作建立更深的使用习惯

## What Changes

### 核心功能 (2个新模式)

#### 1. Coach 模式 - AI引导式创作 (P0)

**定位**: 面向新手和学习者,AI 扮演分镜教练角色

**功能**:
- **逐场景引导**: AI 逐个场景提问,引导用户设计镜头
- **分镜理论教学**: 提供景别/角度/运镜的最佳实践建议
- **交互式问答**:
  - "这个场景想表达什么情绪?"
  - "建议拍摄 3-5 个镜头,你想要几个?"
  - "开场镜头建议用全景建立环境,你觉得如何?"
- **实时反馈**: 对用户选择给出专业评价和改进建议
- **渐进式生成**: 用户每回答完一个场景,AI 生成该场景的镜头

**用户旅程**:
```
1. 选择 Coach 模式
2. AI: "场景1: 雨夜街头。这个场景想营造什么氛围?"
   用户: "孤独、压抑"
3. AI: "建议 4 个镜头。1) 全景建立环境 2) 中景展示主角 3) 特写表情 4) 远景收尾"
   用户: "同意" 或 "我想要 5 个镜头"
4. AI 生成该场景分镜,展示预览
5. 继续下一个场景...
```

**教育价值**:
- 用户在创作过程中学习分镜理论
- AI 解释每个决策的原因(为什么用特写?为什么推镜?)
- 新手通过多次使用逐步掌握分镜技能

#### 2. Hybrid 模式 - 协作式创作 (P0)

**定位**: 面向专业用户,AI 生成框架,用户填充细节

**功能**:
- **AI 生成框架**: 自动生成场景拆分和镜头数量建议
- **用户填充内容**: 用户编辑每个镜头的具体内容
  - 修改景别/角度/运镜
  - 编写详细的画面描述
  - 调整镜头时长和顺序
- **智能合并**: AI 将用户填充的内容整合为完整分镜
- **优化建议**: AI 分析用户填充的内容,提供优化建议

**工作流**:
```
1. 选择 Hybrid 模式
2. AI 生成框架: 3个场景 × 平均4个镜头 = 12个镜头框架
3. 用户看到框架预览:
   场景1: 雨夜街头
     镜头1: [空] - 建议: 全景
     镜头2: [空] - 建议: 中景
     ...
4. 用户填充镜头1:
   - 景别: 全景 (保持 AI 建议)
   - 角度: 俯视 (修改为俯视强调孤独感)
   - 内容: "主角站在雨中,背景是霓虹灯闪烁的街道"
5. AI 实时验证: "✓ 俯视角度很好地强化了孤独感"
6. 重复填充所有镜头...
7. AI 生成完整分镜,包含用户的所有定制内容
```

**专业价值**:
- 节省框架设计时间(AI 自动拆分场景)
- 保留创意掌控权(用户填充所有关键细节)
- 结合 AI 效率和人工创意

### 技术实现

#### 状态机设计

```typescript
// Coach 模式状态
interface CoachModeState {
  current_scene_index: number;          // 当前处理的场景索引
  current_shot_index: number;           // 当前场景内的镜头索引
  questions_asked: Question[];          // 已提问的问题
  user_answers: Answer[];               // 用户回答
  generated_shots: Shot[];              // 已生成的镜头
  education_points: EducationTip[];     // 教育提示
}

// Hybrid 模式状态
interface HybridModeState {
  framework_generated: boolean;         // 框架是否已生成
  framework: ShotFramework[];           // AI 生成的镜头框架
  user_filled_shots: Partial<Shot>[];  // 用户填充的镜头
  completion_progress: number;          // 完成进度 0-100
  validation_results: ValidationIssue[]; // 验证结果
}
```

#### 交互式 CLI 实现

使用 `inquirer.js` 实现交互式问答:

```typescript
// Coach 模式交互
const answers = await inquirer.prompt([
  {
    type: 'list',
    name: 'mood',
    message: `场景 ${scene.name}: 想营造什么氛围?`,
    choices: ['紧张', '温馨', '悲伤', '欢快', '神秘', '其他']
  },
  {
    type: 'number',
    name: 'shot_count',
    message: `建议 ${suggestedCount} 个镜头,你想要多少个?`,
    default: suggestedCount,
    validate: (val) => val >= 1 && val <= 15
  }
]);

// Hybrid 模式填充
const shotDetails = await inquirer.prompt([
  {
    type: 'list',
    name: 'shot_type',
    message: '景别:',
    choices: ['远景', '全景', '中景', '近景', '特写', '大特写'],
    default: framework.suggested_shot_type
  },
  {
    type: 'editor',
    name: 'content',
    message: '画面内容描述:',
    default: ''
  }
]);
```

### 命令扩展

更新 `/generate` 命令支持三模式:

```bash
# Coach 模式
$ storyboardify generate --mode coach

# Hybrid 模式
$ storyboardify generate --mode hybrid

# Express 模式 (已有)
$ storyboardify generate --mode express
```

## Impact

### Affected Specs

1. **three-mode-system** (MODIFIED)
   - 新增 Coach 模式完整实现
   - 新增 Hybrid 模式完整实现
   - 新增模式切换机制

2. **storyboard-generation** (MODIFIED)
   - 新增交互式生成流程
   - 新增用户输入验证
   - 新增框架生成器

### Affected Code

**新增文件**:
- `src/modes/coach-mode.ts` - Coach 模式实现 (~400行)
- `src/modes/hybrid-mode.ts` - Hybrid 模式实现 (~350行)
- `src/modes/base-mode.ts` - 模式基类 (~100行)
- `src/generators/framework-generator.ts` - Hybrid 框架生成器 (~200行)
- `src/utils/interactive-prompt.ts` - 交互式问答工具 (~150行)
- `src/validators/shot-validator.ts` - 镜头验证器 (~100行)

**修改文件**:
- `src/commands/generate.ts` - 支持三模式选择
- `src/types/index.ts` - 新增模式相关类型

**总计**: ~1,300 行新代码

### Breaking Changes

**NONE** - 向后兼容,Express 模式保持不变

### Migration Plan

**Phase 3.1: Coach + Hybrid 模式** (本提案)
- Week 1-2: 实现 Coach 模式
- Week 3-4: 实现 Hybrid 模式
- Week 5: 集成测试和用户反馈

### User Impact

**Positive**:
- 🎓 **教育价值**: 新手通过 Coach 模式学习分镜技能
- 🎨 **创意掌控**: 专业用户通过 Hybrid 模式保留创意控制权
- ⚡ **灵活选择**: 三模式覆盖不同用户需求和场景
- 📈 **用户粘性**: 交互式创作增强使用习惯

**Considerations**:
- Coach 模式完成一个项目需要 10-20 分钟(vs Express 的 1-2 分钟)
- Hybrid 模式需要用户填充所有镜头,时间成本 20-30 分钟
- 需要清晰的模式选择指引,帮助用户选择合适的模式

### Dependencies

**External**:
- `inquirer` - 交互式 CLI (已安装)
- Node.js 18+ (已满足)

**Internal**:
- 复用 Phase 2 的 `scene-splitter.ts` 和 `camera-optimizer.ts`
- 复用 Phase 2 的 Storyboard 类型系统

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| 交互式流程太复杂 | Medium | High | 提供"快速回答"选项,跳过详细问题 |
| 用户填充质量不稳定 | High | Medium | Hybrid 模式提供实时验证和建议 |
| 三模式选择困惑 | Medium | Medium | 提供模式对比表和推荐算法 |

## Success Metrics

**6个月目标**:
- Coach 模式使用率: 30% (新手用户为主)
- Hybrid 模式使用率: 20% (专业用户为主)
- Express 模式使用率: 50% (快速创作)
- 用户满意度: 4.5/5
- 新手用户留存率提升: +15%

## Open Questions

1. **Coach 模式提问数量**: 每个场景问 3 个问题还是 5 个问题?
   - 建议: 核心问题 3 个,可选问题 2 个(用户可跳过)

2. **Hybrid 模式验证严格度**: AI 验证是强制性还是建议性?
   - 建议: 建议性,但标注"可能影响质量"的警告

3. **模式切换**: 是否支持中途切换模式?
   - 建议: Phase 3.1 不支持,Phase 3.2 考虑

4. **教育内容深度**: Coach 模式的分镜理论教学到什么程度?
   - 建议: 基础理论(景别/角度/运镜含义),不深入摄影技术细节
