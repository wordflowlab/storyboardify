/**
 * Quality Checker - Image Quality Assessment
 * 质量检查器 - 图片质量评估
 */

import type { GeneratedImage, ConsistencyScore } from '../../types/index.js';

/**
 * 质量检查选项
 */
export interface QualityCheckOptions {
  checkCharacterConsistency?: boolean;
  checkSceneConsistency?: boolean;
  checkTechnicalQuality?: boolean;
  minAcceptableScore?: number; // 最低可接受分数 (0-1)
}

/**
 * 质量检查结果
 */
export interface QualityCheckResult {
  overall_score: number; // 0-1
  passed: boolean;
  consistency?: ConsistencyScore;
  technical_score?: number;
  issues: string[];
  suggestions: string[];
}

/**
 * 质量检查器
 */
export class QualityChecker {
  private readonly defaultOptions: Required<QualityCheckOptions> = {
    checkCharacterConsistency: true,
    checkSceneConsistency: true,
    checkTechnicalQuality: true,
    minAcceptableScore: 0.7,
  };

  /**
   * 检查生成图片的质量
   */
  async checkImage(
    image: GeneratedImage,
    options: QualityCheckOptions = {}
  ): Promise<QualityCheckResult> {
    const opts = { ...this.defaultOptions, ...options };

    const result: QualityCheckResult = {
      overall_score: 0,
      passed: false,
      issues: [],
      suggestions: [],
    };

    const scores: number[] = [];

    // 1. 技术质量检查
    if (opts.checkTechnicalQuality) {
      const techScore = await this.checkTechnicalQuality(image);
      result.technical_score = techScore;
      scores.push(techScore);

      if (techScore < 0.7) {
        result.issues.push('技术质量偏低: 图片可能模糊或有瑕疵');
        result.suggestions.push('尝试使用更高的质量设置 (quality: "high" 或 "ultra")');
      }
    }

    // 2. 一致性检查
    if (opts.checkCharacterConsistency || opts.checkSceneConsistency) {
      const consistencyScore = this.checkConsistency(image);
      result.consistency = consistencyScore;
      scores.push(consistencyScore.overall);

      if (consistencyScore.overall < 0.8) {
        result.issues.push(`一致性评分偏低: ${(consistencyScore.overall * 100).toFixed(1)}%`);
        result.suggestions.push(...consistencyScore.suggestions);
      }
    }

    // 3. 计算总分
    result.overall_score = scores.length > 0 ? scores.reduce((a, b) => a + b) / scores.length : 0;
    result.passed = result.overall_score >= opts.minAcceptableScore;

    return result;
  }

  /**
   * 批量检查图片质量
   */
  async checkBatch(
    images: GeneratedImage[],
    options: QualityCheckOptions = {}
  ): Promise<{
    results: QualityCheckResult[];
    summary: {
      total: number;
      passed: number;
      failed: number;
      average_score: number;
    };
  }> {
    const results: QualityCheckResult[] = [];

    for (const image of images) {
      const result = await this.checkImage(image, options);
      results.push(result);
    }

    const passedCount = results.filter((r) => r.passed).length;
    const avgScore = results.reduce((sum, r) => sum + r.overall_score, 0) / results.length || 0;

    return {
      results,
      summary: {
        total: images.length,
        passed: passedCount,
        failed: images.length - passedCount,
        average_score: avgScore,
      },
    };
  }

  /**
   * 检查技术质量 (简化版)
   *
   * 实际应用中可以使用图片分析库 (如 sharp) 来检查:
   * - 清晰度 (边缘检测)
   * - 噪点水平
   * - 色彩饱和度
   * - 构图平衡
   */
  private async checkTechnicalQuality(image: GeneratedImage): Promise<number> {
    // 简化实现: 基于提示词和元数据的启发式评分
    let score = 0.8; // 基础分数

    // 检查是否有 URL
    if (!image.url || image.url === '') {
      return 0.1;
    }

    // 检查提示词质量
    if (image.prompt && image.prompt.length > 50) {
      score += 0.1; // 详细的提示词通常生成质量更好
    }

    // 检查是否使用了已知的好种子
    if (image.seed && image.seed > 0) {
      score += 0.05;
    }

    // 检查生成时间 (过快或过慢可能有问题)
    if (image.metadata.generation_time) {
      const time = image.metadata.generation_time / 1000; // 转为秒
      if (time < 5 || time > 120) {
        score -= 0.1; // 异常生成时间
      }
    }

    return Math.min(1, Math.max(0, score));
  }

  /**
   * 检查一致性 (基于参考档案)
   */
  private checkConsistency(image: GeneratedImage): ConsistencyScore {
    const score: ConsistencyScore = {
      overall: 0.85, // 默认评分
      character_appearance: 0.85,
      character_outfit: 0.85,
      scene_layout: 0.85,
      scene_lighting: 0.85,
      issues: [],
      suggestions: [],
    };

    // 简化实现: 实际应该使用图像相似度算法
    // 这里基于提示词和元数据进行启发式评估

    // 检查是否有角色 ID
    if (image.metadata.character_id) {
      // 有角色参考,假设一致性较高
      score.character_appearance = 0.9;
      score.character_outfit = 0.88;
    } else {
      score.issues.push('未找到角色参考');
      score.suggestions.push('建立角色参考档案以提升一致性');
    }

    // 检查是否有场景 ID
    if (image.metadata.scene_id) {
      score.scene_layout = 0.87;
      score.scene_lighting = 0.86;
    } else {
      score.issues.push('未找到场景参考');
      score.suggestions.push('建立场景参考档案以提升一致性');
    }

    // 计算总分
    score.overall =
      (score.character_appearance +
        score.character_outfit +
        score.scene_layout +
        score.scene_lighting) /
      4;

    return score;
  }

  /**
   * 比较两张图片的一致性
   */
  compareImages(
    image1: GeneratedImage,
    image2: GeneratedImage
  ): {
    similarity: number;
    differences: string[];
  } {
    // 简化实现: 比较元数据
    const differences: string[] = [];
    let similarity = 1.0;

    // 比较角色
    if (image1.metadata.character_id !== image2.metadata.character_id) {
      differences.push('角色不同');
      similarity -= 0.3;
    }

    // 比较场景
    if (image1.metadata.scene_id !== image2.metadata.scene_id) {
      differences.push('场景不同');
      similarity -= 0.2;
    }

    // 比较提示词相似度 (简单词汇匹配)
    const promptSimilarity = this.calculatePromptSimilarity(image1.prompt, image2.prompt);
    if (promptSimilarity < 0.5) {
      differences.push('提示词差异较大');
      similarity -= 0.2;
    }

    return {
      similarity: Math.max(0, similarity),
      differences,
    };
  }

  /**
   * 计算提示词相似度 (简单实现)
   */
  private calculatePromptSimilarity(prompt1: string, prompt2: string): number {
    const words1 = new Set(prompt1.toLowerCase().split(/\s+/));
    const words2 = new Set(prompt2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter((w) => words2.has(w)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  /**
   * 为图片评分 (用于一致性追踪器记录)
   */
  scoreImage(_image: GeneratedImage, checkResult: QualityCheckResult): number {
    // 返回 0-1 的评分
    return checkResult.overall_score;
  }

  /**
   * 推荐最佳图片 (从多个变体中选择)
   */
  async selectBestImage(
    images: GeneratedImage[],
    options: QualityCheckOptions = {}
  ): Promise<GeneratedImage | null> {
    if (images.length === 0) return null;
    if (images.length === 1) return images[0];

    // 检查所有图片质量
    const results = await Promise.all(images.map((img) => this.checkImage(img, options)));

    // 找到最高分的图片
    let bestIndex = 0;
    let bestScore = results[0].overall_score;

    for (let i = 1; i < results.length; i++) {
      if (results[i].overall_score > bestScore) {
        bestScore = results[i].overall_score;
        bestIndex = i;
      }
    }

    return images[bestIndex];
  }

  /**
   * 生成质量报告
   */
  generateQualityReport(checkResult: QualityCheckResult): string {
    const lines: string[] = [];

    lines.push('图片质量报告');
    lines.push('='.repeat(40));
    lines.push('');

    lines.push(`总体评分: ${(checkResult.overall_score * 100).toFixed(1)}%`);
    lines.push(`状态: ${checkResult.passed ? '✓ 通过' : '✗ 不合格'}`);
    lines.push('');

    if (checkResult.technical_score !== undefined) {
      lines.push(`技术质量: ${(checkResult.technical_score * 100).toFixed(1)}%`);
    }

    if (checkResult.consistency) {
      lines.push('');
      lines.push('一致性评分:');
      lines.push(`  角色外观: ${(checkResult.consistency.character_appearance * 100).toFixed(1)}%`);
      lines.push(`  角色服装: ${(checkResult.consistency.character_outfit * 100).toFixed(1)}%`);
      lines.push(`  场景布局: ${(checkResult.consistency.scene_layout * 100).toFixed(1)}%`);
      lines.push(`  场景光照: ${(checkResult.consistency.scene_lighting * 100).toFixed(1)}%`);
    }

    if (checkResult.issues.length > 0) {
      lines.push('');
      lines.push('发现的问题:');
      checkResult.issues.forEach((issue) => {
        lines.push(`  - ${issue}`);
      });
    }

    if (checkResult.suggestions.length > 0) {
      lines.push('');
      lines.push('改进建议:');
      checkResult.suggestions.forEach((suggestion) => {
        lines.push(`  - ${suggestion}`);
      });
    }

    lines.push('');
    lines.push('='.repeat(40));

    return lines.join('\n');
  }
}
