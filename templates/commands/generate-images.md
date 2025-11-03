---
description: 生成分镜图片
scripts:
  sh: ../../scripts/bash/generate-images.sh
---

# /generate-images - 图片生成 (v0.1.5 NEW!)

> **目标**: 根据分镜脚本批量生成图片,支持火山引擎和阿里云

---

## 第一步: 配置 API

在开始之前,需要配置图片生成 API:

```bash
# 复制环境变量模板
cp .env.template .env

# 编辑 .env 文件,填入你的 API 密钥
# VOLCANO_ACCESS_KEY_ID=your_volcano_key
# VOLCANO_ACCESS_KEY_SECRET=your_volcano_secret
# ALIYUN_ACCESS_KEY_ID=your_aliyun_key
# ALIYUN_ACCESS_KEY_SECRET=your_aliyun_secret
```

获取 API 密钥:
- **火山引擎**: https://console.volcengine.com/iam/keymanage/
- **阿里云通义万相**: https://ram.console.aliyun.com/manage/ak

---

## 第二步: 运行生成命令

### 交互式模式 (推荐)

```bash
bash scripts/bash/generate-images.sh
```

AI 会引导你完成:
1. 选择图片生成提供商 (volcano/aliyun/hybrid)
2. 选择图片质量 (standard/high/ultra)
3. 设置每个镜头生成的变体数量
4. 确认成本预算

### 命令行模式

```bash
bash scripts/bash/generate-images.sh --provider volcano --quality high --variants 2
```

可用参数:
- `--provider <type>`: 提供商 (volcano|aliyun|hybrid)
- `--quality <level>`: 质量 (standard|high|ultra)
- `--variants <num>`: 每镜头变体数 (1-5)
- `--output <dir>`: 输出目录
- `--no-download`: 仅生成 URL,不下载图片

---

## 第三步: 处理生成结果

### 如果 status = "success"

```
✅ 批量图片生成完成！

总览:
  • 总镜头数: 45
  • 成功生成: 43
  • 失败: 2
  • 总图片数: 86
  • 总成本: ¥24.60
  • 总耗时: 8.3 分钟

平均指标:
  • 平均每镜头成本: ¥0.57
  • 平均每镜头耗时: 11.5 秒

一致性评分:
  • 角色一致性: 91.2%
  • 场景一致性: 87.6%

输出目录: output/images/
生成报告: output/generation_report.json
```

生成的文件:
- `output/images/scene_N_shot_M/` - 按镜头组织的图片
- `output/prompts/` - 使用的提示词 (如果启用)
- `output/generation_report.json` - 详细生成报告
- `output/generation_report.txt` - 人类可读报告

### 如果 status = "error"

常见错误处理:

#### 1. API 密钥未配置

```
❌ 未找到 API 配置

请先配置 .env 文件:
  1. cp .env.template .env
  2. 编辑 .env 填入 API 密钥
  3. 重新运行 /generate-images
```

#### 2. 分镜脚本不存在

```
❌ 未找到分镜脚本

请先完成以下步骤:
  1. /specify - 定义项目规格
  2. /import - 导入剧本
  3. /preproduce - 生成制作包
  4. /generate-express - 生成分镜脚本
  5. /generate-images - 生成图片
```

#### 3. 成本限额不足

```
❌ 每日成本限额不足

当前已用: ¥458.00 / ¥500.00
本次预估: ¥68.40

建议:
  1. 增加 MAX_DAILY_COST_CNY 限额
  2. 等待明天重置
  3. 减少生成的镜头数量
```

#### 4. API 调用失败

```
❌ 图片生成失败

错误: Volcano Engine API timeout

建议:
  1. 检查网络连接
  2. 重试生成 (已保存进度)
  3. 切换到其他提供商 (--provider aliyun)
```

---

## 成本预估

不同提供商和质量级别的成本参考:

### 火山引擎

| 质量级别 | 尺寸 | 单价 | 100镜头成本 |
|---------|------|------|-------------|
| standard | 1024x1024 | ¥0.08 | ¥8.00 |
| high | 1280x1280 | ¥0.12 | ¥12.00 |
| ultra | 1536x1536 | ¥0.18 | ¥18.00 |

### 阿里云通义万相

| 质量级别 | 尺寸 | 单价 | 100镜头成本 |
|---------|------|------|-------------|
| standard | 1024x1024 | ¥0.06 | ¥6.00 |
| high | 1280x1280 | ¥0.08 | ¥8.00 |
| ultra | 1536x1536 | ¥0.10 | ¥10.00 |

*价格仅供参考,以官网实时价格为准*

---

## 高级用法

### 仅生成指定场景

```bash
bash scripts/bash/generate-images.sh --scenes 1,3,5
```

### 使用自定义提示词模板

```bash
bash scripts/bash/generate-images.sh --prompt-template custom-style.yaml
```

### 批量下载现有 URL

```bash
bash scripts/bash/generate-images.sh --download-only --input urls.json
```

### 查看成本统计

```bash
bash scripts/bash/generate-images.sh --cost-stats
```

---

## 一致性优化建议

为了获得更好的角色和场景一致性:

1. **首次生成**: 使用 `--variants 3` 生成多个变体
2. **筛选参考**: 从变体中选择最佳图片作为参考
3. **后续生成**: 系统会自动使用参考图片的种子值
4. **手动调整**: 编辑 `.storyboardify/references/` 中的参考档案

---

## 下一步

图片生成完成后:

```bash
/export              # 导出完整项目 (包含图片)
```

或继续优化:

```bash
# 重新生成特定镜头
bash scripts/bash/generate-images.sh --shots 5,8,12 --variants 5

# 使用更高质量
bash scripts/bash/generate-images.sh --quality ultra --scenes 1
```

---

## 故障排除

### 生成速度慢

- 减少并发数: 编辑 `.env` 设置 `API_CONCURRENT_LIMIT=3`
- 使用标准质量: `--quality standard`
- 分批生成: `--scenes 1,2,3` 然后 `--scenes 4,5,6`

### 角色不一致

- 生成角色设定表: `bash scripts/bash/generate-character-sheets.sh`
- 手动标注最佳参考: 编辑 `.storyboardify/references/characters/*.json`
- 增加变体数: `--variants 5` 然后手动筛选

### 成本过高

- 使用混合模式: `--provider hybrid` (自动选择便宜的)
- 降低质量: `--quality standard`
- 减少变体: `--variants 1`
- 设置每日限额: 编辑 `.env` 的 `MAX_DAILY_COST_CNY`
