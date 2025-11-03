/**
 * Prompt Builder - Intelligent Prompt Generation Engine
 * 提示词构建器 - 智能提示词生成引擎
 */

import type {
  Shot,
  Character,
  Scene,
  CharacterReference,
  SceneReference,
  WorkspaceType,
} from '../../types/index.js';

/**
 * 提示词构建选项
 */
export interface PromptBuilderOptions {
  workspace: WorkspaceType;
  includeNegativePrompt?: boolean;
  useCharacterReference?: boolean;
  useSceneReference?: boolean;
  stylePreset?: string;
  enhanceQuality?: boolean;
}

/**
 * 构建结果
 */
export interface BuiltPrompt {
  positive: string;
  negative: string;
  metadata: {
    character_ids?: string[];
    scene_id?: string;
    shot_number: number;
    workspace: WorkspaceType;
  };
}

/**
 * 提示词构建器 - 固定词序模板系统
 */
export class PromptBuilder {
  // 基础质量标签 (固定位置)
  private static readonly QUALITY_TAGS = {
    standard: 'high quality, detailed',
    high: 'masterpiece, best quality, highly detailed, sharp focus',
    ultra: 'masterpiece, best quality, ultra detailed, 8k, professional, sharp focus, vivid colors',
  } as const;

  // 工作区风格预设
  private static readonly WORKSPACE_STYLES = {
    manga: 'manga style, black and white lineart, screentone, japanese comic',
    'short-video': 'cinematic, modern, vibrant colors, social media ready',
    'dynamic-manga': 'dynamic manga, motion lines, dramatic angle, action scene',
  } as const;

  // 通用负面提示词
  private static readonly NEGATIVE_PROMPT = [
    'low quality',
    'blurry',
    'distorted',
    'deformed',
    'ugly',
    'bad anatomy',
    'bad proportions',
    'extra limbs',
    'watermark',
    'text',
    'signature',
  ].join(', ');

  /**
   * 为镜头构建提示词
   */
  buildForShot(
    shot: Shot,
    scene: Scene,
    characters: Character[],
    options: PromptBuilderOptions,
    characterRefs?: Map<string, CharacterReference>,
    sceneRef?: SceneReference
  ): BuiltPrompt {
    const parts: string[] = [];

    // 1. 质量标签 (最前面)
    const qualityLevel = options.enhanceQuality ? 'ultra' : 'high';
    parts.push(PromptBuilder.QUALITY_TAGS[qualityLevel]);

    // 2. 工作区风格
    parts.push(PromptBuilder.WORKSPACE_STYLES[options.workspace]);

    // 3. 镜头类型和角度
    parts.push(this.buildCameraPrompt(shot));

    // 4. 场景描述
    parts.push(this.buildScenePrompt(scene, sceneRef, options.useSceneReference));

    // 5. 角色描述
    if (characters.length > 0) {
      parts.push(
        this.buildCharactersPrompt(characters, characterRefs, options.useCharacterReference)
      );
    }

    // 6. 画面内容
    parts.push(shot.content);

    // 7. 情绪氛围
    if (shot.mood) {
      parts.push(this.buildMoodPrompt(shot.mood));
    }

    // 8. 特效描述
    if (shot.effects) {
      const effectsPrompt = this.buildEffectsPrompt(shot.effects);
      if (effectsPrompt) {
        parts.push(effectsPrompt);
      }
    }

    // 9. 风格预设 (如果指定)
    if (options.stylePreset) {
      parts.push(options.stylePreset);
    }

    // 构建正面提示词 (使用固定顺序和分隔符)
    const positive = parts.join(', ');

    // 构建负面提示词
    const negative = options.includeNegativePrompt
      ? this.buildNegativePrompt(options.workspace)
      : '';

    return {
      positive,
      negative,
      metadata: {
        character_ids: characters.map((c) => c.id),
        scene_id: scene.id,
        shot_number: shot.shot_number,
        workspace: options.workspace,
      },
    };
  }

  /**
   * 为角色设定表构建提示词
   */
  buildForCharacterSheet(
    character: Character,
    view: 'full_body' | 'close_up' | 'side_view',
    options: PromptBuilderOptions
  ): BuiltPrompt {
    const parts: string[] = [];

    // 质量标签
    parts.push(PromptBuilder.QUALITY_TAGS.ultra);

    // 角色设定表专用标签
    parts.push('character reference sheet, white background, multiple views');

    // 视角描述
    const viewDescriptions = {
      full_body: 'full body shot, standing pose, front view',
      close_up: 'close up portrait, facial details, front view',
      side_view: 'side view, profile shot, full body',
    };
    parts.push(viewDescriptions[view]);

    // 角色特征
    parts.push(this.buildSingleCharacterPrompt(character, undefined, true));

    // 如果有预定义的绘图提示词,使用它
    if (character.drawing_prompt) {
      parts.push(character.drawing_prompt);
    }

    const positive = parts.join(', ');
    const negative = this.buildNegativePrompt(options.workspace);

    return {
      positive,
      negative,
      metadata: {
        character_ids: [character.id],
        shot_number: 0,
        workspace: options.workspace,
      },
    };
  }

  /**
   * 为场景设定表构建提示词
   */
  buildForSceneSheet(
    scene: Scene,
    options: PromptBuilderOptions,
    sceneRef?: SceneReference
  ): BuiltPrompt {
    const parts: string[] = [];

    // 质量标签
    parts.push(PromptBuilder.QUALITY_TAGS.ultra);

    // 场景设定表专用标签
    parts.push('environment concept art, detailed background, no characters');

    // 场景描述
    parts.push(this.buildScenePrompt(scene, sceneRef, true));

    // 如果有预定义的绘图提示词,使用它
    if (scene.drawing_prompt) {
      parts.push(scene.drawing_prompt);
    }

    const positive = parts.join(', ');
    const negative = this.buildNegativePrompt(options.workspace) + ', people, characters';

    return {
      positive,
      negative,
      metadata: {
        scene_id: scene.id,
        shot_number: 0,
        workspace: options.workspace,
      },
    };
  }

  /**
   * 构建镜头提示词
   */
  private buildCameraPrompt(shot: Shot): string {
    const parts: string[] = [];

    // 景别映射
    const shotTypeMap: Record<string, string> = {
      远景: 'extreme long shot, wide angle',
      全景: 'long shot, full scene',
      中景: 'medium shot',
      近景: 'close shot',
      特写: 'close-up',
      大特写: 'extreme close-up',
    };

    // 角度映射
    const angleMap: Record<string, string> = {
      平视: 'eye level angle',
      俯视: 'high angle, looking down',
      仰视: 'low angle, looking up',
      斜角: 'dutch angle, tilted',
      鸟瞰: 'birds eye view, overhead',
      虫视: 'worms eye view, ground level',
    };

    parts.push(shotTypeMap[shot.shot_type] || shot.shot_type);
    parts.push(angleMap[shot.camera_angle] || shot.camera_angle);

    // 运镜
    if (shot.camera_movement && shot.camera_movement.type !== '静止') {
      const movementMap: Record<string, string> = {
        推: 'dolly in, zoom in',
        拉: 'dolly out, zoom out',
        摇: 'pan shot',
        移: 'tracking shot',
        跟: 'follow shot',
        升: 'crane up',
        降: 'crane down',
        环绕: 'orbit shot, rotating camera',
      };
      parts.push(movementMap[shot.camera_movement.type] || '');
    }

    return parts.filter(Boolean).join(', ');
  }

  /**
   * 构建场景提示词
   */
  private buildScenePrompt(
    scene: Scene,
    sceneRef?: SceneReference,
    useReference: boolean = false
  ): string {
    const parts: string[] = [];

    // 使用参考档案的核心描述
    if (useReference && sceneRef) {
      parts.push(sceneRef.core_description);

      // 光照参数
      if (sceneRef.lighting_params) {
        const lighting = sceneRef.lighting_params;
        parts.push(`${lighting.time_of_day}, ${lighting.light_direction} lighting`);
        if (lighting.mood) {
          parts.push(`${lighting.mood} atmosphere`);
        }
      }
    } else {
      // 基础场景描述
      parts.push(scene.location);
      parts.push(scene.time);

      if (scene.weather) {
        parts.push(scene.weather);
      }

      if (scene.atmosphere) {
        parts.push(`${scene.atmosphere} atmosphere`);
      }

      if (scene.color_scheme && scene.color_scheme.length > 0) {
        parts.push(`color palette: ${scene.color_scheme.join(', ')}`);
      }
    }

    return parts.join(', ');
  }

  /**
   * 构建角色提示词
   */
  private buildCharactersPrompt(
    characters: Character[],
    characterRefs?: Map<string, CharacterReference>,
    useReference: boolean = false
  ): string {
    return characters
      .map((char) => {
        const ref = characterRefs?.get(char.id);
        return this.buildSingleCharacterPrompt(char, ref, useReference);
      })
      .join('; ');
  }

  /**
   * 构建单个角色提示词
   */
  private buildSingleCharacterPrompt(
    character: Character,
    ref?: CharacterReference,
    useReference: boolean = false
  ): string {
    const parts: string[] = [];

    // 使用参考档案的核心特征
    if (useReference && ref) {
      parts.push(ref.core_features);
    } else {
      // 基础信息
      parts.push(character.name);

      if (character.age) {
        parts.push(`${character.age} years old`);
      }

      // 外观
      if (character.appearance) {
        const app = character.appearance;

        if (app.hair && app.hair.length > 0) {
          parts.push(app.hair.join(' '));
        }

        if (app.clothing && app.clothing.length > 0) {
          parts.push(`wearing ${app.clothing.join(', ')}`);
        }

        if (app.distinctive_features && app.distinctive_features.length > 0) {
          parts.push(app.distinctive_features.join(', '));
        }
      }
    }

    return parts.join(', ');
  }

  /**
   * 构建情绪提示词
   */
  private buildMoodPrompt(mood: Shot['mood']): string {
    if (!mood) return '';

    const parts: string[] = [];

    parts.push(`${mood.emotion} emotion`);
    parts.push(`${mood.atmosphere} atmosphere`);

    const rhythmMap: Record<string, string> = {
      慢节奏: 'slow paced, calm',
      中节奏: 'moderate pace',
      快节奏: 'fast paced, intense',
    };

    parts.push(rhythmMap[mood.rhythm] || '');

    return parts.filter(Boolean).join(', ');
  }

  /**
   * 构建特效提示词
   */
  private buildEffectsPrompt(effects: Shot['effects']): string {
    if (!effects) return '';

    const parts: string[] = [];

    if (effects.sound_effects && effects.sound_effects.length > 0) {
      // 某些音效可以转换为视觉效果
      const visualEffects = effects.sound_effects
        .filter((se) => this.canVisualizeSoundEffect(se))
        .map((se) => this.soundEffectToVisual(se));

      if (visualEffects.length > 0) {
        parts.push(visualEffects.join(', '));
      }
    }

    return parts.join(', ');
  }

  /**
   * 判断音效是否可以视觉化
   */
  private canVisualizeSoundEffect(soundEffect: string): boolean {
    const visualizable = ['爆炸', '闪电', '火焰', '水花', '烟雾', '光芒'];
    return visualizable.some((v) => soundEffect.includes(v));
  }

  /**
   * 将音效转换为视觉描述
   */
  private soundEffectToVisual(soundEffect: string): string {
    const map: Record<string, string> = {
      爆炸: 'explosion effects, debris flying',
      闪电: 'lightning effects, electric sparks',
      火焰: 'fire effects, flames',
      水花: 'water splash, splashing water',
      烟雾: 'smoke effects, fog',
      光芒: 'glowing light, radiant',
    };

    for (const [key, value] of Object.entries(map)) {
      if (soundEffect.includes(key)) {
        return value;
      }
    }

    return '';
  }

  /**
   * 构建负面提示词
   */
  private buildNegativePrompt(workspace: WorkspaceType): string {
    const base = PromptBuilder.NEGATIVE_PROMPT;

    // 工作区特定的负面提示词
    const workspaceSpecific: Record<WorkspaceType, string> = {
      manga: 'color, colored, photorealistic',
      'short-video': 'monochrome, sketch, unfinished',
      'dynamic-manga': 'static, boring composition',
    };

    return `${base}, ${workspaceSpecific[workspace]}`;
  }
}
