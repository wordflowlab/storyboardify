#!/usr/bin/env node
/**
 * Interactive selection utilities for Storyboardify
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import { AIConfig, WorkspaceType, GenerationMode } from '../types/index.js';

/**
 * Display project banner
 */
export function displayProjectBanner(): void {
  console.log('');
  console.log(chalk.cyan.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.cyan.bold('  Storyboardify - AI 驱动的分镜创作工具'));
  console.log(chalk.cyan.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log('');
}

/**
 * Display initialization step
 */
export function displayStep(step: number, total: number, message: string): void {
  console.log(chalk.dim(`[${step}/${total}]`) + ' ' + message);
}

/**
 * Display success message
 */
export function displaySuccess(message: string): void {
  console.log(chalk.green('✓ ') + message);
}

/**
 * Display error message
 */
export function displayError(message: string): void {
  console.log(chalk.red('✗ ') + message);
}

/**
 * Display warning message
 */
export function displayWarning(message: string): void {
  console.log(chalk.yellow('⚠ ') + message);
}

/**
 * Display info message
 */
export function displayInfo(message: string): void {
  console.log(chalk.cyan('ℹ ') + message);
}

/**
 * Check if running in interactive terminal
 */
export function isInteractive(): boolean {
  return process.stdin.isTTY === true && process.stdout.isTTY === true;
}

/**
 * Select AI assistant interactively
 */
export async function selectAIAssistant(aiConfigs: AIConfig[]): Promise<string> {
  const choices = aiConfigs.map((config) => ({
    name: `${chalk.cyan(config.name.padEnd(12))} ${chalk.dim(`(${config.displayName})`)}`,
    value: config.name,
    short: config.name,
  }));

  const answer = await inquirer.prompt<{ ai: string }>([
    {
      type: 'list',
      name: 'ai',
      message: chalk.bold('选择你的 AI 助手:'),
      choices,
      default: 'claude',
      pageSize: 15,
    },
  ]);

  return answer.ai;
}

/**
 * Select workspace type
 */
export async function selectWorkspace(): Promise<WorkspaceType> {
  const choices = [
    {
      name: `${chalk.cyan('manga'.padEnd(15))} ${chalk.dim('(漫画工作区 4:3)')}`,
      value: 'manga',
      short: 'manga',
    },
    {
      name: `${chalk.cyan('short-video'.padEnd(15))} ${chalk.dim('(短视频工作区 9:16)')}`,
      value: 'short-video',
      short: 'short-video',
    },
    {
      name: `${chalk.cyan('dynamic-manga'.padEnd(15))} ${chalk.dim('(动态漫工作区 16:9)')}`,
      value: 'dynamic-manga',
      short: 'dynamic-manga',
    },
  ];

  const answer = await inquirer.prompt<{ workspace: WorkspaceType }>([
    {
      type: 'list',
      name: 'workspace',
      message: chalk.bold('选择工作区类型:'),
      choices,
      default: 'short-video',
    },
  ]);

  return answer.workspace;
}

/**
 * Select generation mode
 */
export async function selectGenerationMode(): Promise<GenerationMode> {
  const choices = [
    {
      name: `${chalk.cyan('express'.padEnd(12))} ${chalk.dim('(快速模式 - AI全自动生成)')}`,
      value: 'express',
      short: 'express',
    },
    {
      name: `${chalk.cyan('coach'.padEnd(12))} ${chalk.dim('(教练模式 - AI引导创作)')}`,
      value: 'coach',
      short: 'coach',
    },
    {
      name: `${chalk.cyan('hybrid'.padEnd(12))} ${chalk.dim('(混合模式 - AI框架+用户)')}`,
      value: 'hybrid',
      short: 'hybrid',
    },
  ];

  const answer = await inquirer.prompt<{ mode: GenerationMode }>([
    {
      type: 'list',
      name: 'mode',
      message: chalk.bold('选择生成模式:'),
      choices,
      default: 'express',
    },
  ]);

  return answer.mode;
}

/**
 * Select bash script type
 */
export async function selectBashScriptType(): Promise<string> {
  const scriptChoices = [
    {
      name: `${chalk.cyan('sh'.padEnd(12))} ${chalk.dim('(POSIX Shell - macOS/Linux)')}`,
      value: 'sh',
      short: 'sh',
    },
    {
      name: `${chalk.cyan('ps'.padEnd(12))} ${chalk.dim('(PowerShell - Windows)')}`,
      value: 'ps',
      short: 'ps',
    },
  ];

  const answer = await inquirer.prompt<{ scriptType: string }>([
    {
      type: 'list',
      name: 'scriptType',
      message: chalk.bold('选择脚本类型:'),
      choices: scriptChoices,
      default: 'sh',
    },
  ]);

  return answer.scriptType;
}

/**
 * Confirm action
 */
export async function confirmAction(message: string, defaultValue = false): Promise<boolean> {
  const answer = await inquirer.prompt<{ confirmed: boolean }>([
    {
      type: 'confirm',
      name: 'confirmed',
      message,
      default: defaultValue,
    },
  ]);

  return answer.confirmed;
}

/**
 * Select image generation provider
 */
export async function selectImageProvider(): Promise<'volcano' | 'aliyun' | 'hybrid'> {
  const choices = [
    {
      name: `${chalk.cyan('hybrid'.padEnd(12))} ${chalk.dim('(智能混合 - 自动选择最优)')}`,
      value: 'hybrid',
      short: 'hybrid',
    },
    {
      name: `${chalk.cyan('volcano'.padEnd(12))} ${chalk.dim('(火山引擎 - 高质量)')}`,
      value: 'volcano',
      short: 'volcano',
    },
    {
      name: `${chalk.cyan('aliyun'.padEnd(12))} ${chalk.dim('(阿里云通义万相 - 经济)')}`,
      value: 'aliyun',
      short: 'aliyun',
    },
  ];

  const answer = await inquirer.prompt<{ provider: 'volcano' | 'aliyun' | 'hybrid' }>([
    {
      type: 'list',
      name: 'provider',
      message: chalk.bold('选择图片生成提供商:'),
      choices,
      default: 'hybrid',
    },
  ]);

  return answer.provider;
}

/**
 * Select image quality
 */
export async function selectImageQuality(): Promise<'standard' | 'high' | 'ultra'> {
  const choices = [
    {
      name: `${chalk.cyan('high'.padEnd(12))} ${chalk.dim('(高质量 - 1280x1280, 推荐)')}`,
      value: 'high',
      short: 'high',
    },
    {
      name: `${chalk.cyan('standard'.padEnd(12))} ${chalk.dim('(标准质量 - 1024x1024)')}`,
      value: 'standard',
      short: 'standard',
    },
    {
      name: `${chalk.cyan('ultra'.padEnd(12))} ${chalk.dim('(超高质量 - 1536x1536)')}`,
      value: 'ultra',
      short: 'ultra',
    },
  ];

  const answer = await inquirer.prompt<{ quality: 'standard' | 'high' | 'ultra' }>([
    {
      type: 'list',
      name: 'quality',
      message: chalk.bold('选择图片质量:'),
      choices,
      default: 'high',
    },
  ]);

  return answer.quality;
}

/**
 * Input number of variants
 */
export async function inputVariantsCount(): Promise<number> {
  const answer = await inquirer.prompt<{ variants: number }>([
    {
      type: 'number',
      name: 'variants',
      message: chalk.bold('每个镜头生成几个变体?'),
      default: 2,
      validate: (input: number) => {
        if (input < 1 || input > 5) {
          return '请输入 1-5 之间的数字';
        }
        return true;
      },
    },
  ]);

  return answer.variants;
}

/**
 * Confirm generation with cost estimate
 */
export async function confirmGenerationWithCost(
  totalShots: number,
  variants: number,
  estimatedCost: number
): Promise<boolean> {
  console.log('');
  console.log(chalk.dim('━'.repeat(50)));
  console.log(chalk.bold('生成预览:'));
  console.log(`  • 总镜头数: ${chalk.cyan(totalShots)}`);
  console.log(`  • 每镜头变体数: ${chalk.cyan(variants)}`);
  console.log(`  • 总图片数: ${chalk.cyan(totalShots * variants)}`);
  console.log(`  • 预估成本: ${chalk.yellow(`¥${estimatedCost.toFixed(2)}`)}`);
  console.log(chalk.dim('━'.repeat(50)));
  console.log('');

  return confirmAction('确认开始生成?', true);
}
