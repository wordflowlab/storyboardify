---
description: 导出分镜脚本
scripts:
  sh: ../../scripts/bash/export.sh
---

# /export - 分镜导出

> **目标**: 将分镜导出为不同格式

---

## 第一步: 运行脚本

```bash
bash scripts/bash/export.sh
```

---

## 第二步: 选择导出格式

根据工作区提供不同格式：

### 所有工作区
```
• Markdown - 通用文档格式
```

### 漫画工作区 (manga)
```
• Excel - 漫画分镜表格
```

### 短视频/动态漫 (short-video/dynamic-manga)
```
• 剪映 JSON - 导入剪映
```

---

## 第三步: 执行导出

```
正在导出分镜...

格式: [format]
输出文件: exports/[filename]

✅ 导出完成！

文件位置: [export_path]
```

---

## 可用格式

| 格式 | 适用工作区 | 用途 |
|------|-----------|------|
| Markdown | 全部 | 文档查看、打印 |
| Excel | 漫画 | 漫画分镜表 |
| 剪映JSON | 视频/动漫 | 导入剪映编辑 |

