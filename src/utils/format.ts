/**
 * 格式化和字符串处理工具函数
 */

import type { Shot, Storyboard } from '../types/index.js';

/**
 * 格式化时间轴字符串 (MM:SS)
 */
export function formatTimeline(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 格式化时间轴范围 (MM:SS - MM:SS)
 */
export function formatTimelineRange(startSeconds: number, endSeconds: number): string {
  return `${formatTimeline(startSeconds)} - ${formatTimeline(endSeconds)}`;
}

/**
 * 格式化帧数范围 (第X-Y帧)
 */
export function formatFrameRange(startFrame: number, endFrame: number): string {
  return `第${startFrame}-${endFrame}帧`;
}

/**
 * 计算镜头时长的累计时间轴
 */
export function calculateCumulativeTimelines(shots: Shot[]): string[] {
  let cumulative = 0;
  return shots.map((shot) => {
    const duration = shot.effects?.duration || 3; // 默认3秒
    const start = cumulative;
    const end = cumulative + duration;
    cumulative = end;
    return formatTimelineRange(start, end);
  });
}

/**
 * 计算镜头的累计帧数范围 (假设24fps)
 */
export function calculateCumulativeFrameRanges(shots: Shot[], fps = 24): string[] {
  let cumulative = 0;
  return shots.map((shot) => {
    const duration = shot.effects?.duration || 3;
    const frames = Math.floor(duration * fps);
    const start = cumulative;
    const end = cumulative + frames;
    cumulative = end;
    return formatFrameRange(start, end);
  });
}

/**
 * 生成镜头编号 (场景号-镜号)
 */
export function generateShotNumber(sceneIndex: number, shotIndex: number): string {
  return `${sceneIndex + 1}-${shotIndex + 1}`;
}

/**
 * 格式化颜色方案为hex代码
 */
export function formatColorScheme(colors: string[]): string {
  // 简单映射中文颜色到hex (实际应用中应使用更完整的映射表)
  const colorMap: Record<string, string> = {
    暗蓝: '#1a1a2e',
    灰黑: '#2d2d2d',
    深红: '#8b0000',
    金黄: '#ffd700',
    纯白: '#ffffff',
    纯黑: '#000000',
    橙色: '#ff8c00',
    紫色: '#9370db',
    绿色: '#228b22',
    青色: '#00ced1',
  };

  return colors
    .map((color) => {
      // 如果已经是hex格式，直接返回
      if (color.startsWith('#')) {
        return color;
      }
      // 否则查找映射
      return colorMap[color] || color;
    })
    .join(', ');
}

/**
 * 估算漫画页数
 * @param totalShots 总镜头数
 * @param shotsPerPage 每页镜头数 (默认3-4)
 */
export function estimatePageCount(totalShots: number, _shotsPerPage = 3.5): string {
  const min = Math.ceil(totalShots / 4);
  const max = Math.ceil(totalShots / 3);
  return `${min}-${max} 页`;
}

/**
 * 格式化Storyboard为Markdown表格
 */
export function formatStoryboardAsMarkdown(storyboard: Storyboard): string {
  const lines: string[] = [];

  // 标题
  lines.push(`# ${storyboard.metadata.title} 分镜脚本`);
  lines.push('');
  lines.push(`- 工作区: ${storyboard.metadata.workspace_display_name}`);
  lines.push(`- 模式: ${storyboard.metadata.generation_mode}`);
  lines.push(`- 总镜头数: ${storyboard.metadata.total_shots}`);
  if (storyboard.metadata.estimated_duration) {
    lines.push(`- 预估时长: ${storyboard.metadata.estimated_duration}`);
  }
  if (storyboard.metadata.estimated_pages) {
    lines.push(`- 预估页数: ${storyboard.metadata.estimated_pages}`);
  }
  lines.push('');

  // 每个场景
  storyboard.scenes.forEach((scene, sceneIndex) => {
    lines.push(`## 场景 ${sceneIndex + 1}: ${scene.scene_name}`);
    lines.push('');
    lines.push('| 镜号 | 景别 | 角度 | 画面内容 | 运镜 | 时长 | 备注 |');
    lines.push('|------|------|------|----------|------|------|------|');

    scene.shots.forEach((shot, shotIndex) => {
      const shotNum = generateShotNumber(sceneIndex, shotIndex);
      const movement = shot.camera_movement?.type || '静止';
      const duration = shot.effects?.duration || '-';
      const notes = shot.effects?.dialogue?.[0]?.text || '';

      lines.push(
        `| ${shotNum} | ${shot.shot_type} | ${shot.camera_angle} | ${shot.content} | ${movement} | ${duration}s | ${notes} |`
      );
    });

    lines.push('');
  });

  return lines.join('\n');
}

/**
 * 截断长文本并添加省略号
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * 将对象转换为格式化的YAML风格字符串 (简化版)
 */
export function toYAMLString(obj: Record<string, unknown>, indent = 0): string {
  const spaces = '  '.repeat(indent);
  const lines: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      continue;
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
      lines.push(`${spaces}${key}:`);
      lines.push(toYAMLString(value as Record<string, unknown>, indent + 1));
    } else if (Array.isArray(value)) {
      lines.push(`${spaces}${key}:`);
      value.forEach((item) => {
        if (typeof item === 'object') {
          lines.push(`${spaces}  -`);
          lines.push(toYAMLString(item as Record<string, unknown>, indent + 2));
        } else {
          lines.push(`${spaces}  - ${item}`);
        }
      });
    } else {
      const valueStr =
        typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
          ? String(value)
          : JSON.stringify(value);
      lines.push(`${spaces}${key}: ${valueStr}`);
    }
  }

  return lines.join('\n');
}

/**
 * 生成唯一ID
 */
export function generateId(prefix: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
