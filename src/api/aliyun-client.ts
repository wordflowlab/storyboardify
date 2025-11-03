/**
 * Aliyun (通义万相) Image Generation Client
 * 阿里云图片生成客户端
 */

import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import pRetry from 'p-retry';
import type {
  AliyunImageGenRequest,
  AliyunImageGenResponse,
  APIManagerConfig,
} from '../types/index.js';

// Internal API response types
interface CreateTaskResponse {
  task_id: string;
}

interface TaskStatusResponse {
  status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';
  results?: Array<{
    url: string;
  }>;
  width?: number;
  height?: number;
  error?: string;
}

export interface AliyunClientConfig {
  accessKeyId: string;
  accessKeySecret: string;
  endpoint?: string;
  timeout?: number;
  maxRetries?: number;
}

/**
 * 阿里云通义万相 API 客户端
 *
 * 注意: 这是一个简化的实现示例
 * 生产环境请根据阿里云官方文档实现完整的签名算法
 */
export class AliyunClient {
  private readonly config: Required<AliyunClientConfig>;
  private readonly client: AxiosInstance;
  private readonly baseUrl: string;

  // 默认配置
  private static readonly DEFAULTS = {
    endpoint: 'https://wanx.cn-beijing.aliyuncs.com',
    timeout: 60000,
    maxRetries: 3,
  } as const;

  constructor(config: AliyunClientConfig) {
    this.config = {
      ...AliyunClient.DEFAULTS,
      ...config,
    };

    this.baseUrl = this.config.endpoint;

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * 生成图片
   */
  async generateImage(request: AliyunImageGenRequest): Promise<AliyunImageGenResponse> {
    return pRetry(
      async () => {
        // Step 1: 创建生成任务
        const taskId = await this.createGenerationTask(request);

        // Step 2: 轮询任务状态
        const result = await this.pollTaskStatus(taskId);

        return result;
      },
      {
        retries: this.config.maxRetries,
        onFailedAttempt: (error: { attemptNumber: number; message: string }) => {
          console.warn(
            `Aliyun API call failed (attempt ${error.attemptNumber}/${this.config.maxRetries}):`,
            error.message
          );
        },
      }
    );
  }

  /**
   * 创建图片生成任务
   */
  private async createGenerationTask(request: AliyunImageGenRequest): Promise<string> {
    const timestamp = new Date().toISOString();

    const body = {
      action: 'CreateImageGenerationTask',
      version: '2024-03-13',
      prompt: request.prompt,
      negative_prompt: request.negative_prompt || '',
      seed: request.seed || Math.floor(Math.random() * 4294967295),
      width: request.width || 1024,
      height: request.height || 1024,
      num_images: request.num_images || 1,
      model: 'wanx-v1',
    };

    // 生成签名
    const signature = this.generateSignature('POST', '/api/v1/tasks', body, timestamp);

    const response = await this.client.post<CreateTaskResponse>('/api/v1/tasks', body, {
      headers: {
        'X-Date': timestamp,
        Authorization: signature,
      },
    });

    if (!response.data?.task_id) {
      throw new Error('Failed to create Aliyun generation task: no task_id returned');
    }

    return response.data.task_id;
  }

  /**
   * 轮询任务状态
   */
  private async pollTaskStatus(taskId: string): Promise<AliyunImageGenResponse> {
    const maxPolls = 60; // 最多轮询 60 次
    const pollInterval = 2000; // 每 2 秒轮询一次

    for (let i = 0; i < maxPolls; i++) {
      const timestamp = new Date().toISOString();
      const path = `/api/v1/tasks/${taskId}`;

      const signature = this.generateSignature('GET', path, {}, timestamp);

      const response = await this.client.get<TaskStatusResponse>(path, {
        headers: {
          'X-Date': timestamp,
          Authorization: signature,
        },
      });

      const status = response.data.status;

      if (status === 'SUCCEEDED') {
        // 任务成功,返回结果
        const results = response.data.results ?? [];
        const images = results.map((result) => ({
          url: result.url,
        }));

        return {
          request_id: taskId,
          images,
          usage: {
            cost_cny: this.calculateCost(
              response.data.width ?? 1024,
              response.data.height ?? 1024,
              images.length
            ),
          },
        };
      } else if (status === 'FAILED') {
        throw new Error(`Aliyun task failed: ${response.data.error ?? 'Unknown error'}`);
      }

      // 任务仍在进行中,等待后继续轮询
      await this.sleep(pollInterval);
    }

    throw new Error('Aliyun task timeout: exceeded maximum polling attempts');
  }

  /**
   * 生成 API 签名 (简化版)
   *
   * 注意: 这是一个简化实现,生产环境请参考阿里云官方文档
   * https://help.aliyun.com/document_detail/....html
   */
  private generateSignature(
    method: string,
    path: string,
    body: Record<string, unknown>,
    timestamp: string
  ): string {
    const stringToSign = [method, path, timestamp, JSON.stringify(body)].join('\n');

    const signature = crypto
      .createHmac('sha256', this.config.accessKeySecret)
      .update(stringToSign)
      .digest('hex');

    return `ALIYUN ${this.config.accessKeyId}:${signature}`;
  }

  /**
   * 计算成本 (基于图片尺寸和数量)
   */
  private calculateCost(width: number, height: number, numImages: number): number {
    // 通义万相定价示例 (实际价格以官网为准):
    // 1024x1024: ¥0.06/张
    // 1280x720:  ¥0.04/张
    // 512x512:   ¥0.02/张

    const pixels = width * height;
    let unitCost = 0.06; // 默认 1024x1024 价格

    if (pixels <= 512 * 512) {
      unitCost = 0.02;
    } else if (pixels <= 1024 * 1024) {
      unitCost = 0.06;
    } else {
      unitCost = 0.08;
    }

    return unitCost * numImages;
  }

  /**
   * 睡眠辅助函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 测试连接
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.generateImage({
        prompt: 'test connection',
        num_images: 1,
      });
      return true;
    } catch (error) {
      console.error('Aliyun connection test failed:', error);
      return false;
    }
  }

  /**
   * 从 APIManagerConfig 创建客户端
   */
  static fromAPIConfig(config: APIManagerConfig): AliyunClient {
    if (!config.aliyun) {
      throw new Error('Aliyun configuration not found in APIManagerConfig');
    }

    return new AliyunClient({
      accessKeyId: config.aliyun.accessKeyId,
      accessKeySecret: config.aliyun.accessKeySecret,
      endpoint: config.aliyun.endpoint,
    });
  }
}
