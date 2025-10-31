#!/usr/bin/env bash
# 通用函数库 - Storyboardify

# 获取 Storyboardify 项目根目录
get_storyboardify_root() {
    # 查找包含 .storyboardify/config.json 的项目根目录
    if [ -f ".storyboardify/config.json" ]; then
        pwd
    else
        # 向上查找包含 .storyboardify 的目录
        current=$(pwd)
        while [ "$current" != "/" ]; do
            if [ -f "$current/.storyboardify/config.json" ]; then
                echo "$current"
                return 0
            fi
            current=$(dirname "$current")
        done
        echo "错误: 未找到 storyboardify 项目根目录" >&2
        echo "提示: 请在 storyboardify 项目目录内运行，或先运行 'storyboardify init <项目名>' 创建项目" >&2
        exit 1
    fi
}

# 获取当前项目目录
get_current_project() {
    get_storyboardify_root
}

# 获取项目名称（从配置文件读取）
get_project_name() {
    STORYBOARDIFY_ROOT=$(get_storyboardify_root)
    if [ -f "$STORYBOARDIFY_ROOT/.storyboardify/config.json" ]; then
        # 从 config.json 读取项目名称
        grep -o '"name"[[:space:]]*:[[:space:]]*"[^"]*"' "$STORYBOARDIFY_ROOT/.storyboardify/config.json" | \
        sed 's/"name"[[:space:]]*:[[:space:]]*"\([^"]*\)"/\1/'
    else
        basename "$STORYBOARDIFY_ROOT"
    fi
}

# 输出 JSON（用于与 AI 助手通信）
output_json() {
    echo "$1"
}

# 确保文件存在
ensure_file() {
    file="$1"
    template="$2"

    if [ ! -f "$file" ]; then
        if [ -f "$template" ]; then
            cp "$template" "$file"
        else
            touch "$file"
        fi
    fi
}

# 检查配置文件是否存在
check_config_exists() {
    PROJECT_DIR=$(get_current_project)
    CONFIG_FILE="$PROJECT_DIR/.storyboardify/config.json"

    if [ ! -f "$CONFIG_FILE" ]; then
        output_json "{
          \"status\": \"error\",
          \"message\": \"项目配置文件不存在\",
          \"suggestion\": \"请先运行 /specify 定义项目规格\"
        }"
        exit 1
    fi

    echo "$CONFIG_FILE"
}

# 检查剧本文件是否存在
check_script_exists() {
    PROJECT_DIR=$(get_current_project)
    SCRIPT_FILE="$PROJECT_DIR/scriptify.json"

    if [ ! -f "$SCRIPT_FILE" ]; then
        output_json "{
          \"status\": \"error\",
          \"message\": \"未找到剧本文件\",
          \"suggestion\": \"请先运行 /import 导入 Scriptify 剧本\"
        }"
        exit 1
    fi

    echo "$SCRIPT_FILE"
}

# 检查制作包是否存在
check_production_pack_exists() {
    PROJECT_DIR=$(get_current_project)
    PACK_FILE="$PROJECT_DIR/production-pack.json"

    if [ ! -f "$PACK_FILE" ]; then
        output_json "{
          \"status\": \"error\",
          \"message\": \"制作包未生成\",
          \"suggestion\": \"请先运行 /preproduce 生成制作包\"
        }"
        exit 1
    fi

    echo "$PACK_FILE"
}

# 读取 JSON 字段
read_json_field() {
    json_file="$1"
    field="$2"

    if [ ! -f "$json_file" ]; then
        echo ""
        return
    fi

    grep -o "\"$field\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" "$json_file" | \
    sed "s/\"$field\"[[:space:]]*:[[:space:]]*\"\([^\"]*\)\"/\1/"
}

# 获取时间戳
get_timestamp() {
    date '+%Y-%m-%d %H:%M:%S'
}

# 计数 JSON 数组长度
count_json_array() {
    json_file="$1"
    array_name="$2"

    if [ ! -f "$json_file" ]; then
        echo "0"
        return
    fi

    # 简单计数 - 查找数组中的对象数量
    grep -o "\"$array_name\"[[:space:]]*:[[:space:]]*\[" "$json_file" >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        # 提取数组内容并计数对象
        sed -n "/\"$array_name\"[[:space:]]*:[[:space:]]*\[/,/\]/p" "$json_file" | \
        grep -c "{"
    else
        echo "0"
    fi
}
