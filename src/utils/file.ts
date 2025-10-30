/**
 * 文件系统工具函数
 */

import fs from 'fs-extra';
import path from 'path';
import type { ProjectState } from '../types/index.js';

/**
 * 项目配置目录名称
 */
export const CONFIG_DIR = '.storyboardify';
export const CONFIG_FILE = 'config.json';
export const PROJECTS_DIR = 'projects';

/**
 * 确保项目配置目录存在
 */
export async function ensureConfigDir(projectPath: string): Promise<string> {
  const configPath = path.join(projectPath, CONFIG_DIR);
  await fs.ensureDir(configPath);
  return configPath;
}

/**
 * 确保项目目录存在
 */
export async function ensureProjectDir(projectName: string): Promise<string> {
  const projectPath = path.join(process.cwd(), PROJECTS_DIR, projectName);
  await fs.ensureDir(projectPath);
  return projectPath;
}

/**
 * 读取项目配置
 */
export async function readProjectConfig(projectPath: string): Promise<ProjectState | null> {
  const configPath = path.join(projectPath, CONFIG_DIR, CONFIG_FILE);

  if (!(await fs.pathExists(configPath))) {
    return null;
  }

  const content = await fs.readFile(configPath, 'utf-8');
  return JSON.parse(content) as ProjectState;
}

/**
 * 写入项目配置
 */
export async function writeProjectConfig(projectPath: string, config: ProjectState): Promise<void> {
  await ensureConfigDir(projectPath);
  const configPath = path.join(projectPath, CONFIG_DIR, CONFIG_FILE);
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

/**
 * 读取JSON文件
 */
export async function readJSON<T>(filePath: string): Promise<T> {
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content) as T;
}

/**
 * 写入JSON文件
 */
export async function writeJSON(filePath: string, data: unknown): Promise<void> {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * 读取Markdown文件
 */
export async function readMarkdown(filePath: string): Promise<string> {
  return await fs.readFile(filePath, 'utf-8');
}

/**
 * 写入Markdown文件
 */
export async function writeMarkdown(filePath: string, content: string): Promise<void> {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * 检查文件是否存在
 */
export async function fileExists(filePath: string): Promise<boolean> {
  return await fs.pathExists(filePath);
}

/**
 * 列出目录中的所有项目
 */
export async function listProjects(): Promise<string[]> {
  const projectsPath = path.join(process.cwd(), PROJECTS_DIR);

  if (!(await fs.pathExists(projectsPath))) {
    return [];
  }

  const entries = await fs.readdir(projectsPath, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}

/**
 * 创建备份文件
 */
export async function createBackup(filePath: string): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `${filePath}.backup.${timestamp}`;
  await fs.copy(filePath, backupPath);
  return backupPath;
}

/**
 * 获取项目文件路径
 */
export function getProjectFilePaths(projectPath: string) {
  return {
    scriptifyImport: path.join(projectPath, 'scriptify-import.json'),
    productionPack: path.join(projectPath, 'production-pack.json'),
    storyboard: path.join(projectPath, 'storyboard.json'),
    exports: {
      markdown: path.join(projectPath, 'exports', 'storyboard.md'),
      pdf: path.join(projectPath, 'exports', 'storyboard.pdf'),
      excel: path.join(projectPath, 'exports', 'storyboard.xlsx'),
      jianying: path.join(projectPath, 'exports', 'jianying-project.json'),
      ae: path.join(projectPath, 'exports', 'ae-script.jsx'),
      pr: path.join(projectPath, 'exports', 'pr-project.xml'),
    },
  };
}
