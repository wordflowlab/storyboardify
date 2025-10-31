/**
 * Shot Validator
 * Validates shot data and provides suggestions
 */

import type { Shot, ShotType, CameraAngle } from '../types/index.js';

export interface ShotValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

const VALID_SHOT_TYPES: ShotType[] = ['远景', '全景', '中景', '近景', '特写', '大特写'];
const VALID_CAMERA_ANGLES: CameraAngle[] = ['平视', '俯视', '仰视', '斜角', '鸟瞰', '虫视'];

/**
 * Validate a single shot
 */
export function validateShot(shot: Partial<Shot>): ShotValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // 1. Check shot_type
  if (!shot.shot_type) {
    errors.push('缺少景别(shot_type)');
  } else if (!VALID_SHOT_TYPES.includes(shot.shot_type)) {
    errors.push(`无效的景别: ${shot.shot_type}`);
  }

  // 2. Check camera_angle
  if (!shot.camera_angle) {
    errors.push('缺少角度(camera_angle)');
  } else if (!VALID_CAMERA_ANGLES.includes(shot.camera_angle)) {
    errors.push(`无效的角度: ${shot.camera_angle}`);
  }

  // 3. Check content
  if (!shot.content) {
    errors.push('缺少画面内容描述(content)');
  } else if (shot.content.trim().length < 10) {
    warnings.push('画面内容描述过短(建议至少10个字符)');
  } else if (shot.content.trim().length > 300) {
    warnings.push('画面内容描述过长(建议不超过300个字符)');
  }

  // 4. Check camera_movement duration
  if (shot.effects?.duration) {
    if (shot.effects.duration < 1) {
      warnings.push('镜头时长过短(建议至少1秒)');
    } else if (shot.effects.duration > 60) {
      warnings.push('镜头时长过长(建议不超过60秒)');
    }
  }

  // 5. Generate suggestions based on shot type and angle
  if (shot.shot_type && shot.camera_angle) {
    const suggestion = generateSuggestions(shot.shot_type, shot.camera_angle, shot.content);
    if (suggestion) {
      suggestions.push(suggestion);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}

/**
 * Generate suggestions based on shot composition
 */
function generateSuggestions(
  shotType: ShotType,
  cameraAngle: CameraAngle,
  content?: string
): string | null {
  // Check for common good combinations
  if (shotType === '全景' && cameraAngle === '俯视') {
    return '全景 + 俯视是展示空间布局的经典组合 ✓';
  }

  if (shotType === '特写' && cameraAngle === '平视') {
    return '特写 + 平视能很好地展示角色情绪 ✓';
  }

  if (shotType === '中景' && cameraAngle === '平视') {
    return '中景 + 平视是对话场景的标准配置 ✓';
  }

  // Check for unusual combinations
  if (shotType === '远景' && cameraAngle === '虫视') {
    return '远景配虫视较为罕见,确认是否需要这样的视角?';
  }

  if (shotType === '特写' && cameraAngle === '鸟瞰') {
    return '特写配鸟瞰不太常见,可能影响面部表情展示';
  }

  // Content-based suggestions
  if (content) {
    if (content.includes('对话') || content.includes('说话')) {
      if (shotType === '远景' || shotType === '全景') {
        return '对话场景建议使用中景或近景,以便展示表情';
      }
    }

    if (content.includes('动作') || content.includes('打斗') || content.includes('追逐')) {
      if (shotType === '特写' || shotType === '大特写') {
        return '动作场景建议使用全景或中景,以便展示动作全貌';
      }
    }

    if (content.includes('情绪') || content.includes('表情') || content.includes('眼神')) {
      if (shotType === '远景' || shotType === '全景') {
        return '展示情绪建议使用近景或特写,以突出表情细节';
      }
    }
  }

  return null;
}

/**
 * Validate multiple shots
 */
export function validateShots(shots: Partial<Shot>[]): ShotValidationResult[] {
  return shots.map(shot => validateShot(shot));
}

/**
 * Check shot distribution quality
 */
export function analyzeShotDistribution(shots: Partial<Shot>[]): {
  distribution: Record<string, number>;
  suggestions: string[];
} {
  const distribution: Record<string, number> = {};
  const suggestions: string[] = [];

  // Count shot types
  shots.forEach(shot => {
    if (shot.shot_type) {
      distribution[shot.shot_type] = (distribution[shot.shot_type] || 0) + 1;
    }
  });

  const total = shots.length;

  // Check for imbalances
  const closeUpCount = (distribution['特写'] || 0) + (distribution['大特写'] || 0);
  const wideCount = (distribution['远景'] || 0) + (distribution['全景'] || 0);
  const midCount = (distribution['中景'] || 0) + (distribution['近景'] || 0);

  const closeUpPercent = (closeUpCount / total) * 100;
  const widePercent = (wideCount / total) * 100;
  const midPercent = (midCount / total) * 100;

  if (closeUpPercent > 50) {
    suggestions.push('特写镜头占比过高,建议增加全景/中景以平衡视觉节奏');
  }

  if (widePercent > 50) {
    suggestions.push('远景/全景镜头占比过高,建议增加特写以强化情绪');
  }

  if (midPercent < 20 && total > 5) {
    suggestions.push('中景镜头较少,建议适当增加作为过渡');
  }

  // Check for variety
  const uniqueTypes = Object.keys(distribution).length;
  if (uniqueTypes < 3 && total > 5) {
    suggestions.push('景别变化较少,建议增加镜头多样性');
  }

  return {
    distribution,
    suggestions,
  };
}

