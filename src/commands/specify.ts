/**
 * /specify 命令实现
 * 初始化新的 Storyboardify 项目
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs-extra';
import {
  ensureProjectDir,
  writeProjectConfig,
  ensureConfigDir,
} from '../utils/index.js';
import { WORKSPACE_CONFIGS } from '../workspaces/configs.js';
import type { ProjectState, WorkspaceType, GenerationMode } from '../types/index.js';

/**
 * 执行 specify 命令
 */
export async function executeSpecifyCommand(): Promise<void> {
  console.log(chalk.blue('📝 初始化新的 Storyboardify 项目\n'));

  // 1. 询问项目名称
  const { projectName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: '请输入项目名称:',
      validate: (input: string) => {
        if (!input || input.trim().length === 0) {
          return '项目名称不能为空';
        }
        if (input.includes('/') || input.includes('\\')) {
          return '项目名称不能包含路径分隔符';
        }
        return true;
      },
    },
  ]);

  const trimmedName = projectName.trim();

  // 2. 检查项目是否已存在
  const projectPath = path.join(process.cwd(), 'projects', trimmedName);
  if (await fs.pathExists(projectPath)) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: `项目 "${trimmedName}" 已存在,是否覆盖?`,
        default: false,
      },
    ]);

    if (!overwrite) {
      console.log(chalk.yellow('\n✗ 已取消项目创建'));
      return;
    }

    // 备份现有项目
    const backupPath = `${projectPath}.backup.${Date.now()}`;
    await fs.move(projectPath, backupPath);
    console.log(chalk.gray(`已备份现有项目到: ${backupPath}\n`));
  }

  // 3. 选择工作区
  const workspaceChoices = Object.values(WORKSPACE_CONFIGS).map((config) => ({
    name: config.display_name,
    value: config.name,
    description: `纵横比: ${config.aspect_ratio}, 支持格式: ${config.export_formats.join(', ')}`,
  }));

  const { workspace } = await inquirer.prompt([
    {
      type: 'list',
      name: 'workspace',
      message: '选择工作区类型:',
      choices: workspaceChoices,
      pageSize: 10,
    },
  ]);

  // 4. 选择生成模式
  const { mode } = await inquirer.prompt([
    {
      type: 'list',
      name: 'mode',
      message: '选择分镜生成模式:',
      choices: [
        {
          name: '🚀 快速模式 (Express) - AI 自动生成完整分镜',
          value: 'express',
        },
        {
          name: '🎓 教练模式 (Coach) - AI 引导你逐步设计 [Phase 2]',
          value: 'coach',
          disabled: '(Phase 2 功能)',
        },
        {
          name: '🤝 混合模式 (Hybrid) - AI 生成框架,你填充细节 [Phase 2]',
          value: 'hybrid',
          disabled: '(Phase 2 功能)',
        },
      ],
      default: 'express',
    },
  ]);

  // 5. 确认项目信息
  console.log(chalk.blue('\n📋 项目信息确认:'));
  console.log(chalk.gray(`  项目名称: ${trimmedName}`));
  console.log(chalk.gray(`  工作区: ${WORKSPACE_CONFIGS[workspace as WorkspaceType].display_name}`));
  console.log(
    chalk.gray(
      `  生成模式: ${mode === 'express' ? '快速模式' : mode === 'coach' ? '教练模式' : '混合模式'}`
    )
  );
  console.log(chalk.gray(`  项目路径: ${projectPath}\n`));

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: '确认创建项目?',
      default: true,
    },
  ]);

  if (!confirm) {
    console.log(chalk.yellow('\n✗ 已取消项目创建'));
    return;
  }

  // 6. 创建项目目录结构
  console.log(chalk.blue('\n📁 创建项目目录...'));
  await ensureProjectDir(trimmedName);
  await ensureConfigDir(projectPath);

  // 创建子目录
  await fs.ensureDir(path.join(projectPath, 'docs'));
  await fs.ensureDir(path.join(projectPath, 'docs', 'characters'));
  await fs.ensureDir(path.join(projectPath, 'docs', 'scenes'));
  await fs.ensureDir(path.join(projectPath, 'exports'));

  console.log(chalk.green('✓ 项目目录创建完成'));

  // 7. 创建项目配置
  const config: ProjectState = {
    version: '1.0',
    project_name: trimmedName,
    workspace: workspace as WorkspaceType,
    mode: mode as GenerationMode,
    last_modified: new Date().toISOString(),
    files: {},
  };

  await writeProjectConfig(projectPath, config);
  console.log(chalk.green('✓ 项目配置创建完成'));

  // 8. 创建项目 README
  const readmeContent = generateProjectReadme(trimmedName, workspace, mode);
  await fs.writeFile(path.join(projectPath, 'README.md'), readmeContent, 'utf-8');
  console.log(chalk.green('✓ 项目文档创建完成'));

  // 9. 显示下一步提示
  console.log(chalk.blue('\n✅ 项目初始化完成!'));
  console.log(chalk.blue('\n📋 下一步操作:'));
  console.log(chalk.gray('  1. 从 Scriptify 导出你的剧本为 JSON 格式'));
  console.log(chalk.gray(`  2. 运行: storyboardify import <scriptify-export.json>`));
  console.log(chalk.gray('  3. 运行: storyboardify preproduce 生成制作包'));
  console.log(chalk.gray('  4. 运行: storyboardify generate 生成分镜脚本'));
  console.log(chalk.gray('  5. 运行: storyboardify export 导出最终文件'));
  console.log(chalk.blue(`\n📁 项目路径: ${projectPath}`));
}

/**
 * 生成项目 README
 */
function generateProjectReadme(
  projectName: string,
  workspace: string,
  mode: string
): string {
  const workspaceConfig = WORKSPACE_CONFIGS[workspace as WorkspaceType];
  const lines: string[] = [];

  lines.push(`# ${projectName}`);
  lines.push('');
  lines.push('> Storyboardify 分镜脚本项目');
  lines.push('');

  lines.push('## 项目信息');
  lines.push('');
  lines.push(`- **工作区**: ${workspaceConfig.display_name}`);
  lines.push(`- **纵横比**: ${workspaceConfig.aspect_ratio}`);
  lines.push(`- **生成模式**: ${mode === 'express' ? '快速模式' : mode === 'coach' ? '教练模式' : '混合模式'}`);
  lines.push(`- **创建时间**: ${new Date().toLocaleString('zh-CN')}`);
  lines.push('');

  lines.push('## 工作流');
  lines.push('');
  lines.push('### 1. 导入剧本');
  lines.push('```bash');
  lines.push('storyboardify import <scriptify-export.json>');
  lines.push('```');
  lines.push('');

  lines.push('### 2. 生成制作包');
  lines.push('```bash');
  lines.push('storyboardify preproduce');
  lines.push('```');
  lines.push('');

  lines.push('### 3. 生成分镜脚本');
  lines.push('```bash');
  lines.push('storyboardify generate');
  lines.push('```');
  lines.push('');

  lines.push('### 4. 导出文件');
  lines.push('```bash');
  lines.push('storyboardify export --format markdown');
  lines.push('```');
  lines.push('');

  lines.push('## 支持的导出格式');
  lines.push('');
  workspaceConfig.export_formats.forEach((format) => {
    lines.push(`- ${format}`);
  });
  lines.push('');

  lines.push('## 项目结构');
  lines.push('');
  lines.push('```');
  lines.push(`${projectName}/`);
  lines.push('├── .storyboardify/       # 项目配置');
  lines.push('├── docs/                 # 文档输出');
  lines.push('│   ├── characters/       # 人物设定表');
  lines.push('│   └── scenes/           # 场景设定表');
  lines.push('├── exports/              # 导出文件');
  lines.push('├── scriptify-import.json # 导入的剧本数据');
  lines.push('├── production-pack.json  # 制作包数据');
  lines.push('└── storyboard.json       # 分镜数据');
  lines.push('```');
  lines.push('');

  lines.push('---');
  lines.push('');
  lines.push('*由 Storyboardify 生成*');

  return lines.join('\n');
}
