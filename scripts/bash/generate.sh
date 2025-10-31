#!/usr/bin/env bash
# 分镜生成状态检查

# 加载通用函数库
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# 获取项目路径
PROJECT_DIR=$(get_current_project)
PROJECT_NAME=$(get_project_name)

# 检查依赖文件
CONFIG_FILE=$(check_config_exists)
SPEC_FILE="$PROJECT_DIR/spec.json"
PACK_FILE=$(check_production_pack_exists)

# 分镜文件路径
STORYBOARD_FILE="$PROJECT_DIR/storyboard.json"

# 读取配置
workspace=$(read_json_field "$SPEC_FILE" "workspace")
mode=$(read_json_field "$SPEC_FILE" "mode")
style=$(read_json_field "$SPEC_FILE" "style_preference")

# 检查是否已有分镜
if [ -f "$STORYBOARD_FILE" ]; then
    # 读取现有分镜信息
    scene_count=$(count_json_array "$STORYBOARD_FILE" "scenes")
    
    output_json "{
      \"status\": \"success\",
      \"action\": \"review\",
      \"project_name\": \"$PROJECT_NAME\",
      \"storyboard_file\": \"$STORYBOARD_FILE\",
      \"scene_count\": $scene_count,
      \"workspace\": \"$workspace\",
      \"mode\": \"$mode\",
      \"message\": \"发现已有分镜，AI 可引导用户查看或重新生成\"
    }"
else
    # 读取制作包信息
    scene_count=$(count_json_array "$PACK_FILE" "scene_sheets")
    
    # 检查模式配置
    if [ -z "$mode" ]; then
        output_json "{
          \"status\": \"error\",
          \"message\": \"未配置生成模式\",
          \"suggestion\": \"请先运行 /specify 选择模式 (express/coach/hybrid)\"
        }"
        exit 1
    fi

    output_json "{
      \"status\": \"success\",
      \"action\": \"ready\",
      \"project_name\": \"$PROJECT_NAME\",
      \"workspace\": \"$workspace\",
      \"mode\": \"$mode\",
      \"style\": \"$style\",
      \"scene_count\": $scene_count,
      \"pack_file\": \"$PACK_FILE\",
      \"message\": \"准备生成分镜\",
      \"guidance\": \"根据选择的模式 ($mode) 引导用户\"
    }"
fi

