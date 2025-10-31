#!/usr/bin/env bash
# 定义/更新项目规格

# 加载通用函数库
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# 获取项目路径
PROJECT_DIR=$(get_current_project)
PROJECT_NAME=$(get_project_name)

# 配置文件路径
CONFIG_FILE="$PROJECT_DIR/.storyboardify/config.json"
SPEC_FILE="$PROJECT_DIR/spec.json"

# 检查是否已有配置
if [ -f "$CONFIG_FILE" ] && [ -f "$SPEC_FILE" ]; then
    # 读取现有配置
    workspace=$(read_json_field "$SPEC_FILE" "workspace")
    mode=$(read_json_field "$SPEC_FILE" "mode")
    style=$(read_json_field "$SPEC_FILE" "style_preference")
    
    config_content=$(cat "$CONFIG_FILE")
    spec_content=$(cat "$SPEC_FILE")

    output_json "{
      \"status\": \"success\",
      \"action\": \"review\",
      \"project_name\": \"$PROJECT_NAME\",
      \"project_dir\": \"$PROJECT_DIR\",
      \"config_file\": \"$CONFIG_FILE\",
      \"spec_file\": \"$SPEC_FILE\",
      \"config\": $config_content,
      \"spec\": $spec_content,
      \"workspace\": \"$workspace\",
      \"mode\": \"$mode\",
      \"style\": \"$style\",
      \"message\": \"发现现有配置，AI 可引导用户审查或修改\"
    }"
else
    # 创建新配置
    mkdir -p "$PROJECT_DIR/.storyboardify"
    
    # 创建默认配置
    cat > "$CONFIG_FILE" <<EOF
{
  "name": "$PROJECT_NAME",
  "type": "storyboardify-project",
  "created": "$(get_timestamp)",
  "version": "1.0.0"
}
EOF

    # 创建规格模板
    cat > "$SPEC_FILE" <<EOF
{
  "workspace": "",
  "mode": "",
  "style_preference": "",
  "detail_level": "detailed",
  "created": "$(get_timestamp)"
}
EOF

    output_json "{
      \"status\": \"success\",
      \"action\": \"create\",
      \"project_name\": \"$PROJECT_NAME\",
      \"project_dir\": \"$PROJECT_DIR\",
      \"config_file\": \"$CONFIG_FILE\",
      \"spec_file\": \"$SPEC_FILE\",
      \"message\": \"已创建配置模板，AI 应引导用户填写\",
      \"guidance\": \"引导用户选择工作区(manga/short-video/dynamic-manga)、生成模式(express/coach/hybrid)、风格偏好等\"
    }"
fi

