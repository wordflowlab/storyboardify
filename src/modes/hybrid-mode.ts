/**
 * Hybrid Mode Implementation
 * AI framework + user customization
 */

import chalk from 'chalk';
import { BaseMode, type GenerationOptions, type HybridModeState, type ModeState } from './base-mode.js';
import type {
  ProductionPack,
  Storyboard,
  Shot,
  Scene,
  StoryboardScene,
  ShotType,
  CameraAngle,
} from '../types/index.js';
import { generateFramework, type ShotFramework } from '../generators/framework-generator.js';
import { selectFromList, inputText, confirm, openEditor } from '../utils/interactive-prompt.js';
import { ProgressBar, displayStep, displaySuccess, displayWarning, displayInfo } from '../utils/progress-display.js';
import { validateShot, analyzeShotDistribution } from '../validators/shot-validator.js';

export class HybridMode extends BaseMode {
  readonly name = 'hybrid';

  async generate(productionPack: ProductionPack, options: GenerationOptions): Promise<Storyboard> {
    console.log(chalk.blue('\n🎨 欢迎使用Hybrid模式 - AI框架 + 人工定制\n'));
    console.log(chalk.gray('AI将生成分镜框架和建议,你可以自由修改每个镜头的细节。'));
    console.log(chalk.gray('预计耗时: 20-30分钟 (取决于场景数量)\n'));

    // Check for saved progress
    const savedState = await this.loadProgress();
    if (savedState && savedState.mode === 'hybrid') {
      const resume = await confirm('检测到未完成的进度,是否继续?', true);
      if (resume) {
        return await this.resumeFromState(savedState, productionPack, options);
      }
    }

    // Step 1: Generate framework
    displayStep(1, 3, '生成分镜框架');
    console.log(chalk.gray('AI正在分析场景并生成镜头框架...\n'));

    const framework = generateFramework(productionPack);

    displaySuccess(`已生成 ${framework.length} 个镜头框架`);

    // Show framework preview
    this.showFrameworkPreview(framework);

    const proceed = await confirm('\n是否开始填充镜头内容?', true);
    if (!proceed) {
      console.log(chalk.yellow('已取消操作'));
      return this.createEmptyStoryboard(productionPack, options);
    }

    // Initialize state
    const state: ModeState = this.initState('hybrid');
    state.data = {
      framework_generated: true,
      framework,
      user_filled_shots: [],
      completion_progress: 0,
      validation_results: [],
    } as HybridModeState;

    // Step 2: User fills framework
    displayStep(2, 3, '填充镜头内容');

    const filledShots = await this.fillFramework(framework, state);

    // Step 3: Analyze and optimize
    displayStep(3, 3, '分析和优化');

    const storyboard = this.mergeAndOptimize(filledShots, productionPack, options);

    // Validate
    const validation = this.validate(storyboard);
    if (!validation.valid) {
      console.log(chalk.yellow('\n⚠️  分镜验证发现问题:'));
      validation.errors.forEach(err => console.log(chalk.red(`  - ${err.message}`)));
    }

    // Clear progress
    await this.clearProgress();

    displaySuccess('Hybrid模式分镜创作完成!');
    return storyboard;
  }

  /**
   * Show framework preview
   */
  private showFrameworkPreview(framework: ShotFramework[]): void {
    console.log(chalk.blue('\n📋 分镜框架预览:'));

    // Group by scene
    const sceneGroups = new Map<string, ShotFramework[]>();
    framework.forEach(shot => {
      const shots = sceneGroups.get(shot.scene_id) || [];
      shots.push(shot);
      sceneGroups.set(shot.scene_id, shots);
    });

    let previewCount = 0;
    for (const [_sceneId, shots] of sceneGroups) {
      if (previewCount >= 3) break; // Show first 3 scenes

      const sceneName = shots[0].scene_name;
      console.log(chalk.gray(`\n  场景: ${sceneName} (${shots.length} 个镜头)`));

      shots.slice(0, 2).forEach(shot => {
        console.log(
          chalk.gray(
            `    镜头${shot.shot_number}: ${shot.suggested_shot_type} / ${shot.suggested_angle} / ${shot.suggested_movement?.type || '静止'}`
          )
        );
      });

      if (shots.length > 2) {
        console.log(chalk.gray(`    ... 还有 ${shots.length - 2} 个镜头`));
      }

      previewCount++;
    }

    if (sceneGroups.size > 3) {
      console.log(chalk.gray(`\n  ... 还有 ${sceneGroups.size - 3} 个场景`));
    }

    console.log(chalk.blue(`\n总计: ${framework.length} 个镜头框架`));
  }

  /**
   * Fill framework with user content
   */
  private async fillFramework(framework: ShotFramework[], state: ModeState): Promise<Shot[]> {
    const shots: Shot[] = [];
    const progress = new ProgressBar(framework.length, '填充进度');

    for (let i = 0; i < framework.length; i++) {
      const frameShot = framework[i];

      // Check if switching scene
      if (i === 0 || frameShot.scene_id !== framework[i - 1]?.scene_id) {
        console.log(chalk.cyan(`\n\n📍 场景: ${frameShot.scene_name}`));
      }

      displayInfo(`镜头 ${i + 1}/${framework.length}:`);

      const filledShot = await this.promptUserFill(frameShot);
      shots.push(filledShot);

      // Validate shot
      const validation = validateShot(filledShot);
      if (validation.warnings.length > 0) {
        validation.warnings.forEach(warning => displayWarning(warning));
      }
      if (validation.suggestions.length > 0) {
        validation.suggestions.forEach(suggestion => displayInfo(suggestion));
      }

      // Save progress
      state.current_shot_index = i;
      await this.saveProgress(state);

      progress.update(i + 1);
    }

    progress.complete();

    // Analyze shot distribution
    const analysis = analyzeShotDistribution(shots);
    if (analysis.suggestions.length > 0) {
      console.log(chalk.yellow('\n💡 镜头分布建议:'));
      analysis.suggestions.forEach(suggestion => console.log(chalk.gray(`  - ${suggestion}`)));
    }

    return shots;
  }

  /**
   * Prompt user to fill a single shot
   */
  private async promptUserFill(frameShot: ShotFramework): Promise<Shot> {
    console.log(chalk.blue('\n  AI建议:'));
    console.log(chalk.gray(`    景别: ${frameShot.suggested_shot_type}`));
    console.log(chalk.gray(`    角度: ${frameShot.suggested_angle}`));
    console.log(chalk.gray(`    运镜: ${frameShot.suggested_movement?.type || '静止'}`));
    console.log(chalk.gray(`    内容: ${frameShot.content_suggestion}`));
    console.log(chalk.gray(`    理由: ${frameShot.rationale}`));

    // Ask if user wants to use AI suggestions or customize
    const useAISuggestions = await confirm('\n  使用AI建议?', true);

    let shotType: ShotType;
    let cameraAngle: CameraAngle;
    let cameraMovement: Shot['camera_movement'];
    let content: string;

    if (useAISuggestions) {
      shotType = frameShot.suggested_shot_type;
      cameraAngle = frameShot.suggested_angle;
      cameraMovement = frameShot.suggested_movement;
      content = frameShot.content_suggestion;

      // Allow editing content
      const editContent = await confirm('是否编辑画面描述?', false);
      if (editContent) {
        content = await inputText(
          '画面内容描述:',
          content,
          (value: string) => value.length >= 10 || '至少10个字符'
        );
      }
    } else {
      // Full customization
      shotType = await this.askShotType(frameShot.suggested_shot_type);
      cameraAngle = await this.askCameraAngle(frameShot.suggested_angle);

      const useMovement = await confirm('是否使用运镜?', frameShot.suggested_movement?.type !== '静止');
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
          frameShot.suggested_movement?.type || '静止'
        );

        if (movementType !== '静止') {
          cameraMovement = {
            type: movementType as '推' | '拉' | '摇' | '移' | '跟' | '静止',
            speed: '中',
          };
        }
      }

      // Use editor for long text
      const useLongEditor = await confirm('使用编辑器输入画面描述?', false);

      if (useLongEditor) {
        content = await openEditor('画面内容描述:', frameShot.content_suggestion);
      } else {
        content = await inputText(
          '画面内容描述:',
          frameShot.content_suggestion,
          (value: string) => value.length >= 10 || '至少10个字符'
        );
      }
    }

    // Build shot
    const shot: Shot = {
      shot_number: frameShot.shot_number,
      shot_type: shotType,
      camera_angle: cameraAngle,
      content,
      camera_movement: cameraMovement,
    };

    return shot;
  }

  /**
   * Ask for shot type
   */
  private async askShotType(suggested: ShotType): Promise<ShotType> {
    return await selectFromList(
      `选择景别 (建议: ${suggested}):`,
      [
        { name: '远景', value: '远景' as ShotType },
        { name: '全景', value: '全景' as ShotType },
        { name: '中景', value: '中景' as ShotType },
        { name: '近景', value: '近景' as ShotType },
        { name: '特写', value: '特写' as ShotType },
        { name: '大特写', value: '大特写' as ShotType },
      ],
      suggested
    );
  }

  /**
   * Ask for camera angle
   */
  private async askCameraAngle(suggested: CameraAngle): Promise<CameraAngle> {
    return await selectFromList(
      `选择角度 (建议: ${suggested}):`,
      [
        { name: '平视', value: '平视' as CameraAngle },
        { name: '俯视', value: '俯视' as CameraAngle },
        { name: '仰视', value: '仰视' as CameraAngle },
        { name: '斜角', value: '斜角' as CameraAngle },
        { name: '鸟瞰', value: '鸟瞰' as CameraAngle },
        { name: '虫视', value: '虫视' as CameraAngle },
      ],
      suggested
    );
  }

  /**
   * Merge filled shots into storyboard
   */
  private mergeAndOptimize(
    shots: Shot[],
    productionPack: ProductionPack,
    options: GenerationOptions
  ): Storyboard {
    // Group shots by scene
    const scenes: StoryboardScene[] = [];
    const sceneMap = new Map<string, Scene>();

    productionPack.source_data.scenes.forEach(scene => {
      sceneMap.set(scene.id, scene);
    });

    let currentSceneId: string = productionPack.source_data.scenes[0]?.id || 'scene_001';
    let currentSceneShots: Shot[] = [];
    let currentSceneName = productionPack.source_data.scenes[0]?.name || 'Scene 1';

    const framework: ShotFramework[] = [];
    const frameworkGenerated = generateFramework(productionPack);
    framework.push(...frameworkGenerated);

    shots.forEach((_shot, _index) => {
      const shot = _shot;
      // Get scene ID from shot number (assuming sequential)
      const frameShot = framework.find((f: ShotFramework) => f.shot_number === shot.shot_number);
      const sceneId = frameShot?.scene_id || currentSceneId;

      if (sceneId !== currentSceneId) {
        // Save previous scene
        scenes.push({
          scene_id: currentSceneId,
          scene_name: currentSceneName,
          shots: currentSceneShots,
        });

        // Start new scene
        currentSceneId = sceneId;
        const scene = sceneMap.get(sceneId);
        currentSceneName = scene?.name || 'Unknown Scene';
        currentSceneShots = [shot];
      } else {
        currentSceneShots.push(shot);
      }
    });

    // Save last scene
    if (currentSceneId && currentSceneShots.length > 0) {
      scenes.push({
        scene_id: currentSceneId,
        scene_name: currentSceneName,
        shots: currentSceneShots,
      });
    }

    return {
      version: '1.0',
      metadata: {
        title: productionPack.project.name,
        workspace: options.workspace as 'manga' | 'short-video' | 'dynamic-manga',
        workspace_display_name: options.workspace,
        aspect_ratio: '16:9',
        total_scenes: scenes.length,
        total_shots: shots.length,
        generation_mode: 'hybrid',
        created_at: new Date().toISOString(),
      },
      scenes,
      production_pack_reference: {
        characters: productionPack.character_sheets.map(c => c.id),
        scenes: productionPack.scene_sheets.map(s => s.id),
      },
    };
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
   * Create empty storyboard when user cancels
   */
  private createEmptyStoryboard(productionPack: ProductionPack, options: GenerationOptions): Storyboard {
    return {
      version: '1.0',
      metadata: {
        title: productionPack.project.name,
        workspace: options.workspace as 'manga' | 'short-video' | 'dynamic-manga',
        workspace_display_name: options.workspace,
        aspect_ratio: '16:9',
        total_scenes: 0,
        total_shots: 0,
        generation_mode: 'hybrid',
        created_at: new Date().toISOString(),
      },
      scenes: [],
    };
  }
}

