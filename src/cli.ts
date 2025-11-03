#!/usr/bin/env node

import { Command } from '@commander-js/extra-typings';
import chalk from 'chalk';
import fs from 'fs-extra';
import ora from 'ora';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { executeBashScript } from './utils/bash-runner.js';
import { parseCommandTemplate } from './utils/yaml-parser.js';
import {
  displayProjectBanner,
  displayInfo,
  displayStep,
  isInteractive,
  selectAIAssistant,
  selectWorkspace,
  selectGenerationMode,
  selectBashScriptType,
} from './utils/interactive.js';
import { AIConfig } from './types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取 package.json 版本号
const require = createRequire(import.meta.url);
const { version } = require('../package.json') as { version: string };

// AI 平台配置 - 所有支持的平台
const AI_CONFIGS: AIConfig[] = [
  { name: 'claude', dir: '.claude', commandsDir: 'commands', displayName: 'Claude Code' },
  { name: 'cursor', dir: '.cursor', commandsDir: 'commands', displayName: 'Cursor' },
  { name: 'gemini', dir: '.gemini', commandsDir: 'commands', displayName: 'Gemini CLI' },
  { name: 'windsurf', dir: '.windsurf', commandsDir: 'workflows', displayName: 'Windsurf' },
  { name: 'roocode', dir: '.roo', commandsDir: 'commands', displayName: 'Roo Code' },
  { name: 'copilot', dir: '.github', commandsDir: 'prompts', displayName: 'GitHub Copilot' },
  { name: 'qwen', dir: '.qwen', commandsDir: 'commands', displayName: 'Qwen Code' },
  { name: 'opencode', dir: '.opencode', commandsDir: 'command', displayName: 'OpenCode' },
  { name: 'codex', dir: '.codex', commandsDir: 'prompts', displayName: 'Codex CLI' },
  { name: 'kilocode', dir: '.kilocode', commandsDir: 'workflows', displayName: 'Kilo Code' },
  { name: 'auggie', dir: '.augment', commandsDir: 'commands', displayName: 'Auggie CLI' },
  { name: 'codebuddy', dir: '.codebuddy', commandsDir: 'commands', displayName: 'CodeBuddy' },
  { name: 'q', dir: '.amazonq', commandsDir: 'prompts', displayName: 'Amazon Q Developer' },
];

const program = new Command();

// Display banner
console.log(chalk.cyan.bold('\n╔════════════════════════════════════════════════╗'));
console.log(chalk.cyan.bold('║      Storyboardify - AI 分镜创作工具            ║'));
console.log(chalk.cyan.bold('╚════════════════════════════════════════════════╝\n'));

// Helper function to find AI config by name
// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
function findAIConfig(name: string): AIConfig | undefined {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return AI_CONFIGS.find((c) => c.name === name);
}

program
  .name('storyboardify')
  .description(chalk.cyan('Storyboardify - AI 驱动的分镜创作工具 (Slash Command 架构)'))
  .version(version);

// /init - 初始化项目(支持13个AI助手)
program
  .command('init')
  .argument('[name]', '项目名称')
  .option('--here', '在当前目录初始化')
  .option(
    '--ai <type>',
    '选择 AI 助手 (claude|cursor|gemini|windsurf|roocode|copilot|qwen|opencode|codex|kilocode|auggie|codebuddy|q)'
  )
  .option('--workspace <type>', '选择工作区类型 (manga|short-video|dynamic-manga)')
  .option('--mode <type>', '选择生成模式 (coach|express|hybrid)')
  .description('初始化Storyboardify项目(生成AI配置)')
  .action(
    async (
      name: string | undefined,
      options: { here?: boolean; ai?: string; workspace?: string; mode?: string }
    ) => {
      // 交互式选择
      const shouldShowInteractive = isInteractive() && !options.ai;

      let selectedAI = 'claude';
      let selectedWorkspace = 'short-video';
      let selectedMode = 'express';
      let selectedScriptType = 'sh';

      if (shouldShowInteractive) {
        // 显示欢迎横幅
        displayProjectBanner();

        // [1/4] 选择 AI 助手
        displayStep(1, 4, '选择 AI 助手');
        selectedAI = await selectAIAssistant(AI_CONFIGS);
        console.log('');

        // [2/4] 选择工作区类型
        displayStep(2, 4, '选择工作区类型');
        selectedWorkspace = await selectWorkspace();
        console.log('');

        // [3/4] 选择生成模式
        displayStep(3, 4, '选择生成模式');
        selectedMode = await selectGenerationMode();
        console.log('');

        // [4/4] 选择脚本类型
        displayStep(4, 4, '选择脚本类型');
        selectedScriptType = await selectBashScriptType();
        console.log('');
      } else {
        if (options.ai) selectedAI = options.ai;
        if (options.workspace) selectedWorkspace = options.workspace;
        if (options.mode) selectedMode = options.mode;
      }

      const spinner = ora('正在初始化Storyboardify项目...').start();

      try {
        // 确定项目路径
        let projectPath: string;
        if (options.here) {
          projectPath = process.cwd();
          name = path.basename(projectPath);
        } else {
          if (!name) {
            spinner.fail('请提供项目名称或使用 --here 参数');
            process.exit(1);
          }
          projectPath = path.join(process.cwd(), name);
          if (await fs.pathExists(projectPath)) {
            spinner.fail(`项目目录 "${name}" 已存在`);
            process.exit(1);
          }
          await fs.ensureDir(projectPath);
        }

        // 获取选中的AI配置
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const aiConfigOrUndefined = findAIConfig(selectedAI);
        if (!aiConfigOrUndefined) {
          spinner.fail(`不支持的AI助手: ${selectedAI}`);
          process.exit(1);
        }
        // Type assertion after null check
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const aiConfig: AIConfig = aiConfigOrUndefined;

        // 创建基础项目结构（工作区就是分镜项目）
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const dirs: string[] = ['.storyboardify', `${aiConfig.dir}/${aiConfig.commandsDir}`];

        for (const dir of dirs) {
          await fs.ensureDir(path.join(projectPath, dir));
        }

        // 创建项目配置文件 (用于标识项目根目录)
        const config = {
          name: name,
          type: 'storyboardify-project',
          ai: selectedAI,
          workspace: selectedWorkspace,
          mode: selectedMode,
          scriptType: selectedScriptType,
          created: new Date().toISOString(),
          version: version,
        };
        await fs.writeJson(path.join(projectPath, '.storyboardify', 'config.json'), config, {
          spaces: 2,
        });

        // 从npm包复制模板和脚本到项目
        const packageRoot = path.resolve(__dirname, '..');

        // 根据选择的脚本类型复制对应脚本
        const scriptsSubDir = selectedScriptType === 'ps' ? 'powershell' : 'bash';
        const scriptsSource = path.join(packageRoot, 'scripts', scriptsSubDir);
        const scriptsTarget = path.join(projectPath, 'scripts', scriptsSubDir);

        if (await fs.pathExists(scriptsSource)) {
          await fs.copy(scriptsSource, scriptsTarget);

          // 设置bash脚本执行权限
          if (selectedScriptType === 'sh') {
            const bashFiles = await fs.readdir(scriptsTarget);
            for (const file of bashFiles) {
              if (file.endsWith('.sh')) {
                const filePath = path.join(scriptsTarget, file);
                await fs.chmod(filePath, 0o755);
              }
            }
          }
        }

        // 复制templates到项目
        const templatesSource = path.join(packageRoot, 'templates');
        const templatesTarget = path.join(projectPath, 'templates');
        if (await fs.pathExists(templatesSource)) {
          await fs.copy(templatesSource, templatesTarget);
        }

        // 生成AI配置文件（直接复制模板文件）
        const commandFiles: string[] = await fs.readdir(
          path.join(packageRoot, 'templates', 'commands')
        );

        for (const file of commandFiles) {
          if (file.endsWith('.md')) {
            // 直接复制模板文件
            const sourcePath: string = path.join(packageRoot, 'templates', 'commands', file);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
            const targetPath: string = path.join(
              projectPath,
              aiConfig.dir,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              aiConfig.commandsDir,
              file
            );
            await fs.copy(sourcePath, targetPath);
          }
        }

        // 创建README
        const workspaceDisplay: string =
          selectedWorkspace === 'manga'
            ? '漫画 (4:3)'
            : selectedWorkspace === 'short-video'
              ? '短视频 (9:16)'
              : '动态漫 (16:9)';
        const modeDisplay: string =
          selectedMode === 'coach'
            ? '教练模式 (AI引导)'
            : selectedMode === 'express'
              ? '快速模式 (全自动)'
              : '混合模式 (AI框架+用户)';
        const scriptTypeDisplay: string =
          selectedScriptType === 'sh' ? 'POSIX Shell (macOS/Linux)' : 'PowerShell (Windows)';
        const scriptsDirDisplay: string = selectedScriptType === 'sh' ? 'Bash' : 'PowerShell';

        const readme: string = `# ${name}

使用 Storyboardify 创建的分镜项目

## 配置
${/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */ ''}
- **AI 助手**: ${aiConfig.displayName}
- **工作区**: ${workspaceDisplay}
- **生成模式**: ${modeDisplay}
- **脚本类型**: ${scriptTypeDisplay}

## 创作流程

使用 Slash Commands 完成分镜创作：

\`\`\`bash
/specify         # 1. 定义项目规格（工作区、模式）
/import          # 2. 导入 Scriptify 剧本
/preproduce      # 3. 生成制作包（人物+场景设定表）
/generate-${selectedMode}  # 4. 生成分镜脚本
/export          # 5. 导出分镜脚本
\`\`\`

## 项目结构

- \`spec.json\` - 项目规格配置
- \`scriptify-import.json\` - 导入的Scriptify剧本
- \`production-pack.json\` - 制作包（人物和场景设定表）
- \`storyboard.json\` - 分镜脚本
- \`scripts/${scriptsSubDir}/\` - ${scriptsDirDisplay}脚本
- \`templates/\` - AI提示词模板${/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */ ''}
- \`${aiConfig.dir}/\` - ${aiConfig.displayName}配置

## 更多命令

\`\`\`bash
/generate-express  # 快速模式（全自动AI生成）
/generate-coach    # 教练模式（AI引导式学习创作）
/generate-hybrid   # 混合模式（AI框架+用户精调）
\`\`\`

## 文档

查看 [Storyboardify文档](https://github.com/wordflowlab/storyboardify)
`;

        await fs.writeFile(path.join(projectPath, 'README.md'), readme);

        spinner.succeed(`项目 "${name}" 初始化成功!`);

        console.log('');
        displayInfo('下一步:');
        if (!options.here) {
          console.log(`  • cd ${name}`);
        }
        console.log(`  • 运行 /specify 定义项目规格`);
        console.log(`  • 运行 /import 导入Scriptify剧本`);
      } catch (error) {
        spinner.fail('初始化项目失败');
        console.error(error);
        process.exit(1);
      }
    }
  );

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
await registerSlashCommand('generate-images', '生成分镜图片', 'generate-images', 'generate-images');
await registerSlashCommand('export', '导出分镜', 'export', 'export');

// Help command
program
  .command('help')
  .description('显示帮助信息')
  .action(() => {
    console.log(chalk.bold('\nStoryboardify - AI 分镜创作工具 (Slash Command 架构)\n'));
    console.log(chalk.cyan('📦 项目初始化:'));
    console.log('  storyboardify init <项目名>     初始化项目 (支持13个AI平台)');
    console.log('  storyboardify init --here       在当前目录初始化');
    console.log('');
    console.log(chalk.cyan('📋 创作流程:'));
    console.log('  storyboardify specify           定义项目规格');
    console.log('  storyboardify import <file>     导入Scriptify剧本');
    console.log('  storyboardify preproduce        生成制作包');
    console.log('  storyboardify generate-express  Express模式 (全自动)');
    console.log('  storyboardify generate-coach    Coach模式 (AI引导)');
    console.log('  storyboardify generate-hybrid   Hybrid模式 (AI框架+用户)');
    console.log('  storyboardify generate-images   生成分镜图片 (NEW!)');
    console.log('  storyboardify export            导出分镜');
    console.log('');
    console.log(chalk.cyan('🤖 支持的AI平台 (13个):'));
    console.log('  Claude Code, Cursor, Gemini CLI, Windsurf, Roo Code');
    console.log('  GitHub Copilot, Qwen Code, OpenCode, Codex CLI');
    console.log('  Kilo Code, Auggie CLI, CodeBuddy, Amazon Q Developer');
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
