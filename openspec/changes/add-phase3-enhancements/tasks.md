# Implementation Tasks: Phase 3.2 Enhancements

## 1. Resume from Saved State

### 1.1 Coach Mode Resume

- [ ] 1.1.1 Update `CoachModeState` to include `completed_scenes` and `current_scene_shots`
- [ ] 1.1.2 Implement `resumeFromState()` in `CoachMode`
- [ ] 1.1.3 Skip completed scenes and resume from `current_scene_index`
- [ ] 1.1.4 Continue from `current_shot_index` within current scene
- [ ] 1.1.5 Display resume summary showing progress
- [ ] 1.1.6 Test resume with interrupted sessions

### 1.2 Hybrid Mode Resume

- [ ] 1.2.1 Update `HybridModeState` to include `filled_shots` array
- [ ] 1.2.2 Implement `resumeFromState()` in `HybridMode`
- [ ] 1.2.3 Skip already filled shots
- [ ] 1.2.4 Display progress bar showing filled vs remaining shots
- [ ] 1.2.5 Test resume with partially filled framework

## 2. Special Requirements Input (Coach Mode)

- [ ] 2.1 Add `askSpecialRequirements()` method in `CoachMode`
- [ ] 2.2 Prompt user for special requirements after mood selection
- [ ] 2.3 Validate input (max 200 characters)
- [ ] 2.4 Pass special requirements to shot generation logic
- [ ] 2.5 Display special requirements in shot preview
- [ ] 2.6 Store special requirements in scene metadata

## 3. Dialogue Input (Hybrid Mode)

- [ ] 3.1 Add `askDialogue()` method in `HybridMode`
- [ ] 3.2 Prompt user if shot contains dialogue
- [ ] 3.3 Allow adding multiple dialogue entries per shot
- [ ] 3.4 Select character from production pack characters
- [ ] 3.5 Input dialogue text with validation
- [ ] 3.6 Store dialogues in `shot.effects.dialogue`
- [ ] 3.7 Display dialogue count in shot summary

## 4. "Learn More" Feature

### 4.1 Detailed Education Content

- [ ] 4.1.1 Create `src/education/detailed-tips.ts`
- [ ] 4.1.2 Define `DETAILED_EDUCATION` with theory, examples, pitfalls, tips
- [ ] 4.1.3 Add classic movie examples for each technique
- [ ] 4.1.4 Add common mistakes and how to avoid them
- [ ] 4.1.5 Add practical application tips

### 4.2 Interactive Deep Dive

- [ ] 4.2.1 Add "了解更多" prompt after each education tip
- [ ] 4.2.2 Implement `showDetailedEducation()` function
- [ ] 4.2.3 Format detailed content with sections
- [ ] 4.2.4 Add option to return to main flow
- [ ] 4.2.5 Track which topics user explored (analytics)

## 5. Skip to Shot Index (Hybrid Mode)

- [ ] 5.1 Add action menu in Hybrid Mode fill loop
- [ ] 5.2 Implement "跳过此镜头" action
- [ ] 5.3 Implement "返回上一镜头" action
- [ ] 5.4 Implement "跳转到特定镜头" action with index input
- [ ] 5.5 Mark skipped shots as unfilled
- [ ] 5.6 Add "填充未完成镜头" at the end
- [ ] 5.7 Display unfilled shots summary

## 6. Mode Recommendation Logic

- [ ] 6.1 Create `src/utils/mode-recommendation.ts`
- [ ] 6.2 Implement `recommendMode()` function
- [ ] 6.3 Analyze scene count, word count, complexity
- [ ] 6.4 Define recommendation rules:
  - Simple project (<=3 scenes, <500 words) -> Express
  - Complex project (>=5 scenes, >1000 words) -> Hybrid
  - Medium project -> Coach
- [ ] 6.5 Display recommendation before mode selection
- [ ] 6.6 Allow user to override recommendation
- [ ] 6.7 Track recommendation accuracy (analytics)

## 7. Help Text and CLI Updates

- [ ] 7.1 Update `generate` command help text
- [ ] 7.2 Add detailed mode descriptions in help
- [ ] 7.3 Add examples for each mode
- [ ] 7.4 Update README.md with mode comparison table
- [ ] 7.5 Add usage examples in README

## 8. Batch Operations (Hybrid Mode - Optional)

- [ ] 8.1 Add batch operation menu
- [ ] 8.2 Implement batch apply shot type
- [ ] 8.3 Implement batch apply camera angle
- [ ] 8.4 Implement batch apply camera movement
- [ ] 8.5 Parse range input (e.g., "1-5, 7, 10-12")
- [ ] 8.6 Apply to selected shots
- [ ] 8.7 Show batch operation summary

## 9. Testing

- [ ] 9.1 Test Coach mode resume from different points
- [ ] 9.2 Test Hybrid mode resume with partial completion
- [ ] 9.3 Test special requirements integration
- [ ] 9.4 Test dialogue input with multiple characters
- [ ] 9.5 Test "learn more" feature
- [ ] 9.6 Test skip/goto functionality in Hybrid mode
- [ ] 9.7 Test mode recommendation accuracy
- [ ] 9.8 Manual end-to-end testing

## 10. Documentation

- [ ] 10.1 Update CHANGELOG.md for v0.3.1
- [ ] 10.2 Create user guide for resume feature
- [ ] 10.3 Document "learn more" content
- [ ] 10.4 Update mode comparison documentation
- [ ] 10.5 Add troubleshooting section

## 11. Quality Assurance

- [ ] 11.1 Run linter and fix errors
- [ ] 11.2 Build and test
- [ ] 11.3 Test on real projects
- [ ] 11.4 Collect user feedback
- [ ] 11.5 Fix any bugs found

## Estimated Timeline

- Week 1: Resume functionality (tasks 1.x)
- Week 2: Input enhancements (tasks 2.x, 3.x)
- Week 3: Education and navigation (tasks 4.x, 5.x)
- Week 4: Recommendations and polish (tasks 6.x, 7.x, 8.x)
- Week 5: Testing and documentation (tasks 9.x, 10.x, 11.x)

