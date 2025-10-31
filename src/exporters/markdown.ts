/**
 * Markdown 导出器
 * 将分镜脚本导出为 Markdown 格式
 */

import { BaseExporter, ExportOptions, ExportResult } from './base.js';
import type { Storyboard, ExportFormat, Shot } from '../types/index.js';
import fs from 'fs-extra';
import path from 'path';

export class MarkdownExporter extends BaseExporter {
  name = 'Markdown导出器';
  format: ExportFormat = 'markdown';
  extensions = ['.md'];

  async export(storyboard: Storyboard, options: ExportOptions): Promise<ExportResult> {
    try {
      // 验证数据
      const validation = this.validate(storyboard);
      if (!validation.valid) {
        return {
          success: false,
          message: '数据验证失败',
          errors: validation.errors.map((e) => e.message),
        };
      }

      // 生成 Markdown 内容
      const markdown = this.generateMarkdown(storyboard, options);

      // 确定输出路径
      const outputPath = options.outputPath || 'storyboard.md';
      await fs.ensureDir(path.dirname(outputPath));
      await fs.writeFile(outputPath, markdown, 'utf-8');

      return {
        success: true,
        filePath: outputPath,
        message: `成功导出到 ${outputPath}`,
      };
    } catch (error) {
      return {
        success: false,
        message: '导出失败',
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  /**
   * 生成 Markdown 内容
   */
  private generateMarkdown(storyboard: Storyboard, options: ExportOptions): string {
    const lines: string[] = [];

    // 标题
    lines.push(`# ${storyboard.metadata.title} - 分镜脚本`);
    lines.push('');

    // 元数据
    if (options.includeMetadata !== false) {
      lines.push('## 项目信息');
      lines.push('');
      lines.push(`**工作区**: ${storyboard.metadata.workspace_display_name}`);
      lines.push(`**纵横比**: ${storyboard.metadata.aspect_ratio}`);
      lines.push(`**生成模式**: ${this.getModeDisplayName(storyboard.metadata.generation_mode)}`);
      lines.push(`**总场景数**: ${storyboard.metadata.total_scenes}`);
      lines.push(`**总镜头数**: ${storyboard.metadata.total_shots}`);
      if (storyboard.metadata.estimated_duration) {
        lines.push(`**预估时长**: ${storyboard.metadata.estimated_duration}`);
      }
      if (storyboard.metadata.estimated_pages) {
        lines.push(`**预估页数**: ${storyboard.metadata.estimated_pages}`);
      }
      lines.push(`**创建时间**: ${new Date(storyboard.metadata.created_at).toLocaleString('zh-CN')}`);
      lines.push('');
    }

    // 分镜内容
    lines.push('---');
    lines.push('');

    storyboard.scenes.forEach((scene, sceneIndex) => {
      // 场景标题
      lines.push(`## 场景 ${sceneIndex + 1}: ${scene.scene_name}`);
      lines.push('');
      lines.push(`**场景ID**: ${scene.scene_id}`);
      lines.push('');

      // 镜头
      scene.shots.forEach((shot, shotIndex) => {
        lines.push(`### 镜头 ${sceneIndex + 1}.${shotIndex + 1}`);
        lines.push('');

        // 基础信息表格
        lines.push('| 属性 | 值 |');
        lines.push('|------|------|');
        lines.push(`| **镜头编号** | ${shot.shot_number} |`);
        lines.push(`| **景别** | ${shot.shot_type} |`);
        lines.push(`| **角度** | ${shot.camera_angle} |`);

        // 运镜
        if (shot.camera_movement) {
          lines.push(
            `| **运镜** | ${shot.camera_movement.type}${shot.camera_movement.speed ? ` (${shot.camera_movement.speed})` : ''} |`
          );
          if (shot.camera_movement.curve) {
            lines.push(`| **运镜曲线** | ${shot.camera_movement.curve} |`);
          }
        }

        // 时长 (短视频工作区)
        if (shot.effects?.duration) {
          lines.push(`| **时长** | ${shot.effects.duration}秒 |`);
        }

        lines.push('');

        // 画面内容
        lines.push('**画面内容**:');
        lines.push('');
        lines.push(shot.content);
        lines.push('');

        // 情绪标注
        if (shot.mood) {
          lines.push('**情绪氛围**:');
          lines.push('');
          lines.push(`- 情绪: ${shot.mood.emotion}`);
          lines.push(`- 氛围: ${shot.mood.atmosphere}`);
          lines.push(`- 节奏: ${shot.mood.rhythm}`);
          lines.push('');
        }

        // 对话
        if (shot.effects?.dialogue && shot.effects.dialogue.length > 0) {
          lines.push('**对话**:');
          lines.push('');
          shot.effects.dialogue.forEach((d) => {
            lines.push(`- **${d.character_name}**: "${d.text}"`);
          });
          lines.push('');
        }

        // 旁白
        if (shot.effects?.narration) {
          lines.push('**旁白**:');
          lines.push('');
          lines.push(`> ${shot.effects.narration}`);
          lines.push('');
        }

        // 音效
        if (shot.effects?.sound_effects && shot.effects.sound_effects.length > 0) {
          lines.push('**音效**: ' + shot.effects.sound_effects.join(', '));
          lines.push('');
        }

        // 转场
        if (shot.effects?.transition) {
          lines.push(`**转场**: ${shot.effects.transition.type}`);
          if (shot.effects.transition.duration) {
            lines.push(` (${shot.effects.transition.duration}秒)`);
          }
          lines.push('');
        }

        // 工作区特定字段
        this.addWorkspaceFields(lines, shot, storyboard.metadata.workspace);

        lines.push('---');
        lines.push('');
      });
    });

    // 页脚
    if (options.includeMetadata !== false) {
      lines.push('');
      lines.push('---');
      lines.push('');
      lines.push(`*生成时间: ${new Date(storyboard.metadata.created_at).toLocaleString('zh-CN')}*`);
      lines.push('');
      lines.push('*由 Storyboardify 生成*');
    }

    return lines.join('\n');
  }

  /**
   * 添加工作区特定字段
   */
  private addWorkspaceFields(lines: string[], shot: Shot, workspace: string): void {
    if (!shot.workspace_fields) return;

    lines.push('**工作区特定信息**:');
    lines.push('');

    if (workspace === 'manga') {
      const fields = shot.workspace_fields as any;
      if (fields.page_break !== undefined) {
        lines.push(`- 翻页: ${fields.page_break ? '是' : '否'}`);
      }
      if (fields.bubble_position) {
        lines.push(`- 气泡位置: ${fields.bubble_position}`);
      }
      if (fields.panel_layout) {
        lines.push(`- 分格布局: ${fields.panel_layout}`);
      }
    } else if (workspace === 'short-video') {
      const fields = shot.workspace_fields as any;
      if (fields.timeline) {
        lines.push(`- 时间轴: ${fields.timeline}`);
      }
      if (fields.subtitle) {
        lines.push(`- 字幕: ${fields.subtitle.text}`);
        lines.push(`  - 位置: ${fields.subtitle.position}`);
      }
    } else if (workspace === 'dynamic-manga') {
      const fields = shot.workspace_fields as any;
      if (fields.frame_range) {
        lines.push(`- 帧范围: ${fields.frame_range}`);
      }
      if (fields.layer_structure && fields.layer_structure.length > 0) {
        lines.push('- 图层结构:');
        fields.layer_structure.forEach((layer: any) => {
          lines.push(`  - ${layer.layer}: ${layer.content} (深度: ${layer.z_depth})`);
        });
      }
    }

    lines.push('');
  }

  /**
   * 获取模式显示名称
   */
  private getModeDisplayName(mode: string): string {
    const names: Record<string, string> = {
      coach: '教练模式',
      express: '快速模式',
      hybrid: '混合模式',
    };
    return names[mode] || mode;
  }
}
