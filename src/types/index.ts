/**
 * Storyboardify Core Type Definitions
 * 定义所有核心数据结构和类型
 */

// ============================================================================
// Scriptify Integration Types (导入相关)
// ============================================================================

/**
 * Scriptify JSON Export Schema v1.0
 */
export interface ScriptifyExport {
  meta: ScriptifyMeta;
  project: ProjectInfo;
  characters: Character[];
  scenes: Scene[];
  scripts: Script[];
}

export interface ScriptifyMeta {
  version: string; // e.g., "1.0"
  type: 'scriptify_export';
  created_at: string; // ISO 8601 timestamp
  tool: 'scriptify';
  tool_version: string;
}

export interface ProjectInfo {
  name: string;
  type: 'short-drama' | 'web-drama' | 'film' | 'commercial' | 'other';
  episodes: number;
  genre: string[];
}

export interface Character {
  id: string; // e.g., "char_001"
  name: string;
  age?: number;
  role: string;
  appearance?: CharacterAppearance;
  personality?: string;
  drawing_prompt?: string;
}

export interface CharacterAppearance {
  height?: string;
  hair?: string[];
  clothing?: string[];
  distinctive_features?: string[];
}

export interface Scene {
  id: string; // e.g., "scene_001"
  name: string;
  location: string;
  time: string; // e.g., "白天14:00", "夜晚22:00"
  weather?: string;
  atmosphere?: string;
  color_scheme?: string[];
  drawing_prompt?: string;
}

export interface Script {
  episode: number;
  content: string; // Markdown format
  word_count: number;
  format: 'markdown';
}

// ============================================================================
// Production Pack Types (制作包相关)
// ============================================================================

/**
 * 完整制作包数据结构
 */
export interface ProductionPack {
  project: ProjectInfo;
  character_sheets: CharacterSheet[];
  scene_sheets: SceneSheet[];
}

/**
 * 人物设定表
 */
export interface CharacterSheet {
  id: string;
  name: string;
  age?: number;
  role: string;
  appearance: DetailedAppearance;
  personality: string;
  drawing_prompts: {
    full_body: string;
    close_up: string;
    side_view: string;
  };
  source: 'scriptify' | 'storyboardify_refined';
}

export interface DetailedAppearance extends CharacterAppearance {
  physique?: string;
  facial_features?: string;
  accessories?: string[];
}

/**
 * 场景设定表
 */
export interface SceneSheet {
  id: string;
  name: string;
  location: string;
  time: string;
  weather?: string;
  atmosphere: string;
  color_palette: ColorPalette;
  lighting: LightingSetup;
  layout_description: string;
  drawing_prompt: string;
  source: 'scriptify' | 'storyboardify_generated';
}

export interface ColorPalette {
  primary: string[]; // Hex codes
  secondary: string[];
  accent: string[];
}

export interface LightingSetup {
  light_source: string[];
  direction: string;
  intensity: 'low' | 'medium' | 'high';
  mood: string;
}

// ============================================================================
// Storyboard Types (分镜脚本相关)
// ============================================================================

/**
 * 完整分镜脚本
 */
export interface Storyboard {
  project: ProjectInfo;
  workspace: WorkspaceType;
  mode: GenerationMode;
  scenes: StoryboardScene[];
  metadata: StoryboardMetadata;
}

export type WorkspaceType = 'manga' | 'short-video' | 'dynamic-manga';
export type GenerationMode = 'coach' | 'express' | 'hybrid';

export interface StoryboardMetadata {
  created_at: string;
  total_shots: number;
  estimated_duration?: string; // For video workspaces
  estimated_pages?: number; // For manga workspace
}

/**
 * 分镜场景 (包含多个镜头)
 */
export interface StoryboardScene {
  scene_id: string; // References Scene.id
  scene_name: string;
  shots: Shot[];
}

/**
 * 镜头 - 四要素注释系统
 */
export interface Shot {
  // 基础信息
  shot_number: number;
  shot_type: ShotType; // 景别
  camera_angle: CameraAngle; // 角度
  content: string; // 画面内容描述

  // 运镜参数
  camera_movement?: CameraMovement;

  // 情绪标注
  mood?: MoodAnnotation;

  // 动态效果
  effects?: ShotEffects;

  // 工作区特定字段 (动态注入)
  workspace_fields?: MangaFields | ShortVideoFields | DynamicMangaFields;
}

// 基础信息类型
export type ShotType = '远景' | '全景' | '中景' | '近景' | '特写' | '大特写';
export type CameraAngle = '平视' | '俯视' | '仰视' | '斜角' | '鸟瞰' | '虫视';

// 运镜参数
export interface CameraMovement {
  type: '静止' | '推' | '拉' | '摇' | '移' | '跟' | '升' | '降' | '环绕';
  speed?: '慢' | '中' | '快';
  curve?: 'Linear' | 'Ease In' | 'Ease Out' | 'Ease In Out';
}

// 情绪标注
export interface MoodAnnotation {
  emotion: string; // e.g., "紧张", "温馨", "悬疑"
  atmosphere: string;
  rhythm: '慢节奏' | '中节奏' | '快节奏';
}

// 动态效果
export interface ShotEffects {
  dialogue?: Dialogue[];
  narration?: string;
  sound_effects?: string[];
  transition?: Transition;
  duration?: number; // seconds (for video workspaces)
}

export interface Dialogue {
  character_id: string;
  character_name: string;
  text: string;
}

export interface Transition {
  type: '切' | '淡入淡出' | '叠化' | '划像' | '闪白' | '闪黑';
  duration?: number; // seconds
}

// ============================================================================
// Workspace-Specific Fields (工作区特定字段)
// ============================================================================

/**
 * 漫画工作区字段
 */
export interface MangaFields {
  page_break: boolean; // 翻页位置
  bubble_position?: '左上' | '右上' | '左下' | '右下' | '中央';
  panel_layout?: string; // 格子布局描述
}

/**
 * 短视频工作区字段
 */
export interface ShortVideoFields {
  timeline: string; // e.g., "00:03 - 00:07"
  subtitle?: SubtitleConfig;
  voiceover?: VoiceoverConfig;
}

export interface SubtitleConfig {
  text: string;
  position: '顶部' | '中部' | '底部';
  style: {
    font: string;
    size: '小' | '中' | '大';
    color: string;
    stroke?: string;
    effect?: '无' | '打字机' | '淡入' | '弹出';
  };
}

export interface VoiceoverConfig {
  text: string;
  voice: '男声' | '女声' | '童声' | '旁白';
  speed: '慢' | '正常' | '快';
  emotion: string;
  volume: number; // 0-100
}

/**
 * 动态漫工作区字段
 */
export interface DynamicMangaFields {
  frame_range: string; // e.g., "第0-72帧"
  layer_structure?: Layer[];
  camera_3d?: Camera3DParams;
  vfx?: VFXParams;
}

export interface Layer {
  layer: string; // e.g., "前景", "中景", "背景", "特效"
  content: string;
  z_depth: number;
}

export interface Camera3DParams {
  camera_position: {
    start: [number, number, number]; // [x, y, z]
    end: [number, number, number];
  };
  camera_rotation: {
    start: [number, number, number]; // [pitch, yaw, roll]
    end: [number, number, number];
  };
  fov: number;
  animation_curve: 'Linear' | 'Ease In' | 'Ease Out' | 'Ease In Out';
}

export interface VFXParams {
  particle_system?: {
    type: string;
    count: number;
    color: string;
  };
  glow?: {
    intensity: number;
    radius: number;
  };
  motion_blur?: {
    samples: number;
    shutter_angle: number;
  };
}

// ============================================================================
// Workspace Configuration (工作区配置)
// ============================================================================

export interface WorkspaceConfig {
  name: WorkspaceType;
  display_name: string;
  aspect_ratio: string; // e.g., "4:3", "9:16", "16:9"
  additional_fields: string[]; // Field names to inject
  export_formats: ExportFormat[];
  ai_suggestions: {
    optimal_shot_distribution: Record<ShotType, number>; // percentage
    average_shot_duration?: number; // seconds (for video)
    shots_per_page?: number; // for manga
  };
}

export type ExportFormat =
  | 'markdown'
  | 'pdf'
  | 'excel'
  | 'jianying-json'
  | 'ae-jsx'
  | 'pr-xml'
  | 'psd-template';

// ============================================================================
// Project State (项目状态管理)
// ============================================================================

/**
 * 本地项目状态文件 (.storyboardify/config.json)
 */
export interface ProjectState {
  version: string;
  project_name: string;
  workspace: WorkspaceType;
  mode: GenerationMode;
  last_modified: string;
  files: {
    scriptify_import?: string;
    production_pack?: string;
    storyboard?: string;
  };
}

// ============================================================================
// CLI & User Interaction Types
// ============================================================================

export interface CLIOptions {
  mode?: GenerationMode;
  workspace?: WorkspaceType;
  format?: ExportFormat;
  output?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error';
}

export interface ValidationWarning {
  field: string;
  message: string;
  severity: 'warning';
}

// ============================================================================
// Export Types
// ============================================================================

/**
 * Storyboardify导出格式 (bi-directional sync with Scriptify)
 */
export interface StoryboardifyExport {
  meta: {
    version: string;
    type: 'storyboardify_export';
    created_at: string;
    tool: 'storyboardify';
    tool_version: string;
  };
  project: ProjectInfo;
  storyboard: Storyboard;
  production_pack: ProductionPack;
}
