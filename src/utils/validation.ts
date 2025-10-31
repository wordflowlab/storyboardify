/**
 * 数据验证工具函数
 */

import type {
  ScriptifyExport,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  Character,
  Scene,
  Storyboard,
} from '../types/index.js';

/**
 * 验证Scriptify JSON导入数据
 */
export function validateScriptifyExport(data: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // 类型检查
  if (!data || typeof data !== 'object') {
    errors.push({
      field: 'root',
      message: 'Invalid JSON format',
      severity: 'error',
    });
    return { valid: false, errors, warnings };
  }

  const scriptify = data as Partial<ScriptifyExport>;

  // 验证meta字段
  if (!scriptify.meta) {
    errors.push({
      field: 'meta',
      message: 'Missing required field: meta',
      severity: 'error',
    });
  } else {
    if (!scriptify.meta.version) {
      errors.push({
        field: 'meta.version',
        message: 'Missing required field: meta.version',
        severity: 'error',
      });
    } else if (scriptify.meta.version !== '1.0') {
      warnings.push({
        field: 'meta.version',
        message: `Scriptify version ${scriptify.meta.version} detected. Storyboardify supports v1.0. Some features may not import correctly.`,
        severity: 'warning',
      });
    }

    if (scriptify.meta.type !== 'scriptify_export') {
      const typeValue = String(scriptify.meta.type ?? 'unknown');
      errors.push({
        field: 'meta.type',
        message: `Invalid meta.type: expected "scriptify_export", got "${typeValue}"`,
        severity: 'error',
      });
    }
  }

  // 验证project字段
  if (!scriptify.project) {
    errors.push({
      field: 'project',
      message: 'Missing required field: project',
      severity: 'error',
    });
  } else {
    if (!scriptify.project.name) {
      errors.push({
        field: 'project.name',
        message: 'Missing required field: project.name',
        severity: 'error',
      });
    }
  }

  // 验证characters数组
  if (!scriptify.characters || !Array.isArray(scriptify.characters)) {
    warnings.push({
      field: 'characters',
      message: 'No characters found in import',
      severity: 'warning',
    });
  } else {
    scriptify.characters.forEach((char, index) => {
      if (!char.id) {
        errors.push({
          field: `characters[${index}].id`,
          message: 'Character missing required field: id',
          severity: 'error',
        });
      }
      if (!char.name) {
        errors.push({
          field: `characters[${index}].name`,
          message: 'Character missing required field: name',
          severity: 'error',
        });
      }
    });

    // 检查ID唯一性
    const charIds = scriptify.characters.map((c) => c.id).filter(Boolean);
    const duplicates = charIds.filter((id, i) => charIds.indexOf(id) !== i);
    if (duplicates.length > 0) {
      errors.push({
        field: 'characters',
        message: `Duplicate character IDs found: ${duplicates.join(', ')}`,
        severity: 'error',
      });
    }
  }

  // 验证scenes数组
  if (!scriptify.scenes || !Array.isArray(scriptify.scenes)) {
    warnings.push({
      field: 'scenes',
      message: 'No scenes found in import',
      severity: 'warning',
    });
  } else {
    scriptify.scenes.forEach((scene, index) => {
      if (!scene.id) {
        errors.push({
          field: `scenes[${index}].id`,
          message: 'Scene missing required field: id',
          severity: 'error',
        });
      }
      if (!scene.name) {
        errors.push({
          field: `scenes[${index}].name`,
          message: 'Scene missing required field: name',
          severity: 'error',
        });
      }
    });

    // 检查ID唯一性
    const sceneIds = scriptify.scenes.map((s) => s.id).filter(Boolean);
    const duplicates = sceneIds.filter((id, i) => sceneIds.indexOf(id) !== i);
    if (duplicates.length > 0) {
      errors.push({
        field: 'scenes',
        message: `Duplicate scene IDs found: ${duplicates.join(', ')}`,
        severity: 'error',
      });
    }
  }

  // 验证scripts数组
  if (!scriptify.scripts || !Array.isArray(scriptify.scripts)) {
    errors.push({
      field: 'scripts',
      message: 'Missing required field: scripts',
      severity: 'error',
    });
  } else if (scriptify.scripts.length === 0) {
    warnings.push({
      field: 'scripts',
      message: 'No script content found',
      severity: 'warning',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 验证Character数据完整性
 */
export function validateCharacter(character: Character): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!character.id) {
    errors.push({
      field: 'id',
      message: 'Character ID is required',
      severity: 'error',
    });
  }

  if (!character.name) {
    errors.push({
      field: 'name',
      message: 'Character name is required',
      severity: 'error',
    });
  }

  if (!character.appearance || Object.keys(character.appearance).length === 0) {
    warnings.push({
      field: 'appearance',
      message: 'Character appearance is incomplete. AI will generate missing details.',
      severity: 'warning',
    });
  }

  if (!character.drawing_prompt) {
    warnings.push({
      field: 'drawing_prompt',
      message: 'Drawing prompt missing. Will be auto-generated.',
      severity: 'warning',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 验证Scene数据完整性
 */
export function validateScene(scene: Scene): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!scene.id) {
    errors.push({
      field: 'id',
      message: 'Scene ID is required',
      severity: 'error',
    });
  }

  if (!scene.name) {
    errors.push({
      field: 'name',
      message: 'Scene name is required',
      severity: 'error',
    });
  }

  if (!scene.location) {
    errors.push({
      field: 'location',
      message: 'Scene location is required',
      severity: 'error',
    });
  }

  if (!scene.atmosphere) {
    warnings.push({
      field: 'atmosphere',
      message: 'Scene atmosphere missing. Recommended for better storyboard generation.',
      severity: 'warning',
    });
  }

  if (!scene.color_scheme || scene.color_scheme.length === 0) {
    warnings.push({
      field: 'color_scheme',
      message: 'Color scheme missing. Will be auto-generated from atmosphere.',
      severity: 'warning',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 验证Storyboard数据完整性
 */
export function validateStoryboard(storyboard: Storyboard): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!storyboard.metadata || !storyboard.metadata.title) {
    errors.push({
      field: 'metadata.title',
      message: 'Storyboard title is required',
      severity: 'error',
    });
  }

  if (!storyboard.metadata?.workspace) {
    errors.push({
      field: 'metadata.workspace',
      message: 'Workspace type is required',
      severity: 'error',
    });
  }

  if (!storyboard.metadata?.generation_mode) {
    errors.push({
      field: 'metadata.generation_mode',
      message: 'Generation mode is required',
      severity: 'error',
    });
  }

  if (!storyboard.scenes || storyboard.scenes.length === 0) {
    errors.push({
      field: 'scenes',
      message: 'Storyboard must contain at least one scene',
      severity: 'error',
    });
  } else {
    // 验证每个场景至少有一个镜头
    storyboard.scenes.forEach((scene, index) => {
      if (!scene.shots || scene.shots.length === 0) {
        errors.push({
          field: `scenes[${index}].shots`,
          message: `Scene "${scene.scene_name}" has no shots`,
          severity: 'error',
        });
      }

      // 验证镜头编号连续性
      scene.shots.forEach((shot, shotIndex) => {
        if (shot.shot_number !== shotIndex + 1) {
          warnings.push({
            field: `scenes[${index}].shots[${shotIndex}].shot_number`,
            message: `Shot number discontinuity: expected ${shotIndex + 1}, got ${shot.shot_number}`,
            severity: 'warning',
          });
        }
      });
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 格式化验证结果为用户友好的消息
 */
export function formatValidationResult(result: ValidationResult): string {
  const lines: string[] = [];

  if (result.valid) {
    lines.push('✓ Validation passed');
  } else {
    lines.push('✗ Validation failed');
  }

  if (result.errors.length > 0) {
    lines.push('\nErrors:');
    result.errors.forEach((error) => {
      lines.push(`  - ${error.field}: ${error.message}`);
    });
  }

  if (result.warnings.length > 0) {
    lines.push('\nWarnings:');
    result.warnings.forEach((warning) => {
      lines.push(`  - ${warning.field}: ${warning.message}`);
    });
  }

  return lines.join('\n');
}
