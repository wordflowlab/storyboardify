/**
 * AI驱动的分镜生成器 - Express模式 (修复版)
 * 基于场景拆分和运镜优化,生成完整的AI驱动分镜脚本
 */

import type {
  Storyboard,
  Scene,
  Shot,
  ProductionPack,
  CharacterSheet,
  SceneSheet,
  WorkspaceType,
  MangaFields,
  ShortVideoFields,
  DynamicMangaFields,
  SubtitleConfig,
  Layer,
} from '../types/index.js';
import { splitSceneIntoShots, type SceneSplitResult } from './scene-splitter.js';
import { optimizeCameraParameters, type CameraOptimizationContext } from './camera-optimizer.js';
import { WORKSPACE_CONFIGS } from '../workspaces/configs.js';

export interface AIStoryboardOptions {
  workspace: WorkspaceType;
  style_preference?: 'cinematic' | 'dynamic' | 'minimal'; // 风格偏好
  detail_level?: 'basic' | 'detailed' | 'comprehensive'; // 细节程度
}

/**
 * 从剧本内容提取场景文本片段
 */
function extractSceneContent(
  scene: Scene,
  scriptContent: string,
  _sceneIndex: number
): string {
  // 如果场景本身有content,直接使用
  if (scene.content) {
    return scene.content;
  }

  // 否则从剧本中提取场景相关部分
  // 简化实现:查找场景名称相关的段落
  const sceneMarker = `## ${scene.name}`;
  const sceneStartIndex = scriptContent.indexOf(sceneMarker);

  if (sceneStartIndex === -1) {
    return `${scene.location}, ${scene.time}。场景描述待补充。`;
  }

  // 提取从场景标记到下一个场景标记之间的内容
  const nextSceneIndex = scriptContent.indexOf('##', sceneStartIndex + sceneMarker.length);
  const sceneText =
    nextSceneIndex === -1
      ? scriptContent.substring(sceneStartIndex)
      : scriptContent.substring(sceneStartIndex, nextSceneIndex);

  return sceneText.trim().substring(sceneMarker.length).trim() || '场景内容待补充';
}

/**
 * 从场景内容提取关键信息
 */
function extractSceneElements(sceneContent: string): {
  characters: string[];
  actions: string[];
  dialogues: string[];
  emotions: string[];
} {
  // 提取角色
  const character_matches = sceneContent.match(/([A-Z][a-z]+|[\u4e00-\u9fa5]{2,4}):/g) || [];
  const characters = [...new Set(character_matches.map(m => m.replace(':', '')))];

  // 提取动作
  const action_keywords = ['走', '跑', '坐', '站', '转身', '推开', '拿起', '放下', '看向', '离开'];
  const actions = action_keywords.filter(kw => sceneContent.includes(kw));

  // 提取对话
  const dialogue_pattern = /[「『"]([^」』"]+)[」』"]/g;
  const dialogues: string[] = [];
  let match;
  while ((match = dialogue_pattern.exec(sceneContent)) !== null) {
    dialogues.push(match[1]);
  }

  // 提取情绪
  const emotion_keywords = ['愤怒', '悲伤', '喜悦', '紧张', '平静', '恐惧', '惊讶', '困惑'];
  const emotions = emotion_keywords.filter(kw => sceneContent.includes(kw));

  return { characters, actions, dialogues, emotions };
}

/**
 * 为单个镜头生成详细内容
 */
function generateShotContent(
  scene: Scene,
  sceneContent: string,
  sceneSheet: SceneSheet,
  characterSheets: CharacterSheet[],
  shot_plan: SceneSplitResult['shot_plans'][0],
  shot_index: number,
  _total_shots: number
): Partial<Shot> {
  const { characters, actions, dialogues } = extractSceneElements(sceneContent);

  // 生成镜头内容描述
  const content_parts: string[] = [];

  // 如果是开场镜头,描述环境
  if (shot_index === 0) {
    content_parts.push(`${scene.name}。${sceneSheet.layout_description}`);
  }

  // 添加角色和动作
  if (characters.length > 0 && shot_index < characters.length) {
    const char_name = characters[shot_index];
    const char_sheet = characterSheets.find(cs => cs.name === char_name);
    if (char_sheet) {
      const physique = char_sheet.appearance.physique || '';
      content_parts.push(`${char_name}${physique}`);
    }
  }

  // 添加对话(如果有)
  if (dialogues.length > 0 && shot_index < dialogues.length) {
    content_parts.push(`对话: "${dialogues[shot_index]}"`);
  }

  // 添加动作(如果有)
  if (actions.length > 0) {
    const action_index = shot_index % actions.length;
    content_parts.push(`动作: ${actions[action_index]}`);
  }

  // 如果没有足够内容,使用场景内容片段
  if (content_parts.length < 2) {
    const snippet_length = 80;
    const start = Math.floor((shot_index / _total_shots) * sceneContent.length);
    const end = Math.min(start + snippet_length, sceneContent.length);
    const snippet = sceneContent.substring(start, end);
    if (snippet.trim()) {
      content_parts.push(snippet);
    }
  }

  return {
    shot_number: shot_index + 1,
    shot_type: shot_plan.suggested_shot_type as Shot['shot_type'],
    camera_angle: shot_plan.suggested_angle as Shot['camera_angle'],
    content: content_parts.join('。') || '镜头内容待补充',
  };
}

/**
 * 生成情绪标注
 */
function generateMoodAnnotation(sceneContent: string, pacing: string): Shot['mood'] {
  const { emotions } = extractSceneElements(sceneContent);

  let emotion = '平静';
  if (emotions.length > 0) {
    emotion = emotions[0];
  }

  return {
    emotion,
    atmosphere: pacing === 'fast' ? '紧张' : pacing === 'slow' ? '舒缓' : '自然',
    rhythm: pacing === 'fast' ? '快节奏' : pacing === 'slow' ? '慢节奏' : '中节奏',
  };
}

/**
 * 生成工作区特定字段
 */
function generateWorkspaceFields(
  workspace: WorkspaceType,
  shot_index: number,
  _total_shots: number
): Shot['workspace_fields'] {
  if (workspace === 'manga') {
    // 漫画工作区
    const is_page_break = (shot_index + 1) % 4 === 0; // 每4个镜头翻页
    const fields: MangaFields = {
      page_break: is_page_break,
      bubble_position: shot_index % 2 === 0 ? '左上' : '右上',
      panel_layout: shot_index % 3 === 0 ? '全页' : '半页',
    };
    return fields;
  } else if (workspace === 'short-video') {
    // 短视频工作区
    const timeline_seconds = shot_index * 3; // 每个镜头3秒
    const minutes = Math.floor(timeline_seconds / 60);
    const seconds = timeline_seconds % 60;

    const subtitle: SubtitleConfig = {
      text: '字幕内容待填充',
      position: '底部',
      style: {
        font: 'PingFang SC',
        size: '中',
        color: '#FFFFFF',
        stroke: '#000000',
        effect: '淡入',
      },
    };

    const fields: ShortVideoFields = {
      timeline: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
      subtitle,
      voiceover: {
        text: '配音文本待填充',
        voice: '旁白',
        speed: '正常',
        emotion: '中性',
        volume: 80,
      },
    };
    return fields;
  } else if (workspace === 'dynamic-manga') {
    // 动态漫工作区
    const layers: Layer[] = [
      { layer: '背景层', content: '背景内容', z_depth: 0 },
      { layer: '中景层', content: '场景元素', z_depth: 10 },
      { layer: '人物层', content: '角色动画', z_depth: 20 },
      { layer: '特效层', content: '视觉特效', z_depth: 30 },
    ];

    const fields: DynamicMangaFields = {
      frame_range: `${shot_index * 24}-${(shot_index + 1) * 24}`, // 24fps
      layer_structure: layers,
      camera_3d: {
        camera_position: {
          start: [0, 0, 50],
          end: [0, 0, 45],
        },
        camera_rotation: {
          start: [0, 0, 0],
          end: [0, 0, 0],
        },
        fov: 50,
        animation_curve: 'Ease In Out',
      },
      vfx: {
        particle_system: undefined,
        glow: undefined,
        motion_blur: {
          samples: 16,
          shutter_angle: 180,
        },
      },
    };
    return fields;
  }

  return undefined;
}

/**
 * Express模式: 完全自动生成分镜
 */
export async function generateExpressStoryboard(
  productionPack: ProductionPack,
  options: AIStoryboardOptions
): Promise<Storyboard> {
  const { character_sheets, scene_sheets, source_data } = productionPack;
  const scenes = source_data.scenes;
  const scriptContent = source_data.scripts[0]?.content || '';

  console.log(`\n🚀 Express模式: 开始AI驱动分镜生成...\n`);

  // 1. 为场景添加内容
  const enriched_scenes = scenes.map((scene, index) => ({
    ...scene,
    content: extractSceneContent(scene, scriptContent, index),
  }));

  // 2. 生成场景拆分规划
  console.log('📊 步骤 1/4: 分析场景复杂度并生成镜头规划...');
  const split_results = enriched_scenes.map(scene => {
    const sheet = scene_sheets.find(s => s.scene_id === scene.id);
    return splitSceneIntoShots(scene, sheet);
  });

  const total_shots = split_results.reduce((sum, r) => sum + r.estimated_shots, 0);
  console.log(`   ✓ 规划完成: ${scenes.length}个场景, 预计${total_shots}个镜头\n`);

  // 3. 为每个场景生成镜头
  console.log('🎬 步骤 2/4: 生成详细镜头内容...');
  const storyboard_scenes: Storyboard['scenes'] = [];
  let global_shot_number = 1;

  for (const [scene_index, scene] of enriched_scenes.entries()) {
    const split_result = split_results[scene_index];
    const scene_sheet = scene_sheets.find(s => s.scene_id === scene.id)!;

    console.log(
      `   场景 ${scene_index + 1}/${scenes.length}: ${scene.name} (${split_result.estimated_shots}个镜头, ${split_result.pacing}节奏)`
    );

    const shots: Shot[] = [];

    for (const [shot_index, shot_plan] of split_result.shot_plans.entries()) {
      // 生成基础镜头内容
      const shot_base = generateShotContent(
        scene,
        scene.content!,
        scene_sheet,
        character_sheets,
        shot_plan,
        shot_index,
        split_result.estimated_shots
      );

      // 优化运镜参数
      const shot_position: CameraOptimizationContext['shot_position'] =
        shot_index === 0
          ? 'opening'
          : shot_index === split_result.estimated_shots - 1
            ? 'closing'
            : shot_index / split_result.estimated_shots > 0.6
              ? 'climax'
              : 'middle';

      const optimized_camera = optimizeCameraParameters({
        shot_type: shot_base.shot_type!,
        scene_pacing: split_result.pacing,
        mood: undefined,
        is_dialogue: shot_base.content?.includes('对话') || false,
        is_action: shot_base.content?.includes('动作') || false,
        shot_position,
      });

      // 组装完整镜头
      const shot: Shot = {
        shot_number: global_shot_number++,
        shot_type: shot_base.shot_type!,
        camera_angle: shot_base.camera_angle!,
        content: shot_base.content!,
        camera_movement: {
          type: optimized_camera.movement.type,
          speed:
            optimized_camera.movement.speed === '极慢' ||
            optimized_camera.movement.speed === '慢速'
              ? '慢'
              : optimized_camera.movement.speed === '中速'
                ? '中'
                : optimized_camera.movement.speed === '快速' ||
                    optimized_camera.movement.speed === '极快'
                  ? '快'
                  : '中',
        },
        mood: generateMoodAnnotation(scene.content!, split_result.pacing),
        workspace_fields: generateWorkspaceFields(
          options.workspace,
          shot_index,
          split_result.estimated_shots
        ),
      };

      shots.push(shot);
    }

    storyboard_scenes.push({
      scene_id: scene.id,
      scene_name: scene.name,
      shots,
    });
  }

  console.log(`   ✓ ${total_shots}个镜头生成完成\n`);

  // 4. 生成元数据
  console.log('📝 步骤 3/4: 生成元数据...');
  const workspace_config = WORKSPACE_CONFIGS[options.workspace];

  let estimated_duration: string | undefined;
  let estimated_pages: string | undefined;

  if (options.workspace === 'short-video' || options.workspace === 'dynamic-manga') {
    const total_seconds = total_shots * 3; // 假设每个镜头3秒
    const minutes = Math.floor(total_seconds / 60);
    const seconds = total_seconds % 60;
    estimated_duration = `${minutes}分${seconds}秒`;
  }

  if (options.workspace === 'manga') {
    estimated_pages = `${Math.ceil(total_shots / 4)}`; // 假设每页4格
  }

  console.log(`   ✓ 预估${estimated_duration || estimated_pages + '页' || '完成'}\n`);

  // 5. 组装完整分镜脚本
  console.log('✅ 步骤 4/4: 组装分镜脚本...\n');

  const storyboard: Storyboard = {
    version: '1.0',
    metadata: {
      title: source_data.scripts[0]?.title || source_data.project.name,
      workspace: options.workspace,
      workspace_display_name: workspace_config.display_name,
      aspect_ratio: workspace_config.aspect_ratio,
      total_scenes: scenes.length,
      total_shots,
      estimated_duration,
      estimated_pages,
      generation_mode: 'express',
      created_at: new Date().toISOString(),
    },
    scenes: storyboard_scenes,
    production_pack_reference: {
      characters: character_sheets.map(cs => cs.id),
      scenes: scene_sheets.map(ss => ss.scene_id),
    },
  };

  console.log('🎉 Express模式分镜生成完成!\n');
  console.log(`总计: ${scenes.length}个场景, ${total_shots}个镜头`);
  console.log(`工作区: ${workspace_config.display_name}`);
  console.log(`预估: ${estimated_duration || estimated_pages + '页' || 'N/A'}\n`);

  return storyboard;
}
