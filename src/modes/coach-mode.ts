/**
 * Coach Mode Implementation
 * AI-guided storyboard creation for learning
 */

import chalk from 'chalk';
import { BaseMode, type GenerationOptions, type CoachModeState, type ModeState } from './base-mode.js';
import type {
  ProductionPack,
  Storyboard,
  Shot,
  Scene,
  StoryboardScene,
  ShotType,
  CameraAngle,
} from '../types/index.js';
import { selectFromList, inputNumber, confirm, inputText } from '../utils/interactive-prompt.js';
import { ProgressBar, displayStep, displaySuccess, displayInfo } from '../utils/progress-display.js';
import { showEducationTip } from '../education/tips.js';
import { splitSceneIntoShots } from '../generators/scene-splitter.js';
import { optimizeCameraParameters } from '../generators/camera-optimizer.js';

export class CoachMode extends BaseMode {
  readonly name = 'coach';

  async generate(productionPack: ProductionPack, options: GenerationOptions): Promise<Storyboard> {
    console.log(chalk.blue('\n🎓 欢迎使用Coach模式 - AI引导式分镜创作\n'));
    console.log(chalk.gray('AI将逐步引导你设计每个场景的分镜,并分享专业分镜理论。'));
    console.log(chalk.gray('预计耗时: 10-20分钟 (取决于场景数量)\n'));

    // Check for saved progress
    const savedState = await this.loadProgress();
    if (savedState && savedState.mode === 'coach') {
      const resume = await confirm('检测到未完成的进度,是否继续?', true);
      if (resume) {
        return await this.resumeFromState(savedState, productionPack, options);
      }
    }

    // Initialize state
    const state: ModeState = this.initState('coach');
    state.data = {
      questions_asked: [],
      user_answers: [],
      generated_shots: [],
      education_points: [],
    } as CoachModeState;

    const scenes = productionPack.source_data.scenes;
    const storyboardScenes: StoryboardScene[] = [];
    let totalShots = 0;

    const progress = new ProgressBar(scenes.length, '场景进度');

    // Guide through each scene
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      state.current_scene_index = i;

      displayStep(i + 1, scenes.length, `场景: ${scene.name}`);

      const storyboardScene = await this.guideScene(scene, productionPack, state);
      storyboardScenes.push(storyboardScene);
      totalShots += storyboardScene.shots.length;

      // Save progress after each scene
      await this.saveProgress(state);

      progress.update(i + 1);
    }

    progress.complete();

    // Assemble final storyboard
    const storyboard = this.assembleStoryboard(
      productionPack,
      storyboardScenes,
      totalShots,
      options
    );

    // Validate
    const validation = this.validate(storyboard);
    if (!validation.valid) {
      console.log(chalk.yellow('\n⚠️  分镜验证发现问题:'));
      validation.errors.forEach(err => console.log(chalk.red(`  - ${err.message}`)));
    }

    // Clear progress
    await this.clearProgress();

    displaySuccess('Coach模式分镜创作完成!');
    return storyboard;
  }

  /**
   * Guide user through a single scene
   */
  private async guideScene(
    scene: Scene,
    productionPack: ProductionPack,
    _state: ModeState
  ): Promise<StoryboardScene> {
    console.log(chalk.cyan(`\n📍 场景: ${scene.name}`));
    console.log(chalk.gray(`   地点: ${scene.location}`));
    console.log(chalk.gray(`   时间: ${scene.time}`));
    if (scene.atmosphere) {
      console.log(chalk.gray(`   氛围: ${scene.atmosphere}`));
    }

    // Step 1: Ask about mood/atmosphere
    const mood = await this.askMood(scene);

    // Step 2: AI suggests shot count, user can adjust
    const sceneSheet = productionPack.scene_sheets.find(s => s.scene_id === scene.id);
    const splitResult = splitSceneIntoShots(scene, sceneSheet);
    const suggestedCount = splitResult.estimated_shots;

    console.log(chalk.blue(`\n💡 AI建议: 这个场景拍摄 ${suggestedCount} 个镜头`));
    console.log(chalk.gray(`   (基于场景复杂度: ${splitResult.complexity}, 节奏: ${splitResult.pacing})`));

    showEducationTip('pacing', splitResult.pacing);

    const shotCount = await inputNumber(
      `你想要几个镜头? (建议: ${suggestedCount})`,
      suggestedCount,
      1,
      15
    );

    // Step 3: Generate shots with user guidance
    const shots: Shot[] = [];
    const userShotCount = shotCount || suggestedCount;

    for (let i = 0; i < userShotCount; i++) {
      displayInfo(`\n镜头 ${i + 1}/${userShotCount}:`);

      const shot = await this.guideShot(scene, i, userShotCount, splitResult.pacing, mood);
      shots.push(shot);
    }

    return {
      scene_id: scene.id,
      scene_name: scene.name,
      shots,
    };
  }

  /**
   * Ask about scene mood
   */
  private async askMood(scene: Scene): Promise<string> {
    const mood = await selectFromList(
      `场景「${scene.name}」想营造什么氛围?`,
      [
        { name: '😰 紧张 - 快节奏,短镜头', value: 'tense' },
        { name: '💖 温馨 - 慢节奏,长镜头', value: 'warm' },
        { name: '😢 悲伤 - 特写为主,情绪镜头', value: 'sad' },
        { name: '😄 欢快 - 动态运镜,多角度', value: 'happy' },
        { name: '🤔 神秘 - 阴影,斜角', value: 'mysterious' },
        { name: '❓ 让AI决定', value: 'auto' },
      ],
      scene.atmosphere || 'auto'
    );

    if (mood !== 'auto') {
      const moodMap: Record<string, string> = {
        tense: '紧张',
        warm: '温馨',
        sad: '悲伤',
        happy: '欢快',
        mysterious: '神秘',
      };
      showEducationTip('mood', moodMap[mood]);
    }

    return mood;
  }

  /**
   * Guide user to create a single shot
   */
  private async guideShot(
    scene: Scene,
    shotIndex: number,
    totalShots: number,
    pacing: 'slow' | 'medium' | 'fast',
    mood: string
  ): Promise<Shot> {
    // Determine shot position
    let shot_position: 'opening' | 'middle' | 'climax' | 'closing' = 'middle';
    if (shotIndex === 0) shot_position = 'opening';
    else if (shotIndex === totalShots - 1) shot_position = 'closing';
    else if (shotIndex / totalShots > 0.6 && shotIndex / totalShots < 0.8) shot_position = 'climax';

    // Get AI optimization
    const optimization = optimizeCameraParameters({
      shot_type: shotIndex === 0 ? '全景' : '中景',
      scene_pacing: pacing,
      mood: mood !== 'auto' ? mood : undefined,
      is_dialogue: scene.content?.includes('「') || scene.content?.includes('"') || false,
      is_action: scene.content?.match(/走|跑|打|推|拉/) !== null || false,
      shot_position,
    });

    // Ask shot type
    const shotType = await this.askShotType(optimization.movement.type as ShotType, shotIndex);

    // Ask camera angle
    const cameraAngle = await this.askCameraAngle(optimization.angle.type as CameraAngle);

    // Ask for movement
    const useMovement = await confirm('是否使用运镜?', optimization.movement.type !== '静止');
    let cameraMovement = undefined;

    if (useMovement) {
      const movementType = await selectFromList(
        '选择运镜方式:',
        [
          { name: '推 - 逐渐靠近', value: '推' },
          { name: '拉 - 逐渐远离', value: '拉' },
          { name: '摇 - 水平移动', value: '摇' },
          { name: '移 - 跟随移动', value: '移' },
          { name: '跟 - 紧跟目标', value: '跟' },
          { name: '静止', value: '静止' },
        ],
        optimization.movement.type
      );

      if (movementType !== '静止') {
        showEducationTip('movement', movementType as string);
        cameraMovement = {
          type: movementType as '推' | '拉' | '摇' | '移' | '跟' | '静止',
          speed: '中' as const,
        };
      }
    }

    // Ask for content description
    const content = await inputText(
      '画面内容描述 (至少10个字符):',
      `${scene.location}, ${shotType}展示...`,
      (value: string) => {
        if (value.length < 10) return '内容描述至少需要10个字符';
        return true;
      }
    );

    // Build shot
    const shot: Shot = {
      shot_number: shotIndex + 1,
      shot_type: shotType,
      camera_angle: cameraAngle,
      content,
      camera_movement: cameraMovement,
    };

    displaySuccess(`镜头 ${shotIndex + 1} 创建完成`);

    return shot;
  }

  /**
   * Ask for shot type
   */
  private async askShotType(suggested: ShotType, shotIndex: number): Promise<ShotType> {
    const choices = [
      { name: '远景 - 建立空间', value: '远景' as ShotType },
      { name: '全景 - 展示全身', value: '全景' as ShotType },
      { name: '中景 - 腰部以上', value: '中景' as ShotType },
      { name: '近景 - 胸部以上', value: '近景' as ShotType },
      { name: '特写 - 面部', value: '特写' as ShotType },
      { name: '大特写 - 局部', value: '大特写' as ShotType },
    ];

    // Suggest based on shot position
    const defaultType = shotIndex === 0 ? '全景' : suggested || '中景';

    const shotType = await selectFromList(
      `选择景别 (建议: ${defaultType}):`,
      choices,
      defaultType
    );

    showEducationTip('shot_type', shotType);

    return shotType;
  }

  /**
   * Ask for camera angle
   */
  private async askCameraAngle(suggested: CameraAngle): Promise<CameraAngle> {
    const choices = [
      { name: '平视 - 自然视角', value: '平视' as CameraAngle },
      { name: '俯视 - 展示布局', value: '俯视' as CameraAngle },
      { name: '仰视 - 增强气势', value: '仰视' as CameraAngle },
      { name: '斜角 - 动态感', value: '斜角' as CameraAngle },
    ];

    const cameraAngle = await selectFromList(
      `选择角度 (建议: ${suggested}):`,
      choices,
      suggested || '平视'
    );

    showEducationTip('angle', cameraAngle);

    return cameraAngle;
  }

  /**
   * Resume from saved state
   */
  private async resumeFromState(
    _savedState: ModeState,
    _productionPack: ProductionPack,
    _options: GenerationOptions
  ): Promise<Storyboard> {
    // TODO: Implement resume logic
    throw new Error('Resume from saved state not yet implemented');
  }

  /**
   * Assemble final storyboard
   */
  private assembleStoryboard(
    productionPack: ProductionPack,
    scenes: StoryboardScene[],
    totalShots: number,
    options: GenerationOptions
  ): Storyboard {
    return {
      version: '1.0',
      metadata: {
        title: productionPack.project.name,
        workspace: options.workspace as 'manga' | 'short-video' | 'dynamic-manga',
        workspace_display_name: options.workspace,
        aspect_ratio: '16:9',
        total_scenes: scenes.length,
        total_shots: totalShots,
        generation_mode: 'coach',
        created_at: new Date().toISOString(),
      },
      scenes,
      production_pack_reference: {
        characters: productionPack.character_sheets.map(c => c.id),
        scenes: productionPack.scene_sheets.map(s => s.id),
      },
    };
  }
}

