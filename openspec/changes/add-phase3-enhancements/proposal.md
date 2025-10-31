# Proposal: Phase 3.2 - Enhancement Features for Coach and Hybrid Modes

## Why

**Problem**: Phase 3.1 成功交付了 Coach 和 Hybrid 模式的核心功能，但还有一些重要的增强功能未实现：
- **中断恢复**：用户中断后无法从上次位置继续，需要重新开始
- **交互体验**：缺少特殊要求输入、对话添加、深度学习等功能
- **用户引导**：缺少模式推荐逻辑和详细帮助文本
- **跳转功能**：Hybrid 模式无法跳转到特定镜头，修改不便

**User Pain Points**:
1. Coach/Hybrid 模式耗时长（10-30分钟），中断后需要重新开始
2. 无法添加对话内容，需要手动编辑 JSON
3. 教育提示不够深入，缺少"了解更多"功能
4. Hybrid 模式填充镜头时无法跳过或返回修改
5. 新手不知道选择哪个模式

**Opportunity**:
- 完善用户体验，降低使用门槛
- 提高工作效率，支持中断恢复
- 增强教育价值，提供深度学习内容
- 提升专业性，支持对话和特殊要求输入

## What Changes

### 核心功能 (P0)

#### 1. Resume from Saved State - 中断恢复

**Coach Mode 恢复:**
```typescript
interface CoachModeState {
  current_scene_index: number;      // 当前场景索引
  current_shot_index: number;       // 当前镜头索引
  completed_scenes: StoryboardScene[]; // 已完成的场景
  current_scene_shots: Shot[];      // 当前场景已完成的镜头
  questions_asked: QuestionRecord[];
  user_answers: AnswerRecord[];
}

// 恢复流程
if (savedState && savedState.mode === 'coach') {
  const { resume } = await confirm('检测到未完成的进度，是否继续？', true);
  if (resume) {
    // 跳过已完成的场景
    // 从 current_scene_index 和 current_shot_index 继续
  }
}
```

**Hybrid Mode 恢复:**
```typescript
interface HybridModeState {
  framework: ShotFramework[];
  filled_shots: Shot[];             // 已填充的镜头
  current_shot_index: number;       // 当前镜头索引
}

// 恢复流程
if (savedState && savedState.mode === 'hybrid') {
  const { resume } = await confirm(
    `已完成 ${savedState.current_shot_index}/${savedState.framework.length} 个镜头，是否继续？`,
    true
  );
  if (resume) {
    // 跳过已填充的镜头
    // 从 current_shot_index 继续填充
  }
}
```

#### 2. Special Requirements Input - Coach 模式特殊要求

```typescript
// 在每个场景开始时询问
const specialReqs = await inputText(
  '是否有特殊要求？（可选，如"需要慢动作"、"使用黑白色调"等）',
  '',
  (value) => value.length <= 200 || '特殊要求不超过200字符'
);

if (specialReqs) {
  // 将特殊要求传递给 AI 生成器
  // 影响镜头生成的建议
}
```

#### 3. Dialogue Input - Hybrid 模式对话输入

```typescript
// 在填充镜头时询问
const hasDialogue = await confirm('这个镜头是否包含对话？', false);

if (hasDialogue) {
  const dialogues: Dialogue[] = [];
  let addMore = true;
  
  while (addMore) {
    const character = await selectFromList(
      '选择说话角色:',
      characterChoices
    );
    
    const text = await inputText(
      `${character} 的对话内容:`,
      '',
      (value) => value.length > 0 || '对话内容不能为空'
    );
    
    dialogues.push({ character_id: character.id, character_name: character.name, text });
    
    addMore = await confirm('是否添加更多对话？', false);
  }
  
  shot.effects = { ...shot.effects, dialogue: dialogues };
}
```

#### 4. "Learn More" Feature - 深度学习功能

```typescript
// 在显示教育提示后
const learnMore = await confirm('💡 想了解更多关于此技巧的详细信息吗？', false);

if (learnMore) {
  showDetailedEducation(category, key);
}

function showDetailedEducation(category: string, key: string) {
  const detailedContent = DETAILED_EDUCATION[category]?.[key];
  
  console.log(chalk.blue('\n📚 深度学习:\n'));
  console.log(detailedContent.theory);      // 理论知识
  console.log(chalk.green('\n✨ 经典案例:\n'));
  console.log(detailedContent.examples);    // 经典电影案例
  console.log(chalk.yellow('\n⚠️  常见误区:\n'));
  console.log(detailedContent.pitfalls);    // 常见错误
  console.log(chalk.cyan('\n🎯 应用建议:\n'));
  console.log(detailedContent.tips);        // 实用建议
}
```

#### 5. Skip to Shot Index - Hybrid 模式跳转

```typescript
// 在 Hybrid 模式填充时提供跳转选项
const action = await selectFromList(
  '选择操作:',
  [
    { name: '✓ 填充此镜头', value: 'fill' },
    { name: '⏭ 跳过此镜头（稍后填充）', value: 'skip' },
    { name: '⏮ 返回上一镜头', value: 'back' },
    { name: '🔍 跳转到特定镜头', value: 'goto' },
  ]
);

if (action === 'goto') {
  const targetIndex = await inputNumber(
    `跳转到镜头 (1-${framework.length}):`,
    currentIndex + 1,
    1,
    framework.length
  );
  currentIndex = targetIndex - 1;
}

if (action === 'skip') {
  // 标记为未填充，继续下一个
  framework[currentIndex].is_user_filled = false;
  currentIndex++;
}
```

#### 6. Mode Recommendation Logic - 模式推荐

```typescript
// 在模式选择前分析项目并推荐
function recommendMode(productionPack: ProductionPack): {
  recommended: GenerationMode;
  reason: string;
} {
  const sceneCount = productionPack.source_data.scenes.length;
  const totalWords = productionPack.source_data.scenes.reduce(
    (sum, scene) => sum + (scene.content?.length || 0),
    0
  );
  
  // 简单项目 (<=3场景, <500字) -> Express
  if (sceneCount <= 3 && totalWords < 500) {
    return {
      recommended: 'express',
      reason: '项目规模较小，推荐使用 Express 模式快速生成'
    };
  }
  
  // 复杂项目 (>=5场景, >1000字) -> Hybrid
  if (sceneCount >= 5 || totalWords > 1000) {
    return {
      recommended: 'hybrid',
      reason: '项目较复杂，推荐使用 Hybrid 模式以便精细控制'
    };
  }
  
  // 中等项目 -> Coach
  return {
    recommended: 'coach',
    reason: '适合学习分镜技巧，推荐使用 Coach 模式'
  };
}

// 显示推荐
const recommendation = recommendMode(productionPack);
console.log(chalk.yellow(`\n💡 智能推荐: ${recommendation.recommended.toUpperCase()} 模式`));
console.log(chalk.gray(`   ${recommendation.reason}\n`));
```

#### 7. Help Text and CLI Updates

```bash
# 更新 help 文本
storyboardify generate --help

Options:
  --mode <mode>    Generation mode: coach, hybrid, express
                   
                   coach:   🎓 AI-guided learning mode (10-20 min)
                            Perfect for beginners learning storyboarding
                            - Scene-by-scene guidance
                            - Educational tips
                            - Interactive Q&A
                   
                   hybrid:  🎨 AI framework + manual customization (20-30 min)
                            For professionals who want control
                            - AI generates shot framework
                            - User fills detailed content
                            - Real-time validation
                   
                   express: ⚡ Fully automatic generation (1-2 min)
                            Fast and efficient
                            - Zero interaction required
                            - AI handles everything
```

### 次要功能 (P1)

#### 8. Batch Operations in Hybrid Mode

```typescript
// 批量操作
const batchAction = await selectFromList(
  '批量操作:',
  [
    { name: '📋 批量应用景别', value: 'batch_shot_type' },
    { name: '📐 批量应用角度', value: 'batch_angle' },
    { name: '🎬 批量应用运镜', value: 'batch_movement' },
  ]
);

if (batchAction === 'batch_shot_type') {
  const shotType = await askShotType('全景');
  const range = await inputText('应用范围 (如: 1-5, 7, 10-12):');
  // 应用到指定范围的镜头
}
```

## Impact

### Affected Specs

1. **three-mode-system** (MODIFIED)
   - 新增中断恢复机制
   - 新增模式推荐逻辑

2. **storyboard-generation** (MODIFIED)
   - 新增特殊要求输入
   - 新增对话输入
   - 新增跳转功能

### Affected Code

**新增文件**:
- `src/education/detailed-tips.ts` - 深度教育内容 (~200行)
- `src/utils/mode-recommendation.ts` - 模式推荐逻辑 (~100行)

**修改文件**:
- `src/modes/base-mode.ts` - 增强状态恢复逻辑
- `src/modes/coach-mode.ts` - 添加特殊要求输入、恢复功能
- `src/modes/hybrid-mode.ts` - 添加对话输入、跳转、恢复功能
- `src/education/tips.ts` - 添加"了解更多"功能
- `src/commands/generate.ts` - 添加模式推荐、更新帮助文本

**总计**: ~500 行新代码 + ~300 行修改

### Breaking Changes

**NONE** - 完全向后兼容

## Success Metrics

**目标**:
- 中断恢复成功率: >95%
- 用户满意度: 4.5/5 → 4.7/5
- 模式推荐准确率: >80% (用户采纳推荐)
- 平均完成时间: 
  - Coach 模式: 20分钟 → 15分钟 (恢复功能)
  - Hybrid 模式: 30分钟 → 25分钟 (跳转功能)

