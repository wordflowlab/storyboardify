#!/usr/bin/env node

/**
 * Storyboardify CLI Entry Point
 * AI驱动的分镜脚本创作工具
 */

import { Command } from '@commander-js/extra-typings';
import chalk from 'chalk';
import { executeSpecifyCommand } from './commands/specify.js';
import { executeImportCommand } from './commands/import.js';
import { executePreproduceCommand } from './commands/preproduce.js';
import { executeGenerateCommand } from './commands/generate.js';
import { executeExportCommand } from './commands/export.js';
import { executeStatusCommand } from './commands/status.js';
import type { ExportFormat, GenerationMode } from './types/index.js';

const program = new Command();

program
  .name('storyboardify')
  .description('AI驱动的分镜脚本创作工具 - 从剧本到制作包的完整解决方案')
  .version('0.1.0');

// /specify - 初始化项目
program
  .command('specify')
  .description('初始化新项目,配置工作区和模式')
  .action(async () => {
    try {
      await executeSpecifyCommand();
    } catch (error) {
      console.error(chalk.red('项目初始化失败:'), error);
      process.exit(1);
    }
  });

// /import - 导入Scriptify JSON
program
  .command('import')
  .description('导入Scriptify导出的JSON剧本文件')
  .argument('<file>', 'Scriptify JSON文件路径')
  .action(async (file: string) => {
    try {
      await executeImportCommand(file);
    } catch (error) {
      console.error(chalk.red('导入失败:'), error);
      process.exit(1);
    }
  });

// /preproduce - 生成制作包
program
  .command('preproduce')
  .description('生成人物设定表和场景设定表')
  .argument('[project]', '项目路径(可选,默认当前目录)')
  .action(async (project?: string) => {
    try {
      await executePreproduceCommand(project);
    } catch (error) {
      console.error(chalk.red('制作包生成失败:'), error);
      process.exit(1);
    }
  });

// /generate - 生成分镜脚本
program
  .command('generate')
  .description('生成分镜脚本')
  .option('-m, --mode <mode>', '生成模式 (coach/express/hybrid)', 'express')
  .argument('[project]', '项目路径(可选,默认当前目录)')
  .action(async (project: string | undefined, options: { mode: string }) => {
    try {
      await executeGenerateCommand(options.mode as GenerationMode, project);
    } catch (error) {
      console.error(chalk.red('分镜生成失败:'), error);
      process.exit(1);
    }
  });

// /review - 审校分镜
program
  .command('review')
  .description('审校和优化分镜脚本')
  .action(async () => {
    console.log(chalk.blue('✓ 审校分镜'));
    console.log(chalk.yellow('TODO: Phase 6 - 实现审校功能'));
  });

// /export - 导出分镜
program
  .command('export')
  .description('导出分镜脚本为指定格式')
  .option(
    '-f, --format <format>',
    '导出格式 (markdown/pdf/excel/jianying-json/ae-jsx/pr-xml)',
    'markdown'
  )
  .option('-o, --output <path>', '输出文件路径')
  .argument('[project]', '项目路径(可选,默认当前目录)')
  .action(async (project: string | undefined, options: { format: string; output?: string }) => {
    try {
      await executeExportCommand(options.format as ExportFormat, options.output, project);
    } catch (error) {
      console.error(chalk.red('导出失败:'), error);
      process.exit(1);
    }
  });

// /status - 查看项目状态
program
  .command('status')
  .description('查看当前项目状态')
  .argument('[project]', '项目路径(可选,默认当前目录)')
  .action(async (project?: string) => {
    try {
      await executeStatusCommand(project);
    } catch (error) {
      console.error(chalk.red('状态查看失败:'), error);
      process.exit(1);
    }
  });

// 解析命令行参数
program.parse();
