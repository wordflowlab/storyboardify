/**
 * 场景设定表生成器
 * 将 Scriptify 导入的基础场景信息扩展为详细的场景设定表
 */

import type { Scene, SceneSheet, ColorPalette, LightingSetup } from '../types/index.js';

/**
 * 生成详细的场景设定表
 * 根据基础场景信息生成完整的设定表,包括色彩、光照和绘图Prompt
 */
export function generateSceneSheet(scene: Scene): SceneSheet {
  const sheet: SceneSheet = {
    id: scene.id,
    scene_id: scene.id, // 添加scene_id字段
    name: scene.name,
    location: scene.location,
    time: scene.time,
    weather: scene.weather,
    atmosphere: scene.atmosphere || generateAtmosphereFromContext(scene),
    color_palette: generateColorPalette(scene),
    lighting: generateLightingSetup(scene),
    layout_description: generateLayoutDescription(scene),
    drawing_prompt: scene.drawing_prompt || generateSceneDrawingPrompt(scene),
    source: scene.drawing_prompt ? 'scriptify' : 'storyboardify_generated',
  };

  return sheet;
}

/**
 * 从上下文推断氛围
 */
function generateAtmosphereFromContext(scene: Scene): string {
  const { time, weather, location } = scene;
  const atmospheres: string[] = [];

  // 根据时间推断
  if (time.includes('夜晚') || time.includes('深夜')) {
    atmospheres.push('神秘', '静谧');
    if (weather === '下雨') {
      atmospheres.push('阴郁', '压抑');
    }
  } else if (time.includes('清晨') || time.includes('黎明')) {
    atmospheres.push('清新', '希望');
  } else if (time.includes('黄昏') || time.includes('傍晚')) {
    atmospheres.push('温暖', '浪漫');
  } else if (time.includes('白天') || time.includes('中午')) {
    atmospheres.push('明亮', '活力');
  }

  // 根据天气推断
  if (weather === '下雨') {
    atmospheres.push('忧郁');
  } else if (weather === '晴天') {
    atmospheres.push('愉悦');
  } else if (weather === '阴天') {
    atmospheres.push('沉闷');
  }

  // 根据地点推断
  if (location.includes('医院') || location.includes('诊所')) {
    atmospheres.push('冷清', '紧张');
  } else if (location.includes('咖啡') || location.includes('餐厅')) {
    atmospheres.push('温馨', '轻松');
  } else if (location.includes('街道') || location.includes('街头')) {
    atmospheres.push('繁忙', '市井');
  } else if (location.includes('警局') || location.includes('审讯')) {
    atmospheres.push('严肃', '紧张');
  }

  return atmospheres.length > 0 ? atmospheres.join('、') : '普通氛围';
}

/**
 * 生成色彩方案
 */
function generateColorPalette(scene: Scene): ColorPalette {
  // 如果已有color_scheme,使用它
  if (scene.color_scheme && scene.color_scheme.length > 0) {
    return convertColorSchemeToHex(scene.color_scheme);
  }

  // 根据时间和氛围生成色彩
  const { time, weather } = scene;
  const palette: ColorPalette = {
    primary: [],
    secondary: [],
    accent: [],
  };

  // 根据时间段
  if (time.includes('夜晚') || time.includes('深夜')) {
    palette.primary = ['#1a1a2e', '#16213e', '#0f3460']; // 深蓝、深紫
    palette.secondary = ['#2c3e50', '#34495e']; // 灰蓝
    if (weather === '下雨') {
      palette.accent = ['#00d4ff', '#4a90e2']; // 雨水反光
    } else {
      palette.accent = ['#f39c12', '#e67e22']; // 霓虹灯光
    }
  } else if (time.includes('黄昏') || time.includes('傍晚')) {
    palette.primary = ['#ff6b6b', '#ee5a6f', '#c44569']; // 暖红、粉橙
    palette.secondary = ['#f79d5c', '#feca57']; // 金黄
    palette.accent = ['#4a69bd', '#6a89cc']; // 天空蓝
  } else if (time.includes('清晨') || time.includes('黎明')) {
    palette.primary = ['#74b9ff', '#a29bfe', '#dfe6e9']; // 浅蓝、淡紫
    palette.secondary = ['#ffeaa7', '#fdcb6e']; // 晨光金
    palette.accent = ['#fab1a0', '#ff7675']; // 粉红
  } else {
    // 白天
    palette.primary = ['#74b9ff', '#ffffff', '#dfe6e9']; // 明亮蓝白
    palette.secondary = ['#55efc4', '#00b894']; // 清新绿
    palette.accent = ['#ffeaa7', '#fdcb6e']; // 阳光黄
  }

  return palette;
}

/**
 * 将色彩名称转换为Hex代码
 */
function convertColorSchemeToHex(colorScheme: string[]): ColorPalette {
  const colorMap: Record<string, string> = {
    // 基础颜色
    红色: '#e74c3c',
    蓝色: '#3498db',
    绿色: '#2ecc71',
    黄色: '#f1c40f',
    紫色: '#9b59b6',
    橙色: '#e67e22',
    粉色: '#fd79a8',
    褐色: '#795548',
    // 深色系
    暗蓝: '#0f3460',
    深蓝: '#16213e',
    暗红: '#c0392b',
    深绿: '#27ae60',
    深紫: '#6c5ce7',
    // 浅色系
    浅蓝: '#74b9ff',
    浅绿: '#a3f7bf',
    浅黄: '#ffeaa7',
    浅紫: '#a29bfe',
    // 灰色系
    灰白: '#ecf0f1',
    灰色: '#95a5a6',
    灰黑: '#2c3e50',
    黑色: '#1a1a1a',
    白色: '#ffffff',
    // 特殊
    霓虹色: '#00d4ff',
    金色: '#ffd700',
    银色: '#c0c0c0',
  };

  const hexColors = colorScheme.map((color) => colorMap[color] || '#808080');

  return {
    primary: hexColors.slice(0, 3),
    secondary: hexColors.slice(3, 5),
    accent: hexColors.slice(5, 7),
  };
}

/**
 * 生成光照设置
 */
function generateLightingSetup(scene: Scene): LightingSetup {
  const { time, weather } = scene;

  let intensity: 'low' | 'medium' | 'high' = 'medium';
  let direction = 'top';
  const lightSources: string[] = [];
  let mood = '自然';

  // 根据时间设置光源和强度
  if (time.includes('夜晚') || time.includes('深夜')) {
    intensity = 'low';
    lightSources.push('月光', '街灯', '霓虹灯');
    direction = 'side';
    mood = '神秘低调';
  } else if (time.includes('黄昏') || time.includes('傍晚')) {
    intensity = 'medium';
    lightSources.push('夕阳', '侧光');
    direction = 'side-low';
    mood = '温暖柔和';
  } else if (time.includes('清晨') || time.includes('黎明')) {
    intensity = 'medium';
    lightSources.push('晨光', '侧光');
    direction = 'side-high';
    mood = '清新明亮';
  } else {
    // 白天
    intensity = 'high';
    lightSources.push('太阳', '自然光');
    direction = 'top';
    mood = '明亮清晰';
  }

  // 天气修正
  if (weather === '下雨' || weather === '阴天') {
    intensity = intensity === 'high' ? 'medium' : 'low';
    mood = '柔和漫射';
  }

  return {
    light_source: lightSources,
    direction,
    intensity,
    mood,
  };
}

/**
 * 生成布局描述
 */
function generateLayoutDescription(scene: Scene): string {
  const { location } = scene;
  const descriptions: string[] = [];

  // 根据地点类型生成描述
  if (location.includes('街道') || location.includes('街头')) {
    descriptions.push(
      '前景: 人行道和街边设施',
      '中景: 街道两侧的建筑和店铺',
      '远景: 延伸的街道和天际线'
    );
  } else if (location.includes('诊所') || location.includes('医院') || location.includes('办公室')) {
    descriptions.push(
      '前景: 办公桌或诊疗设备',
      '中景: 房间主体空间和家具',
      '背景: 墙面、窗户或书架'
    );
  } else if (location.includes('咖啡') || location.includes('餐厅') || location.includes('商店')) {
    descriptions.push(
      '前景: 桌椅或吧台',
      '中景: 用餐区域和顾客',
      '背景: 装饰墙面和窗户'
    );
  } else if (location.includes('警局') || location.includes('审讯室')) {
    descriptions.push(
      '前景: 审讯桌或办公桌',
      '中景: 简洁的房间空间',
      '背景: 单向玻璃或墙面'
    );
  } else if (location.includes('室内')) {
    descriptions.push(
      '前景: 室内家具',
      '中景: 主要活动空间',
      '背景: 墙面和装饰'
    );
  } else {
    descriptions.push(
      '前景: 地面或近处物体',
      '中景: 主要场景区域',
      '背景: 远处环境'
    );
  }

  return descriptions.join('\n');
}

/**
 * 生成场景绘图Prompt
 */
function generateSceneDrawingPrompt(scene: Scene): string {
  const { location, time, weather, atmosphere } = scene;
  const promptParts: string[] = [];

  // 基础描述
  promptParts.push(`scene of ${location}`);

  // 时间
  if (time.includes('夜晚') || time.includes('深夜')) {
    promptParts.push('night time');
  } else if (time.includes('黄昏') || time.includes('傍晚')) {
    promptParts.push('sunset', 'golden hour');
  } else if (time.includes('清晨') || time.includes('黎明')) {
    promptParts.push('early morning', 'sunrise');
  } else {
    promptParts.push('daytime', 'bright daylight');
  }

  // 天气
  if (weather === '下雨') {
    promptParts.push('rainy weather', 'wet streets', 'rain effects');
  } else if (weather === '晴天') {
    promptParts.push('clear sky', 'sunny');
  } else if (weather === '阴天') {
    promptParts.push('overcast', 'cloudy');
  }

  // 氛围
  if (atmosphere) {
    const atmosphereEng = translateAtmosphereToEnglish(atmosphere);
    promptParts.push(atmosphereEng);
  }

  // 地点特征
  if (location.includes('街道')) {
    promptParts.push('urban street view', 'city architecture');
  } else if (location.includes('室内')) {
    promptParts.push('interior scene', 'indoor environment');
  }

  // 艺术风格
  promptParts.push(
    'cinematic composition',
    'detailed environment',
    'professional matte painting',
    'concept art',
    'trending on artstation',
    '8k resolution',
    'highly detailed'
  );

  return promptParts.join(', ');
}

/**
 * 将中文氛围翻译为英文关键词
 */
function translateAtmosphereToEnglish(atmosphere: string): string {
  const translations: Record<string, string> = {
    神秘: 'mysterious',
    静谧: 'serene',
    阴郁: 'gloomy',
    压抑: 'oppressive',
    清新: 'fresh',
    希望: 'hopeful',
    温暖: 'warm',
    浪漫: 'romantic',
    明亮: 'bright',
    活力: 'energetic',
    忧郁: 'melancholic',
    愉悦: 'cheerful',
    沉闷: 'dull',
    冷清: 'desolate',
    紧张: 'tense',
    温馨: 'cozy',
    轻松: 'relaxed',
    繁忙: 'busy',
    市井: 'lively',
    严肃: 'serious',
  };

  const words = atmosphere.split(/[、，,]/);
  const translated = words.map((word) => translations[word.trim()] || word).filter(Boolean);

  return translated.join(', ');
}

/**
 * 批量生成场景设定表
 */
export function generateSceneSheets(scenes: Scene[]): SceneSheet[] {
  return scenes.map((scene) => generateSceneSheet(scene));
}

/**
 * 导出为Markdown格式
 */
export function exportSceneSheetToMarkdown(sheet: SceneSheet): string {
  const lines: string[] = [];

  lines.push(`# 场景设定表 - ${sheet.name}`);
  lines.push('');
  lines.push(`**ID**: ${sheet.id}`);
  lines.push(`**场景名称**: ${sheet.name}`);
  lines.push(`**地点**: ${sheet.location}`);
  lines.push(`**时间**: ${sheet.time}`);
  if (sheet.weather) {
    lines.push(`**天气**: ${sheet.weather}`);
  }
  lines.push(`**氛围**: ${sheet.atmosphere}`);
  lines.push('');

  lines.push('## 色彩方案');
  lines.push('');
  lines.push('### 主色调');
  sheet.color_palette.primary.forEach((color) => {
    lines.push(`- ${color}`);
  });
  lines.push('');
  lines.push('### 辅助色');
  sheet.color_palette.secondary.forEach((color) => {
    lines.push(`- ${color}`);
  });
  lines.push('');
  lines.push('### 点缀色');
  sheet.color_palette.accent.forEach((color) => {
    lines.push(`- ${color}`);
  });
  lines.push('');

  lines.push('## 光照设置');
  lines.push('');
  lines.push(`**光源**: ${sheet.lighting.light_source.join(', ')}`);
  lines.push(`**方向**: ${sheet.lighting.direction}`);
  lines.push(`**强度**: ${sheet.lighting.intensity}`);
  lines.push(`**氛围**: ${sheet.lighting.mood}`);
  lines.push('');

  lines.push('## 布局描述');
  lines.push('');
  lines.push(sheet.layout_description);
  lines.push('');

  lines.push('## 绘图Prompt');
  lines.push('```');
  lines.push(sheet.drawing_prompt);
  lines.push('```');
  lines.push('');

  lines.push(`**来源**: ${sheet.source === 'scriptify' ? 'Scriptify导入' : 'Storyboardify生成'}`);
  lines.push('');

  return lines.join('\n');
}
