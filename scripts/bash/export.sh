#!/usr/bin/env bash
# 导出分镜脚本

# 加载通用函数库
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# 获取项目路径
PROJECT_DIR=$(get_current_project)
PROJECT_NAME=$(get_project_name)

# 检查依赖文件
CONFIG_FILE=$(check_config_exists)
STORYBOARD_FILE="$PROJECT_DIR/storyboard.json"

# 检查分镜文件
if [ ! -f "$STORYBOARD_FILE" ]; then
    output_json "{
      \"status\": \"error\",
      \"message\": \"分镜文件不存在\",
      \"suggestion\": \"请先运行 /generate 生成分镜\"
    }"
    exit 1
fi

# 读取分镜信息
scene_count=$(count_json_array "$STORYBOARD_FILE" "scenes")
workspace=$(read_json_field "$STORYBOARD_FILE" "workspace")

# 检查已有导出
EXPORT_DIR="$PROJECT_DIR/exports"
mkdir -p "$EXPORT_DIR"

# 列出可用的导出格式
available_formats="markdown"
if [ "$workspace" = "manga" ]; then
    available_formats="$available_formats, excel"
elif [ "$workspace" = "short-video" ] || [ "$workspace" = "dynamic-manga" ]; then
    available_formats="$available_formats, jianying"
fi

# 列出已导出的文件
exported_files=""
if [ -d "$EXPORT_DIR" ] && [ "$(ls -A $EXPORT_DIR 2>/dev/null)" ]; then
    exported_files=$(ls -1 "$EXPORT_DIR" | tr '\n' ', ' | sed 's/,$//')
fi

output_json "{
  \"status\": \"success\",
  \"action\": \"export\",
  \"project_name\": \"$PROJECT_NAME\",
  \"storyboard_file\": \"$STORYBOARD_FILE\",
  \"scene_count\": $scene_count,
  \"workspace\": \"$workspace\",
  \"export_dir\": \"$EXPORT_DIR\",
  \"available_formats\": \"$available_formats\",
  \"exported_files\": \"$exported_files\",
  \"message\": \"准备导出分镜\",
  \"guidance\": \"引导用户选择导出格式: $available_formats\"
}"

