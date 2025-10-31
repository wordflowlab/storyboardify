---
description: Express 模式 - 全自动分镜生成
scripts:
  sh: ../../scripts/bash/generate.sh
---

# /generate-express - Express 模式

> **模式**: 全自动AI生成 (1-2分钟)

---

## 第一步: 运行脚本

```bash
bash scripts/bash/generate.sh
```

---

## 第二步: AI 自动生成分镜

为每个场景自动生成镜头，包括：
- 景别选择（远景/全景/中景/近景/特写）
- 相机角度（平视/俯视/仰视/斜角）
- 运镜方式（推/拉/摇/移/跟/静止）
- 画面内容描述
- 镜头时长

---

## 第三步: 保存分镜

使用 Write 工具创建 `storyboard.json`

```
✅ 分镜生成完成！

场景数: [scene_count]
镜头总数: [shot_count]

下一步：
  • /export - 导出分镜脚本
```

