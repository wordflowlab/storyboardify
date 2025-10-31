/**
 * /export 命令实现
 * 导出分镜脚本为指定格式
 */

import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import {
  readProjectConfig,
  readJSON,
  getProjectFilePaths,
} from '../utils/index.js';
import { getExporter, getAvailableFormats } from '../exporters/registry.js';
import type { Storyboard, ExportFormat } from '../types/index.js';

/**
 * 执行 export 命令
 */
export async function executeExportCommand(
  format: ExportFormat,
  outputPath?: string,
  projectPath?: string
): Promise<void> {
  console.log(chalk.blue(`📤 开始导出分镜脚本 (格式: ${format})\n`));

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

  console.log(chalk.gray(`项目: ${config.project_name}`));
  console.log(chalk.gray(`工作区: ${config.workspace}\n`));

  // 3. 检查分镜数据是否存在
  if (!config.files.storyboard) {
    console.error(chalk.red('❌ 未找到分镜数据'));
    console.log(chalk.gray('提示: 请先运行 storyboardify generate 生成分镜脚本'));
    process.exit(1);
  }

  // 4. 读取分镜数据
  const storyboard = await readJSON<Storyboard>(config.files.storyboard);
  console.log(chalk.blue('📖 已读取分镜数据'));
  console.log(chalk.gray(`  - 场景数: ${storyboard.scenes.length}`));
  console.log(chalk.gray(`  - 总镜头数: ${storyboard.metadata.total_shots}\n`));

  // 5. 获取导出器
  const exporter = getExporter(format);
  if (!exporter) {
    console.error(chalk.red(`❌ 不支持的导出格式: ${format}`));
    console.log(chalk.gray('\n可用格式:'));
    getAvailableFormats().forEach((f) => {
      console.log(chalk.gray(`  - ${f}`));
    });
    process.exit(1);
  }

  // 6. 验证数据
  console.log(chalk.blue('🔍 验证数据...'));
  const validation = exporter.validate(storyboard);
  if (!validation.valid) {
    console.error(chalk.red('❌ 数据验证失败:'));
    validation.errors.forEach((error) => {
      console.error(chalk.red(`  - ${error.message}`));
    });
    process.exit(1);
  }
  console.log(chalk.green('✓ 数据验证通过\n'));

  // 7. 确定输出路径
  let finalOutputPath: string;
  if (outputPath) {
    finalOutputPath = path.isAbsolute(outputPath)
      ? outputPath
      : path.join(resolvedPath, outputPath);
  } else {
    const filePaths = getProjectFilePaths(resolvedPath);
    const exportPaths = filePaths.exports as Record<string, string>;
    finalOutputPath = exportPaths[format] || path.join(resolvedPath, 'exports', `storyboard.${exporter.extensions[0].slice(1)}`);
  }

  // 8. 执行导出
  console.log(chalk.blue(`📝 导出到: ${finalOutputPath}`));
  const result = await exporter.export(storyboard, {
    outputPath: finalOutputPath,
    format,
    includeMetadata: true,
    includePrompts: true,
  });

  if (!result.success) {
    console.error(chalk.red('\n❌ 导出失败:'));
    if (result.errors) {
      result.errors.forEach((error) => {
        console.error(chalk.red(`  - ${error}`));
      });
    } else {
      console.error(chalk.red(`  - ${result.message}`));
    }
    process.exit(1);
  }

  // 9. 成功提示
  console.log(chalk.green(`\n✓ ${result.message}`));
  console.log(chalk.blue('\n📁 导出文件:'));
  console.log(chalk.gray(`  ${result.filePath}`));

  // 10. 显示文件大小
  if (result.filePath) {
    const stats = await fs.stat(result.filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(chalk.gray(`  大小: ${sizeKB} KB`));
  }

  console.log(chalk.blue('\n✅ 导出完成!'));
}
