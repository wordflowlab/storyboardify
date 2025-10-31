## ADDED Requirements

### Requirement: Session Resume Capability

The system SHALL support resuming interrupted sessions for Coach and Hybrid modes.

#### Scenario: Coach mode resume from saved state

- **WHEN** user starts Coach mode and a saved state exists
- **THEN** system prompts: "检测到未完成的进度 (场景 2/5, 镜头 3/4)，是否继续？"
- **WHEN** user confirms resume
- **THEN** system skips completed scenes and shots
- **AND** continues from the exact interruption point
- **AND** preserves all previous answers and generated content

#### Scenario: Hybrid mode resume from saved state

- **WHEN** user starts Hybrid mode and a saved state exists  
- **THEN** system prompts: "已完成 8/15 个镜头，是否继续？"
- **WHEN** user confirms resume
- **THEN** system skips already filled shots
- **AND** displays progress: ✓✓✓✓✓✓✓✓ ○○○○○○○
- **AND** continues filling from next unfilled shot

### Requirement: Mode Recommendation System

The system SHALL recommend the most suitable generation mode based on project analysis.

#### Scenario: Recommend Express mode for simple projects

- **WHEN** project has <=3 scenes and <500 words
- **THEN** system recommends Express mode
- **AND** displays reason: "项目规模较小，推荐使用 Express 模式快速生成"
- **AND** allows user to override recommendation

#### Scenario: Recommend Hybrid mode for complex projects

- **WHEN** project has >=5 scenes or >1000 words
- **THEN** system recommends Hybrid mode
- **AND** displays reason: "项目较复杂，推荐使用 Hybrid 模式以便精细控制"

#### Scenario: Recommend Coach mode for learning

- **WHEN** project complexity is medium (3-5 scenes, 500-1000 words)
- **THEN** system recommends Coach mode
- **AND** displays reason: "适合学习分镜技巧，推荐使用 Coach 模式"

## MODIFIED Requirements

### Requirement: Coach Mode Interactive Guidance

The system SHALL provide interactive AI-guided storyboard creation with educational support.

#### Scenario: Scene guidance with special requirements

- **WHEN** Coach mode processes a scene
- **THEN** asks for mood/atmosphere
- **AND** suggests shot count based on complexity
- **AND** prompts: "是否有特殊要求？(可选，如'需要慢动作'、'使用黑白色调'等)"
- **WHEN** user provides special requirements (max 200 chars)
- **THEN** incorporates requirements into shot generation
- **AND** displays requirements in shot preview

#### Scenario: Deep dive education

- **WHEN** system shows an education tip (e.g., about 推镜)
- **THEN** prompts: "💡 想了解更多关于此技巧的详细信息吗？"
- **WHEN** user confirms
- **THEN** displays detailed content:
  ```
  📚 深度学习: 推镜技巧
  
  【理论】
  推镜通过逐渐靠近主体，引导观众注意力...
  
  【经典案例】
  - 《公民凯恩》opening shot
  - 《教父》餐厅场景
  
  【常见误区】
  - 推镜过快导致观众不适
  - 缺少明确对焦目标
  
  【应用建议】
  - 推镜速度应匹配情绪节奏
  - 结合音效增强效果
  ```

## ADDED Requirements

### Requirement: Hybrid Mode Navigation Controls

The system SHALL provide flexible navigation controls in Hybrid mode for efficient shot filling.

#### Scenario: Skip and return to shots

- **WHEN** Hybrid mode presents a shot for filling
- **THEN** offers actions:
  ```
  ? 选择操作:
  ❯ ✓ 填充此镜头
    ⏭ 跳过此镜头（稍后填充）
    ⏮ 返回上一镜头
    🔍 跳转到特定镜头
  ```
- **WHEN** user selects "跳过此镜头"
- **THEN** marks shot as unfilled and continues to next shot

#### Scenario: Jump to specific shot index

- **WHEN** user selects "跳转到特定镜头"
- **THEN** prompts: "跳转到镜头 (1-15):"
- **WHEN** user enters valid index
- **THEN** jumps to that shot
- **AND** allows filling from that position

#### Scenario: Fill remaining unfilled shots

- **WHEN** user completes main filling loop
- **AND** some shots were skipped
- **THEN** displays: "还有 3 个镜头未填充，是否现在填充？"
- **WHEN** user confirms
- **THEN** loops through unfilled shots only

