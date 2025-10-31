#!/usr/bin/env node

import { Command } from '@commander-js/extra-typings';
import chalk from 'chalk';
import fs from 'fs-extra';
import { createRequire } from 'module';
import { executeBashScript } from './utils/bash-runner.js';
import { parseCommandTemplate } from './utils/yaml-parser.js';

// 读取 package.json 版本号
const require = createRequire(import.meta.url);
const { version } = require('../package.json') as { version: string };

const program = new Command();

// Display banner
console.log(chalk.cyan.bold('\n╔════════════════════════════════════════════════╗'));
console.log(chalk.cyan.bold('║      Storyboardify - AI 分镜创作工具            ║'));
console.log(chalk.cyan.bold('╚════════════════════════════════════════════════╝\n'));

program
  .name('storyboardify')
  .description(chalk.cyan('Storyboardify - AI 驱动的分镜创作工具 (Slash Command 架构)'))
  .version(version);

// Helper function to register slash commands
async function registerSlashCommand(
  cmdName: string,
  description: string,
  scriptName: string,
  templateName: string
) {
  program
    .command(cmdName)
    .description(description)
    .argument('[args...]', '命令参数')
    .action(async (args: string[]) => {
      try {
        // Execute bash script
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const result = await executeBashScript(scriptName, args);

        // Type-safe property access with validation
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const statusValue = result.status;
        const status: 'success' | 'error' | 'info' =
          typeof statusValue === 'string' &&
          (statusValue === 'success' || statusValue === 'error' || statusValue === 'info')
            ? (statusValue as 'success' | 'error' | 'info')
            : 'error';

        if (status === 'success' || status === 'info') {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          const projectNameValue = result.project_name;
          const projectName = typeof projectNameValue === 'string' ? projectNameValue : undefined;
          console.log(chalk.green(`✓ ${projectName || '操作成功'}\n`));

          // Read and display command template
          const templatePath = `templates/commands/${templateName}.md`;
          if (await fs.pathExists(templatePath)) {
            const { content } = await parseCommandTemplate(templatePath);
            console.log(chalk.dim('─'.repeat(60)));
            console.log(content);
            console.log(chalk.dim('─'.repeat(60)) + '\n');

            // Display script output context for AI
            console.log(chalk.dim('## 脚本输出信息\n'));
            console.log('```json');
            console.log(JSON.stringify(result, null, 2));
            console.log('```\n');
          }
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          const messageValue = result.message;
          const message = typeof messageValue === 'string' ? messageValue : undefined;
          const errorMsg: string = message || '操作失败';
          console.error(chalk.red(`✗ ${errorMsg}`));

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          const suggestionValue = result.suggestion;
          if (suggestionValue !== undefined && suggestionValue !== null) {
            const suggestionStr: string =
              typeof suggestionValue === 'string' ? suggestionValue : String(suggestionValue);
            console.log(chalk.yellow(`💡 建议: ${suggestionStr}`));
          }
          process.exit(1);
        }
      } catch (error) {
        console.error(chalk.red('执行失败:'), error);
        process.exit(1);
      }
    });
}

// Register slash commands
await registerSlashCommand('specify', '定义项目规格', 'specify', 'specify');
await registerSlashCommand('import', '导入剧本', 'import', 'import');
await registerSlashCommand('preproduce', '生成制作包', 'preproduce', 'preproduce');
await registerSlashCommand('generate-express', 'Express模式生成', 'generate', 'generate-express');
await registerSlashCommand('generate-coach', 'Coach模式生成', 'generate', 'generate-coach');
await registerSlashCommand('generate-hybrid', 'Hybrid模式生成', 'generate', 'generate-hybrid');
await registerSlashCommand('export', '导出分镜', 'export', 'export');

// Help command
program
  .command('help')
  .description('显示帮助信息')
  .action(() => {
    console.log(chalk.bold('\nStoryboardify - AI 分镜创作工具 (Slash Command 架构)\n'));
    console.log(chalk.cyan('📋 创作流程:'));
    console.log('  storyboardify specify           定义项目规格');
    console.log('  storyboardify import <file>     导入Scriptify剧本');
    console.log('  storyboardify preproduce        生成制作包');
    console.log('  storyboardify generate-express  Express模式 (全自动)');
    console.log('  storyboardify generate-coach    Coach模式 (AI引导)');
    console.log('  storyboardify generate-hybrid   Hybrid模式 (AI框架+用户)');
    console.log('  storyboardify export            导出分镜');
    console.log('');
    console.log(chalk.cyan('💡 推荐用法:'));
    console.log('  在 Claude/Cursor 等 AI 助手中使用 Slash Commands:');
    console.log('    /specify');
    console.log('    /import');
    console.log('    /preproduce');
    console.log('    /generate-coach');
    console.log('    /export');
    console.log('');
    console.log(
      chalk.yellow('⚠️  注意: 本工具设计为在 AI 助手中使用，AI 会根据模板引导您完成创作')
    );
    console.log('');
  });

// Parse arguments
program.parse();
