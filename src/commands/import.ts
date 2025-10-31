/**
 * /import 命令实现
 */

import chalk from 'chalk';
import { importScriptify, detectMissingFields, printMissingFieldsReport } from '../importers/scriptify.js';
import {
  ensureProjectDir,
  writeProjectConfig,
  writeJSON,
  getProjectFilePaths,
  readProjectConfig,
} from '../utils/index.js';
import type { ProjectState } from '../types/index.js';

/**
 * 执行import命令
 */
export async function executeImportCommand(file: string): Promise<void> {
  console.log(chalk.blue('📥 开始导入Scriptify剧本\n'));

  // 1. 导入并验证Scriptify JSON
  const scriptify = await importScriptify(file);

  // 2. 检测缺失字段
  const missing = detectMissingFields(scriptify);
  printMissingFieldsReport(missing);

  // 3. 创建或更新项目
  const projectName = scriptify.project.name;
  const projectPath = await ensureProjectDir(projectName);

  console.log(chalk.blue(`\n📁 项目路径: ${projectPath}`));

  // 4. 检查是否已存在项目配置
  const existingConfig = await readProjectConfig(projectPath);
  if (existingConfig) {
    console.log(chalk.yellow('\n⚠ 检测到现有项目,将覆盖Scriptify导入数据'));
    // TODO: 添加用户确认提示 (Phase 1.5 - Inquirer集成)
  }

  // 5. 保存Scriptify导入数据
  const filePaths = getProjectFilePaths(projectPath);
  await writeJSON(filePaths.scriptifyImport, scriptify);
  console.log(chalk.green(`✓ 已保存导入数据: scriptify-import.json`));

  // 6. 创建/更新项目配置
  const config: ProjectState = {
    version: '1.0',
    project_name: projectName,
    workspace: existingConfig?.workspace || 'manga', // 默认漫画工作区
    mode: existingConfig?.mode || 'express', // 默认Express模式
    last_modified: new Date().toISOString(),
    files: {
      scriptify_import: filePaths.scriptifyImport,
      production_pack: existingConfig?.files.production_pack,
      storyboard: existingConfig?.files.storyboard,
    },
  };

  await writeProjectConfig(projectPath, config);
  console.log(chalk.green(`✓ 已更新项目配置: .storyboardify/config.json`));

  // 7. 显示下一步提示
  console.log(chalk.blue('\n📋 下一步操作:'));
  console.log(
    chalk.gray(
      '  1. 运行 /preproduce 生成人物和场景设定表'
    )
  );
  console.log(
    chalk.gray('  2. 运行 /generate 生成分镜脚本')
  );
  console.log(chalk.gray('  3. 运行 /export 导出最终文件'));
  console.log(chalk.blue(`\n✅ 导入完成!`));
}
