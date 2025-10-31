/**
 * 人物设定表生成器
 * 将 Scriptify 导入的基础人物信息扩展为详细的人物设定表
 */

import type { Character, CharacterSheet } from '../types/index.js';

/**
 * 生成详细的人物设定表
 * 根据基础人物信息生成完整的设定表,包括绘图Prompt
 */
export function generateCharacterSheet(character: Character): CharacterSheet {
  const appearance = character.appearance || {};

  // 基础人物信息
  const sheet: CharacterSheet = {
    id: character.id,
    name: character.name,
    age: character.age,
    role: character.role,
    appearance: {
      ...appearance,
      // 扩展外观描述
      physique: generatePhysiqueDescription(character),
      facial_features: generateFacialFeatures(character),
      accessories: generateAccessories(appearance),
    },
    personality: character.personality || generatePersonalityFromRole(character.role),
    drawing_prompts: {
      full_body: generateFullBodyPrompt(character),
      close_up: generateCloseUpPrompt(character),
      side_view: generateSideViewPrompt(character),
    },
    source: character.drawing_prompt ? 'scriptify' : 'storyboardify_refined',
  };

  return sheet;
}

/**
 * 生成体型描述
 */
function generatePhysiqueDescription(character: Character): string {
  const age = character.age || 30;
  const role = character.role.toLowerCase();

  // 根据年龄和角色推断体型
  if (age < 18) {
    return '少年体型,身材纤细';
  } else if (age < 30) {
    if (role.includes('运动') || role.includes('军人') || role.includes('警察')) {
      return '健壮匀称,肌肉线条明显';
    }
    return '青年体型,身材匀称';
  } else if (age < 50) {
    if (role.includes('老板') || role.includes('领导')) {
      return '中年体型,略显发福';
    }
    return '成熟稳重的体型';
  } else {
    return '中老年体型,略显佝偻';
  }
}

/**
 * 生成面部特征描述
 */
function generateFacialFeatures(character: Character): string {
  const appearance = character.appearance;
  if (!appearance) {
    return '普通面容';
  }

  const features: string[] = [];

  // 从distinctive_features提取
  if (appearance.distinctive_features && appearance.distinctive_features.length > 0) {
    features.push(...appearance.distinctive_features);
  }

  // 如果没有特征,根据角色推断
  if (features.length === 0) {
    const role = character.role.toLowerCase();
    if (role.includes('主角') || role.includes('英雄')) {
      features.push('坚毅的眼神', '轮廓分明');
    } else if (role.includes('反派') || role.includes('坏人')) {
      features.push('阴狠的眼神', '冷峻的表情');
    } else {
      features.push('普通面容', '表情自然');
    }
  }

  return features.join(', ');
}

/**
 * 生成配饰描述
 */
function generateAccessories(appearance: Character['appearance']): string[] {
  const accessories: string[] = [];

  if (!appearance) return accessories;

  // 从clothing中提取可能的配饰
  if (appearance.clothing) {
    appearance.clothing.forEach((item) => {
      if (
        item.includes('眼镜') ||
        item.includes('项链') ||
        item.includes('手表') ||
        item.includes('帽子') ||
        item.includes('围巾')
      ) {
        accessories.push(item);
      }
    });
  }

  return accessories;
}

/**
 * 从角色推断性格
 */
function generatePersonalityFromRole(role: string): string {
  const roleLower = role.toLowerCase();

  if (roleLower.includes('主角') || roleLower.includes('英雄')) {
    return '勇敢正义,有责任心,善良坚韧';
  } else if (roleLower.includes('反派') || roleLower.includes('坏人') || roleLower.includes('villain')) {
    return '阴险狡诈,冷酷无情,野心勃勃';
  } else if (roleLower.includes('配角') || roleLower.includes('朋友')) {
    return '热情开朗,乐于助人,忠诚可靠';
  } else if (roleLower.includes('医生') || roleLower.includes('教授')) {
    return '冷静理智,知识渊博,专业严谨';
  } else if (roleLower.includes('警察') || roleLower.includes('侦探')) {
    return '观察敏锐,正义凛然,意志坚定';
  } else {
    return '性格待定,需要进一步描述';
  }
}

/**
 * 生成全身绘图Prompt (MidJourney/SD通用)
 */
function generateFullBodyPrompt(character: Character): string {
  const { name, age, role, appearance, personality } = character;
  const promptParts: string[] = [];

  // 如果已有drawing_prompt,优先使用
  if (character.drawing_prompt) {
    return character.drawing_prompt;
  }

  // 基础描述
  promptParts.push(`full body portrait of ${name}`);

  // 年龄和性别
  if (age) {
    if (age < 18) {
      promptParts.push('young teenager');
    } else if (age < 30) {
      promptParts.push('young adult');
    } else if (age < 50) {
      promptParts.push('middle-aged person');
    } else {
      promptParts.push('elderly person');
    }
  }

  // 外观细节
  if (appearance) {
    // 发型
    if (appearance.hair && appearance.hair.length > 0) {
      promptParts.push(appearance.hair.join(' '));
    }

    // 服装
    if (appearance.clothing && appearance.clothing.length > 0) {
      promptParts.push(`wearing ${appearance.clothing.join(', ')}`);
    }

    // 身高
    if (appearance.height) {
      if (appearance.height.includes('180') || appearance.height.includes('190')) {
        promptParts.push('tall stature');
      }
    }
  }

  // 角色特征
  promptParts.push(`character role: ${role}`);

  // 性格影响的气质
  if (personality) {
    if (personality.includes('冷静') || personality.includes('理性')) {
      promptParts.push('calm and composed expression');
    }
    if (personality.includes('勇敢') || personality.includes('正义')) {
      promptParts.push('heroic pose');
    }
  }

  // 艺术风格
  promptParts.push(
    'highly detailed',
    'professional character design',
    'concept art',
    'trending on artstation',
    'cinematic lighting'
  );

  return promptParts.join(', ');
}

/**
 * 生成特写绘图Prompt
 */
function generateCloseUpPrompt(character: Character): string {
  const { name, appearance } = character;
  const promptParts: string[] = [];

  promptParts.push(`close-up portrait of ${name}`);

  // 面部特征
  if (appearance?.distinctive_features && appearance.distinctive_features.length > 0) {
    promptParts.push(appearance.distinctive_features.join(', '));
  }

  // 发型
  if (appearance?.hair && appearance.hair.length > 0) {
    promptParts.push(appearance.hair.join(' '));
  }

  // 特写专用描述
  promptParts.push(
    'detailed facial features',
    'emotional expression',
    'professional photography',
    'shallow depth of field',
    'cinematic lighting',
    '8k uhd',
    'highly detailed'
  );

  return promptParts.join(', ');
}

/**
 * 生成侧面绘图Prompt
 */
function generateSideViewPrompt(character: Character): string {
  const { name, appearance } = character;
  const promptParts: string[] = [];

  promptParts.push(`side profile view of ${name}`);

  // 发型(侧面视角重要)
  if (appearance?.hair && appearance.hair.length > 0) {
    promptParts.push(appearance.hair.join(' '));
  }

  // 服装轮廓
  if (appearance?.clothing && appearance.clothing.length > 0) {
    promptParts.push(`wearing ${appearance.clothing[0]}`);
  }

  // 侧面视角专用描述
  promptParts.push(
    'side view',
    'profile shot',
    'character turnaround',
    'clean background',
    'professional character sheet',
    'concept art',
    'highly detailed'
  );

  return promptParts.join(', ');
}

/**
 * 批量生成人物设定表
 */
export function generateCharacterSheets(characters: Character[]): CharacterSheet[] {
  return characters.map((char) => generateCharacterSheet(char));
}

/**
 * 导出为Markdown格式
 */
export function exportCharacterSheetToMarkdown(sheet: CharacterSheet): string {
  const lines: string[] = [];

  lines.push(`# 人物设定表 - ${sheet.name}`);
  lines.push('');
  lines.push(`**ID**: ${sheet.id}`);
  lines.push(`**姓名**: ${sheet.name}`);
  if (sheet.age) {
    lines.push(`**年龄**: ${sheet.age}`);
  }
  lines.push(`**角色**: ${sheet.role}`);
  lines.push('');

  lines.push('## 外观描述');
  lines.push('');
  if (sheet.appearance.physique) {
    lines.push(`**体型**: ${sheet.appearance.physique}`);
  }
  if (sheet.appearance.height) {
    lines.push(`**身高**: ${sheet.appearance.height}`);
  }
  if (sheet.appearance.hair && sheet.appearance.hair.length > 0) {
    lines.push(`**发型**: ${sheet.appearance.hair.join(', ')}`);
  }
  if (sheet.appearance.facial_features) {
    lines.push(`**面部特征**: ${sheet.appearance.facial_features}`);
  }
  if (sheet.appearance.clothing && sheet.appearance.clothing.length > 0) {
    lines.push(`**服装**: ${sheet.appearance.clothing.join(', ')}`);
  }
  if (sheet.appearance.distinctive_features && sheet.appearance.distinctive_features.length > 0) {
    lines.push(`**显著特征**: ${sheet.appearance.distinctive_features.join(', ')}`);
  }
  if (sheet.appearance.accessories && sheet.appearance.accessories.length > 0) {
    lines.push(`**配饰**: ${sheet.appearance.accessories.join(', ')}`);
  }
  lines.push('');

  lines.push('## 性格');
  lines.push('');
  lines.push(sheet.personality);
  lines.push('');

  lines.push('## 绘图Prompt');
  lines.push('');
  lines.push('### 全身视图');
  lines.push('```');
  lines.push(sheet.drawing_prompts.full_body);
  lines.push('```');
  lines.push('');
  lines.push('### 特写视图');
  lines.push('```');
  lines.push(sheet.drawing_prompts.close_up);
  lines.push('```');
  lines.push('');
  lines.push('### 侧面视图');
  lines.push('```');
  lines.push(sheet.drawing_prompts.side_view);
  lines.push('```');
  lines.push('');

  lines.push(`**来源**: ${sheet.source === 'scriptify' ? 'Scriptify导入' : 'Storyboardify生成'}`);
  lines.push('');

  return lines.join('\n');
}
