/**
 * Progress Display Utilities
 * Display progress bars and status information
 */

import chalk from 'chalk';

/**
 * Simple progress bar class
 */
export class ProgressBar {
  private current: number = 0;
  private total: number = 0;
  private title: string = '';
  private startTime: number = Date.now();

  constructor(total: number, title: string = 'Progress') {
    this.total = total;
    this.title = title;
    this.current = 0;
    this.startTime = Date.now();
  }

  /**
   * Update progress
   */
  update(current: number): void {
    this.current = current;
    this.render();
  }

  /**
   * Increment progress
   */
  increment(): void {
    this.current++;
    this.render();
  }

  /**
   * Render progress bar
   */
  private render(): void {
    const percentage = Math.floor((this.current / this.total) * 100);
    const barLength = 30;
    const filledLength = Math.floor((percentage / 100) * barLength);
    const emptyLength = barLength - filledLength;

    const bar = '█'.repeat(filledLength) + '░'.repeat(emptyLength);
    const status = `${this.current}/${this.total}`;
    const estimatedTime = this.getEstimatedTime();

    // Clear line and print
    process.stdout.write('\r\x1b[K');
    process.stdout.write(
      `${chalk.blue(this.title)}: ${chalk.cyan(bar)} ${chalk.green(percentage + '%')} (${status}) ${chalk.gray(estimatedTime)}`
    );

    if (this.current >= this.total) {
      process.stdout.write('\n');
    }
  }

  /**
   * Get estimated remaining time
   */
  private getEstimatedTime(): string {
    if (this.current === 0) return '';

    const elapsed = Date.now() - this.startTime;
    const avgTimePerItem = elapsed / this.current;
    const remaining = (this.total - this.current) * avgTimePerItem;

    if (remaining < 1000) {
      return '';
    }

    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    if (minutes > 0) {
      return `~${minutes}分${seconds}秒`;
    }
    return `~${seconds}秒`;
  }

  /**
   * Complete the progress bar
   */
  complete(): void {
    this.current = this.total;
    this.render();
  }
}

/**
 * Display a step in the process
 */
export function displayStep(stepNumber: number, totalSteps: number, description: string): void {
  console.log(chalk.blue(`\n[${stepNumber}/${totalSteps}] ${description}`));
}

/**
 * Display a success message
 */
export function displaySuccess(message: string): void {
  console.log(chalk.green(`✓ ${message}`));
}

/**
 * Display a warning message
 */
export function displayWarning(message: string): void {
  console.log(chalk.yellow(`⚠ ${message}`));
}

/**
 * Display an error message
 */
export function displayError(message: string): void {
  console.log(chalk.red(`✗ ${message}`));
}

/**
 * Display an info message
 */
export function displayInfo(message: string): void {
  console.log(chalk.gray(`ℹ ${message}`));
}

