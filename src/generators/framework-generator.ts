/**
 * Framework Generator for Hybrid Mode
 * Generates shot framework with AI suggestions
 */

import type { ProductionPack, Scene, Shot } from '../types/index.js';
import { splitSceneIntoShots, type SceneSplitResult } from './scene-splitter.js';
import { optimizeCameraParameters, type CameraOptimizationContext } from './camera-optimizer.js';

export interface ShotFramework {
  shot_number: number;
  scene_id: string;
  scene_name: string;
  suggested_shot_type: Shot['shot_type'];
  suggested_angle: Shot['camera_angle'];
  suggested_movement: Shot['camera_movement'];
  content_suggestion: string;
  rationale: string;
  is_user_filled: boolean;
}

/**
 * Generate framework for all scenes
 */
export function generateFramework(productionPack: ProductionPack): ShotFramework[] {
  const frameworks: ShotFramework[] = [];
  let globalShotNumber = 1;

  const scenes = productionPack.source_data.scenes;
  const sceneSheets = productionPack.scene_sheets;
  const sceneSheetMap = new Map(sceneSheets.map(sheet => [sheet.scene_id, sheet]));

  for (const scene of scenes) {
    const sceneSheet = sceneSheetMap.get(scene.id);

    // Use scene-splitter to analyze scene
    const splitResult = splitSceneIntoShots(scene, sceneSheet);

    // Generate framework for each shot plan
    for (const shotPlan of splitResult.shot_plans) {
      const framework = generateShotFramework(
        scene,
        shotPlan.shot_number,
        splitResult,
        globalShotNumber
      );

      frameworks.push(framework);
      globalShotNumber++;
    }
  }

  return frameworks;
}

/**
 * Generate framework for a single shot
 */
function generateShotFramework(
  scene: Scene,
  localShotNumber: number,
  splitResult: SceneSplitResult,
  globalShotNumber: number
): ShotFramework {
  const shotPlan = splitResult.shot_plans[localShotNumber - 1];

  // Determine shot position
  const total = splitResult.shot_plans.length;
  let shot_position: CameraOptimizationContext['shot_position'] = 'middle';

  if (localShotNumber === 1) {
    shot_position = 'opening';
  } else if (localShotNumber === total) {
    shot_position = 'closing';
  } else if (localShotNumber / total > 0.6 && localShotNumber / total < 0.8) {
    shot_position = 'climax';
  }

  // Use camera-optimizer to get optimized parameters
  const cameraOptimization = optimizeCameraParameters({
    shot_type: shotPlan.suggested_shot_type,
    scene_pacing: splitResult.pacing,
    mood: scene.atmosphere,
    is_dialogue: scene.content?.includes('「') || scene.content?.includes('"') || false,
    is_action: scene.content?.match(/走|跑|打|推|拉|转身|坐下|站起/) !== null || false,
    shot_position,
  });

  // Generate content suggestion
  const contentSuggestion = generateContentSuggestion(scene, shotPlan, localShotNumber, total);

  // Build comprehensive rationale
  const rationale = `${shotPlan.rationale}; ${cameraOptimization.rationale}`;

  return {
    shot_number: globalShotNumber,
    scene_id: scene.id,
    scene_name: scene.name,
    suggested_shot_type: shotPlan.suggested_shot_type as Shot['shot_type'],
    suggested_angle: cameraOptimization.angle.type as Shot['camera_angle'],
    suggested_movement: {
      type: cameraOptimization.movement.type,
      speed: cameraOptimization.movement.speed === '极慢' || cameraOptimization.movement.speed === '极快'
        ? cameraOptimization.movement.speed === '极慢' ? '慢' : '快'
        : cameraOptimization.movement.speed === '慢速' ? '慢'
        : cameraOptimization.movement.speed === '快速' ? '快'
        : '中',
    },
    content_suggestion: contentSuggestion,
    rationale,
    is_user_filled: false,
  };
}

/**
 * Generate content suggestion for a shot
 */
function generateContentSuggestion(
  scene: Scene,
  shotPlan: { content_focus: string; suggested_shot_type: string },
  shotNumber: number,
  totalShots: number
): string {
  const sceneName = scene.name;
  const location = scene.location;
  const time = scene.time;
  const atmosphere = scene.atmosphere || '平静';

  let suggestion = '';

  // Opening shot
  if (shotNumber === 1) {
    suggestion = `${location},${time}。${shotPlan.content_focus}。营造${atmosphere}的氛围。`;
  }
  // Closing shot
  else if (shotNumber === totalShots) {
    suggestion = `${sceneName}的结尾镜头。${shotPlan.content_focus}。为下一场景做准备。`;
  }
  // Middle shots
  else {
    suggestion = `${shotPlan.content_focus}。注意${shotPlan.suggested_shot_type}的构图特点。`;
  }

  // Add scene content hint if available
  if (scene.content) {
    const contentPreview = scene.content.slice(0, 50);
    suggestion += ` 参考: ${contentPreview}...`;
  }

  return suggestion;
}

/**
 * Generate framework for a specific scene
 */
export function generateSceneFramework(
  scene: Scene,
  sceneSheet: any,
  startingShotNumber: number
): ShotFramework[] {
  const splitResult = splitSceneIntoShots(scene, sceneSheet);
  const frameworks: ShotFramework[] = [];

  for (let i = 0; i < splitResult.shot_plans.length; i++) {
    const framework = generateShotFramework(
      scene,
      i + 1,
      splitResult,
      startingShotNumber + i
    );
    frameworks.push(framework);
  }

  return frameworks;
}

