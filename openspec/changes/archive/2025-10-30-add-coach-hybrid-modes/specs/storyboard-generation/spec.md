# storyboard-generation Specification Deltas

## MODIFIED Requirements

### Requirement: Scene-to-Shots Decomposition

The system SHALL extend scene splitting algorithm to support interactive mode hints and user input validation.

**Changes**: Extend scene splitting to support interactive mode hints

#### Scenario: Scene splitting with user input

- **WHEN** Coach Mode asks user "你想用几个镜头表现这个场景?"
- **THEN** system provides AI suggestion based on scene complexity:
  ```
  场景: 雨夜街头
  AI分析:
  - 复杂度: 中等
  - 建议镜头数: 4-5个
  - 理由: 场景包含环境建立、角色出场、对话3个要素

  ? 你想用几个镜头? (输入数字 1-15) [4]
  ```
- **AND** validates user input (1-15 range)
- **AND** respects user override (e.g., user chooses 6 instead of 4)

#### Scenario: Scene splitting for Hybrid framework

- **WHEN** Hybrid Mode generates framework
- **THEN** uses enhanced `splitSceneIntoShots` with framework mode:
  ```typescript
  const splitResult = splitSceneIntoShots(scene, sceneSheet, {
    mode: 'framework',
    include_suggestions: true,
    include_rationale: true
  });
  ```
- **AND** result includes:
  ```typescript
  {
    estimated_shots: 4,
    shot_plans: [
      {
        shot_number: 1,
        suggested_shot_type: '全景',
        suggested_angle: '平视',
        content_focus: '建立环境',
        rationale: '开场镜头建议用全景展示空间关系',
        is_user_fillable: true  // ← NEW
      }
    ]
  }
  ```

### Requirement: Shot Design Automation

The system SHALL extend shot design to support suggestion mode with confidence scores and auto-generation mode.

**Changes**: Extend shot design to support suggestions vs. auto-generation modes

#### Scenario: Suggestion mode for Hybrid

- **WHEN** generating shots in Hybrid Mode
- **THEN** shot design includes `suggestion_confidence` scores:
  ```typescript
  {
    shot_type: '中景',
    suggestion_confidence: 0.85,  // 85% confidence
    alternative_suggestions: ['近景', '全景'],
    rationale: '对话场景建议中景,但可考虑近景增强情绪'
  }
  ```
- **AND** user can see confidence and alternatives
- **AND** low-confidence suggestions (<70%) are flagged:
  ```
  ⚠ AI对此镜头建议置信度较低(65%),建议您仔细斟酌
  ```

#### Scenario: Auto-generation mode for Express

- **WHEN** generating shots in Express Mode
- **THEN** uses high-confidence direct generation:
  ```typescript
  const shot = generateShot(context, {
    mode: 'auto',
    confidence_threshold: 0.8,
    fallback_to_defaults: true
  });
  ```
- **AND** no user interaction required

### Requirement: Camera Movement Annotation

The system SHALL extend camera optimizer to provide detailed rationale and alternatives for interactive modes.

**Changes**: Extend camera optimizer to provide rationale for Coach/Hybrid modes

#### Scenario: Camera movement with rationale

- **WHEN** optimizing camera movement in Coach or Hybrid mode
- **THEN** returns detailed rationale:
  ```typescript
  const cameraParams = optimizeCameraParameters(context, {
    include_rationale: true,
    include_alternatives: true
  });

  // Returns:
  {
    movement: {
      type: '推',
      speed: '中速',
      description: '推镜聚焦情绪'
    },
    rationale: '推镜适合此场景,因为: 1) 情绪需要逐步增强 2) 从环境聚焦到角色 3) 中速保持自然节奏',
    alternatives: [
      { type: '静止', reason: '如果想保持客观视角' },
      { type: '摇', reason: '如果想展示更多环境' }
    ]
  }
  ```
- **AND** rationale is displayed in Coach Mode education tips
- **AND** alternatives are shown in Hybrid Mode for user selection

## ADDED Requirements

### Requirement: Interactive Shot Refinement

The system SHALL support interactive refinement of individual shots in Coach Mode.

#### Scenario: Shot-by-shot refinement

- **WHEN** Coach Mode generates a shot based on user answers
- **THEN** displays shot preview:
  ```
  ✓ 镜头 1.1 已生成

  【预览】
  景别: 全景
  角度: 平视
  运镜: 推镜 (中速)
  内容: 城市街道全景,霓虹灯闪烁,雨水反射灯光。主角背影出现在画面右侧。
  时长: 4秒

  ? 满意此镜头吗? (Use arrow keys)
  ❯ ✓ 确认,继续下一镜头
    🔧 修改此镜头
    🔄 重新生成此镜头
    ℹ️  查看详细信息
  ```
- **WHEN** user selects "🔧 修改此镜头"
- **THEN** enters edit mode:
  ```
  ? 修改哪个字段?
    景别 (当前: 全景)
  ❯ 角度 (当前: 平视)
    运镜 (当前: 推镜)
    内容
    时长 (当前: 4秒)
  ```

#### Scenario: Regenerate with variation

- **WHEN** user selects "🔄 重新生成此镜头"
- **THEN** AI generates 2-3 variations:
  ```
  🔄 生成变体中...

  请选择镜头变体:

  ❯ 变体A: 远景 + 俯视 + 静止
    「用远景+俯视营造孤独感,静止镜头强化氛围」

    变体B: 全景 + 平视 + 拉镜
    「保持全景,但改用拉镜展示环境到角色的关系」

    变体C: 中景 + 仰视 + 推镜
    「改用中景+仰视,推镜聚焦角色情绪」

    放弃,保留原方案
  ```

### Requirement: Framework Validation

The system SHALL validate Hybrid Mode framework before user fill.

#### Scenario: Framework consistency check

- **WHEN** Hybrid Mode generates framework
- **THEN** validates:
  1. No 3+ consecutive same shot types
  2. Opening/closing shots follow best practices (开场用全景/远景, 收尾用特写/全景)
  3. Shot count per scene is reasonable (3-8 shots for typical scene)
  4. Camera movement distribution is balanced (not all 静止 or all 推镜)
- **WHEN** validation finds issues
- **THEN** auto-corrects and notifies:
  ```
  ⚠ AI检测到框架问题并已自动修正:
  - 镜头1.3-1.5 连续3个特写 → 调整为 特写/中景/特写
  - 场景2开场使用特写 → 调整为全景

  修正后的框架已准备好供您填充。
  ```

#### Scenario: Framework summary validation

- **WHEN** framework generation completes
- **THEN** displays validation summary:
  ```
  🔍 框架质量检查:

  ✓ 景别分布: 远景×2, 全景×4, 中景×3, 近景×2, 特写×1 (合理)
  ✓ 运镜多样性: 5种运镜类型 (良好)
  ✓ 开场/收尾: 符合规范
  ⚠ 平均时长: 3.2秒 (略短,建议部分镜头延长至4-5秒)

  总体评分: 85/100 (优秀)
  ```

### Requirement: Batch Operations

The system SHALL support batch operations for efficient editing.

#### Scenario: Batch adjust duration

- **WHEN** user wants to extend duration for multiple shots
- **THEN** supports batch command:
  ```bash
  # In Hybrid mode after filling
  ? 是否需要批量调整镜头? (y/n) [n]
  > y

  ? 选择批量操作:
    调整多个镜头的时长
  ❯ 调整多个镜头的运镜速度
    为多个镜头添加音效
    取消

  ? 选择镜头范围:
    场景1所有镜头
    场景2所有镜头
  ❯ 自定义范围 (输入: 1.1,1.3-1.5,2.1)

  > 1.1,1.3-1.5

  ? 将运镜速度改为:
  ❯ 慢
    中
    快

  ✓ 已调整 4 个镜头的运镜速度
  ```

### Requirement: Template System

The system SHALL support shot templates for repetitive patterns.

#### Scenario: Define custom template

- **WHEN** user creates a template during Hybrid Mode
- **THEN** saves template for reuse:
  ```
  ? 保存此镜头配置为模板吗? (y/n) [n]
  > y

  ? 模板名称: [对话镜头-双人]

  ? 模板包含哪些字段?
    ✓ 景别: 中景
    ✓ 角度: 平视
    ✓ 运镜: 静止
    ☐ 内容 (每次不同)
    ☐ 时长 (每次不同)

  ✓ 模板已保存: ~/.storyboardify/templates/对话镜头-双人.json
  ```

#### Scenario: Apply template to shots

- **WHEN** filling shot in Hybrid Mode
- **THEN** offers template quick apply:
  ```
  ? 镜头 2.3 - 使用模板? (y/n) [n]
  > y

  ? 选择模板:
  ❯ 对话镜头-双人
    动作镜头-追逐
    环境镜头-建立
    自定义...

  ✓ 已应用模板「对话镜头-双人」

  景别: 中景 ✓
  角度: 平视 ✓
  运镜: 静止 ✓

  ? 请描述画面内容: (仍需填写)
  ```

### Requirement: Generation Mode Analytics

The system SHALL track generation mode usage and effectiveness.

#### Scenario: Mode effectiveness tracking

- **WHEN** user completes storyboard in any mode
- **THEN** saves analytics:
  ```json
  {
    "analytics": {
      "mode": "coach",
      "duration_minutes": 18,
      "total_shots": 12,
      "ai_suggestions_accepted": 9,
      "user_overrides": 3,
      "regenerations": 2,
      "average_time_per_shot_seconds": 90,
      "education_tips_viewed": 15
    }
  }
  ```
- **AND** displays summary:
  ```
  📊 创作统计:

  用时: 18分钟
  平均每镜头: 1.5分钟
  AI建议采纳率: 75%
  重新生成次数: 2

  💡 提示: 您的创作效率较高!下次可考虑尝试 Hybrid 模式进一步提速。
  ```

#### Scenario: Cross-session learning

- **WHEN** user has completed 3+ projects
- **THEN** system learns preferences:
  ```
  💡 个性化建议:

  基于您的历史创作:
  - 您偏好使用「平视」角度 (使用率 68%)
  - 您经常自定义「画面内容」(重写率 85%)
  - 建议: Hybrid 模式可能更适合您(AI生成框架,您填充内容)
  ```
