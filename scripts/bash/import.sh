#!/usr/bin/env bash
# 导入 Scriptify 剧本

# 加载通用函数库
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# 获取项目路径
PROJECT_DIR=$(get_current_project)
PROJECT_NAME=$(get_project_name)

# 检查配置文件
CONFIG_FILE=$(check_config_exists)

# 参数：剧本文件路径
SCRIPT_PATH="$1"

# 目标文件
TARGET_FILE="$PROJECT_DIR/scriptify.json"

# 检查是否已有剧本
if [ -f "$TARGET_FILE" ]; then
    # 读取现有剧本信息
    script_title=$(read_json_field "$TARGET_FILE" "title")
    scene_count=$(count_json_array "$TARGET_FILE" "scenes")
    
    output_json "{
      \"status\": \"success\",
      \"action\": \"review\",
      \"project_name\": \"$PROJECT_NAME\",
      \"script_file\": \"$TARGET_FILE\",
      \"title\": \"$script_title\",
      \"scene_count\": $scene_count,
      \"message\": \"发现已有剧本，AI 可引导用户查看或重新导入\"
    }"
else
    if [ -z "$SCRIPT_PATH" ]; then
        output_json "{
          \"status\": \"error\",
          \"message\": \"请提供 Scriptify 剧本文件路径\",
          \"suggestion\": \"使用: /import <path-to-scriptify.json>\"
        }"
        exit 1
    fi

    if [ ! -f "$SCRIPT_PATH" ]; then
        output_json "{
          \"status\": \"error\",
          \"message\": \"剧本文件不存在: $SCRIPT_PATH\"
        }"
        exit 1
    fi

    # 验证JSON格式（简单检查）
    if ! grep -q '"title"' "$SCRIPT_PATH" || ! grep -q '"scenes"' "$SCRIPT_PATH"; then
        output_json "{
          \"status\": \"error\",
          \"message\": \"文件格式不正确，不是有效的 Scriptify 剧本\"
        }"
        exit 1
    fi

    # 复制文件
    cp "$SCRIPT_PATH" "$TARGET_FILE"

    # 读取导入的剧本信息
    script_title=$(read_json_field "$TARGET_FILE" "title")
    scene_count=$(count_json_array "$TARGET_FILE" "scenes")

    output_json "{
      \"status\": \"success\",
      \"action\": \"imported\",
      \"project_name\": \"$PROJECT_NAME\",
      \"script_file\": \"$TARGET_FILE\",
      \"title\": \"$script_title\",
      \"scene_count\": $scene_count,
      \"message\": \"剧本导入成功！\",
      \"next_step\": \"运行 /preproduce 生成制作包\"
    }"
fi

