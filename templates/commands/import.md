---
description: 导入 Scriptify 剧本
scripts:
  sh: ../../scripts/bash/import.sh
---

# /import - 剧本导入

> **目标**: 导入 Scriptify 生成的剧本JSON，进行验证

---

## 第一步: 运行脚本

```bash
bash scripts/bash/import.sh [剧本文件路径]
```

---

## 第二步: 处理导入结果

### 如果 action = "review"（已有剧本）

```
发现已导入的剧本：

标题: [title]
场景数: [scene_count]

是否重新导入? (y/N)
```

### 如果 action = "imported"（导入成功）

显示剧本信息并确认：

```
✅ 剧本导入成功！

标题: [title]
场景数: [scene_count]

剧本文件已保存到: scriptify.json

下一步：
  • /preproduce - 生成制作包
```

### 如果 status = "error"

```
❌ 导入失败: [error_message]

请检查：
  1. 文件路径是否正确
  2. 文件是否是有效的 Scriptify JSON
  3. 是否包含 scenes 数组
```

---

## 剧本格式要求

Scriptify 剧本必须包含：
- `title`: 剧本标题
- `scenes`: 场景数组
- `characters`: 角色列表（可选）

示例结构：
```json
{
  "title": "示例剧本",
  "scenes": [...],
  "characters": [...]
}
```

