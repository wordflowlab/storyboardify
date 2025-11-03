/**
 * API Manager - Unified Image Generation Interface
 * API 管理器 - 统一图片生成接口
 */

import PQueue from 'p-queue';
import { VolcanoEngineClient } from './volcano-engine.js';
import { AliyunClient } from './aliyun-client.js';
import type {
  ImageProvider,
  ImageGenerationRequest,
  ImageGenerationResponse,
  APIManagerConfig,
  CostStats,
} from '../types/index.js';

/**
 * API 管理器 - 统一调用接口
 */
export class APIManager {
  private readonly config: APIManagerConfig;
  private readonly volcanoClient?: VolcanoEngineClient;
  private readonly aliyunClient?: AliyunClient;
  private readonly queue: PQueue;

  // 成本追踪
  private dailyCost: number = 0;
  private lastResetDate: string = new Date().toISOString().split('T')[0];
  private generationCount: number = 0;

  // 质量配置映射
  private static readonly QUALITY_CONFIGS = {
    standard: {
      width: 1024,
      height: 1024,
      steps: 20,
    },
    high: {
      width: 1280,
      height: 1280,
      steps: 30,
    },
    ultra: {
      width: 1536,
      height: 1536,
      steps: 50,
    },
  } as const;

  constructor(config: APIManagerConfig) {
    this.config = config;

    // 初始化客户端
    if (config.volcano) {
      this.volcanoClient = VolcanoEngineClient.fromAPIConfig(config);
    }

    if (config.aliyun) {
      this.aliyunClient = AliyunClient.fromAPIConfig(config);
    }

    // 初始化并发队列
    this.queue = new PQueue({
      concurrency: config.concurrentLimit || 5,
    });
  }

  /**
   * 生成图片 (统一接口)
   */
  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    // 检查成本限制
    this.checkDailyCostLimit();

    // 重置每日成本 (如果是新的一天)
    this.resetDailyCostIfNeeded();

    // 获取质量配置
    const qualityConfig = APIManager.QUALITY_CONFIGS[request.quality];

    // 合并配置
    const finalRequest = {
      ...request,
      width: request.width || qualityConfig.width,
      height: request.height || qualityConfig.height,
    };

    // 添加到队列执行
    return this.queue.add(async () => {
      const startTime = Date.now();

      try {
        let response: ImageGenerationResponse;

        // 根据提供商选择调用相应的客户端
        switch (request.provider) {
          case 'volcano':
            response = await this.generateWithVolcano(finalRequest);
            break;

          case 'aliyun':
            response = await this.generateWithAliyun(finalRequest);
            break;

          case 'hybrid':
            response = await this.generateWithHybrid(finalRequest);
            break;

          default:
            throw new Error(`Unknown provider: ${request.provider as string}`);
        }

        // 记录成本
        this.recordCost(response.usage.cost_cny);

        // 添加生成时间
        response.usage.generation_time = Date.now() - startTime;

        return response;
      } catch (error) {
        throw new Error(
          `Image generation failed with provider ${request.provider}: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }) as Promise<ImageGenerationResponse>;
  }

  /**
   * 使用火山引擎生成
   */
  private async generateWithVolcano(
    request: ImageGenerationRequest
  ): Promise<ImageGenerationResponse> {
    if (!this.volcanoClient) {
      throw new Error('Volcano Engine client not initialized');
    }

    const response = await this.volcanoClient.generateImage({
      prompt: request.prompt,
      negative_prompt: request.negative_prompt,
      seed: request.seed,
      width: request.width,
      height: request.height,
      num_images: request.num_images,
    });

    return {
      request_id: response.request_id,
      images: response.images.map((img) => ({
        url: img.url,
        seed: img.seed,
        prompt: request.prompt,
        metadata: {
          generated_at: new Date().toISOString(),
        },
      })),
      usage: {
        cost_cny: response.usage.cost_cny,
        generation_time: 0, // Will be filled by caller
      },
      provider: 'volcano',
    };
  }

  /**
   * 使用阿里云生成
   */
  private async generateWithAliyun(
    request: ImageGenerationRequest
  ): Promise<ImageGenerationResponse> {
    if (!this.aliyunClient) {
      throw new Error('Aliyun client not initialized');
    }

    const response = await this.aliyunClient.generateImage({
      prompt: request.prompt,
      negative_prompt: request.negative_prompt,
      seed: request.seed,
      width: request.width,
      height: request.height,
      num_images: request.num_images,
    });

    return {
      request_id: response.request_id,
      images: response.images.map((img) => ({
        url: img.url,
        prompt: request.prompt,
        metadata: {
          generated_at: new Date().toISOString(),
        },
      })),
      usage: {
        cost_cny: response.usage.cost_cny,
        generation_time: 0, // Will be filled by caller
      },
      provider: 'aliyun',
    };
  }

  /**
   * 混合模式 - 智能选择提供商
   */
  private async generateWithHybrid(
    request: ImageGenerationRequest
  ): Promise<ImageGenerationResponse> {
    // 优先使用成本较低的提供商
    // 如果一个失败,自动降级到另一个

    const providers: ImageProvider[] = ['aliyun', 'volcano']; // Aliyun 通常更便宜
    let lastError: Error | null = null;

    for (const provider of providers) {
      try {
        const modifiedRequest = { ...request, provider };

        if (provider === 'volcano' && this.volcanoClient) {
          return await this.generateWithVolcano(modifiedRequest);
        } else if (provider === 'aliyun' && this.aliyunClient) {
          return await this.generateWithAliyun(modifiedRequest);
        }
      } catch (error) {
        console.warn(`Provider ${provider} failed in hybrid mode:`, error);
        lastError = error instanceof Error ? error : new Error(String(error));
        continue;
      }
    }

    throw new Error(
      `All providers failed in hybrid mode. Last error: ${lastError?.message || 'Unknown error'}`
    );
  }

  /**
   * 检查每日成本限制
   */
  private checkDailyCostLimit(): void {
    const maxCost = this.config.maxDailyCost || 500;

    if (this.dailyCost >= maxCost) {
      throw new Error(
        `Daily cost limit reached: ¥${this.dailyCost.toFixed(2)} / ¥${maxCost.toFixed(2)}`
      );
    }
  }

  /**
   * 重置每日成本 (如果是新的一天)
   */
  private resetDailyCostIfNeeded(): void {
    const today = new Date().toISOString().split('T')[0];

    if (today !== this.lastResetDate) {
      this.dailyCost = 0;
      this.generationCount = 0;
      this.lastResetDate = today;
    }
  }

  /**
   * 记录成本
   */
  private recordCost(cost: number): void {
    this.dailyCost += cost;
    this.generationCount++;

    // 成本预警 (80% 阈值)
    const maxCost = this.config.maxDailyCost || 500;
    const utilizationRate = this.dailyCost / maxCost;

    if (utilizationRate >= 0.8 && utilizationRate < 0.9) {
      console.warn(
        `⚠️  Daily cost warning: ¥${this.dailyCost.toFixed(2)} / ¥${maxCost.toFixed(2)} (${(
          utilizationRate * 100
        ).toFixed(1)}%)`
      );
    } else if (utilizationRate >= 0.9) {
      console.error(
        `🚨 Daily cost critical: ¥${this.dailyCost.toFixed(2)} / ¥${maxCost.toFixed(2)} (${(
          utilizationRate * 100
        ).toFixed(1)}%)`
      );
    }
  }

  /**
   * 获取成本统计
   */
  getCostStats(): CostStats {
    const maxCost = this.config.maxDailyCost || 500;

    return {
      dailyCost: this.dailyCost,
      maxDailyCost: maxCost,
      remainingBudget: Math.max(0, maxCost - this.dailyCost),
      utilizationRate: this.dailyCost / maxCost,
    };
  }

  /**
   * 测试所有配置的提供商
   */
  async testAllProviders(): Promise<{
    volcano: boolean;
    aliyun: boolean;
  }> {
    const results = {
      volcano: false,
      aliyun: false,
    };

    if (this.volcanoClient) {
      try {
        results.volcano = await this.volcanoClient.testConnection();
      } catch (error) {
        console.error('Volcano Engine test failed:', error);
      }
    }

    if (this.aliyunClient) {
      try {
        results.aliyun = await this.aliyunClient.testConnection();
      } catch (error) {
        console.error('Aliyun test failed:', error);
      }
    }

    return results;
  }

  /**
   * 获取当前队列状态
   */
  getQueueStatus() {
    return {
      pending: this.queue.pending,
      size: this.queue.size,
      concurrency: this.queue.concurrency,
    };
  }
}
