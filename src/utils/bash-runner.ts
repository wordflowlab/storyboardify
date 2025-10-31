/**
 * Bash script execution utilities
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { BashResult } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Find the storyboardify project root directory by looking for .storyboardify/config.json
 */
function findProjectRoot(): string {
  let current = process.cwd();

  while (current !== '/') {
    const configPath = path.join(current, '.storyboardify', 'config.json');
    if (fs.existsSync(configPath)) {
      return current;
    }
    current = path.dirname(current);
  }

  // Fallback to current directory
  return process.cwd();
}

/**
 * Find the package root directory (where scripts/bash/ exists)
 */
function findPackageRoot(): string {
  // Check if we're in a packaged version (dist/ exists)
  const distPath = path.resolve(__dirname, '../..');
  const scriptsPath = path.join(distPath, 'scripts', 'bash');

  if (fs.existsSync(scriptsPath)) {
    return distPath.replace(/\/dist$/, '');
  }

  // Development mode: look for scripts/bash in current or parent dirs
  let current = process.cwd();
  while (current !== '/') {
    const scriptsPath = path.join(current, 'scripts', 'bash');
    if (fs.existsSync(scriptsPath)) {
      return current;
    }
    current = path.dirname(current);
  }

  // Fallback: assume scripts are in project root (package root)
  return process.cwd();
}

/**
 * Execute a bash script and return parsed JSON result
 */
export async function executeBashScript(
  scriptName: string,
  args: string[] = []
): Promise<BashResult> {
  return new Promise((resolve, reject) => {
    const packageRoot = findPackageRoot();
    const scriptPath = path.join(packageRoot, 'scripts', 'bash', `${scriptName}.sh`);

    // Set working directory to project root for bash scripts
    const projectRoot = findProjectRoot();

    const child = spawn('bash', [scriptPath, ...args], {
      cwd: projectRoot,
      env: process.env,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Script exited with code ${code}: ${stderr}`));
        return;
      }

      try {
        // Parse JSON output from script
        const parsed = JSON.parse(stdout.trim()) as unknown;
        const parsedObj = parsed as Record<string, unknown>;

        // Safely extract and validate properties
        const statusValue = parsedObj.status;
        const status: 'success' | 'error' | 'info' =
          typeof statusValue === 'string' &&
          (statusValue === 'success' || statusValue === 'error' || statusValue === 'info')
            ? (statusValue as 'success' | 'error' | 'info')
            : 'error';

        const message = typeof parsedObj.message === 'string' ? parsedObj.message : undefined;
        const project_name =
          typeof parsedObj.project_name === 'string' ? parsedObj.project_name : undefined;

        const result: BashResult = {
          status,
          message,
          project_name,
          ...parsedObj,
        };
        resolve(result);
      } catch (error) {
        reject(new Error(`Failed to parse script output: ${stdout}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Execute a bash script with real-time output
 */
export async function executeBashScriptWithOutput(
  scriptName: string,
  args: string[] = []
): Promise<void> {
  return new Promise((resolve, reject) => {
    const projectRoot = findProjectRoot();
    const scriptPath = path.join(projectRoot, 'scripts', 'bash', `${scriptName}.sh`);

    const child = spawn('bash', [scriptPath, ...args], {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'inherit', // Show output in real-time
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Script exited with code ${code}`));
        return;
      }
      resolve();
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}
