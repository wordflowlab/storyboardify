/**
 * Scriptify JSON导入器
 */

import type { ScriptifyExport } from '../types/index.js';
import { readJSON } from '../utils/file.js';
import { validateScriptifyExport } from '../utils/validation.js';
import chalk from 'chalk';
import ora from 'ora';

/**
 * 导入Scriptify JSON文件
 */
export async function importScriptify(filePath: string): Promise<ScriptifyExport> {
  const spinner = ora('正在读取Scriptify JSON文件...').start();

  try {
    // 读取JSON文件
    const data = await readJSON<unknown>(filePath);
    spinner.text = '正在验证数据格式...';

    // 验证数据
    const validation = validateScriptifyExport(data);

    if (!validation.valid) {
      spinner.fail('Scriptify JSON验证失败');
      console.log(chalk.red('\n错误列表:'));
      validation.errors.forEach((error) => {
        console.log(chalk.red(`  - ${error.field}: ${error.message}`));
      });

      if (validation.warnings.length > 0) {
        console.log(chalk.yellow('\n警告列表:'));
        validation.warnings.forEach((warning) => {
          console.log(chalk.yellow(`  - ${warning.field}: ${warning.message}`));
        });
      }

      throw new Error('Scriptify JSON验证失败,请检查文件格式');
    }

    // 显示警告
    if (validation.warnings.length > 0) {
      spinner.warn('导入成功,但存在警告');
      console.log(chalk.yellow('警告列表:'));
      validation.warnings.forEach((warning) => {
        console.log(chalk.yellow(`  - ${warning.field}: ${warning.message}`));
      });
    } else {
      spinner.succeed('Scriptify JSON导入成功');
    }

    const scriptify = data as ScriptifyExport;

    // 显示导入摘要
    console.log(chalk.blue('\n导入摘要:'));
    console.log(chalk.gray(`  项目名称: ${scriptify.project.name}`));
    console.log(chalk.gray(`  项目类型: ${scriptify.project.type}`));
    console.log(
      chalk.gray(`  角色数量: ${scriptify.characters?.length || 0}`)
    );
    console.log(chalk.gray(`  场景数量: ${scriptify.scenes?.length || 0}`));
    console.log(chalk.gray(`  剧本集数: ${scriptify.scripts?.length || 0}`));
    console.log(
      chalk.gray(
        `  总字数: ${scriptify.scripts?.reduce((sum, s) => sum + (s.word_count || 0), 0) || 0}`
      )
    );

    return scriptify;
  } catch (error) {
    spinner.fail('导入失败');
    throw error;
  }
}

/**
 * 检测导入数据中缺失的字段并生成补充建议
 */
export function detectMissingFields(scriptify: ScriptifyExport): {
  characters: { id: string; missing: string[] }[];
  scenes: { id: string; missing: string[] }[];
} {
  const result = {
    characters: [] as { id: string; missing: string[] }[],
    scenes: [] as { id: string; missing: string[] }[],
  };

  // 检查角色缺失字段
  scriptify.characters?.forEach((char) => {
    const missing: string[] = [];

    if (!char.appearance || Object.keys(char.appearance).length === 0) {
      missing.push('appearance (外观描述)');
    }
    if (!char.personality) {
      missing.push('personality (性格描述)');
    }
    if (!char.drawing_prompt) {
      missing.push('drawing_prompt (绘画提示词)');
    }

    if (missing.length > 0) {
      result.characters.push({ id: char.id, missing });
    }
  });

  // 检查场景缺失字段
  scriptify.scenes?.forEach((scene) => {
    const missing: string[] = [];

    if (!scene.atmosphere) {
      missing.push('atmosphere (氛围描述)');
    }
    if (!scene.color_scheme || scene.color_scheme.length === 0) {
      missing.push('color_scheme (色彩方案)');
    }
    if (!scene.drawing_prompt) {
      missing.push('drawing_prompt (场景绘画提示词)');
    }

    if (missing.length > 0) {
      result.scenes.push({ id: scene.id, missing });
    }
  });

  return result;
}

/**
 * 打印缺失字段报告
 */
export function printMissingFieldsReport(report: ReturnType<typeof detectMissingFields>): void {
  if (report.characters.length === 0 && report.scenes.length === 0) {
    console.log(chalk.green('\n✓ 所有数据完整,无需补充字段'));
    return;
  }

  console.log(chalk.yellow('\n⚠ 检测到以下字段缺失,将在后续阶段自动生成:'));

  if (report.characters.length > 0) {
    console.log(chalk.blue('\n角色缺失字段:'));
    report.characters.forEach((char) => {
      console.log(chalk.gray(`  ${char.id}:`));
      char.missing.forEach((field) => {
        console.log(chalk.gray(`    - ${field}`));
      });
    });
  }

  if (report.scenes.length > 0) {
    console.log(chalk.blue('\n场景缺失字段:'));
    report.scenes.forEach((scene) => {
      console.log(chalk.gray(`  ${scene.id}:`));
      scene.missing.forEach((field) => {
        console.log(chalk.gray(`    - ${field}`));
      });
    });
  }

  console.log(
    chalk.yellow('\n提示: 运行 /preproduce 命令将自动补全这些字段')
  );
}
