/**
 * /preproduce 命令实现
 * 生成制作包(人物设定表 + 场景设定表)
 */

import chalk from 'chalk';
import path from 'path';
import {
  readProjectConfig,
  readJSON,
  writeJSON,
  getProjectFilePaths,
  ensureDir,
} from '../utils/index.js';
import { generateCharacterSheets, exportCharacterSheetToMarkdown } from '../generators/character-sheet.js';
import { generateSceneSheets, exportSceneSheetToMarkdown } from '../generators/scene-sheet.js';
import type { ScriptifyExport, ProductionPack } from '../types/index.js';
import fs from 'fs-extra';

/**
 * 执行 preproduce 命令
 */
export async function executePreproduceCommand(projectPath?: string): Promise<void> {
  console.log(chalk.blue('🎨 开始生成制作包\n'));

  // 1. 确定项目路径
  const resolvedPath = projectPath || process.cwd();
  const configPath = path.join(resolvedPath, '.storyboardify');

  // 检查是否是有效项目
  if (!(await fs.pathExists(configPath))) {
    console.error(
      chalk.red('❌ 当前目录不是有效的Storyboardify项目')
    );
    console.log(chalk.gray('提示: 请先运行 storyboardify import <file> 导入剧本'));
    process.exit(1);
  }

  // 2. 读取项目配置
  const config = await readProjectConfig(resolvedPath);
  if (!config) {
    console.error(chalk.red('❌ 无法读取项目配置'));
    process.exit(1);
  }

  console.log(chalk.gray(`项目: ${config.project_name}`));
  console.log(chalk.gray(`工作区: ${config.workspace}\n`));

  // 3. 读取Scriptify导入数据
  if (!config.files.scriptify_import) {
    console.error(chalk.red('❌ 未找到Scriptify导入数据'));
    console.log(chalk.gray('提示: 请先运行 storyboardify import <file>'));
    process.exit(1);
  }

  const scriptifyData = await readJSON<ScriptifyExport>(config.files.scriptify_import);
  console.log(chalk.blue('📖 已读取Scriptify数据'));
  console.log(chalk.gray(`  - 角色数: ${scriptifyData.characters.length}`));
  console.log(chalk.gray(`  - 场景数: ${scriptifyData.scenes.length}\n`));

  // 4. 生成人物设定表
  console.log(chalk.blue('👥 生成人物设定表...'));
  const characterSheets = generateCharacterSheets(scriptifyData.characters);
  console.log(chalk.green(`✓ 已生成 ${characterSheets.length} 个人物设定表`));

  // 5. 生成场景设定表
  console.log(chalk.blue('🎬 生成场景设定表...'));
  const sceneSheets = generateSceneSheets(scriptifyData.scenes);
  console.log(chalk.green(`✓ 已生成 ${sceneSheets.length} 个场景设定表\n`));

  // 6. 创建制作包数据
  const productionPack: ProductionPack = {
    project: scriptifyData.project,
    character_sheets: characterSheets,
    scene_sheets: sceneSheets,
    source_data: scriptifyData, // 保存原始数据引用
  };

  // 7. 保存制作包JSON
  const filePaths = getProjectFilePaths(resolvedPath);
  await writeJSON(filePaths.productionPack, productionPack);
  console.log(chalk.green('✓ 已保存制作包数据: production-pack.json'));

  // 8. 导出Markdown格式
  await exportProductionPackToMarkdown(resolvedPath, productionPack);
  console.log(chalk.green('✓ 已导出Markdown文件到 docs/ 目录'));

  // 9. 更新项目配置
  config.files.production_pack = filePaths.productionPack;
  config.last_modified = new Date().toISOString();
  const configFilePath = path.join(resolvedPath, '.storyboardify', 'config.json');
  await writeJSON(configFilePath, config);

  // 10. 显示下一步提示
  console.log(chalk.blue('\n📋 制作包内容:'));
  console.log(chalk.gray(`  - ${characterSheets.length} 个人物设定表`));
  console.log(chalk.gray(`  - ${sceneSheets.length} 个场景设定表`));

  console.log(chalk.blue('\n📁 输出文件:'));
  console.log(chalk.gray('  - production-pack.json (JSON数据)'));
  console.log(chalk.gray('  - docs/characters/ (人物Markdown)'));
  console.log(chalk.gray('  - docs/scenes/ (场景Markdown)'));

  console.log(chalk.blue('\n📋 下一步操作:'));
  console.log(chalk.gray('  - 运行 storyboardify generate 生成分镜脚本'));
  console.log(chalk.gray('  - 或编辑 production-pack.json 手动调整设定表'));

  console.log(chalk.blue('\n✅ 制作包生成完成!'));
}

/**
 * 导出制作包为Markdown文件
 */
async function exportProductionPackToMarkdown(
  projectPath: string,
  productionPack: ProductionPack
): Promise<void> {
  const docsDir = path.join(projectPath, 'docs');
  const charactersDir = path.join(docsDir, 'characters');
  const scenesDir = path.join(docsDir, 'scenes');

  // 创建目录
  await ensureDir(charactersDir);
  await ensureDir(scenesDir);

  // 导出人物设定表
  for (const sheet of productionPack.character_sheets) {
    const markdown = exportCharacterSheetToMarkdown(sheet);
    const filename = `${sheet.id}-${sheet.name}.md`;
    const filepath = path.join(charactersDir, filename);
    await fs.writeFile(filepath, markdown, 'utf-8');
  }

  // 导出场景设定表
  for (const sheet of productionPack.scene_sheets) {
    const markdown = exportSceneSheetToMarkdown(sheet);
    const filename = `${sheet.id}-${sheet.name}.md`;
    const filepath = path.join(scenesDir, filename);
    await fs.writeFile(filepath, markdown, 'utf-8');
  }

  // 创建总览文件
  const overviewLines: string[] = [];
  overviewLines.push(`# ${productionPack.project.name} - 制作包`);
  overviewLines.push('');
  overviewLines.push(`**项目类型**: ${productionPack.project.type}`);
  overviewLines.push(`**集数**: ${productionPack.project.episodes}`);
  overviewLines.push(`**类型**: ${productionPack.project.genre.join(', ')}`);
  overviewLines.push('');

  overviewLines.push('## 人物设定表');
  overviewLines.push('');
  productionPack.character_sheets.forEach((sheet) => {
    overviewLines.push(
      `- [${sheet.name}](./characters/${sheet.id}-${sheet.name}.md) - ${sheet.role}`
    );
  });
  overviewLines.push('');

  overviewLines.push('## 场景设定表');
  overviewLines.push('');
  productionPack.scene_sheets.forEach((sheet) => {
    overviewLines.push(
      `- [${sheet.name}](./scenes/${sheet.id}-${sheet.name}.md) - ${sheet.location}`
    );
  });
  overviewLines.push('');

  const overviewPath = path.join(docsDir, 'production-pack-overview.md');
  await fs.writeFile(overviewPath, overviewLines.join('\n'), 'utf-8');
}
