/**
 * 导出器注册表
 * 管理所有可用的导出器
 */

import type { Exporter } from './base.js';
import type { ExportFormat } from '../types/index.js';
import { MarkdownExporter } from './markdown.js';

/**
 * 导出器注册表
 */
class ExporterRegistry {
  private exporters: Map<ExportFormat, Exporter> = new Map();

  /**
   * 注册导出器
   */
  register(exporter: Exporter): void {
    this.exporters.set(exporter.format, exporter);
  }

  /**
   * 获取导出器
   */
  get(format: ExportFormat): Exporter | undefined {
    return this.exporters.get(format);
  }

  /**
   * 获取所有可用的导出格式
   */
  getAvailableFormats(): ExportFormat[] {
    return Array.from(this.exporters.keys());
  }

  /**
   * 获取所有导出器
   */
  getAll(): Exporter[] {
    return Array.from(this.exporters.values());
  }

  /**
   * 检查格式是否支持
   */
  isFormatSupported(format: string): boolean {
    return this.exporters.has(format as ExportFormat);
  }

  /**
   * 获取工作区支持的导出格式
   */
  getFormatsForWorkspace(workspace: string): ExportFormat[] {
    return Array.from(this.exporters.values())
      .filter((exporter) => exporter.supportsWorkspace(workspace))
      .map((exporter) => exporter.format);
  }
}

// 创建全局注册表实例
const registry = new ExporterRegistry();

// 注册默认导出器
registry.register(new MarkdownExporter());

// 导出注册表实例和便捷函数
export { registry as exporterRegistry };

export function getExporter(format: ExportFormat): Exporter | undefined {
  return registry.get(format);
}

export function getAvailableFormats(): ExportFormat[] {
  return registry.getAvailableFormats();
}

export function isFormatSupported(format: string): boolean {
  return registry.isFormatSupported(format);
}

export function getFormatsForWorkspace(workspace: string): ExportFormat[] {
  return registry.getFormatsForWorkspace(workspace);
}
