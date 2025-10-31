# production-pack-generation Specification

## Purpose
TBD - created by archiving change add-storyboardify-complete. Update Purpose after archive.
## Requirements
### Requirement: Import Scriptify JSON Data

The system SHALL parse and validate Scriptify JSON export files (format version 1.0).

#### Scenario: Valid Scriptify JSON import

- **WHEN** user imports a valid Scriptify JSON file with `meta.version === '1.0'` and `meta.type === 'scriptify_export'`
- **THEN** system extracts `project`, `characters`, `scenes`, and `scripts` data successfully
- **AND** displays summary: project name, character count, scene count, episode count

#### Scenario: Invalid JSON format

- **WHEN** user imports a file that is not valid JSON
- **THEN** system displays error message: "Invalid JSON format. Please export from Scriptify v0.5.0+"
- **AND** does not proceed with data processing

#### Scenario: Incompatible version

- **WHEN** user imports a JSON file with `meta.version !== '1.0'`
- **THEN** system displays warning: "Scriptify version X.X detected. This tool supports v1.0. Compatibility may be limited."
- **AND** attempts to parse with fallback logic
- **AND** logs compatibility warnings for user review

### Requirement: Generate Character Design Sheets

The system SHALL generate comprehensive character design sheets from imported character data.

#### Scenario: Basic character sheet generation

- **WHEN** system processes a character with basic fields (name, age, role, appearance, personality)
- **THEN** generates a Markdown design sheet containing:
  - Character metadata (name, age, role)
  - Expanded appearance description (minimum 50 words)
  - Personality traits analysis
  - Relationship network diagram
  - Drawing prompt (MidJourney format)
  - Drawing prompt (Stable Diffusion format)

#### Scenario: Character with missing appearance details

- **WHEN** character has minimal appearance data (e.g., only "黑色风衣")
- **THEN** system infers additional details based on personality and role
- **AND** flags inferred details with `[AI-inferred]` marker
- **AND** prompts user to review and confirm

#### Scenario: Multi-character relationship extraction

- **WHEN** multiple characters are imported
- **THEN** system analyzes scripts to detect interactions
- **AND** generates relationship network: `角色A --关系类型--> 角色B`
- **AND** includes relationship strength indicator (primary/secondary)

### Requirement: Generate Scene Design Sheets

The system SHALL generate detailed scene design sheets from imported scene data.

#### Scenario: Complete scene sheet generation

- **WHEN** system processes a scene with location, time, weather, and atmosphere
- **THEN** generates a Markdown design sheet containing:
  - Scene metadata (name, location, time, weather)
  - Expanded environment description (minimum 100 words)
  - Color scheme (3-5 primary colors with hex codes)
  - Lighting setup (light source, direction, intensity, mood)
  - Drawing prompt (MidJourney format)
  - Drawing prompt (Stable Diffusion format)

#### Scenario: Scene reuse detection

- **WHEN** multiple scripts reference the same location (e.g., "办公室", "雨夜街头")
- **THEN** system detects duplicate locations
- **AND** suggests reusing existing scene design sheet
- **AND** allows user to create variant (e.g., "办公室-白天", "办公室-夜晚")

#### Scenario: Color scheme generation from atmosphere

- **WHEN** scene has atmosphere keywords (e.g., "孤独、压抑", "欢快、明亮")
- **THEN** system generates matching color palette:
  - "孤独、压抑" → dark blues (#1a1a2e, #16213e), grays (#0f3460, #53354a)
  - "欢快、明亮" → warm yellows (#fff59d, #ffe082), pinks (#f48fb1, #f06292)
- **AND** provides color theory rationale

### Requirement: Generate AI Drawing Prompts

The system SHALL generate optimized drawing prompts for MidJourney and Stable Diffusion.

#### Scenario: MidJourney character prompt generation

- **WHEN** generating MidJourney prompt for a character
- **THEN** prompt follows structure: `[subject], [age/gender], [clothing], [expression], [style], [lighting], [quality parameters]`
- **AND** includes MidJourney-specific parameters: `--ar 16:9 --style raw --v 6.0`
- **AND** character prompts are limited to 200 words for optimal results

#### Scenario: Stable Diffusion scene prompt generation

- **WHEN** generating Stable Diffusion prompt for a scene
- **THEN** prompt follows structure: `[location], [time of day], [weather], [lighting], [atmosphere], [style], [negative prompt]`
- **AND** includes recommended SD settings: `Steps: 30, Sampler: DPM++ 2M Karras, CFG scale: 7`
- **AND** includes negative prompt to avoid common artifacts

#### Scenario: Prompt consistency across episodes

- **WHEN** same character appears in multiple episodes
- **THEN** system reuses core character prompt template
- **AND** only varies contextual elements (expression, action, environment)
- **AND** maintains character visual consistency

#### Scenario: Prompt optimization for platform

- **WHEN** user selects MidJourney as target platform
- **THEN** prompt includes cinematic/artistic keywords preferred by MJ
- **WHEN** user selects Stable Diffusion as target platform
- **THEN** prompt uses more technical/descriptive keywords preferred by SD
- **AND** adjusts keyword weighting syntax: MJ uses `keyword::2`, SD uses `(keyword:1.2)`

### Requirement: Export Production Pack

The system SHALL export all generated design sheets as a structured production pack.

#### Scenario: Standard production pack export

- **WHEN** user completes character and scene sheet generation
- **THEN** system exports a folder structure:
  ```
  production-pack/
  ├── characters/
  │   ├── char-001-李墨.md
  │   ├── char-002-林薇.md
  │   └── prompts/
  │       ├── char-001-midjourney.txt
  │       ├── char-001-stablediffusion.txt
  ├── scenes/
  │   ├── scene-001-雨夜街头.md
  │   ├── scene-002-豪宅.md
  │   └── prompts/
  │       ├── scene-001-midjourney.txt
  │       ├── scene-001-stablediffusion.txt
  └── index.md (production pack overview)
  ```
- **AND** includes index.md with clickable links to all sheets

#### Scenario: JSON export for programmatic use

- **WHEN** user selects JSON export format
- **THEN** exports `production-pack.json` with structured data:
  ```json
  {
    "meta": { "version": "1.0", "type": "production_pack", "created_at": "..." },
    "characters": [ {...} ],
    "scenes": [ {...} ],
    "prompts": { "midjourney": [...], "stablediffusion": [...] }
  }
  ```
- **AND** JSON validates against schema (all required fields present)

#### Scenario: Incremental update of production pack

- **WHEN** user modifies a character or scene in Scriptify and re-imports
- **THEN** system detects changes via character/scene ID
- **AND** offers options: "Regenerate all", "Update changed only", "Review changes"
- **AND** preserves manual edits in design sheets (marked with `<!-- USER EDIT -->` comments)

