# workspace-system Specification

## Purpose
TBD - created by archiving change add-storyboardify-complete. Update Purpose after archive.
## Requirements
### Requirement: Workspace Configuration System

The system SHALL define workspace configurations that specify additional fields, export formats, and aspect ratios for each production type.

#### Scenario: Workspace configuration loading

- **WHEN** system initializes
- **THEN** loads three workspace configs:
  - `manga`: 4:3 ratio, fields=[翻页位置, 气泡位置, 页数估算], exports=[Markdown, PDF, PSD-template, Excel]
  - `short-video`: 9:16 ratio, fields=[时间轴, 字幕, 配音], exports=[Markdown, 剪映JSON, PR-XML, PDF]
  - `dynamic-manga`: 16:9 ratio, fields=[帧数范围, 图层结构, 3D参数], exports=[Markdown, AE-JSX, PR-XML, 剪映JSON]
- **AND** each config includes field definitions (type, options, validation rules)

#### Scenario: Workspace selection on project init

- **WHEN** user runs `/specify`
- **THEN** displays interactive workspace selection:
  ```
  选择工作区:
  1. 📱 漫画工作区 (快看/腾讯动漫)
  2. 📹 短视频工作区 (抖音/快手)
  3. 🎬 动态漫工作区 (AE/剪映)
  ```
- **AND** saves selection to `.storyboardify/config.json`
- **AND** workspace choice affects all subsequent operations

### Requirement: Manga Workspace

The system SHALL provide manga workspace optimized for static comic/webtoon production.

#### Scenario: Page break annotation

- **WHEN** generating shots in manga workspace
- **THEN** each shot includes `翻页位置: boolean` field
- **AND** AI suggests page breaks every 3-5 shots (typical manga page density)
- **AND** user can override page break positions

#### Scenario: Speech bubble positioning

- **WHEN** shot contains dialogue
- **THEN** includes `气泡位置` field with options: [左上, 右上, 左下, 右下, 中央]
- **AND** AI suggests position based on:
  - Character screen position (character left → 气泡右上)
  - Reading flow (top-to-bottom, right-to-left for manga)
  - Avoiding overlap with important visual elements

#### Scenario: Page count estimation

- **WHEN** storyboard generation completes
- **THEN** estimates total page count: `页数估算: 15-18 页`
- **AND** calculation: shot count ÷ 3-4 shots per page
- **AND** adjusts for翻页位置 overrides

#### Scenario: Manga export - Excel format

- **WHEN** user exports in manga workspace with Excel format
- **THEN** generates spreadsheet with columns:
  - 页码, 镜号, 景别, 角度, 画面内容, 对话, 气泡位置, 翻页, 备注
- **AND** rows grouped by page (visual separator every 3-4 shots)

### Requirement: Short Video Workspace

The system SHALL provide short-video workspace optimized for vertical (9:16) mobile video production.

#### Scenario: Timeline annotation

- **WHEN** generating shots in short-video workspace
- **THEN** each shot includes `时间轴: MM:SS - MM:SS` field
- **AND** automatically calculates cumulative timeline:
  - Shot 1 (3s): `00:00 - 00:03`
  - Shot 2 (4s): `00:03 - 00:07`
  - Shot 3 (2s): `00:07 - 00:09`
- **AND** updates timeline when shot durations change

#### Scenario: Subtitle generation and styling

- **WHEN** shot contains dialogue or narration
- **THEN** includes `字幕: string` field with text content
- **AND** includes `字幕位置: [顶部, 中部, 底部]`
- **AND** includes `字幕样式: {font, size, color, stroke, effect}`:
  ```json
  {
    "font": "粗体",
    "size": "大",
    "color": "白色",
    "stroke": "黑色描边",
    "effect": "打字机"
  }
  ```
- **AND** AI suggests position based on composition (avoid covering faces)

#### Scenario: Voiceover parameters

- **WHEN** shot requires narration or off-screen voice
- **THEN** includes `配音` field:
  ```json
  {
    "text": "这是一个没有月亮的夜晚...",
    "voice": "男声",
    "speed": "正常",
    "emotion": "平静",
    "volume": 80
  }
  ```
- **AND** allows text-to-speech integration (future enhancement)

#### Scenario: Vertical composition warning

- **WHEN** AI suggests 全景 shot in short-video workspace
- **THEN** warns: "全景在竖屏(9:16)构图下可能浪费画面空间,建议改用中景或近景"
- **AND** suggests optimal shot types for vertical: 中景(40%), 近景(30%), 特写(20%)

#### Scenario: Short-video export - Jianying JSON

- **WHEN** user exports in short-video workspace with剪映 format
- **THEN** generates Jianying project JSON:
  ```json
  {
    "version": "3.5.0",
    "timeline": {
      "tracks": [
        { "type": "video", "clips": [ ... ] },
        { "type": "audio", "clips": [ ... ] },
        { "type": "text", "clips": [ ... ] }
      ]
    },
    "materials": { "videos": [...], "audios": [...], "texts": [...] }
  }
  ```
- **AND** maps shots to video clips with timeline positions
- **AND** includes subtitle tracks with styles

### Requirement: Dynamic Manga Workspace

The system SHALL provide dynamic-manga workspace optimized for 2.5D animation with parallax and camera movement.

#### Scenario: Frame range annotation

- **WHEN** generating shots in dynamic-manga workspace (assumes 24fps)
- **THEN** each shot includes `帧数范围: 第X-Y帧`
- **AND** calculates from duration: 3-second shot = `第0-72帧`
- **AND** cumulative frame counts for timeline sequencing

#### Scenario: Layer structure definition

- **WHEN** shot requires parallax or depth
- **THEN** includes `图层结构: array` field:
  ```json
  [
    { "layer": "前景", "content": "蜡烛火焰(粒子效果)", "z_depth": 100 },
    { "layer": "中景", "content": "主角盘坐", "z_depth": 200 },
    { "layer": "背景", "content": "修炼室墙壁", "z_depth": 500 },
    { "layer": "特效", "content": "光晕,氛围雾气", "z_depth": 50 }
  ]
  ```
- **AND** AI suggests layer separation based on scene description

#### Scenario: 3D camera parameters

- **WHEN** shot has camera movement (推/拉/摇/升/降)
- **THEN** includes `3D参数` field:
  ```json
  {
    "camera_position": { "start": [0, 200, -500], "end": [0, 150, -200] },
    "camera_rotation": { "start": [30, 0, 0], "end": [30, 0, 0] },
    "fov": 45,
    "animation_curve": "Ease In"
  }
  ```
- **AND** calculates position changes from运镜方式 (推镜 → Z-axis movement)

#### Scenario: VFX parameters suggestion

- **WHEN** shot includes special effects keywords (e.g., "光芒四射", "爆炸", "粒子")
- **THEN** includes `特效参数` field:
  ```json
  {
    "particle_system": { "type": "Particular", "count": 500, "color": "blue" },
    "glow": { "intensity": 40, "radius": 30 },
    "motion_blur": { "samples": 16, "shutter_angle": 180 }
  }
  ```

#### Scenario: Dynamic-manga export - AE JSX script

- **WHEN** user exports in dynamic-manga workspace with AE-JSX format
- **THEN** generates After Effects JSX script that:
  - Creates composition for each shot
  - Imports layer assets (characters, scenes) as placeholders
  - Sets up 3D camera with keyframes
  - Adds effects (glow, particles) based on VFX parameters
  - Exports as `.jsx` file runnable in AE

### Requirement: Workspace-Specific Field Injection

The system SHALL dynamically inject workspace-specific fields into shot data structures at runtime.

#### Scenario: Field injection on workspace switch

- **WHEN** user switches from manga to short-video workspace mid-project
- **THEN** system removes manga-specific fields (翻页位置, 气泡位置)
- **AND** adds short-video-specific fields (时间轴, 字幕, 配音)
- **AND** migrates common fields (景别, 角度, 运镜) unchanged
- **AND** warns user: "切换工作区将移除特定字段。是否备份当前数据?"

#### Scenario: Field validation per workspace

- **WHEN** validating storyboard in manga workspace
- **THEN** checks manga-specific fields exist and are valid
- **WHEN** validating in short-video workspace
- **THEN** checks short-video-specific fields exist and are valid
- **AND** validates aspect ratio compatibility (warns if wide shots in vertical format)

### Requirement: Cross-Workspace Compatibility

The system SHALL maintain core storyboard data compatibility across workspace switches.

#### Scenario: Core field preservation

- **WHEN** switching between any workspaces
- **THEN** preserves core四要素 fields:
  - 基础信息: 镜号, 景别, 角度, 画面内容
  - 运镜参数: 运镜方式, 速度, 速度曲线
  - 情绪标注: 情绪/氛围, 节奏
  - 动态效果: 音效, 转场 (base fields only)
- **AND** stores workspace-specific fields in separate namespace

#### Scenario: Export format compatibility matrix

- **WHEN** exporting storyboard
- **THEN** offers only formats compatible with current workspace:
  - Manga: ❌ 剪映JSON, ✅ PSD-template
  - Short-video: ✅ 剪映JSON, ❌ PSD-template
  - Dynamic-manga: ✅ AE-JSX, ✅ 剪映JSON
- **AND** universal formats always available: Markdown, PDF

