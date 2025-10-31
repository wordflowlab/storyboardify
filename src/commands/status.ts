/**
 * /status 命令实现
 * 查看当前项目状态
 */

import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import { readProjectConfig, readJSON } from '../utils/index.js';
import { WORKSPACE_CONFIGS } from '../workspaces/configs.js';
import type { Storyboard, ProductionPack, ScriptifyExport } from '../types/index.js';

/**
 * 执行 status 命令
 */
export async function executeStatusCommand(projectPath?: string): Promise<void> {
  // 1. 确定项目路径
  const resolvedPath = projectPath || process.cwd();
  const configPath = path.join(resolvedPath, '.storyboardify');

  // 检查是否是有效项目
  if (!(await fs.pathExists(configPath))) {
    console.error(chalk.red('❌ 当前目录不是有效的Storyboardify项目'));
    console.log(chalk.gray('\n提示: 运行 storyboardify specify 创建新项目'));
    console.log(chalk.gray('或者 cd 到现有项目目录'));
    process.exit(1);
  }

  // 2. 读取项目配置
  const config = await readProjectConfig(resolvedPath);
  if (!config) {
    console.error(chalk.red('❌ 无法读取项目配置'));
    process.exit(1);
  }

  // 3. 显示项目基本信息
  console.log(chalk.blue('📊 项目状态\n'));
  console.log(chalk.bold(`项目名称: ${config.project_name}`));
  console.log(
    chalk.gray(`工作区: ${WORKSPACE_CONFIGS[config.workspace]?.display_name || config.workspace}`)
  );
  console.log(
    chalk.gray(
      `生成模式: ${config.mode === 'express' ? '快速模式' : config.mode === 'coach' ? '教练模式' : '混合模式'}`
    )
  );
  console.log(
    chalk.gray(`最后修改: ${new Date(config.last_modified).toLocaleString('zh-CN')}`)
  );
  console.log(chalk.gray(`项目路径: ${resolvedPath}\n`));

  // 4. 检查工作流状态
  console.log(chalk.blue('📋 工作流状态\n'));

  const workflow = [
    {
      step: '1. 导入剧本',
      file: config.files.scriptify_import,
      command: 'storyboardify import <file>',
    },
    {
      step: '2. 生成制作包',
      file: config.files.production_pack,
      command: 'storyboardify preproduce',
    },
    {
      step: '3. 生成分镜',
      file: config.files.storyboard,
      command: 'storyboardify generate',
    },
  ];

  for (const item of workflow) {
    const status = item.file ? '✅' : '⏸️';
    const statusText = item.file ? chalk.green('已完成') : chalk.yellow('待执行');
    console.log(`${status} ${chalk.bold(item.step)}: ${statusText}`);

    if (item.file) {
      const exists = await fs.pathExists(item.file);
      if (exists) {
        const stats = await fs.stat(item.file);
        const sizeKB = (stats.size / 1024).toFixed(2);
        console.log(chalk.gray(`   文件: ${path.basename(item.file)} (${sizeKB} KB)`));
      } else {
        console.log(chalk.red(`   ⚠ 文件不存在: ${item.file}`));
      }
    } else {
      console.log(chalk.gray(`   运行: ${item.command}`));
    }
    console.log('');
  }

  // 5. 显示详细统计
  await displayDetailedStats(config, resolvedPath);

  // 6. 显示导出状态
  await displayExportStatus(config, resolvedPath);

  // 7. 显示下一步建议
  displayNextSteps(config);
}

/**
 * 显示详细统计信息
 */
async function displayDetailedStats(config: any, _projectPath: string): Promise<void> {
  console.log(chalk.blue('📈 详细统计\n'));

  // Scriptify 导入数据
  if (config.files.scriptify_import) {
    try {
      const scriptifyData = await readJSON<ScriptifyExport>(config.files.scriptify_import);
      console.log(chalk.bold('导入数据:'));
      console.log(chalk.gray(`  - 角色数: ${scriptifyData.characters.length}`));
      console.log(chalk.gray(`  - 场景数: ${scriptifyData.scenes.length}`));
      console.log(chalk.gray(`  - 剧本集数: ${scriptifyData.scripts.length}`));
      if (scriptifyData.scripts[0]) {
        console.log(chalk.gray(`  - 总字数: ${scriptifyData.scripts[0].word_count}`));
      }
      console.log('');
    } catch (error) {
      console.log(chalk.yellow('  无法读取导入数据\n'));
    }
  }

  // 制作包数据
  if (config.files.production_pack) {
    try {
      const productionPack = await readJSON<ProductionPack>(config.files.production_pack);
      console.log(chalk.bold('制作包:'));
      console.log(chalk.gray(`  - 人物设定表: ${productionPack.character_sheets.length}`));
      console.log(chalk.gray(`  - 场景设定表: ${productionPack.scene_sheets.length}`));
      console.log('');
    } catch (error) {
      console.log(chalk.yellow('  无法读取制作包数据\n'));
    }
  }

  // 分镜数据
  if (config.files.storyboard) {
    try {
      const storyboard = await readJSON<Storyboard>(config.files.storyboard);
      console.log(chalk.bold('分镜脚本:'));
      console.log(chalk.gray(`  - 场景数: ${storyboard.scenes.length}`));
      console.log(chalk.gray(`  - 总镜头数: ${storyboard.metadata.total_shots}`));
      if (storyboard.metadata.estimated_duration) {
        console.log(chalk.gray(`  - 预估时长: ${storyboard.metadata.estimated_duration}`));
      }
      if (storyboard.metadata.estimated_pages) {
        console.log(chalk.gray(`  - 预估页数: ${storyboard.metadata.estimated_pages}`));
      }
      console.log('');
    } catch (error) {
      console.log(chalk.yellow('  无法读取分镜数据\n'));
    }
  }
}

/**
 * 显示导出状态
 */
async function displayExportStatus(_config: any, projectPath: string): Promise<void> {
  const exportsDir = path.join(projectPath, 'exports');
  if (!(await fs.pathExists(exportsDir))) {
    return;
  }

  const exportFiles = await fs.readdir(exportsDir);
  if (exportFiles.length === 0) {
    return;
  }

  console.log(chalk.blue('📤 已导出文件\n'));
  for (const file of exportFiles) {
    const filePath = path.join(exportsDir, file);
    const stats = await fs.stat(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(chalk.gray(`  ✓ ${file} (${sizeKB} KB)`));
  }
  console.log('');
}

/**
 * 显示下一步建议
 */
function displayNextSteps(config: { files: any }): void {
  console.log(chalk.blue('💡 建议的下一步操作\n'));

  if (!config.files.scriptify_import) {
    console.log(chalk.yellow('  → 运行 storyboardify import <file> 导入剧本'));
  } else if (!config.files.production_pack) {
    console.log(chalk.yellow('  → 运行 storyboardify preproduce 生成制作包'));
  } else if (!config.files.storyboard) {
    console.log(chalk.yellow('  → 运行 storyboardify generate 生成分镜脚本'));
  } else {
    console.log(chalk.green('  ✓ 工作流已完成!'));
    console.log(chalk.gray('  → 运行 storyboardify export 导出最终文件'));
    console.log(chalk.gray('  → 或编辑 storyboard.json 手动调整分镜'));
  }
  console.log('');
}
