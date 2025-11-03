/**
 * Batch Generator - Image Generation Orchestrator
 * 批量生成调度器 - 图片生成编排器
 */

import path from 'path';
import fs from 'fs-extra';
import ora, { type Ora } from 'ora';
import chalk from 'chalk';
import { APIManager } from '../../api/api-manager.js';
import { ConsistencyTracker } from './consistency-tracker.js';
import { PromptBuilder } from './prompt-builder.js';
import type {
  Storyboard,
  Shot,
  Scene,
  Character,
  CharacterReference,
  BatchGenerationConfig,
  BatchGenerationResult,
  ImageGenerationRequest,
  GeneratedImage,
  ScriptifyExport,
  WorkspaceType,
} from '../../types/index.js';

/**
 * 批量生成选项
 */
export interface BatchGenerationOptions {
  storyboard: Storyboard;
  scriptifyData: ScriptifyExport;
  projectDir: string;
  config: BatchGenerationConfig;
  outputDir?: string;
}

/**
 * 批量生成调度器
 */
export class BatchGenerator {
  private readonly apiManager: APIManager;
  private readonly consistencyTracker: ConsistencyTracker;
  private readonly promptBuilder: PromptBuilder;
  private readonly projectDir: string;
  private readonly outputDir: string;

  constructor(
    apiManager: APIManager,
    consistencyTracker: ConsistencyTracker,
    projectDir: string,
    outputDir?: string
  ) {
    this.apiManager = apiManager;
    this.consistencyTracker = consistencyTracker;
    this.promptBuilder = new PromptBuilder();
    this.projectDir = projectDir;
    this.outputDir = outputDir || path.join(projectDir, 'output', 'images');
  }

  /**
   * 批量生成所有镜头的图片
   */
  async generateAll(options: BatchGenerationOptions): Promise<BatchGenerationResult> {
    const startTime = Date.now();
    const spinner = ora('初始化批量生成任务...').start();

    try {
      // 1. 准备输出目录
      await fs.ensureDir(this.outputDir);
      spinner.succeed('输出目录准备完成');

      // 2. 初始化一致性追踪器
      spinner.start('初始化一致性追踪系统...');
      await this.consistencyTracker.initialize();
      await this.consistencyTracker.initializeCharacters(options.scriptifyData.characters);
      await this.consistencyTracker.initializeScenes(options.scriptifyData.scenes);
      spinner.succeed('一致性追踪系统初始化完成');

      // 3. 收集所有镜头
      const allShots = this.collectAllShots(options.storyboard);
      const totalShots = allShots.length;
      spinner.info(`共找到 ${totalShots} 个镜头需要生成`);

      // 4. 批量生成
      spinner.start(`开始生成图片 (0/${totalShots})...`);
      const result = await this.generateBatch(
        allShots,
        options.storyboard.metadata.workspace,
        options.scriptifyData,
        options.config,
        spinner
      );

      const totalTime = Date.now() - startTime;
      result.total_time = totalTime;

      // 5. 保存生成报告
      await this.saveGenerationReport(result);

      spinner.succeed(
        chalk.green(
          `批量生成完成! 成功: ${result.successful}/${totalShots}, 失败: ${result.failed}, 耗时: ${(totalTime / 1000).toFixed(1)}s, 总成本: ¥${result.total_cost.toFixed(2)}`
        )
      );

      return result;
    } catch (error) {
      spinner.fail('批量生成失败');
      throw error;
    }
  }

  /**
   * 批量生成逻辑
   */
  private async generateBatch(
    shots: Array<{ shot: Shot; scene: Scene; sceneIndex: number; shotIndex: number }>,
    workspace: WorkspaceType,
    scriptifyData: ScriptifyExport,
    config: BatchGenerationConfig,
    spinner: Ora
  ): Promise<BatchGenerationResult> {
    const result: BatchGenerationResult = {
      total_shots: shots.length,
      total_images: 0,
      successful: 0,
      failed: 0,
      total_cost: 0,
      total_time: 0,
      images: {},
      consistency: {
        character: 0,
        scene: 0,
      },
    };

    // 按镜头顺序生成
    for (let i = 0; i < shots.length; i++) {
      const { shot, scene, sceneIndex, shotIndex } = shots[i];
      const shotKey = `scene_${sceneIndex + 1}_shot_${shotIndex + 1}`;

      spinner.text = `生成镜头 ${i + 1}/${shots.length}: ${shotKey}`;

      try {
        // 生成该镜头的图片
        const images = await this.generateSingleShot(
          shot,
          scene,
          scriptifyData.characters,
          workspace,
          config
        );

        result.images[shotKey] = images;
        result.total_images += images.length;
        result.successful++;

        // 累计成本
        images.forEach((img) => {
          if (img.metadata.cost) {
            result.total_cost += img.metadata.cost;
          }
        });

        // 更新进度
        spinner.text = chalk.green(
          `✓ ${shotKey} 完成 (${i + 1}/${shots.length}) - ¥${result.total_cost.toFixed(2)}`
        );
      } catch (error) {
        result.failed++;
        spinner.warn(
          chalk.yellow(
            `✗ ${shotKey} 生成失败: ${error instanceof Error ? error.message : String(error)}`
          )
        );

        // 如果配置为失败不重试,继续下一个
        if (!config.retry_on_failure) {
          continue;
        }
      }
    }

    return result;
  }

  /**
   * 生成单个镜头的图片
   */
  private async generateSingleShot(
    shot: Shot,
    scene: Scene,
    characters: Character[],
    workspace: WorkspaceType,
    config: BatchGenerationConfig
  ): Promise<GeneratedImage[]> {
    // 1. 识别镜头中的角色
    const shotCharacters = this.identifyCharacters(shot, characters);

    // 2. 获取参考
    const characterRefs = new Map(
      shotCharacters
        .map((char) => {
          const ref = this.consistencyTracker.getCharacterReference(char.id);
          return ref ? ([char.id, ref] as [string, CharacterReference]) : null;
        })
        .filter((entry): entry is [string, CharacterReference] => entry !== null)
    );
    const sceneRef = this.consistencyTracker.getSceneReference(scene.id);

    // 3. 构建提示词
    const prompt = this.promptBuilder.buildForShot(
      shot,
      scene,
      shotCharacters,
      {
        workspace,
        includeNegativePrompt: true,
        useCharacterReference: true,
        useSceneReference: true,
        enhanceQuality: config.quality === 'ultra',
      },
      characterRefs,
      sceneRef
    );

    // 4. 生成多个变体
    const images: GeneratedImage[] = [];
    for (let i = 0; i < config.variants_per_shot; i++) {
      const request: ImageGenerationRequest = {
        prompt: prompt.positive,
        negative_prompt: prompt.negative,
        provider: config.provider,
        quality: config.quality,
        num_images: 1,
      };

      const response = await this.apiManager.generateImage(request);

      // 转换为 GeneratedImage
      const generatedImage: GeneratedImage = {
        url: response.images[0].url,
        seed: response.images[0].seed,
        prompt: prompt.positive,
        metadata: {
          shot_id: `shot_${shot.shot_number}`,
          scene_id: scene.id,
          character_id: shotCharacters[0]?.id,
          generated_at: new Date().toISOString(),
          cost: response.usage.cost_cny,
          generation_time: response.usage.generation_time,
        },
      };

      images.push(generatedImage);

      // 5. 保存提示词 (如果配置)
      if (config.save_prompts) {
        await this.savePrompt(shot.shot_number, scene.id, prompt);
      }
    }

    return images;
  }

  /**
   * 识别镜头中的角色
   */
  private identifyCharacters(shot: Shot, allCharacters: Character[]): Character[] {
    // 简单实现: 从对话中识别角色
    const characterNames = new Set<string>();

    // 从对话中提取角色名
    if (shot.effects?.dialogue) {
      shot.effects.dialogue.forEach((d) => {
        characterNames.add(d.character_name);
      });
    }

    // 从画面内容中提取角色名 (简单文本匹配)
    allCharacters.forEach((char) => {
      if (shot.content.includes(char.name)) {
        characterNames.add(char.name);
      }
    });

    // 根据名字找到角色对象
    return allCharacters.filter((char) => characterNames.has(char.name));
  }

  /**
   * 收集所有镜头
   */
  private collectAllShots(
    storyboard: Storyboard
  ): Array<{ shot: Shot; scene: Scene; sceneIndex: number; shotIndex: number }> {
    const result: Array<{
      shot: Shot;
      scene: Scene;
      sceneIndex: number;
      shotIndex: number;
    }> = [];

    storyboard.scenes.forEach((storyboardScene, sceneIndex) => {
      // 从 scriptify 数据中找到对应的 Scene
      // 这里简化处理,实际应该从 scriptifyData.scenes 查找
      const scene: Scene = {
        id: storyboardScene.scene_id,
        name: storyboardScene.scene_name,
        location: '默认位置',
        time: '白天',
      };

      storyboardScene.shots.forEach((shot, shotIndex) => {
        result.push({ shot, scene, sceneIndex, shotIndex });
      });
    });

    return result;
  }

  /**
   * 保存提示词
   */
  private async savePrompt(
    shotNumber: number,
    sceneId: string,
    prompt: { positive: string; negative: string }
  ): Promise<void> {
    const promptDir = path.join(this.projectDir, 'output', 'prompts');
    await fs.ensureDir(promptDir);

    const filename = `${sceneId}_shot_${shotNumber}.json`;
    await fs.writeJSON(path.join(promptDir, filename), prompt, { spaces: 2 });
  }

  /**
   * 保存生成报告
   */
  private async saveGenerationReport(result: BatchGenerationResult): Promise<void> {
    const reportPath = path.join(this.projectDir, 'output', 'generation_report.json');
    await fs.writeJSON(reportPath, result, { spaces: 2 });

    // 同时保存人类可读的文本报告
    const textReport = this.generateTextReport(result);
    await fs.writeFile(path.join(this.projectDir, 'output', 'generation_report.txt'), textReport);
  }

  /**
   * 生成文本报告
   */
  private generateTextReport(result: BatchGenerationResult): string {
    const lines: string[] = [];

    lines.push('='.repeat(60));
    lines.push('批量图片生成报告');
    lines.push('='.repeat(60));
    lines.push('');

    lines.push('总览:');
    lines.push(`  总镜头数: ${result.total_shots}`);
    lines.push(`  成功: ${result.successful}`);
    lines.push(`  失败: ${result.failed}`);
    lines.push(`  总图片数: ${result.total_images}`);
    lines.push(`  总成本: ¥${result.total_cost.toFixed(2)}`);
    lines.push(`  总耗时: ${(result.total_time / 1000).toFixed(1)}秒`);
    lines.push('');

    lines.push('平均指标:');
    if (result.successful > 0) {
      lines.push(`  平均每镜头成本: ¥${(result.total_cost / result.successful).toFixed(2)}`);
      lines.push(
        `  平均每镜头耗时: ${(result.total_time / result.successful / 1000).toFixed(1)}秒`
      );
    }
    lines.push('');

    lines.push('一致性评分:');
    lines.push(`  角色一致性: ${(result.consistency.character * 100).toFixed(1)}%`);
    lines.push(`  场景一致性: ${(result.consistency.scene * 100).toFixed(1)}%`);
    lines.push('');

    lines.push('成本统计:');
    const costStats = this.apiManager.getCostStats();
    lines.push(`  今日已用: ¥${costStats.dailyCost.toFixed(2)}`);
    lines.push(`  每日预算: ¥${costStats.maxDailyCost.toFixed(2)}`);
    lines.push(`  剩余预算: ¥${costStats.remainingBudget.toFixed(2)}`);
    lines.push(`  使用率: ${(costStats.utilizationRate * 100).toFixed(1)}%`);
    lines.push('');

    lines.push('='.repeat(60));

    return lines.join('\n');
  }

  /**
   * 获取 API 管理器
   */
  getAPIManager(): APIManager {
    return this.apiManager;
  }
}
