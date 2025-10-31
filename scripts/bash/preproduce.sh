#!/usr/bin/env bash
# 生成制作包（人物+场景设定表）

# 加载通用函数库
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# 获取项目路径
PROJECT_DIR=$(get_current_project)
PROJECT_NAME=$(get_project_name)

# 检查依赖文件
CONFIG_FILE=$(check_config_exists)
SCRIPT_FILE=$(check_script_exists)

# 制作包文件路径
PACK_FILE="$PROJECT_DIR/production-pack.json"

# 检查是否已有制作包
if [ -f "$PACK_FILE" ]; then
    # 读取现有制作包信息
    character_count=$(count_json_array "$PACK_FILE" "characters")
    scene_count=$(count_json_array "$PACK_FILE" "scene_sheets")
    
    output_json "{
      \"status\": \"success\",
      \"action\": \"review\",
      \"project_name\": \"$PROJECT_NAME\",
      \"pack_file\": \"$PACK_FILE\",
      \"character_count\": $character_count,
      \"scene_count\": $scene_count,
      \"message\": \"发现已有制作包，AI 可引导用户查看或重新生成\"
    }"
else
    # 读取剧本信息
    script_title=$(read_json_field "$SCRIPT_FILE" "title")
    scene_count=$(count_json_array "$SCRIPT_FILE" "scenes")
    character_count=$(count_json_array "$SCRIPT_FILE" "characters")

    # 创建制作包模板
    cat > "$PACK_FILE" <<EOF
{
  "source_data": $(cat "$SCRIPT_FILE"),
  "characters": [],
  "scene_sheets": [],
  "metadata": {
    "title": "$script_title",
    "generated_at": "$(get_timestamp)",
    "scene_count": $scene_count,
    "character_count": $character_count
  }
}
EOF

    output_json "{
      \"status\": \"success\",
      \"action\": \"create\",
      \"project_name\": \"$PROJECT_NAME\",
      \"pack_file\": \"$PACK_FILE\",
      \"script_title\": \"$script_title\",
      \"scene_count\": $scene_count,
      \"character_count\": $character_count,
      \"message\": \"已创建制作包模板，AI 应引导生成人物和场景设定表\",
      \"guidance\": \"需要为每个角色生成：外观、性格、绘画提示词；为每个场景生成：布局、光源、色调、氛围\"
    }"
fi

