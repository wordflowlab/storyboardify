# Three-Mode System Specification

## Overview

This capability provides three distinct creation modes (Coach/Express/Hybrid) to accommodate different user needs for AI participation level, time investment, and creative control.

## ADDED Requirements

### Requirement: Coach Mode - AI-Guided Manual Creation

The system SHALL provide a Coach Mode where AI acts as a guide through step-by-step questioning, while the user manually creates every shot.

#### Scenario: Scene-by-scene guided workflow

- **WHEN** user selects Coach Mode for storyboard creation
- **THEN** system processes scenes sequentially
- **AND** for each scene, AI asks:
  1. "这个场景想表达什么情绪/氛围?" (What emotion/atmosphere?)
  2. "你想用几个镜头表现这个场景?" (How many shots?)
  3. For each shot: "想展示什么内容?" (What to show?)
  4. For each shot: AI suggests 景别 based on content, asks "是否采纳?" (Accept suggestion?)
  5. For each shot: "镜头需要运动吗?" (Camera movement?)
- **AND** user provides answers via text input or selection

#### Scenario: Shot-level guidance and theory

- **WHEN** AI suggests a shot type (e.g., "建议使用【远景】,营造氛围")
- **THEN** includes brief cinematography rationale (e.g., "远景适合交代环境")
- **WHEN** user makes unconventional choice (e.g., 特写 for establishing shot)
- **THEN** AI asks "特写通常用于细节或情绪高潮,确定用于开场?" without blocking
- **AND** respects user's final decision (不强制修改)

#### Scenario: Progress tracking and resumption

- **WHEN** user completes shots 1-3 of scene 1 and pauses
- **THEN** system saves Coach Mode state: `{ scene: 1, shot: 3, completed: [1.1, 1.2, 1.3] }`
- **WHEN** user resumes
- **THEN** continues from shot 1.4
- **AND** displays progress: "场景1: 3/5镜头已完成"

#### Scenario: Learning log export

- **WHEN** Coach Mode session completes
- **THEN** generates `ai-coaching-log.md` containing:
  - All AI suggestions and rationales
  - User decisions and overrides
  - Cinematography tips mentioned during session
- **AND** allows user to review learning points later

### Requirement: Express Mode - AI-Generated Quick Creation

The system SHALL provide an Express Mode where AI automatically generates complete storyboards from scripts, requiring only user review.

#### Scenario: One-click generation from script

- **WHEN** user selects Express Mode and provides script
- **THEN** system performs full auto-generation:
  1. Splits script into scenes
  2. Plans shot count per scene (based on word count/complexity)
  3. Generates all shots with complete四要素 annotation
  4. Estimates total duration
- **AND** completes in <30 seconds for 20-30 shot storyboard

#### Scenario: AI-generated shot details

- **WHEN** generating each shot in Express Mode
- **THEN** shot includes:
  - 景别: Selected by AI based on scene progression (远景→中景→特写 pattern)
  - 角度: Inferred from script emotion/power dynamics
  - 运镜: Assigned based on action keywords (e.g., "追赶" → 跟镜)
  - 画面内容: 50-100 word description generated from script
  - 时长: Calculated from dialogue + action estimates
  - 情绪: Extracted from script keywords
  - 绘图Prompt: Generated for each shot

#### Scenario: Post-generation review prompt

- **WHEN** Express Mode generation completes
- **THEN** system displays:
  - "✅ 已生成 28 个镜头,总时长 2分30秒"
  - "请使用 /preview 预览分镜,或 /review 进行审校"
  - "可使用 /regenerate [镜头号] 重新生成单个镜头"
- **AND** transitions to review/edit mode

#### Scenario: Regenerate individual shot

- **WHEN** user runs `/regenerate --shot 1.3`
- **THEN** AI re-generates shot 1.3 with different approach
- **AND** presents 2-3 variations: "变体A(推镜), 变体B(静止), 变体C(跟镜)"
- **AND** user selects preferred variation

#### Scenario: Bulk shot editing

- **WHEN** user runs `/edit --shots 1.1-1.5 --field 时长 --value +2`
- **THEN** increases duration of shots 1.1 through 1.5 by 2 seconds
- **AND** recalculates total scene duration
- **AND** validates new durations (warns if any shot >15s)

### Requirement: Hybrid Mode - Collaborative Framework Fill

The system SHALL provide a Hybrid Mode where AI generates structural框架 (景别/运镜 suggestions) and user fills in creative details (画面内容/情绪/细节).

#### Scenario: Framework generation

- **WHEN** user selects Hybrid Mode
- **THEN** AI generates framework for all scenes:
  - Suggests shot count: "建议 4-6 个镜头"
  - Assigns 景别 distribution: "镜头1: 远景(建议), 镜头2: 中景(建议), ..."
  - Assigns base 运镜: "镜头1: 推镜(建议), 速度: 缓慢(建议)"
  - Leaves user-fill markers: `[请用户填写]` for 画面内容, 角度, 情绪
- **AND** marks suggestions as `(建议)` to indicate they are overridable

#### Scenario: Scene-by-scene fill workflow

- **WHEN** user runs `/fill --scene 1`
- **THEN** system enters interactive fill mode for scene 1:
  - Displays shot 1.1 framework with AI suggestions
  - Prompts: "请描述画面的具体内容 (环境、角色、道具等)"
  - User input: "城市街道,霓虹灯牌,主角背影出现在画面右侧"
  - Prompts: "镜头角度? (平视/仰视/俯视/荷兰角)"
  - User selects: "微微俯视"
  - Prompts: "是否调整运镜? (当前: 推镜)"
  - User: "保持推镜,但速度要慢一点"
  - System: "✅ 镜头 1.1 完成!"
- **AND** continues to shot 1.2

#### Scenario: Batch fill with templates

- **WHEN** user creates a shot template (e.g., "对话镜头模板: 中景+平视+静止")
- **THEN** system allows applying template to multiple shots:
  - `/fill --shots 2.1,2.2,2.3 --template dialogue-shot`
  - AI fills 景别/角度/运镜 from template
  - User only fills 画面内容 and 对话
- **AND** saves 60% fill time for repetitive shot types

#### Scenario: Framework override

- **WHEN** user disagrees with AI景别 suggestion (e.g., AI suggests 中景, user wants 特写)
- **THEN** user overrides: "景别: 特写"
- **AND** system updates shot
- **AND** does NOT warn or question (respects user expertise)

#### Scenario: Integration after fill

- **WHEN** all scenes are filled
- **THEN** user runs `/integrate`
- **AND** system performs final integration:
  - Checks shot连贯性 (no jarring cuts)
  - Adjusts shot时长 distribution (if total exceeds/under target duration)
  - Fills missing optional fields (音效, if scene描述 mentions sounds)
  - Generates绘图Prompt for all shots
- **AND** produces `storyboard-final.md`

### Requirement: Mode Switching

The system SHALL allow users to switch between modes mid-project without data loss.

#### Scenario: Express → Coach mode switch

- **WHEN** user starts in Express Mode, generates storyboard, then switches to Coach Mode
- **THEN** system retains AI-generated shots as starting point
- **AND** allows user to manually refine each shot through guided questions
- **AND** marks refined shots with `[User-refined]` tag

#### Scenario: Coach → Hybrid mode switch

- **WHEN** user starts in Coach Mode, completes scene 1 manually, then switches to Hybrid Mode
- **THEN** scene 1 shots remain unchanged (user-created)
- **AND** scenes 2+ use Hybrid framework (AI generates structure, user fills details)
- **AND** maintains consistent formatting across all scenes

#### Scenario: Mode metadata tracking

- **WHEN** storyboard is saved
- **THEN** includes mode metadata for each scene:
  ```json
  {
    "scene_id": "1.1",
    "creation_mode": "coach",
    "ai_suggestions_used": 3,
    "user_overrides": 1,
    "refinement_count": 2
  }
  ```
- **AND** allows analytics on mode effectiveness

### Requirement: Mode Recommendation

The system SHALL recommend the most suitable mode based on project characteristics and user preferences.

#### Scenario: Mode recommendation on project init

- **WHEN** user runs `/specify` to initialize project
- **THEN** AI analyzes:
  - Script length (short <500 words → Express, long >2000 words → Hybrid)
  - Script complexity (dialogue-heavy → Express, action-heavy → Coach)
  - User experience level (beginner → Express, expert → Coach)
- **AND** displays recommendation:
  ```
  💡 推荐模式: 🔄 混合模式
  理由:
  1. 剧本长度中等 (1500 字),全手动耗时较长
  2. 需要补充小说中没有的视觉细节
  3. AI 框架可节省 50% 时间
  ```
- **AND** allows user to override recommendation

#### Scenario: Mid-project mode switch suggestion

- **WHEN** user spends >30 minutes on scene 1 in Coach Mode
- **THEN** system suggests: "检测到场景1用时较长。是否切换到混合模式,加速后续场景?" (non-intrusive notification)
- **AND** user可 dismiss或 accept switch

## Implementation Notes

- Coach Mode SHOULD track user decisions to improve future AI suggestions (learning user preferences)
- Express Mode generation MUST be deterministic with same input (for reproducibility)
- Hybrid Mode framework SHOULD be adjustable granularity (minimal/moderate/detailed)
- Mode switching MUST preserve all user-created content (no data loss)
- Mode metadata SHOULD be included in export for project analytics
