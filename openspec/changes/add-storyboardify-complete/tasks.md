# Implementation Tasks: Storyboardify

## 0. Pre-Implementation Setup

- [ ] 0.1 Create GitHub repository `storyboardify`
- [ ] 0.2 Initialize npm project structure
- [ ] 0.3 Configure TypeScript (tsconfig.json)
- [ ] 0.4 Configure ESLint/Prettier
- [ ] 0.5 Setup Git hooks (husky + lint-staged)
- [ ] 0.6 Create .gitignore (node_modules, dist, .DS_Store)
- [ ] 0.7 Install dependencies (commander, chalk, fs-extra, inquirer, ora)

## 1. Project Infrastructure

### 1.1 Directory Structure

- [ ] 1.1.1 Create `src/` directory
- [ ] 1.1.2 Create `src/types/` for TypeScript definitions
- [ ] 1.1.3 Create `src/utils/` for utility functions
- [ ] 1.1.4 Create `src/modes/` for three-mode implementations
- [ ] 1.1.5 Create `src/workspaces/` for workspace configurations
- [ ] 1.1.6 Create `src/exporters/` for export plugins
- [ ] 1.1.7 Create `scripts/bash/` for POSIX shell scripts
- [ ] 1.1.8 Create `scripts/powershell/` for PowerShell scripts
- [ ] 1.1.9 Create `templates/commands/` for Slash Command templates
- [ ] 1.1.10 Create `docs/` for documentation
- [ ] 1.1.11 Create `.claude/commands/` for Claude Code integration
- [ ] 1.1.12 Create `projects/` for user project files (add to .gitignore)

### 1.2 Core Types Definition

- [ ] 1.2.1 Define `AIConfig` interface (13 AI platforms)
- [ ] 1.2.2 Define `WorkspaceConfig` interface
- [ ] 1.2.3 Define `StoryboardData` interface (shot/scene structure)
- [ ] 1.2.4 Define `ScriptifyExportData` interface (JSON schema v1.0)
- [ ] 1.2.5 Define `CharacterDesignSheet` interface
- [ ] 1.2.6 Define `SceneDesignSheet` interface
- [ ] 1.2.7 Define `Shot` interface (含四要素)
- [ ] 1.2.8 Define `ExportResult` interface
- [ ] 1.2.9 Create `src/types/index.ts` exporting all types

### 1.3 Utility Functions (复用 Scriptify)

- [ ] 1.3.1 Implement `bash-runner.ts` (执行Bash脚本)
- [ ] 1.3.2 Implement `interactive.ts` (交互式选择器)
- [ ] 1.3.3 Implement `yaml-parser.ts` (解析命令模板YAML frontmatter)
- [ ] 1.3.4 Implement `json-validator.ts` (验证JSON schema)
- [ ] 1.3.5 Implement `logger.ts` (彩色日志输出)

## 2. Scriptify Data Import

### 2.1 JSON Parser

- [ ] 2.1.1 Implement `parseScriptifyJSON(filePath)` - 解析JSON文件
- [ ] 2.1.2 Validate `meta.version` (检查版本兼容性)
- [ ] 2.1.3 Validate `meta.type === 'scriptify_export'`
- [ ] 2.1.4 Extract project metadata
- [ ] 2.1.5 Extract characters array
- [ ] 2.1.6 Extract scenes array
- [ ] 2.1.7 Extract scripts array
- [ ] 2.1.8 Handle parsing errors (clear error messages)

### 2.2 Bash Script: `import.sh`

- [ ] 2.2.1 Accept file path argument
- [ ] 2.2.2 Check if file exists
- [ ] 2.2.3 Check if valid JSON
- [ ] 2.2.4 Output JSON: `{ status, project_name, imported_data }`
- [ ] 2.2.5 Error handling (JSON parse error, missing fields)

### 2.3 Slash Command: `/import`

- [ ] 2.3.1 Create `templates/commands/import.md`
- [ ] 2.3.2 Define YAML frontmatter (description, scripts)
- [ ] 2.3.3 Write Markdown instructions for AI
- [ ] 2.3.4 Register command in `src/cli.ts`
- [ ] 2.3.5 Call `executeBashScript('import', args)`
- [ ] 2.3.6 Display imported data summary

## 3. Production Pack Generation

### 3.1 Character Design Sheet Generator

- [ ] 3.1.1 Implement `generateCharacterSheet(character)` in `src/generators/character-sheet.ts`
- [ ] 3.1.2 Expand appearance details (from JSON)
- [ ] 3.1.3 Expand personality traits
- [ ] 3.1.4 Generate MidJourney Prompt (character-focused)
- [ ] 3.1.5 Generate Stable Diffusion Prompt (character-focused)
- [ ] 3.1.6 Extract relationship network
- [ ] 3.1.7 Create design sheet template (Markdown)

### 3.2 Scene Design Sheet Generator

- [ ] 3.2.1 Implement `generateSceneSheet(scene)` in `src/generators/scene-sheet.ts`
- [ ] 3.2.2 Expand environment description
- [ ] 3.2.3 Define color scheme (根据atmosphere)
- [ ] 3.2.4 Define lighting setup
- [ ] 3.2.5 Generate MidJourney Prompt (scene-focused)
- [ ] 3.2.6 Generate Stable Diffusion Prompt (scene-focused)
- [ ] 3.2.7 Create design sheet template (Markdown)

### 3.3 Bash Scripts

- [ ] 3.3.1 Implement `characters-pack.sh` - 调用character-sheet generator
- [ ] 3.3.2 Implement `scenes-pack.sh` - 调用scene-sheet generator
- [ ] 3.3.3 Implement `prompts-gen.sh` - 批量生成Prompts

### 3.4 Slash Commands

- [ ] 3.4.1 Create `/characters-pack` command template
- [ ] 3.4.2 Create `/scenes-pack` command template
- [ ] 3.4.3 Create `/prompts-gen` command template
- [ ] 3.4.4 Register commands in `src/cli.ts`

## 4. Storyboard Generation System

### 4.1 Three-Mode State Machine

- [ ] 4.1.1 Define `ModeState` type and state machine interface
- [ ] 4.1.2 Implement `CoachMode` class (`src/modes/coach-mode.ts`)
- [ ] 4.1.3 Implement `ExpressMode` class (`src/modes/express-mode.ts`)
- [ ] 4.1.4 Implement `HybridMode` class (`src/modes/hybrid-mode.ts`)
- [ ] 4.1.5 Implement mode switching logic
- [ ] 4.1.6 Implement progress tracking for each mode

### 4.2 Scene Splitting Algorithm

- [ ] 4.2.1 Implement `splitScenes(scriptContent)` in `src/generators/scene-splitter.ts`
- [ ] 4.2.2 Detect time/location/character changes
- [ ] 4.2.3 Extract scene boundaries
- [ ] 4.2.4 Assign scene IDs (1.1, 1.2, etc.)
- [ ] 4.2.5 Extract dialogue and action descriptions per scene

### 4.3 Shot Planner (Express Mode)

- [ ] 4.3.1 Implement `planShots(scene)` in `src/generators/shot-planner.ts`
- [ ] 4.3.2 Analyze scene length → suggest shot count
- [ ] 4.3.3 Analyze emotion → assign shot types (景别)
- [ ] 4.3.4 Assign camera angles (平视/仰视/俯视)
- [ ] 4.3.5 Assign camera movements (静止/推/拉/摇)
- [ ] 4.3.6 Estimate shot durations
- [ ] 4.3.7 Generate drawing prompts per shot

### 4.4 Camera Movement Optimizer

- [ ] 4.4.1 Implement `optimizeCamera(shots)` in `src/generators/camera-optimizer.ts`
- [ ] 4.4.2 Analyze shot type distribution (景别统计)
- [ ] 4.4.3 Check for 3+ consecutive same-type shots (warn)
- [ ] 4.4.4 Suggest camera movement variety
- [ ] 4.4.5 Validate camera speed curves (Ease In/Out)

### 4.5 Bash Scripts

- [ ] 4.5.1 Implement `storyboard.sh` - 接受--mode参数
- [ ] 4.5.2 Implement `camera.sh` - 运镜优化建议
- [ ] 4.5.3 Implement `fill.sh` - 混合模式填充

### 4.6 Slash Commands

- [ ] 4.6.1 Create `/storyboard` command template (支持--mode flag)
- [ ] 4.6.2 Create `/camera` command template
- [ ] 4.6.3 Create `/fill` command template
- [ ] 4.6.4 Register commands in `src/cli.ts`

## 5. Workspace System

### 5.1 Workspace Configuration

- [ ] 5.1.1 Define workspace configs in `src/workspaces/config.ts`
- [ ] 5.1.2 Define `manga` workspace config (4:3, 翻页/气泡)
- [ ] 5.1.3 Define `short-video` workspace config (9:16, 字幕/配音)
- [ ] 5.1.4 Define `dynamic-manga` workspace config (16:9, 图层/3D)
- [ ] 5.1.5 Implement `getWorkspace(id)` - 获取配置
- [ ] 5.1.6 Implement `injectWorkspaceFields(shot, workspace)` - 动态注入字段

### 5.2 Workspace-Specific Generators

- [ ] 5.2.1 Implement `addMangaFields(shot)` - 添加翻页/气泡字段
- [ ] 5.2.2 Implement `addShortVideoFields(shot)` - 添加字幕/配音字段
- [ ] 5.2.3 Implement `addDynamicMangaFields(shot)` - 添加图层/3D字段

### 5.3 Slash Command: `/specify`

- [ ] 5.3.1 Create `/specify` command template
- [ ] 5.3.2 Interactive workspace selection (3 options)
- [ ] 5.3.3 Interactive mode selection (coach/express/hybrid)
- [ ] 5.3.4 Interactive project name input
- [ ] 5.3.5 Create project directory structure
- [ ] 5.3.6 Save `.storyboardify/config.json`
- [ ] 5.3.7 Generate README.md in project

## 6. Review & Quality Check

### 6.1 Three-Pass Review System

- [ ] 6.1.1 Implement `reviewContent(storyboard)` - 内容连贯性检查
- [ ] 6.1.2 Implement `reviewStyle(storyboard)` - 风格一致性检查
- [ ] 6.1.3 Implement `reviewDetails(storyboard)` - 细节完整性检查
- [ ] 6.1.4 Generate review report (Markdown)
- [ ] 6.1.5 Suggest fixes for common issues

### 6.2 Storyboard Validator

- [ ] 6.2.1 Implement `validateShot(shot)` - 检查必填字段
- [ ] 6.2.2 Check 景别 values (远景/全景/中景/近景/特写)
- [ ] 6.2.3 Check 角度 values (平视/仰视/俯视)
- [ ] 6.2.4 Check 运镜 values (静止/推/拉/摇/移/跟/升/降)
- [ ] 6.2.5 Check shot duration reasonableness (1-60s)
- [ ] 6.2.6 Validate workspace-specific fields

### 6.3 Bash Script & Command

- [ ] 6.3.1 Implement `review.sh`
- [ ] 6.3.2 Create `/review` command template
- [ ] 6.3.3 Register command in `src/cli.ts`

## 7. Export System

### 7.1 Base Exporter

- [ ] 7.1.1 Define `Exporter` interface in `src/exporters/base.ts`
- [ ] 7.1.2 Define `export(data, options)` method signature
- [ ] 7.1.3 Define `validate(data)` method signature
- [ ] 7.1.4 Create exporter registry (`src/exporters/registry.ts`)

### 7.2 Markdown Exporter

- [ ] 7.2.1 Implement `MarkdownExporter` class
- [ ] 7.2.2 Generate project header section
- [ ] 7.2.3 Generate scene sections
- [ ] 7.2.4 Generate shot sections (四要素)
- [ ] 7.2.5 Include workspace-specific fields
- [ ] 7.2.6 Export to `.md` file

### 7.3 PDF Exporter

- [ ] 7.3.1 Implement `PDFExporter` class (use library or Markdown → PDF)
- [ ] 7.3.2 Format storyboard table layout
- [ ] 7.3.3 Include scene thumbnails (if available)
- [ ] 7.3.4 Export to `.pdf` file

### 7.4 Jianying JSON Exporter (剪映)

- [ ] 7.4.1 Research Jianying project file format
- [ ] 7.4.2 Implement `JianyingExporter` class
- [ ] 7.4.3 Convert shots to Jianying tracks (video/audio/subtitle)
- [ ] 7.4.4 Map camera movements to Jianying effects
- [ ] 7.4.5 Export timeline structure
- [ ] 7.4.6 Validate against Jianying format spec
- [ ] 7.4.7 Export to `.json` file

### 7.5 After Effects JSX Exporter

- [ ] 7.5.1 Research AE JSX script API
- [ ] 7.5.2 Implement `AEScriptExporter` class
- [ ] 7.5.3 Generate composition creation script
- [ ] 7.5.4 Generate layer structure (前景/中景/背景/特效)
- [ ] 7.5.5 Generate camera animation keyframes
- [ ] 7.5.6 Generate 3D parameters (Camera Position/Rotation/FOV)
- [ ] 7.5.7 Export to `.jsx` file

### 7.6 Premiere XML Exporter

- [ ] 7.6.1 Research Premiere Pro XML format
- [ ] 7.6.2 Implement `PremiereXMLExporter` class
- [ ] 7.6.3 Generate sequence structure
- [ ] 7.6.4 Generate clip entries per shot
- [ ] 7.6.5 Export to `.xml` file

### 7.7 Bash Script & Command

- [ ] 7.7.1 Implement `export.sh` - 接受--format参数
- [ ] 7.7.2 Create `/export` command template
- [ ] 7.7.3 Interactive format selection (multi-select)
- [ ] 7.7.4 Register command in `src/cli.ts`

## 8. AI Platform Integration

### 8.1 13 AI Platform Configurations

- [ ] 8.1.1 Define `AI_CONFIGS` array in `src/cli.ts` (同Scriptify)
- [ ] 8.1.2 Add Claude Code config (`.claude/commands/`)
- [ ] 8.1.3 Add Cursor config (`.cursor/commands/`)
- [ ] 8.1.4 Add Gemini CLI config (`.gemini/commands/`)
- [ ] 8.1.5 Add Windsurf config (`.windsurf/workflows/`)
- [ ] 8.1.6 Add Roo Code config (`.roo/commands/`)
- [ ] 8.1.7 Add GitHub Copilot config (`.github/prompts/`)
- [ ] 8.1.8 Add Qwen Code config (`.qwen/commands/`)
- [ ] 8.1.9 Add OpenCode config (`.opencode/command/`)
- [ ] 8.1.10 Add Codex CLI config (`.codex/prompts/`)
- [ ] 8.1.11 Add Kilo Code config (`.kilocode/workflows/`)
- [ ] 8.1.12 Add Auggie CLI config (`.augment/commands/`)
- [ ] 8.1.13 Add CodeBuddy config (`.codebuddy/commands/`)
- [ ] 8.1.14 Add Amazon Q Developer config (`.amazonq/prompts/`)

### 8.2 Slash Command Templates

- [ ] 8.2.1 Copy 10 command templates to each AI platform dir
- [ ] 8.2.2 Ensure consistent YAML frontmatter across platforms

## 9. Testing

### 9.1 Unit Tests

- [ ] 9.1.1 Install testing framework (Jest/Vitest)
- [ ] 9.1.2 Test `parseScriptifyJSON()` - valid/invalid inputs
- [ ] 9.1.3 Test `generateCharacterSheet()` - character expansion
- [ ] 9.1.4 Test `generateSceneSheet()` - scene expansion
- [ ] 9.1.5 Test `splitScenes()` - scene detection
- [ ] 9.1.6 Test `planShots()` - shot generation logic
- [ ] 9.1.7 Test `optimizeCamera()` - 景别分布检查
- [ ] 9.1.8 Test `validateShot()` - 字段验证
- [ ] 9.1.9 Test exporters - format correctness
- [ ] 9.1.10 Achieve >70% code coverage

### 9.2 E2E Tests

- [ ] 9.2.1 Test complete flow: `init → import → characters-pack → storyboard → export`
- [ ] 9.2.2 Test coach mode workflow
- [ ] 9.2.3 Test express mode workflow
- [ ] 9.2.4 Test hybrid mode workflow
- [ ] 9.2.5 Test three workspace outputs (manga/short-video/dynamic-manga)

### 9.3 Integration Tests

- [ ] 9.3.1 Test Scriptify JSON import (real JSON files)
- [ ] 9.3.2 Test Jianying JSON compatibility (import to 剪映 and verify)
- [ ] 9.3.3 Test AE JSX script execution (run in After Effects)

## 10. Documentation

### 10.1 Core Documentation

- [ ] 10.1.1 Write `README.md` - Overview, Installation, Quick Start
- [ ] 10.1.2 Write `QUICKSTART.md` - 5-minute tutorial
- [ ] 10.1.3 Write `ARCHITECTURE.md` - Technical architecture explanation
- [ ] 10.1.4 Write `COMMANDS.md` - List all 10 slash commands with examples
- [ ] 10.1.5 Write `WORKSPACES.md` - Three workspace详解
- [ ] 10.1.6 Write `EXPORT_FORMATS.md` - 导出格式说明

### 10.2 Example Projects

- [ ] 10.2.1 Create example 1: 漫画工作区(悬疑短剧)
- [ ] 10.2.2 Create example 2: 短视频工作区(职场搞笑)
- [ ] 10.2.3 Create example 3: 动态漫工作区(修仙玄幻)
- [ ] 10.2.4 Include sample Scriptify export JSON for each

### 10.3 API Documentation

- [ ] 10.3.1 Generate TypeDoc documentation
- [ ] 10.3.2 Document public interfaces
- [ ] 10.3.3 Document exporter plugin API

## 11. Release Preparation

### 11.1 Package Configuration

- [ ] 11.1.1 Configure `package.json` - name, version, description
- [ ] 11.1.2 Configure `bin` entry point
- [ ] 11.1.3 Configure `scripts` (build, test, lint)
- [ ] 11.1.4 Configure `files` array (what to publish)
- [ ] 11.1.5 Configure `engines` (Node.js >=18)

### 11.2 Publishing

- [ ] 11.2.1 Test `npm pack` locally
- [ ] 11.2.2 Publish to npm as `ai-storyboardify` (scoped name)
- [ ] 11.2.3 Verify installation (`npm install -g ai-storyboardify`)
- [ ] 11.2.4 Test `storyboardify init` command

### 11.3 CI/CD

- [ ] 11.3.1 Configure GitHub Actions (test/build/publish)
- [ ] 11.3.2 Add status badges to README

## 12. Post-Launch

### 12.1 Community Setup

- [ ] 12.1.1 Create GitHub Issues templates
- [ ] 12.1.2 Create GitHub Discussions
- [ ] 12.1.3 Create CONTRIBUTING.md
- [ ] 12.1.4 Create CODE_OF_CONDUCT.md

### 12.2 Monitoring

- [ ] 12.2.1 Setup npm download stats tracking
- [ ] 12.2.2 Monitor GitHub Issues for bug reports
- [ ] 12.2.3 Collect user feedback
