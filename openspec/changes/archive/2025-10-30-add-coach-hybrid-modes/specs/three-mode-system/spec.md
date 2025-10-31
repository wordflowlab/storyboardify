# three-mode-system Specification Deltas

## MODIFIED Requirements

### Requirement: Coach Mode - AI-Guided Manual Creation

The system SHALL implement interactive CLI-based Coach Mode with education tips and progress persistence.

**Changes**: Implementing full Coach Mode as specified in original spec

#### Scenario: Interactive CLI implementation

- **WHEN** user selects Coach Mode via `storyboardify generate --mode coach`
- **THEN** system uses `inquirer.js` for interactive prompts
- **AND** displays scene context before each question:
  ```
  📝 场景 1/3: 雨夜街头
  位置: 城市街道
  时间: 夜晚22:00

  ? 这个场景想表达什么情绪/氛围? (Use arrow keys)
  ❯ 😰 紧张 - 快节奏,短镜头
    💖 温馨 - 慢节奏,长镜头
    😢 悲伤 - 特写为主,情绪镜头
    😄 欢快 - 动态运镜,多角度
    ❓ 让AI决定
  ```
- **AND** provides keyboard navigation (arrow keys + enter)

#### Scenario: Education tips display

- **WHEN** user selects a shot type (e.g., "远景")
- **THEN** system displays contextual tip:
  ```
  💡 分镜技巧: 远景用于建立空间关系,展示角色与环境的关系。适合开场或场景切换。

  按回车继续,或输入 'h' 了解更多...
  ```
- **AND** user can request deep dive on cinematography theory
- **AND** tips are context-aware (e.g., fast-pacing tips for action scenes)

#### Scenario: Progress persistence

- **WHEN** Coach Mode is interrupted (Ctrl+C or process exit)
- **THEN** system saves state to `.storyboardify/mode-state.json`:
  ```json
  {
    "mode": "coach",
    "started_at": "2025-10-30T12:00:00Z",
    "last_saved_at": "2025-10-30T12:15:00Z",
    "current_scene_index": 1,
    "current_shot_index": 2,
    "data": {
      "questions_asked": [...],
      "user_answers": [...],
      "generated_shots": [...]
    }
  }
  ```
- **WHEN** user re-runs `storyboardify generate`
- **THEN** detects saved state and prompts:
  ```
  ? 检测到未完成的 Coach 模式进度 (场景2, 镜头3),是否继续? (Y/n)
  ```

#### Scenario: Skip quick answer option

- **WHEN** user presses 'Enter' without selecting (on any prompt with AI suggestion)
- **THEN** system uses AI's default recommendation
- **AND** displays: "✓ 使用AI建议: 全景"
- **AND** allows fast-forward through prompts for experienced users

### Requirement: Hybrid Mode - Collaborative Framework Fill

The system SHALL implement Hybrid Mode with AI framework generation, interactive user fill, and real-time validation.

**Changes**: Implementing full Hybrid Mode as specified in original spec

#### Scenario: Framework preview before fill

- **WHEN** Hybrid Mode framework generation completes
- **THEN** displays framework overview:
  ```
  🎨 混合模式框架已生成

  场景1: 雨夜街头 (4个镜头)
    镜头1: 全景 / 平视 / 推镜 [待填充内容]
    镜头2: 中景 / 平视 / 静止 [待填充内容]
    镜头3: 特写 / 仰视 / 推镜 [待填充内容]
    镜头4: 远景 / 俯视 / 拉镜 [待填充内容]

  场景2: 心理诊所 (3个镜头)
    ...

  总计: 3个场景, 12个镜头

  ? 开始填充内容? (Y/n)
  ```
- **AND** allows user to review before committing to fill process

#### Scenario: Content editor integration

- **WHEN** user is prompted for "画面内容描述"
- **THEN** opens system editor (via `inquirer.editor`):
  ```
  # 镜头 1.1 - 画面内容

  ## AI建议:
  城市街道全景,霓虹灯闪烁,雨水反射灯光。

  ## 请在下方编写您的内容:



  [保存并关闭编辑器以继续]
  ```
- **AND** user can write multi-line descriptions
- **AND** AI suggestion is pre-filled as reference

#### Scenario: Real-time validation feedback

- **WHEN** user fills a shot with very short content (< 10 chars)
- **THEN** displays non-blocking warning:
  ```
  ⚠ 建议: 画面内容较简短,可能需要补充环境/角色/道具等细节

  ? 是否继续? (y/n) [y]
  ```
- **WHEN** user fills shot duration > 15 seconds
- **THEN** displays:
  ```
  ⚠ 建议: 单个镜头时长较长(16秒),考虑拆分为两个镜头以增强节奏感

  ? 是否继续? (y/n) [y]
  ```
- **AND** validation is suggestive, not blocking

#### Scenario: Batch accept AI suggestions

- **WHEN** user sees framework with AI suggestions they agree with
- **THEN** can select "批量采纳建议":
  ```
  ? 镜头 1.1 - 景别: (Use arrow keys)
    全景 (AI建议) ✓
    远景
    中景
    近景
  ❯ 批量采纳此场景所有AI建议
  ```
- **AND** system fills remaining shots in scene with AI suggestions
- **AND** only prompts for content descriptions

### Requirement: Mode Switching

The system SHALL allow mode switching with state migration and mixed-mode metadata tracking.

**Changes**: Implementing mode switching with state migration

#### Scenario: Switching with data migration

- **WHEN** user generates storyboard in Express Mode
- **AND** runs `storyboardify generate --mode coach --from-existing`
- **THEN** system loads existing storyboard as starting point
- **AND** enters Coach Mode for refinement of each shot
- **AND** user can choose to skip shots they're satisfied with

#### Scenario: Mixed-mode metadata

- **WHEN** storyboard contains shots from multiple modes
- **THEN** `storyboard.json` includes mode metadata:
  ```json
  {
    "metadata": {
      "generation_modes_used": ["express", "coach"],
      "mode_distribution": {
        "express": 8,
        "coach_refined": 4
      }
    },
    "scenes": [
      {
        "scene_id": "scene_001",
        "shots": [
          {
            "shot_number": 1,
            "creation_mode": "express",
            "refined_by": "coach",
            ...
          }
        ]
      }
    ]
  }
  ```
## ADDED Requirements

### Requirement: Progress Indicators

The system SHALL display progress and estimated time for Coach and Hybrid modes.

#### Scenario: Bottom bar progress display

- **WHEN** user is in Coach or Hybrid mode
- **THEN** displays bottom bar with progress:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  进度: 场景 2/3 | 镜头 6/12 (50%) | 预估剩余: 8分钟
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```
- **AND** updates after each shot completion
- **AND** estimated time is calculated based on average time per shot

#### Scenario: Completion celebration

- **WHEN** all shots are completed
- **THEN** displays success message:
  ```
  🎉 Coach模式分镜创作完成!

  总用时: 15分钟
  完成镜头: 12个
  AI建议采纳: 8/12 (67%)
  用户自定义: 4/12 (33%)

  ✓ 分镜已保存: storyboard.json

  📋 下一步:
    - 运行 storyboardify export 导出分镜
    - 运行 storyboardify review 审校分镜
  ```

### Requirement: Mode Comparison Helper

The system SHALL provide a mode comparison table to help users choose.

#### Scenario: Mode selection with comparison

- **WHEN** user runs `storyboardify generate` without --mode flag
- **THEN** displays mode comparison:
  ```
  ? 选择分镜生成模式: (Use arrow keys)

  ┌─────────┬─────────────────┬─────────┬─────────┬────────────┐
  │ 模式    │ 适合人群        │ 用时    │ 掌控度  │ 学习价值   │
  ├─────────┼─────────────────┼─────────┼─────────┼────────────┤
  │ 🎓 Coach│ 新手,学习者     │ 10-20分 │ ★★★★★  │ ★★★★★     │
  │ 🎨 Hybrid│ 专业用户       │ 20-30分 │ ★★★★☆  │ ★★★☆☆     │
  │ ⚡ Express│ 快速创作      │ 1-2分   │ ★☆☆☆☆  │ ★☆☆☆☆     │
  └─────────┴─────────────────┴─────────┴─────────┴────────────┘

  ❯ 🎓 Coach 模式 - AI引导学习,逐步设计
    🎨 Hybrid 模式 - AI框架+人工定制
    ⚡ Express 模式 - 全自动AI生成
  ```
- **AND** highlights recommended mode based on user's history (if exists)

### Requirement: Keyboard Shortcuts

The system SHALL support keyboard shortcuts for common operations.

#### Scenario: Shortcut help display

- **WHEN** user presses '?' during any Coach/Hybrid prompt
- **THEN** displays shortcut help:
  ```
  ⌨️  键盘快捷键:

  ↑↓  - 选择选项
  Enter - 确认选择
  Ctrl+C - 保存并退出
  s - 跳过当前问题,使用AI建议
  b - 返回上一个问题
  h - 查看帮助
  ? - 显示此帮助

  按任意键返回...
  ```

#### Scenario: Quick skip with 's'

- **WHEN** user presses 's' on any prompt
- **THEN** uses AI's default suggestion
- **AND** immediately moves to next prompt
- **AND** displays: "⏭ 已跳过,使用AI建议"
