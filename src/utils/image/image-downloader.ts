/**
 * Image Downloader - Download and Save Generated Images
 * 图片下载管理器 - 下载并保存生成的图片
 */

import path from 'path';
import fs from 'fs-extra';
import axios from 'axios';
import sharp from 'sharp';
import pRetry from 'p-retry';
import type { GeneratedImage } from '../../types/index.js';

/**
 * 下载选项
 */
export interface DownloadOptions {
  outputDir: string;
  format?: 'png' | 'jpg' | 'webp';
  quality?: number; // 1-100 for jpg/webp
  resize?: {
    width?: number;
    height?: number;
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  };
  addWatermark?: boolean;
  maxRetries?: number;
}

/**
 * 下载结果
 */
export interface DownloadResult {
  success: boolean;
  local_path?: string;
  error?: string;
  file_size?: number;
  dimensions?: {
    width: number;
    height: number;
  };
}

/**
 * 图片下载管理器
 */
export class ImageDownloader {
  private readonly defaultOptions: Required<Omit<DownloadOptions, 'outputDir'>> = {
    format: 'png',
    quality: 90,
    resize: {},
    addWatermark: false,
    maxRetries: 3,
  };

  /**
   * 下载单张图片
   */
  async download(image: GeneratedImage, options: DownloadOptions): Promise<DownloadResult> {
    const opts = { ...this.defaultOptions, ...options };

    try {
      // 确保输出目录存在
      await fs.ensureDir(opts.outputDir);

      // 生成文件名
      const filename = this.generateFilename(image, opts.format);
      const outputPath = path.join(opts.outputDir, filename);

      // 下载图片
      const imageBuffer = await this.downloadImage(image.url, opts.maxRetries);

      // 处理图片
      const processedBuffer = await this.processImage(imageBuffer, opts);

      // 保存到磁盘
      await fs.writeFile(outputPath, processedBuffer);

      // 获取图片信息
      const metadata = await sharp(processedBuffer).metadata();

      return {
        success: true,
        local_path: outputPath,
        file_size: processedBuffer.length,
        dimensions: {
          width: metadata.width || 0,
          height: metadata.height || 0,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * 批量下载图片
   */
  async downloadBatch(
    images: Record<string, GeneratedImage[]>,
    options: DownloadOptions
  ): Promise<{
    results: Record<string, DownloadResult[]>;
    summary: {
      total: number;
      successful: number;
      failed: number;
      total_size: number;
    };
  }> {
    const results: Record<string, DownloadResult[]> = {};
    let successful = 0;
    let failed = 0;
    let totalSize = 0;
    let total = 0;

    for (const [key, imageList] of Object.entries(images)) {
      results[key] = [];

      for (const image of imageList) {
        total++;

        // 为每个镜头创建子目录
        const shotOutputDir = path.join(options.outputDir, key);
        const result = await this.download(image, {
          ...options,
          outputDir: shotOutputDir,
        });

        results[key].push(result);

        if (result.success) {
          successful++;
          totalSize += result.file_size || 0;

          // 更新 image 对象的 local_path
          image.local_path = result.local_path;
        } else {
          failed++;
        }
      }
    }

    return {
      results,
      summary: {
        total,
        successful,
        failed,
        total_size: totalSize,
      },
    };
  }

  /**
   * 下载图片 (带重试)
   */
  private async downloadImage(url: string, maxRetries: number): Promise<Buffer> {
    return pRetry(
      async () => {
        const response = await axios.get<ArrayBuffer>(url, {
          responseType: 'arraybuffer',
          timeout: 30000, // 30 秒超时
        });

        if (response.status !== 200) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return Buffer.from(response.data);
      },
      {
        retries: maxRetries,
        onFailedAttempt: (error) => {
          console.warn(`下载失败 (尝试 ${error.attemptNumber}/${maxRetries}):`, error.message);
        },
      }
    );
  }

  /**
   * 处理图片 (格式转换、调整大小、水印等)
   */
  private async processImage(
    buffer: Buffer,
    options: Required<Omit<DownloadOptions, 'outputDir'>>
  ): Promise<Buffer> {
    let pipeline = sharp(buffer);

    // 调整大小
    if (options.resize && (options.resize.width || options.resize.height)) {
      pipeline = pipeline.resize({
        width: options.resize.width,
        height: options.resize.height,
        fit: options.resize.fit || 'inside',
      });
    }

    // 格式转换
    switch (options.format) {
      case 'jpg':
        pipeline = pipeline.jpeg({ quality: options.quality });
        break;
      case 'webp':
        pipeline = pipeline.webp({ quality: options.quality });
        break;
      case 'png':
      default:
        pipeline = pipeline.png({ quality: options.quality });
        break;
    }

    // 添加水印 (如果需要)
    if (options.addWatermark) {
      pipeline = await this.addWatermark(pipeline);
    }

    return pipeline.toBuffer();
  }

  /**
   * 添加水印
   */
  private async addWatermark(pipeline: sharp.Sharp): Promise<sharp.Sharp> {
    // 简化实现: 添加文本水印
    // 实际应用中可以使用 sharp 的 composite 功能添加图片水印

    const metadata = await pipeline.metadata();
    const width = metadata.width || 1024;
    const height = metadata.height || 1024;

    // 创建水印文本 SVG
    const watermarkSvg = `
      <svg width="${width}" height="${height}">
        <text
          x="${width - 200}"
          y="${height - 20}"
          font-family="Arial"
          font-size="14"
          fill="rgba(255,255,255,0.5)"
        >Storyboardify</text>
      </svg>
    `;

    return pipeline.composite([
      {
        input: Buffer.from(watermarkSvg),
        gravity: 'southeast',
      },
    ]);
  }

  /**
   * 生成文件名
   */
  private generateFilename(image: GeneratedImage, format: string): string {
    const timestamp = new Date(image.metadata.generated_at).getTime();
    const shotId = image.metadata.shot_id || 'unknown';
    const seed = image.seed || 'noseed';

    return `${shotId}_${timestamp}_${seed}.${format}`;
  }

  /**
   * 清理旧文件
   */
  async cleanupOldFiles(
    directory: string,
    maxAgeHours: number = 24
  ): Promise<{ deleted: number; errors: number }> {
    const files = await fs.readdir(directory);
    const now = Date.now();
    const maxAge = maxAgeHours * 60 * 60 * 1000;

    let deleted = 0;
    let errors = 0;

    for (const file of files) {
      const filePath = path.join(directory, file);

      try {
        const stats = await fs.stat(filePath);

        if (now - stats.mtimeMs > maxAge) {
          await fs.remove(filePath);
          deleted++;
        }
      } catch (error) {
        console.warn(`清理文件失败: ${filePath}`, error);
        errors++;
      }
    }

    return { deleted, errors };
  }

  /**
   * 计算目录大小
   */
  async calculateDirectorySize(directory: string): Promise<number> {
    let totalSize = 0;

    const files = await fs.readdir(directory);

    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = await fs.stat(filePath);

      if (stats.isFile()) {
        totalSize += stats.size;
      } else if (stats.isDirectory()) {
        totalSize += await this.calculateDirectorySize(filePath);
      }
    }

    return totalSize;
  }

  /**
   * 格式化文件大小
   */
  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  }
}
