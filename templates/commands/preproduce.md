---
description: 生成制作包（人物+场景设定表）
scripts:
  sh: ../../scripts/bash/preproduce.sh
---

# /preproduce - 制作包生成

> **目标**: 从剧本生成人物设定表和场景设定表

---

## 第一步: 运行脚本

```bash
bash scripts/bash/preproduce.sh
```

---

## 第二步: 生成制作包内容

### 为每个角色生成设定表

```
正在为角色生成设定表...

角色: [character_name]

1. 外观描述
2. 性格特点
3. MidJourney/SD 绘画提示词
```

### 为每个场景生成设定表

```
正在为场景生成设定表...

场景: [scene_name]

1. 场景布局
2. 光源设置
3. 色调氛围
4. 绘画提示词
```

---

## 第三步: 保存制作包

使用 Write 工具更新 `production-pack.json`

```
✅ 制作包生成完成！

人物设定: [character_count] 个
场景设定: [scene_count] 个

下一步：
  • /generate - 生成分镜脚本
```

