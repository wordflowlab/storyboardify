# Storyboard Generation Specification

## Overview

This capability enables AI-assisted storyboard script generation from screenplay content, supporting three creation modes (Coach/Express/Hybrid) and following standardized four-element storyboard notation (景别/角度/运镜/情绪).

## ADDED Requirements

### Requirement: Scene Splitting Algorithm

The system SHALL automatically split screenplay scripts into individual scenes based on time, location, and character changes.

#### Scenario: Basic scene detection

- **WHEN** script contains standard scene headers (e.g., "场景1: 雨夜街头", "INT. 办公室 - 白天")
- **THEN** system creates scene boundaries at each header
- **AND** assigns scene IDs in format `1.X` (episode.scene)
- **AND** extracts scene metadata: name, location, time, interior/exterior

#### Scenario: Implicit scene boundary detection

- **WHEN** script lacks explicit scene headers but has time/location transitions (e.g., "三小时后", "切换到医院")
- **THEN** system detects implicit boundaries using NLP
- **AND** inserts inferred scene markers with confidence score
- **AND** prompts user to confirm: "Detected scene change at line X (confidence: 85%). Confirm?"

#### Scenario: Character-based scene splitting

- **WHEN** all on-screen characters change between script sections
- **THEN** system considers this a potential scene boundary
- **AND** combines with location/time analysis for final decision
- **AND** avoids over-splitting during brief character exits (e.g., "李墨暂时离开,30秒后返回")

### Requirement: Shot Planning Algorithm

The system SHALL generate shot plans for each scene, determining shot count, types, and sequencing.

#### Scenario: Shot count estimation

- **WHEN** scene word count is 100-200 words (short dialogue scene)
- **THEN** suggests 4-6 shots
- **WHEN** scene word count is 500+ words (complex action scene)
- **THEN** suggests 10-15 shots
- **AND** adjusts for dialogue ratio: high dialogue → fewer shots (allow longer takes)

#### Scenario: Shot type distribution

- **WHEN** generating shots for any scene
- **THEN** follows distribution guideline:
  - 远景 (ELS): 10-15% (establishing shots)
  - 全景 (FS): 15-20% (full body, action)
  - 中景 (MS): 30-40% (dialogue, default)
  - 近景 (CS): 20-25% (emotion, close interaction)
  - 特写 (CU): 10-15% (detail, peak emotion)
- **AND** avoids 3+ consecutive shots of same type
- **AND** prioritizes variety for visual interest

#### Scenario: Shot sequencing logic

- **WHEN** scene starts
- **THEN** first shot SHOULD be 远景 or 全景 (establish environment)
- **WHEN** dialogue begins
- **THEN** transitions to 中景 or 近景 (show speakers)
- **WHEN** emotional peak occurs
- **THEN** uses 特写 (amplify emotion)
- **WHEN** scene ends
- **THEN** may use 拉镜 or 远景 (release tension, transition)

### Requirement: Camera Angle Assignment

The system SHALL assign appropriate camera angles based on scene content and emotional intent.

#### Scenario: Default angle assignment

- **WHEN** no specific angle cues in script
- **THEN** defaults to 平视 (eye-level, neutral)
- **AND** uses 平视 for 60-70% of shots (natural viewing)

#### Scenario: Power dynamic angles

- **WHEN** script indicates power imbalance (e.g., "老板俯视小明", "孩子仰望父亲")
- **THEN** uses 仰视 for powerful character POV (looking up at them)
- **AND** uses 俯视 for vulnerable character POV (looking down at them)

#### Scenario: Emotional intensity angles

- **WHEN** scene has high tension or chaos (e.g., "战斗爆发", "心理崩溃")
- **THEN** may use 荷兰角 (Dutch tilt, 15-45° tilt) to convey unease
- **WHEN** scene shows vast scale or god's-eye view
- **THEN** uses 鸟瞰 (90° top-down view)

### Requirement: Camera Movement Design

The system SHALL assign camera movements that enhance storytelling and emotional impact.

#### Scenario: Static shot assignment

- **WHEN** scene focuses on dialogue without physical action
- **THEN** uses 静止 (static) camera for 40-50% of shots
- **AND** allows viewer to focus on performance and dialogue

#### Scenario: Push-in for tension

- **WHEN** script indicates rising tension, revelation, or focus shift
- **THEN** uses 推镜 (push in) with 缓慢 or 正常 speed
- **AND** speed curve: Ease In (slow start, accelerate toward subject)

#### Scenario: Pull-out for reveal

- **WHEN** script shows character realization or expanding context
- **THEN** uses 拉镜 (pull out) to reveal surrounding environment
- **AND** speed curve: Ease Out (fast start, decelerate)

#### Scenario: Follow shot for movement

- **WHEN** character walks, runs, or moves through space
- **THEN** uses 跟镜 (follow shot) or 移镜 (tracking shot)
- **AND** matches movement speed to character speed (slow walk → 缓慢, chase → 快速)

#### Scenario: Pan for space exploration

- **WHEN** scene introduces new environment or scans across characters
- **THEN** uses 摇镜 (pan) horizontally
- **AND** speed: 缓慢 (3-5 seconds to complete pan)

### Requirement: Shot Duration Estimation

The system SHALL assign realistic shot durations based on content complexity.

#### Scenario: Dialogue shot duration

- **WHEN** shot contains dialogue
- **THEN** duration = dialogue word count / 3 words per second + 1 second buffer
- **AND** minimum 2 seconds, maximum 15 seconds

#### Scenario: Action shot duration

- **WHEN** shot contains physical action (e.g., "李墨翻过围墙")
- **THEN** estimates based on action complexity:
  - Simple action (stand, sit): 2-3 seconds
  - Moderate action (walk, turn): 3-5 seconds
  - Complex action (fight, chase): 5-10 seconds

#### Scenario: Emotional reaction shot duration

- **WHEN** shot shows character reacting without dialogue
- **THEN** assigns 2-4 seconds for viewer to register emotion
- **AND** extends to 5-8 seconds for dramatic pause or重要情绪时刻

### Requirement: Four-Element Shot Annotation

The system SHALL annotate every shot with the four mandatory storyboard elements: 基础信息, 运镜参数, 情绪标注, 动态效果.

#### Scenario: Complete shot annotation

- **WHEN** generating a shot
- **THEN** shot data includes:
  - **基础信息**: 镜号, 景别, 角度, 画面内容 (all required)
  - **运镜参数**: 运镜方式, 速度, 速度曲线 (all required)
  - **情绪标注**: 情绪/氛围, 节奏 (recommended)
  - **动态效果**: 音效, 转场, 特效 (optional)
- **AND** all required fields are non-empty
- **AND** values conform to enumerated options (e.g., 景别 ∈ {远景, 全景, 中景, 近景, 特写})

#### Scenario: Emotion tag extraction

- **WHEN** script contains emotional keywords (e.g., "紧张", "浪漫", "悲伤")
- **THEN** system tags shot with matching 情绪/氛围
- **AND** propagates emotion to camera movement (e.g., "紧张" → 推镜 + 快速)

#### Scenario: Sound effect suggestion

- **WHEN** script describes sounds (e.g., "雨声", "脚步声", "爆炸")
- **THEN** system adds 音效 field with extracted sound
- **AND** suggests sound intensity (low/medium/high)

### Requirement: Drawing Prompt Generation per Shot

The system SHALL generate AI drawing prompts for each shot to assist visual pre-production.

#### Scenario: Shot-specific prompt generation

- **WHEN** generating prompt for a shot
- **THEN** combines:
  - Character appearance (from production pack)
  - Scene environment (from production pack)
  - Shot-specific details (景别, 角度, 动作, 情绪)
- **AND** formats as: `[shot content], [shot type keywords], [camera angle], [emotion/atmosphere], [style]`

#### Scenario: Prompt variation for same scene

- **WHEN** multiple shots occur in same scene
- **THEN** reuses scene base prompt (environment, lighting)
- **AND** varies character position, expression, and shot framing
- **AND** maintains visual consistency across shots

### Requirement: Storyboard Validation

The system SHALL validate generated storyboards against quality and completeness standards.

#### Scenario: Mandatory field validation

- **WHEN** storyboard generation completes
- **THEN** validates every shot has:
  - Non-empty 景别, 角度, 运镜方式
  - 画面内容 with minimum 10 characters
  - Numeric duration between 1-60 seconds
- **AND** lists any validation failures with shot references

#### Scenario: Shot type distribution check

- **WHEN** validating a scene
- **THEN** checks if any shot type exceeds 50% of scene (indicates lack of variety)
- **AND** warns if 远景 is 0% (missing establishing shot)
- **AND** warns if 3+ consecutive shots of same type

#### Scenario: Camera movement reasonableness check

- **WHEN** validating camera movements
- **THEN** flags unrealistic combinations:
  - 特写 + 移镜 (close-up + tracking: visually jarring)
  - 远景 + 推镜 to 特写 in 2 seconds (too fast)
  - 5+ consecutive 推镜 (repetitive, loses impact)
- **AND** suggests alternatives

## Implementation Notes

- Scene splitting MAY use LLM (Claude/GPT) for implicit boundary detection with confidence scoring
- Shot count SHOULD be user-adjustable (AI suggestion is starting point, not constraint)
- Camera angle enum MUST be extensible (allow custom angles like "虫视" for advanced users)
- Drawing prompts SHOULD reference production pack IDs to ensure consistency
- Validation SHOULD be non-blocking (warnings, not errors) to allow creative flexibility
