/**
 * Mock 分镜生成器
 * 用于测试和演示,生成简单的分镜数据
 */

import type {
  Storyboard,
  StoryboardScene,
  Shot,
  ProductionPack,
  WorkspaceType,
  GenerationMode,
} from '../types/index.js';
import { WORKSPACE_CONFIGS } from '../workspaces/configs.js';

/**
 * 生成 Mock 分镜数据
 * 基于制作包生成简单的分镜脚本
 */
export function generateMockStoryboard(
  productionPack: ProductionPack,
  workspace: WorkspaceType = 'manga',
  mode: GenerationMode = 'express'
): Storyboard {
  const scenes: StoryboardScene[] = [];
  let totalShots = 0;

  // 为每个场景生成基础镜头
  productionPack.scene_sheets.forEach((sceneSheet) => {
    const shots: Shot[] = [];

    // 每个场景生成 3-5 个镜头
    const shotCount = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < shotCount; i++) {
      totalShots++;

      const shot: Shot = {
        shot_number: totalShots,
        shot_type: getShotType(i, shotCount),
        camera_angle: getCameraAngle(i),
        content: generateShotContent(sceneSheet.name, i, shotCount),
        camera_movement: {
          type: getCameraMovement(i),
          speed: '中',
          curve: 'Ease In Out',
        },
        mood: {
          emotion: sceneSheet.atmosphere.split('、')[0] || '平静',
          atmosphere: sceneSheet.atmosphere,
          rhythm: i < shotCount / 2 ? '慢节奏' : '中节奏',
        },
        effects: {
          dialogue: [],
          duration: workspace === 'short-video' ? 3 + i : undefined,
          transition: i === shotCount - 1 ? { type: '淡入淡出', duration: 1 } : undefined,
        },
      };

      shots.push(shot);
    }

    scenes.push({
      scene_id: sceneSheet.id,
      scene_name: sceneSheet.name,
      shots,
    });
  });

  const workspaceConfig = WORKSPACE_CONFIGS[workspace];

  const storyboard: Storyboard = {
    version: '1.0',
    metadata: {
      title: productionPack.project.name,
      workspace,
      workspace_display_name: workspaceConfig.display_name,
      aspect_ratio: workspaceConfig.aspect_ratio,
      total_scenes: scenes.length,
      total_shots: totalShots,
      estimated_duration:
        workspace === 'short-video' ? `${Math.floor(totalShots * 3.5)}秒` : undefined,
      estimated_pages: workspace === 'manga' ? `${Math.ceil(totalShots / 3.5)}` : undefined,
      generation_mode: mode,
      created_at: new Date().toISOString(),
    },
    scenes,
  };

  return storyboard;
}

/**
 * 根据镜头位置选择景别
 */
function getShotType(shotIndex: number, totalShots: number): Shot['shot_type'] {
  if (shotIndex === 0) {
    return '全景'; // 开场建立环境
  } else if (shotIndex === totalShots - 1) {
    return '特写'; // 结尾强调情绪
  } else if (shotIndex % 3 === 0) {
    return '远景';
  } else if (shotIndex % 3 === 1) {
    return '中景';
  } else {
    return '近景';
  }
}

/**
 * 根据镜头位置选择角度
 */
function getCameraAngle(shotIndex: number): Shot['camera_angle'] {
  const angles: Array<Shot['camera_angle']> = ['平视', '俯视', '仰视'];
  return angles[shotIndex % 3];
}

/**
 * 根据镜头位置选择运镜
 */
function getCameraMovement(shotIndex: number): '静止' | '推' | '拉' | '摇' | '移' | '跟' | '升' | '降' | '环绕' {
  const movements: Array<'静止' | '推' | '拉' | '摇' | '移'> = [
    '静止',
    '推',
    '拉',
    '摇',
    '移',
  ];
  return movements[shotIndex % movements.length];
}

/**
 * 生成镜头内容描述
 */
function generateShotContent(sceneName: string, shotIndex: number, totalShots: number): string {
  if (shotIndex === 0) {
    return `${sceneName}的全景,建立场景氛围和环境。镜头展示整体空间布局。`;
  } else if (shotIndex === totalShots - 1) {
    return `${sceneName}的特写镜头,聚焦关键细节或人物表情,为本场景收尾。`;
  } else {
    return `${sceneName}的第${shotIndex + 1}个镜头,展示场景中的动作和交互。`;
  }
}
