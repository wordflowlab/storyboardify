/**
 * Base Mode Class
 * 所有生成模式的基类,提供共享功能
 */

import fs from 'fs-extra';
import path from 'path';
import type { Storyboard, ProductionPack, ValidationResult } from '../types/index.js';

export interface GenerationOptions {
  workspace: string;
  style_preference?: 'dynamic' | 'static' | 'balanced';
  detail_level?: 'basic' | 'detailed' | 'comprehensive';
}

export interface ModeState {
  mode: 'coach' | 'hybrid' | 'express';
  started_at: string;
  last_saved_at: string;
  current_scene_index: number;
  current_shot_index: number;
  data: CoachModeState | HybridModeState | Record<string, unknown>;
}

export interface CoachModeState {
  questions_asked: QuestionRecord[];
  user_answers: AnswerRecord[];
  generated_shots: unknown[];
  education_points: string[];
}

export interface HybridModeState {
  framework_generated: boolean;
  framework: unknown[];
  user_filled_shots: unknown[];
  completion_progress: number;
  validation_results: unknown[];
}

export interface QuestionRecord {
  scene_id: string;
  question: string;
  timestamp: string;
}

export interface AnswerRecord {
  scene_id: string;
  answer: string;
  timestamp: string;
}

/**
 * Base Mode Abstract Class
 */
export abstract class BaseMode {
  abstract readonly name: string;
  protected projectDir: string;

  constructor(projectDir: string = process.cwd()) {
    this.projectDir = projectDir;
  }

  /**
   * Generate storyboard - must be implemented by subclasses
   */
  abstract generate(
    productionPack: ProductionPack,
    options: GenerationOptions
  ): Promise<Storyboard>;

  /**
   * Validate storyboard
   */
  protected validate(storyboard: Storyboard): ValidationResult {
    const errors: ValidationResult['errors'] = [];
    const warnings: ValidationResult['warnings'] = [];

    // 1. Check basic structure
    if (!storyboard.metadata) {
      errors.push({
        field: 'metadata',
        message: 'Storyboard metadata is missing',
        severity: 'error',
      });
    }

    if (!storyboard.scenes || storyboard.scenes.length === 0) {
      errors.push({
        field: 'scenes',
        message: 'Storyboard has no scenes',
        severity: 'error',
      });
    }

    // 2. Validate scenes and shots
    if (storyboard.scenes) {
      storyboard.scenes.forEach((scene, sceneIndex) => {
        if (!scene.shots || scene.shots.length === 0) {
          warnings.push({
            field: `scenes[${sceneIndex}].shots`,
            message: `Scene "${scene.scene_name}" has no shots`,
            severity: 'warning',
          });
        }

        scene.shots.forEach((shot, shotIndex) => {
          if (!shot.shot_type) {
            errors.push({
              field: `scenes[${sceneIndex}].shots[${shotIndex}].shot_type`,
              message: 'Shot is missing shot_type',
              severity: 'error',
            });
          }

          if (!shot.camera_angle) {
            errors.push({
              field: `scenes[${sceneIndex}].shots[${shotIndex}].camera_angle`,
              message: 'Shot is missing camera_angle',
              severity: 'error',
            });
          }

          if (!shot.content || shot.content.trim().length < 10) {
            warnings.push({
              field: `scenes[${sceneIndex}].shots[${shotIndex}].content`,
              message: 'Shot content is too short (less than 10 characters)',
              severity: 'warning',
            });
          }
        });
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Save progress state
   */
  protected async saveProgress(state: ModeState): Promise<void> {
    const statePath = this.getStatePath();
    const stateDir = path.dirname(statePath);

    // Ensure directory exists
    await fs.ensureDir(stateDir);

    // Update timestamps
    state.last_saved_at = new Date().toISOString();

    // Write state
    await fs.writeJSON(statePath, state, { spaces: 2 });
  }

  /**
   * Load progress state
   */
  protected async loadProgress(): Promise<ModeState | null> {
    const statePath = this.getStatePath();

    if (await fs.pathExists(statePath)) {
      return await fs.readJSON(statePath);
    }

    return null;
  }

  /**
   * Clear progress state
   */
  protected async clearProgress(): Promise<void> {
    const statePath = this.getStatePath();

    if (await fs.pathExists(statePath)) {
      await fs.remove(statePath);
    }
  }

  /**
   * Get state file path
   */
  private getStatePath(): string {
    return path.join(this.projectDir, '.storyboardify', 'mode-state.json');
  }

  /**
   * Initialize mode state
   */
  protected initState(mode: 'coach' | 'hybrid' | 'express'): ModeState {
    return {
      mode,
      started_at: new Date().toISOString(),
      last_saved_at: new Date().toISOString(),
      current_scene_index: 0,
      current_shot_index: 0,
      data: {},
    };
  }
}

