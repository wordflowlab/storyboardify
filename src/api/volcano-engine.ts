/**
 * Volcano Engine Image Generation Client
 * 火山引擎图片生成客户端
 */

import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import pRetry from 'p-retry';
import type {
  VolcanoImageGenRequest,
  VolcanoImageGenResponse,
  APIManagerConfig,
} from '../types/index.js';

export interface VolcanoEngineConfig {
  accessKeyId: string;
  accessKeySecret: string;
  region?: string;
  timeout?: number;
  maxRetries?: number;
}

/**
 * 火山引擎文生图 API 客户端
 */
export class VolcanoEngineClient {
  private readonly config: Required<VolcanoEngineConfig>;
  private readonly client: AxiosInstance;
  private readonly baseUrl: string;

  // API 端点配置
  private static readonly ENDPOINTS = {
    'cn-beijing': 'https://visual.volcengineapi.com',
    'cn-shanghai': 'https://visual.volcengineapi.com',
    'ap-singapore': 'https://visual-ap-southeast-1.volcengineapi.com',
  } as const;

  // 默认配置
  private static readonly DEFAULTS = {
    region: 'cn-beijing',
    timeout: 60000,
    maxRetries: 3,
  } as const;

  constructor(config: VolcanoEngineConfig) {
    this.config = {
      ...VolcanoEngineClient.DEFAULTS,
      ...config,
    };

    const region = this.config.region as keyof typeof VolcanoEngineClient.ENDPOINTS;
    this.baseUrl =
      VolcanoEngineClient.ENDPOINTS[region] || VolcanoEngineClient.ENDPOINTS['cn-beijing'];

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
  async generateImage(request: VolcanoImageGenRequest): Promise<VolcanoImageGenResponse> {
    return pRetry(
      async () => {
        const endpoint = '/api/v1/image/generate';
        const timestamp = Date.now();

        // 构建请求体
        const body = {
          prompt: request.prompt,
          negative_prompt: request.negative_prompt || '',
          seed: request.seed || Math.floor(Math.random() * 4294967295),
          width: request.width || 1024,
          height: request.height || 1024,
          style_preset: request.style_preset || 'anime',
          num_images: request.num_images || 1,
        };

        // 生成签名
        const signature = this.generateSignature(endpoint, body, timestamp);

        // 发送请求
        const response = await this.client.post<VolcanoImageGenResponse>(endpoint, body, {
          headers: {
            'X-Date': timestamp.toString(),
            Authorization: signature,
          },
        });

        // 验证响应
        if (!response.data || !response.data.images || response.data.images.length === 0) {
          throw new Error('Invalid response from Volcano Engine API: no images returned');
        }

        return response.data;
      },
      {
        retries: this.config.maxRetries,
        onFailedAttempt: (error: { attemptNumber: number; message: string }) => {
          console.warn(
            `Volcano Engine API call failed (attempt ${error.attemptNumber}/${this.config.maxRetries}):`,
            error.message
          );
        },
      }
    );
  }

  /**
   * 生成 API 签名 (Volcano Engine Signature v4)
   */
  private generateSignature(
    endpoint: string,
    body: Record<string, unknown>,
    timestamp: number
  ): string {
    const method = 'POST';
    const canonicalUri = endpoint;
    const canonicalQueryString = '';

    // 规范化请求头
    const canonicalHeaders = [
      `content-type:application/json`,
      `host:${new URL(this.baseUrl).host}`,
      `x-date:${timestamp}`,
    ].join('\n');

    const signedHeaders = 'content-type;host;x-date';

    // 计算 body hash
    const bodyHash = crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex');

    // 构建规范请求
    const canonicalRequest = [
      method,
      canonicalUri,
      canonicalQueryString,
      canonicalHeaders,
      '',
      signedHeaders,
      bodyHash,
    ].join('\n');

    // 计算规范请求的 hash
    const canonicalRequestHash = crypto.createHash('sha256').update(canonicalRequest).digest('hex');

    // 构建待签名字符串
    const dateStamp = new Date(timestamp).toISOString().split('T')[0].replace(/-/g, '');
    const credentialScope = `${dateStamp}/${this.config.region}/visual/request`;
    const stringToSign = [
      'HMAC-SHA256',
      timestamp.toString(),
      credentialScope,
      canonicalRequestHash,
    ].join('\n');

    // 生成签名密钥
    const kDate = this.hmac(`VOLCANO${this.config.accessKeySecret}`, dateStamp);
    const kRegion = this.hmac(kDate, this.config.region);
    const kService = this.hmac(kRegion, 'visual');
    const kSigning = this.hmac(kService, 'request');

    // 计算签名
    const signature = this.hmac(kSigning, stringToSign).toString('hex');

    // 构建 Authorization 头
    return [
      'HMAC-SHA256',
      `Credential=${this.config.accessKeyId}/${credentialScope}`,
      `SignedHeaders=${signedHeaders}`,
      `Signature=${signature}`,
    ].join(', ');
  }

  /**
   * HMAC-SHA256 辅助函数
   */
  private hmac(key: string | Buffer, data: string): Buffer {
    return crypto.createHmac('sha256', key).update(data).digest();
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
      console.error('Volcano Engine connection test failed:', error);
      return false;
    }
  }

  /**
   * 从 APIManagerConfig 创建客户端
   */
  static fromAPIConfig(config: APIManagerConfig): VolcanoEngineClient {
    if (!config.volcano) {
      throw new Error('Volcano Engine configuration not found in APIManagerConfig');
    }

    return new VolcanoEngineClient({
      accessKeyId: config.volcano.accessKeyId,
      accessKeySecret: config.volcano.accessKeySecret,
      region: config.volcano.region,
    });
  }
}
