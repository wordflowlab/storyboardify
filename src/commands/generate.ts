/**
 * /generate 命令实现
 * 生成分镜脚本
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs-extra';
import {
  readProjectConfig,
  readJSON,
  writeJSON,
  getProjectFilePaths,
} from '../utils/index.js';
import { generateMockStoryboard } from '../generators/mock-storyboard.js';
import { CoachMode, HybridMode, ExpressMode } from '../modes/index.js';
import type { ProductionPack, GenerationMode } from '../types/index.js';

/**
 * 执行 generate 命令
 */
export async function executeGenerateCommand(
  mode?: GenerationMode,
  projectPath?: string
): Promise<void> {
  console.log(chalk.blue('🎬 开始生成分镜脚本\n'));

  // 1. 确定项目路径
  const resolvedPath = projectPath || process.cwd();
  const configPath = path.join(resolvedPath, '.storyboardify');

  // 检查是否是有效项目
  if (!(await fs.pathExists(configPath))) {
    console.error(chalk.red('❌ 当前目录不是有效的Storyboardify项目'));
    console.log(chalk.gray('提示: 请先运行 storyboardify import <file> 导入剧本'));
    process.exit(1);
  }

  // 2. 读取项目配置
  const config = await readProjectConfig(resolvedPath);
  if (!config) {
    console.error(chalk.red('❌ 无法读取项目配置'));
    process.exit(1);
  }

  // 使用参数指定的模式或配置中的模式
  const generationMode = mode || config.mode;

  console.log(chalk.gray(`项目: ${config.project_name}`));
  console.log(chalk.gray(`工作区: ${config.workspace}`));
  console.log(chalk.gray(`生成模式: ${generationMode}\n`));

  // 3. 检查制作包是否存在
  if (!config.files.production_pack) {
    console.error(chalk.red('❌ 未找到制作包数据'));
    console.log(chalk.gray('提示: 请先运行 storyboardify preproduce 生成制作包'));
    process.exit(1);
  }

  // 4. 读取制作包数据
  const productionPack = await readJSON<ProductionPack>(config.files.production_pack);
  console.log(chalk.blue('📖 已读取制作包数据'));
  console.log(chalk.gray(`  - 角色数: ${productionPack.character_sheets.length}`));
  console.log(chalk.gray(`  - 场景数: ${productionPack.scene_sheets.length}\n`));

  // 5. 选择生成模式 (if not specified)
  let selectedMode = generationMode;

  if (!mode) {
    selectedMode = await inquirer.prompt([
      {
        type: 'list',
        name: 'mode',
        message: '选择分镜生成模式:',
        choices: [
          {
            name: '⚡ Express 模式 (全自动AI生成) - 快速 (1-2分钟)',
            value: 'express',
          },
          {
            name: '🎓 Coach 模式 (AI引导学习) - 互动 (10-20分钟)',
            value: 'coach',
          },
          {
            name: '🎨 Hybrid 模式 (AI框架+人工定制) - 专业 (20-30分钟)',
            value: 'hybrid',
          },
        ],
        default: 'express',
      },
    ]).then(answers => answers.mode as GenerationMode);
  }

  // 6. 选择生成器类型
  const { useAI } = await inquirer.prompt([
    {
      type: 'list',
      name: 'useAI',
      message: '选择分镜生成方式:',
      choices: [
        {
          name: '🤖 AI驱动生成 (智能场景拆分 + 运镜优化) - 推荐',
          value: true,
        },
        {
          name: '📋 简化Mock生成 (算法式,快速演示)',
          value: false,
        },
      ],
      default: true,
    },
  ]);

  // 7. 生成分镜
  let storyboard;

  if (useAI) {
    console.log(chalk.blue(`\n🤖 使用AI驱动的${selectedMode}模式生成分镜...\n`));

    const modeInstance = createMode(selectedMode, process.cwd());

    storyboard = await modeInstance.generate(productionPack, {
      workspace: config.workspace,
      style_preference: 'dynamic',
      detail_level: 'detailed',
    });
  } else {
    console.log(chalk.blue('\n📋 使用简化Mock生成器...\n'));
    console.log(chalk.yellow('注意: Mock生成器仅用于快速演示'));
    console.log(chalk.gray('推荐使用AI驱动生成获得更好的效果\n'));
    storyboard = generateMockStoryboard(productionPack, config.workspace, selectedMode);
  }

  console.log(chalk.green(`\n✓ 已生成分镜脚本`));
  console.log(chalk.gray(`  - 场景数: ${storyboard.scenes.length}`));
  console.log(chalk.gray(`  - 总镜头数: ${storyboard.metadata.total_shots}`));

  if (storyboard.metadata.estimated_duration) {
    console.log(chalk.gray(`  - 预估时长: ${storyboard.metadata.estimated_duration}`));
  }
  if (storyboard.metadata.estimated_pages) {
    console.log(chalk.gray(`  - 预估页数: ${storyboard.metadata.estimated_pages}`));
  }
  console.log('');

  // 8. 保存分镜数据
  const filePaths = getProjectFilePaths(resolvedPath);
  await writeJSON(filePaths.storyboard, storyboard);
  console.log(chalk.green('\n✓ 已保存分镜数据: storyboard.json'));

  // 9. 更新项目配置
  config.files.storyboard = filePaths.storyboard;
  config.mode = selectedMode;
  config.last_modified = new Date().toISOString();
  const configFilePath = path.join(resolvedPath, '.storyboardify', 'config.json');
  await writeJSON(configFilePath, config);

  // 9. 显示详细统计和预览
  console.log(chalk.blue('\n📊 分镜脚本统计:'));
  console.log(chalk.gray(`  场景总数: ${storyboard.scenes.length}`));
  console.log(chalk.gray(`  镜头总数: ${storyboard.metadata.total_shots}`));
  if (storyboard.metadata.estimated_duration) {
    console.log(chalk.gray(`  预估时长: ${storyboard.metadata.estimated_duration}`));
  }
  if (storyboard.metadata.estimated_pages) {
    console.log(chalk.gray(`  预估页数: ${storyboard.metadata.estimated_pages}`));
  }
  console.log(chalk.gray(`  工作区: ${storyboard.metadata.workspace_display_name}`));
  console.log(chalk.gray(`  纵横比: ${storyboard.metadata.aspect_ratio}`));

  console.log(chalk.blue('\n📋 分镜内容预览:'));
  storyboard.scenes.slice(0, 2).forEach((scene, index) => {
    console.log(chalk.gray(`  场景${index + 1}: ${scene.scene_name} (${scene.shots.length}个镜头)`));
    if (scene.shots.length > 0) {
      const firstShot = scene.shots[0];
      console.log(
        chalk.gray(
          `    镜头1: ${firstShot.shot_type} / ${firstShot.camera_angle} / ${firstShot.camera_movement?.type || '静止'}`
        )
      );
    }
  });
  if (storyboard.scenes.length > 2) {
    console.log(chalk.gray(`  ... 还有 ${storyboard.scenes.length - 2} 个场景`));
  }

  console.log(chalk.blue('\n💡 下一步操作:'));
  console.log(chalk.gray('  - 运行 storyboardify status 查看完整项目状态'));
  console.log(chalk.gray('  - 运行 storyboardify export 导出分镜脚本'));
  console.log(chalk.gray('  - 或编辑 storyboard.json 手动调整分镜'));

  console.log(chalk.green('\n✅ 分镜生成完成!'));
}

/**
 * Mode Factory
 * Create mode instance based on mode type
 */
function createMode(mode: GenerationMode, projectDir: string) {
  switch (mode) {
    case 'coach':
      return new CoachMode(projectDir);
    case 'hybrid':
      return new HybridMode(projectDir);
    case 'express':
      return new ExpressMode(projectDir);
    default:
      return new ExpressMode(projectDir);
  }
}
