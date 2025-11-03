#!/usr/bin/env bash
# generate-images.sh - 批量生成分镜图片

set -e

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 加载通用函数
source "$SCRIPT_DIR/common.sh"

# 获取项目根目录
PROJECT_ROOT=$(get_storyboardify_root)
PROJECT_NAME=$(get_project_name)

# 默认配置
PROVIDER="hybrid"
QUALITY="high"
VARIANTS=2
OUTPUT_DIR="$PROJECT_ROOT/output/images"
DOWNLOAD=true
COST_STATS_ONLY=false

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        --provider)
            PROVIDER="$2"
            shift 2
            ;;
        --quality)
            QUALITY="$2"
            shift 2
            ;;
        --variants)
            VARIANTS="$2"
            shift 2
            ;;
        --output)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        --no-download)
            DOWNLOAD=false
            shift
            ;;
        --cost-stats)
            COST_STATS_ONLY=true
            shift
            ;;
        --help)
            echo "用法: $0 [选项]"
            echo ""
            echo "选项:"
            echo "  --provider <type>    图片生成提供商 (volcano|aliyun|hybrid, 默认: hybrid)"
            echo "  --quality <level>    图片质量 (standard|high|ultra, 默认: high)"
            echo "  --variants <num>     每镜头生成变体数 (1-5, 默认: 2)"
            echo "  --output <dir>       输出目录 (默认: output/images)"
            echo "  --no-download        仅生成 URL,不下载图片"
            echo "  --cost-stats         仅显示成本统计"
            echo "  --help               显示此帮助信息"
            exit 0
            ;;
        *)
            echo "未知选项: $1" >&2
            echo "运行 $0 --help 查看帮助" >&2
            exit 1
            ;;
    esac
done

# 检查必需文件
if [ ! -f "$PROJECT_ROOT/.env" ]; then
    output_json '{
        "status": "error",
        "message": "未找到 .env 配置文件",
        "suggestion": "请先配置 API 密钥: cp .env.template .env && vi .env",
        "project_name": "'"$PROJECT_NAME"'"
    }'
    exit 1
fi

if [ ! -f "$PROJECT_ROOT/storyboard.json" ]; then
    output_json '{
        "status": "error",
        "message": "未找到分镜脚本",
        "suggestion": "请先运行以下命令生成分镜脚本: /specify, /import, /preproduce, /generate-express",
        "project_name": "'"$PROJECT_NAME"'"
    }'
    exit 1
fi

# 如果只查看成本统计
if [ "$COST_STATS_ONLY" = true ]; then
    output_json '{
        "status": "info",
        "action": "cost_stats",
        "message": "成本统计查询",
        "project_name": "'"$PROJECT_NAME"'",
        "config": {
            "provider": "'"$PROVIDER"'",
            "quality": "'"$QUALITY"'",
            "variants": '"$VARIANTS"'
        }
    }'
    exit 0
fi

# 检查 scriptify-import.json (用于角色和场景信息)
SCRIPTIFY_FILE="$PROJECT_ROOT/scriptify-import.json"
if [ ! -f "$SCRIPTIFY_FILE" ]; then
    SCRIPTIFY_FILE="$PROJECT_ROOT/scriptify.json"
fi

if [ ! -f "$SCRIPTIFY_FILE" ]; then
    output_json '{
        "status": "error",
        "message": "未找到 Scriptify 导入文件",
        "suggestion": "请先运行 /import 导入剧本",
        "project_name": "'"$PROJECT_NAME"'"
    }'
    exit 1
fi

# 创建输出目录
mkdir -p "$OUTPUT_DIR"
mkdir -p "$PROJECT_ROOT/output/prompts"
mkdir -p "$PROJECT_ROOT/.storyboardify/references"

# 读取分镜脚本统计信息
STORYBOARD_FILE="$PROJECT_ROOT/storyboard.json"
TOTAL_SCENES=$(grep -o '"scene_id"' "$STORYBOARD_FILE" | wc -l | tr -d ' ')
TOTAL_SHOTS=$(grep -o '"shot_number"' "$STORYBOARD_FILE" | wc -l | tr -d ' ')

# 成本预估
case $PROVIDER in
    volcano)
        case $QUALITY in
            standard) UNIT_COST=0.08 ;;
            high) UNIT_COST=0.12 ;;
            ultra) UNIT_COST=0.18 ;;
        esac
        ;;
    aliyun)
        case $QUALITY in
            standard) UNIT_COST=0.06 ;;
            high) UNIT_COST=0.08 ;;
            ultra) UNIT_COST=0.10 ;;
        esac
        ;;
    hybrid)
        # Hybrid 模式使用阿里云价格 (通常更便宜)
        case $QUALITY in
            standard) UNIT_COST=0.06 ;;
            high) UNIT_COST=0.08 ;;
            ultra) UNIT_COST=0.10 ;;
        esac
        ;;
esac

ESTIMATED_COST=$(echo "$TOTAL_SHOTS * $VARIANTS * $UNIT_COST" | bc -l)
ESTIMATED_COST=$(printf "%.2f" "$ESTIMATED_COST")

# 输出配置信息
output_json '{
    "status": "success",
    "action": "start_generation",
    "message": "开始批量生成图片",
    "project_name": "'"$PROJECT_NAME"'",
    "config": {
        "provider": "'"$PROVIDER"'",
        "quality": "'"$QUALITY"'",
        "variants": '"$VARIANTS"',
        "download": '"$DOWNLOAD"',
        "output_dir": "'"$OUTPUT_DIR"'"
    },
    "storyboard": {
        "total_scenes": '"$TOTAL_SCENES"',
        "total_shots": '"$TOTAL_SHOTS"'
    },
    "cost_estimate": {
        "unit_cost": '"$UNIT_COST"',
        "estimated_total": '"$ESTIMATED_COST"',
        "currency": "CNY"
    },
    "next_step": "AI 将调用图片生成模块执行批量生成"
}'

exit 0
