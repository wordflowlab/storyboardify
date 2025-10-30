/**
 * 工作区配置定义
 */

import type { WorkspaceConfig, ShotType } from '../types/index.js';

/**
 * 漫画工作区配置
 */
export const MANGA_WORKSPACE: WorkspaceConfig = {
  name: 'manga',
  display_name: '📱 漫画工作区 (快看/腾讯动漫)',
  aspect_ratio: '4:3',
  additional_fields: ['page_break', 'bubble_position', 'panel_layout'],
  export_formats: ['markdown', 'pdf', 'excel', 'psd-template'],
  ai_suggestions: {
    optimal_shot_distribution: {
      远景: 10,
      全景: 15,
      中景: 30,
      近景: 25,
      特写: 15,
      大特写: 5,
    },
    shots_per_page: 3.5,
  },
};

/**
 * 短视频工作区配置
 */
export const SHORT_VIDEO_WORKSPACE: WorkspaceConfig = {
  name: 'short-video',
  display_name: '📹 短视频工作区 (抖音/快手)',
  aspect_ratio: '9:16',
  additional_fields: ['timeline', 'subtitle', 'voiceover'],
  export_formats: ['markdown', 'pdf', 'jianying-json', 'pr-xml'],
  ai_suggestions: {
    optimal_shot_distribution: {
      远景: 5,
      全景: 10,
      中景: 40,
      近景: 30,
      特写: 13,
      大特写: 2,
    },
    average_shot_duration: 3,
  },
};

/**
 * 动态漫工作区配置
 */
export const DYNAMIC_MANGA_WORKSPACE: WorkspaceConfig = {
  name: 'dynamic-manga',
  display_name: '🎬 动态漫工作区 (AE/剪映)',
  aspect_ratio: '16:9',
  additional_fields: ['frame_range', 'layer_structure', 'camera_3d', 'vfx'],
  export_formats: ['markdown', 'pdf', 'ae-jsx', 'pr-xml', 'jianying-json'],
  ai_suggestions: {
    optimal_shot_distribution: {
      远景: 8,
      全景: 15,
      中景: 35,
      近景: 25,
      特写: 12,
      大特写: 5,
    },
    average_shot_duration: 4,
  },
};

/**
 * 所有工作区配置
 */
export const WORKSPACE_CONFIGS: Record<string, WorkspaceConfig> = {
  manga: MANGA_WORKSPACE,
  'short-video': SHORT_VIDEO_WORKSPACE,
  'dynamic-manga': DYNAMIC_MANGA_WORKSPACE,
};

/**
 * 获取工作区配置
 */
export function getWorkspaceConfig(workspace: string): WorkspaceConfig | undefined {
  return WORKSPACE_CONFIGS[workspace];
}

/**
 * 检查导出格式是否与工作区兼容
 */
export function isExportFormatCompatible(workspace: string, format: string): boolean {
  const config = getWorkspaceConfig(workspace);
  if (!config) return false;
  return config.export_formats.includes(format as never);
}

/**
 * 获取工作区的最佳镜头类型分布建议
 */
export function getShotDistributionSuggestion(
  workspace: string,
  totalShots: number
): Record<ShotType, number> {
  const config = getWorkspaceConfig(workspace);
  if (!config) {
    throw new Error(`Unknown workspace: ${workspace}`);
  }

  const distribution: Record<ShotType, number> = {} as Record<ShotType, number>;
  const percentages = config.ai_suggestions.optimal_shot_distribution;

  for (const [shotType, percentage] of Object.entries(percentages)) {
    const count = Math.round((totalShots * percentage) / 100);
    distribution[shotType as ShotType] = count;
  }

  return distribution;
}

/**
 * 验证工作区字段配置
 */
export function validateWorkspaceFields(
  workspace: string,
  fields: string[]
): { valid: boolean; missing: string[] } {
  const config = getWorkspaceConfig(workspace);
  if (!config) {
    return { valid: false, missing: [] };
  }

  const missing = config.additional_fields.filter((field) => !fields.includes(field));
  return {
    valid: missing.length === 0,
    missing,
  };
}
