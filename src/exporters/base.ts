/**
 * 导出器基础接口
 */

import type { Storyboard, ExportFormat, ValidationResult } from '../types/index.js';

/**
 * 导出选项
 */
export interface ExportOptions {
  outputPath?: string;
  format?: ExportFormat;
  includeMetadata?: boolean;
  includePrompts?: boolean;
}

/**
 * 导出结果
 */
export interface ExportResult {
  success: boolean;
  filePath?: string;
  message: string;
  errors?: string[];
}

/**
 * 导出器接口
 * 所有导出器必须实现此接口
 */
export interface Exporter {
  name: string;
  format: ExportFormat;
  extensions: string[];

  /**
   * 导出分镜数据
   */
  export(storyboard: Storyboard, options: ExportOptions): Promise<ExportResult>;

  /**
   * 验证数据是否满足导出要求
   */
  validate(storyboard: Storyboard): ValidationResult;

  /**
   * 是否支持该工作区
   */
  supportsWorkspace(workspace: string): boolean;
}

/**
 * 抽象导出器基类
 */
export abstract class BaseExporter implements Exporter {
  abstract name: string;
  abstract format: ExportFormat;
  abstract extensions: string[];

  abstract export(storyboard: Storyboard, options: ExportOptions): Promise<ExportResult>;

  /**
   * 默认验证实现
   */
  validate(storyboard: Storyboard): ValidationResult {
    const errors: Array<{ field: string; message: string; severity: 'error' }> = [];
    const warnings: Array<{ field: string; message: string; severity: 'warning' }> = [];

    // 检查基本字段
    if (!storyboard.metadata) {
      errors.push({
        field: 'metadata',
        message: '缺少元数据信息',
        severity: 'error',
      });
    }

    if (!storyboard.scenes || storyboard.scenes.length === 0) {
      errors.push({
        field: 'scenes',
        message: '没有分镜场景数据',
        severity: 'error',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * 默认支持所有工作区
   */
  supportsWorkspace(_workspace: string): boolean {
    return true;
  }
}
