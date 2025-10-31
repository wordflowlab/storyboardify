## ADDED Requirements

### Requirement: Dialogue Content Input

The system SHALL support adding dialogue content during storyboard generation.

#### Scenario: Add dialogue in Hybrid mode

- **WHEN** Hybrid mode fills a shot
- **THEN** prompts: "这个镜头是否包含对话？"
- **WHEN** user confirms dialogue exists
- **THEN** enters dialogue input loop
- **AND** prompts for character selection from production pack
- **AND** prompts for dialogue text

#### Scenario: Multiple dialogue entries per shot

- **WHEN** user adds first dialogue
- **THEN** prompts: "是否添加更多对话？"
- **WHEN** user adds multiple dialogues
- **THEN** stores as array in `shot.effects.dialogue`
- **AND** displays dialogue count in summary: "对话×3"

#### Scenario: Dialogue validation

- **WHEN** user inputs dialogue text
- **THEN** validates text is not empty
- **AND** validates length <= 500 characters
- **WHEN** validation fails
- **THEN** displays error and prompts again

### Requirement: Special Requirements Metadata

The system SHALL capture and apply special requirements for scene generation.

#### Scenario: Capture special requirements

- **WHEN** Coach mode processes a scene
- **THEN** prompts: "是否有特殊要求？"
- **WHEN** user provides text (e.g., "需要慢动作效果")
- **THEN** validates length <= 200 characters
- **AND** stores in scene metadata

#### Scenario: Apply special requirements to generation

- **WHEN** generating shots with special requirements
- **THEN** AI considers requirements in shot planning
- **AND** includes requirements context in drawing prompts
- **AND** displays requirements in shot preview

## MODIFIED Requirements

### Requirement: State Persistence and Recovery

The system SHALL persist generation state and support recovery from interruptions.

#### Scenario: Auto-save during Coach mode

- **WHEN** Coach mode completes each shot
- **THEN** auto-saves state to `.storyboardify/mode-state.json`
- **AND** includes:
  ```json
  {
    "mode": "coach",
    "current_scene_index": 2,
    "current_shot_index": 3,
    "completed_scenes": [...],
    "current_scene_shots": [...],
    "started_at": "2025-10-30T10:00:00Z",
    "last_saved_at": "2025-10-30T10:15:23Z"
  }
  ```

#### Scenario: Auto-save during Hybrid mode

- **WHEN** Hybrid mode completes each shot fill
- **THEN** auto-saves state with:
  ```json
  {
    "mode": "hybrid",
    "current_shot_index": 8,
    "framework": [...],
    "filled_shots": [...],
    "last_saved_at": "2025-10-30T11:30:45Z"
  }
  ```

#### Scenario: Clear state on completion

- **WHEN** mode generation completes successfully
- **THEN** clears saved state file
- **AND** displays: "✅ 分镜生成完成"
- **AND** removes `.storyboardify/mode-state.json`

