# Storyboardify v1.1.0 快速启动指南

> **目标**: 在 30 分钟内完成开发环境搭建,开始 Week 1 开发工作

---

## 🚀 第一步: 环境准备 (5 分钟)

### 1.1 确认开发环境

```bash
# 检查 Node.js 版本 (需要 >= 18.0.0)
node --version

# 检查 npm 版本
npm --version

# 检查 TypeScript 编译器
npx tsc --version
```

### 1.2 克隆项目并切换分支

```bash
cd /Users/coso/Documents/dev/ai/wordflowlab/storyboardify

# 确保在最新的 main 分支
git checkout main
git pull origin main

# 创建开发分支
git checkout -b feature/image-generation

# 查看当前状态
git status
```

---

## 📦 第二步: 安装新依赖 (10 分钟)

### 2.1 更新 package.json

在 `dependencies` 部分添加以下内容:

```json
{
  "dependencies": {
    "@volcengine/openapi": "^1.0.0",
    "@alicloud/openapi-client": "^0.4.8",
    "@alicloud/tea-util": "^1.4.7",
    "axios": "^1.6.0",
    "p-queue": "^8.0.1",
    "p-retry": "^6.2.0",
    "sharp": "^0.33.0",
    "dotenv": "^16.4.0"
  }
}
```

### 2.2 安装依赖

```bash
npm install

# 验证安装
npm list @volcengine/openapi
npm list @alicloud/openapi-client
npm list axios
npm list p-queue
npm list p-retry
npm list sharp
npm list dotenv
```

### 2.3 验证编译

```bash
npm run build

# 应该输出: ✓ 编译成功
```

---

## 🏗️ 第三步: 创建目录结构 (5 分钟)

```bash
# 创建 API 层目录
mkdir -p src/api

# 创建图片生成器目录
mkdir -p src/generators/image

# 创建分镜优化器目录
mkdir -p src/generators/storyboard

# 创建导出器目录 (已存在则跳过)
mkdir -p src/exporters

# 创建图片工具目录
mkdir -p src/utils/image

# 创建文档目录
mkdir -p docs

# 创建示例项目目录
mkdir -p examples/with-image-generation

# 验证目录结构
tree src -L 2 -d
```

**预期输出**:
```
src
├── api
├── exporters
├── generators
│   ├── image
│   └── storyboard
├── types
├── utils
│   └── image
└── workspaces
```

---

## 🔑 第四步: 配置 API 密钥 (5 分钟)

### 4.1 创建环境配置文件

```bash
# 复制模板文件
cp .env.template .env

# 编辑配置文件
# 使用你喜欢的编辑器打开 .env
```

### 4.2 填写 API 密钥

**火山引擎配置**:
1. 访问 https://www.volcengine.com/
2. 注册/登录账号
3. 进入控制台 → 访问控制 → 用户管理
4. 创建 AccessKey
5. 复制 `Access Key ID` 和 `Access Key Secret`

**阿里云配置**:
1. 访问 https://ram.console.aliyun.com/
2. 创建 AccessKey
3. 复制 `AccessKeyId` 和 `AccessKeySecret`

**.env 文件示例**:
```bash
# 火山引擎配置
VOLCANO_ACCESS_KEY_ID=AKLT***************
VOLCANO_ACCESS_KEY_SECRET=YWRm***************
VOLCANO_REGION=cn-beijing

# 阿里云配置
ALIYUN_ACCESS_KEY_ID=LTAI***************
ALIYUN_ACCESS_KEY_SECRET=cGFz***************
ALIYUN_REGION=cn-hangzhou

# API 配置
API_TIMEOUT=60000
API_MAX_RETRIES=3
API_CONCURRENT_LIMIT=5

# 成本控制
MAX_DAILY_COST_CNY=500
ENABLE_COST_ALERT=true
```

### 4.3 添加 .gitignore

确保 `.env` 不会被提交到 Git:

```bash
# 检查 .gitignore 是否包含 .env
grep "^\.env$" .gitignore

# 如果没有,添加它
echo ".env" >> .gitignore
```

---

## ✅ 第五步: 验证环境 (5 分钟)

### 5.1 编译测试

```bash
npm run build

# 应该成功编译,无错误
```

### 5.2 运行现有测试

```bash
npm test

# 应该通过所有现有测试
```

### 5.3 验证 CLI

```bash
npm run start -- --version

# 应该输出版本号: 1.0.0
```

---

## 🎯 第六步: 开始第一个任务 (剩余时间)

### Task 1.1: 创建 API 客户端骨架

#### 1. 创建火山引擎客户端文件

```bash
touch src/api/volcano-engine.ts
```

添加基础结构:

```typescript
/**
 * 火山引擎文生图 API 客户端
 */

import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import pRetry from 'p-retry';

export interface VolcanoImageGenRequest {
  prompt: string;
  negative_prompt?: string;
  seed?: number;
  width?: number;
  height?: number;
  style_preset?: string;
  num_images?: number;
}

export interface VolcanoImageGenResponse {
  request_id: string;
  images: Array<{
    url: string;
    seed: number;
  }>;
  usage: {
    tokens: number;
    cost_cny: number;
  };
}

export class VolcanoEngineClient {
  private client: AxiosInstance;
  private accessKeyId: string;
  private accessKeySecret: string;
  private region: string;

  constructor(config: {
    accessKeyId: string;
    accessKeySecret: string;
    region?: string;
  }) {
    this.accessKeyId = config.accessKeyId;
    this.accessKeySecret = config.accessKeySecret;
    this.region = config.region || 'cn-beijing';

    this.client = axios.create({
      baseURL: `https://visual.volcengineapi.com`,
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * 文生图接口
   * TODO: 实现完整逻辑
   */
  async generateImage(
    request: VolcanoImageGenRequest
  ): Promise<VolcanoImageGenResponse> {
    // TODO: 实现签名算法
    // TODO: 实现 API 调用
    // TODO: 实现错误处理
    throw new Error('Not implemented yet');
  }
}
```

#### 2. 验证编译

```bash
npm run build

# 应该编译成功
```

#### 3. 提交第一个 commit

```bash
git add src/api/volcano-engine.ts
git commit -m "feat: add VolcanoEngineClient skeleton structure

- Create basic client class with TypeScript interfaces
- Define request/response types
- Add constructor with config support
- TODO: Implement signature algorithm and API call logic

Related to: Week 1, Day 3-4, Task 1.4"

git push -u origin feature/image-generation
```

---

## 📋 Week 1 任务清单

现在你已经完成了环境搭建!下面是 Week 1 的完整任务清单:

### Day 1-2: 环境配置 ✅
- [x] 更新 package.json
- [x] 安装新依赖
- [x] 创建目录结构
- [x] 配置 API 密钥
- [ ] 编写 API 配置指南文档

### Day 3-4: API 客户端封装
- [ ] 实现火山引擎签名算法
- [ ] 实现火山引擎文生图接口
- [ ] 实现阿里云客户端
- [ ] 实现 API 管理器
- [ ] 编写单元测试

### Day 5-7: 提示词构建引擎
- [ ] 实现一致性追踪器
- [ ] 实现提示词构建器
- [ ] 扩展类型定义
- [ ] 编写集成测试

---

## 🔍 调试技巧

### 查看日志

```bash
# 开启详细日志
export DEBUG=storyboardify:*

# 运行命令
npm run dev -- init test-project
```

### 测试 API 连接

创建临时测试文件 `test-api.ts`:

```typescript
import { VolcanoEngineClient } from './src/api/volcano-engine.js';
import dotenv from 'dotenv';

dotenv.config();

async function testAPI() {
  const client = new VolcanoEngineClient({
    accessKeyId: process.env.VOLCANO_ACCESS_KEY_ID!,
    accessKeySecret: process.env.VOLCANO_ACCESS_KEY_SECRET!,
  });

  try {
    const result = await client.generateImage({
      prompt: '测试图片,年轻女性,长黑发',
      width: 512,
      height: 512,
    });
    console.log('✅ API 调用成功:', result);
  } catch (error) {
    console.error('❌ API 调用失败:', error);
  }
}

testAPI();
```

运行测试:
```bash
npx tsx test-api.ts
```

---

## 📚 推荐阅读

开始开发前,建议先阅读以下文档:

1. **必读**:
   - [OPTIMIZATION_ROADMAP.md](./OPTIMIZATION_ROADMAP.md) - 完整路线图
   - [AI漫剧制作完整流程.md](./AI漫剧制作完整流程.md) - 业务背景

2. **参考**:
   - [火山引擎文生图 API 文档](https://www.volcengine.com/docs/api/)
   - [阿里云通义万相 API 文档](https://help.aliyun.com/)

3. **技术参考**:
   - [p-queue 文档](https://github.com/sindresorhus/p-queue)
   - [p-retry 文档](https://github.com/sindresorhus/p-retry)
   - [axios 文档](https://axios-http.com/)

---

## 🆘 常见问题

### Q1: npm install 失败,提示 node-gyp 错误
**A**: 这通常是 sharp 库编译失败。解决方法:

```bash
# macOS
brew install pkg-config cairo pango libpng jpeg giflib librsvg

# 重新安装
npm install
```

### Q2: TypeScript 编译报错找不到模块
**A**: 确保 tsconfig.json 配置正确:

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true,
    "resolveJsonModule": true
  }
}
```

### Q3: API 调用返回 403 Forbidden
**A**: 检查 API 密钥是否正确配置:

```bash
# 验证环境变量
echo $VOLCANO_ACCESS_KEY_ID
echo $ALIYUN_ACCESS_KEY_ID

# 确保 .env 文件被正确加载
```

### Q4: 图片下载失败
**A**: 检查网络连接和代理设置:

```bash
# 如果需要代理
export HTTP_PROXY=http://your-proxy:port
export HTTPS_PROXY=http://your-proxy:port
```

---

## ✨ 完成标志

当你完成以下所有任务时,说明环境搭建成功:

- [x] Node.js >= 18.0.0
- [x] 所有依赖安装成功
- [x] 目录结构创建完成
- [x] API 密钥配置完成
- [x] 编译通过无错误
- [x] 现有测试全部通过
- [x] 第一个 commit 已提交
- [ ] API 连接测试成功

---

## 🎯 下一步

完成本指南后,请继续阅读:

1. [OPTIMIZATION_ROADMAP.md](./OPTIMIZATION_ROADMAP.md) - Week 1 Day 3-4 详细任务
2. 开始实现火山引擎签名算法
3. 编写第一个单元测试

---

**祝你开发顺利!** 🚀

有任何问题,请查看 [OPTIMIZATION_ROADMAP.md](./OPTIMIZATION_ROADMAP.md) 的风险管理章节。
