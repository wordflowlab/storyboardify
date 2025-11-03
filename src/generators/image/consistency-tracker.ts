/**
 * Consistency Tracker - Character and Scene Reference Management
 * 一致性追踪器 - 角色和场景参考管理
 */

import fs from 'fs-extra';
import path from 'path';
import type {
  CharacterReference,
  SceneReference,
  GeneratedImage,
  Character,
  Scene,
} from '../../types/index.js';

/**
 * 一致性追踪器 - 管理角色和场景的参考档案
 */
export class ConsistencyTracker {
  private readonly referenceDir: string;

  // 内存缓存
  private characterRefs: Map<string, CharacterReference> = new Map();
  private sceneRefs: Map<string, SceneReference> = new Map();

  constructor(projectDir: string) {
    this.referenceDir = path.join(projectDir, '.storyboardify', 'references');
  }

  /**
   * 初始化追踪器 (创建目录结构)
   */
  async initialize(): Promise<void> {
    await fs.ensureDir(path.join(this.referenceDir, 'characters'));
    await fs.ensureDir(path.join(this.referenceDir, 'scenes'));

    // 加载现有参考
    await this.loadAllReferences();
  }

  /**
   * 从角色列表初始化角色参考
   */
  async initializeCharacters(characters: Character[]): Promise<void> {
    for (const char of characters) {
      if (!this.characterRefs.has(char.id)) {
        const reference: CharacterReference = {
          character_id: char.id,
          character_name: char.name,
          core_features: this.extractCoreFeatures(char),
          reference_images: [],
          successful_seeds: [],
          style_params: {
            style_preset: 'anime', // 默认动漫风格
          },
          generation_history: [],
        };

        this.characterRefs.set(char.id, reference);
        await this.saveCharacterReference(reference);
      }
    }
  }

  /**
   * 从场景列表初始化场景参考
   */
  async initializeScenes(scenes: Scene[]): Promise<void> {
    for (const scene of scenes) {
      if (!this.sceneRefs.has(scene.id)) {
        const reference: SceneReference = {
          scene_id: scene.id,
          scene_name: scene.name,
          core_description: this.extractSceneDescription(scene),
          reference_images: [],
          successful_seeds: [],
          lighting_params: {
            time_of_day: scene.time || '白天',
            light_direction: 'natural',
            mood: scene.atmosphere || 'neutral',
          },
        };

        this.sceneRefs.set(scene.id, reference);
        await this.saveSceneReference(reference);
      }
    }
  }

  /**
   * 获取角色参考
   */
  getCharacterReference(characterId: string): CharacterReference | undefined {
    return this.characterRefs.get(characterId);
  }

  /**
   * 获取场景参考
   */
  getSceneReference(sceneId: string): SceneReference | undefined {
    return this.sceneRefs.get(sceneId);
  }

  /**
   * 记录成功的角色生成
   */
  async recordCharacterGeneration(
    characterId: string,
    image: GeneratedImage,
    qualityScore: number
  ): Promise<void> {
    const ref = this.characterRefs.get(characterId);
    if (!ref) {
      throw new Error(`Character reference not found: ${characterId}`);
    }

    // 添加到生成历史
    ref.generation_history.push({
      prompt: image.prompt,
      seed: image.seed || 0,
      image_url: image.url,
      quality_score: qualityScore,
      timestamp: new Date().toISOString(),
    });

    // 如果质量高,添加到成功种子和参考图片
    if (qualityScore >= 0.8) {
      if (image.seed && !ref.successful_seeds.includes(image.seed)) {
        ref.successful_seeds.push(image.seed);
      }

      if (image.local_path && !ref.reference_images.includes(image.local_path)) {
        ref.reference_images.push(image.local_path);
      }
    }

    // 保持历史记录在合理范围内 (最多100条)
    if (ref.generation_history.length > 100) {
      ref.generation_history = ref.generation_history.slice(-100);
    }

    // 保存更新
    await this.saveCharacterReference(ref);
  }

  /**
   * 记录成功的场景生成
   */
  async recordSceneGeneration(
    sceneId: string,
    image: GeneratedImage,
    qualityScore: number
  ): Promise<void> {
    const ref = this.sceneRefs.get(sceneId);
    if (!ref) {
      throw new Error(`Scene reference not found: ${sceneId}`);
    }

    // 如果质量高,添加到成功种子和参考图片
    if (qualityScore >= 0.8) {
      if (image.seed && !ref.successful_seeds.includes(image.seed)) {
        ref.successful_seeds.push(image.seed);
      }

      if (image.local_path && !ref.reference_images.includes(image.local_path)) {
        ref.reference_images.push(image.local_path);
      }

      // 保存更新
      await this.saveSceneReference(ref);
    }
  }

  /**
   * 获取角色的最佳种子 (基于历史质量评分)
   */
  getBestSeedsForCharacter(characterId: string, count: number = 3): number[] {
    const ref = this.characterRefs.get(characterId);
    if (!ref || ref.generation_history.length === 0) {
      return [];
    }

    // 按质量评分排序
    const sorted = [...ref.generation_history].sort((a, b) => b.quality_score - a.quality_score);

    // 返回前 N 个不重复的种子
    const seeds = new Set<number>();
    for (const entry of sorted) {
      if (seeds.size >= count) break;
      seeds.add(entry.seed);
    }

    return Array.from(seeds);
  }

  /**
   * 获取场景的最佳种子
   */
  getBestSeedsForScene(sceneId: string, count: number = 3): number[] {
    const ref = this.sceneRefs.get(sceneId);
    if (!ref) {
      return [];
    }

    return ref.successful_seeds.slice(0, count);
  }

  /**
   * 提取角色核心特征
   */
  private extractCoreFeatures(character: Character): string {
    const features: string[] = [];

    // 基础信息
    features.push(`${character.name}, ${character.age || 'unknown age'}`);
    features.push(character.role);

    // 外观特征
    if (character.appearance) {
      if (character.appearance.hair) {
        features.push(`hair: ${character.appearance.hair.join(', ')}`);
      }
      if (character.appearance.clothing) {
        features.push(`clothing: ${character.appearance.clothing.join(', ')}`);
      }
      if (character.appearance.distinctive_features) {
        features.push(`features: ${character.appearance.distinctive_features.join(', ')}`);
      }
    }

    // 性格 (可影响表情)
    if (character.personality) {
      features.push(`personality: ${character.personality}`);
    }

    return features.join('; ');
  }

  /**
   * 提取场景核心描述
   */
  private extractSceneDescription(scene: Scene): string {
    const parts: string[] = [];

    parts.push(scene.location);
    parts.push(scene.time);

    if (scene.weather) {
      parts.push(scene.weather);
    }

    if (scene.atmosphere) {
      parts.push(scene.atmosphere);
    }

    if (scene.color_scheme) {
      parts.push(`colors: ${scene.color_scheme.join(', ')}`);
    }

    return parts.join(', ');
  }

  /**
   * 加载所有参考
   */
  private async loadAllReferences(): Promise<void> {
    // 加载角色参考
    const charDir = path.join(this.referenceDir, 'characters');
    if (await fs.pathExists(charDir)) {
      const files = await fs.readdir(charDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const ref = (await fs.readJSON(path.join(charDir, file))) as CharacterReference;
          this.characterRefs.set(ref.character_id, ref);
        }
      }
    }

    // 加载场景参考
    const sceneDir = path.join(this.referenceDir, 'scenes');
    if (await fs.pathExists(sceneDir)) {
      const files = await fs.readdir(sceneDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const ref = (await fs.readJSON(path.join(sceneDir, file))) as SceneReference;
          this.sceneRefs.set(ref.scene_id, ref);
        }
      }
    }
  }

  /**
   * 保存角色参考
   */
  private async saveCharacterReference(ref: CharacterReference): Promise<void> {
    const filePath = path.join(this.referenceDir, 'characters', `${ref.character_id}.json`);
    await fs.writeJSON(filePath, ref, { spaces: 2 });
  }

  /**
   * 保存场景参考
   */
  private async saveSceneReference(ref: SceneReference): Promise<void> {
    const filePath = path.join(this.referenceDir, 'scenes', `${ref.scene_id}.json`);
    await fs.writeJSON(filePath, ref, { spaces: 2 });
  }

  /**
   * 导出统计信息
   */
  getStatistics() {
    return {
      totalCharacters: this.characterRefs.size,
      totalScenes: this.sceneRefs.size,
      charactersWithReferences: Array.from(this.characterRefs.values()).filter(
        (ref) => ref.reference_images.length > 0
      ).length,
      scenesWithReferences: Array.from(this.sceneRefs.values()).filter(
        (ref) => ref.reference_images.length > 0
      ).length,
      totalGenerations: Array.from(this.characterRefs.values()).reduce(
        (sum, ref) => sum + ref.generation_history.length,
        0
      ),
    };
  }
}
