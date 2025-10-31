/**
 * Interactive Prompt Utilities
 * Wrapper functions for inquirer prompts
 */

import inquirer from 'inquirer';

/**
 * Select from a list of choices
 */
export async function selectFromList<T>(
  message: string,
  choices: Array<{ name: string; value: T }> | string[],
  defaultValue?: T | string
): Promise<T> {
  const { result } = await inquirer.prompt([
    {
      type: 'list',
      name: 'result',
      message,
      choices,
      default: defaultValue,
    },
  ]);

  return result;
}

/**
 * Input a number with validation
 */
export async function inputNumber(
  message: string,
  defaultValue?: number,
  min?: number,
  max?: number
): Promise<number> {
  const { result } = await inquirer.prompt([
    {
      type: 'number',
      name: 'result',
      message,
      default: defaultValue,
      validate: (value: number) => {
        if (isNaN(value)) {
          return '请输入有效的数字';
        }
        if (min !== undefined && value < min) {
          return `数值不能小于 ${min}`;
        }
        if (max !== undefined && value > max) {
          return `数值不能大于 ${max}`;
        }
        return true;
      },
    },
  ]);

  return result;
}

/**
 * Input text
 */
export async function inputText(
  message: string,
  defaultValue?: string,
  validate?: (value: string) => boolean | string
): Promise<string> {
  const { result } = await inquirer.prompt([
    {
      type: 'input',
      name: 'result',
      message,
      default: defaultValue,
      validate: validate || (() => true),
    },
  ]);

  return result;
}

/**
 * Confirm (yes/no)
 */
export async function confirm(message: string, defaultValue: boolean = true): Promise<boolean> {
  const { result } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'result',
      message,
      default: defaultValue,
    },
  ]);

  return result;
}

/**
 * Open editor for long text input
 */
export async function openEditor(message: string, defaultValue: string = ''): Promise<string> {
  const { result } = await inquirer.prompt([
    {
      type: 'editor',
      name: 'result',
      message,
      default: defaultValue,
    },
  ]);

  return result;
}

/**
 * Select multiple choices from a list
 */
export async function selectMultiple<T>(
  message: string,
  choices: Array<{ name: string; value: T }> | string[],
  defaultValues?: T[] | string[]
): Promise<T[]> {
  const { result } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'result',
      message,
      choices,
      default: defaultValues,
    },
  ]);

  return result;
}

