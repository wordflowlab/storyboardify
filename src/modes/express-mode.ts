/**
 * Express Mode Implementation
 * Fully automatic AI-powered storyboard generation
 */

import { BaseMode, type GenerationOptions } from './base-mode.js';
import type { ProductionPack, Storyboard, WorkspaceType } from '../types/index.js';
import { generateExpressStoryboard } from '../generators/ai-storyboard.js';

export class ExpressMode extends BaseMode {
  readonly name = 'express';

  async generate(productionPack: ProductionPack, options: GenerationOptions): Promise<Storyboard> {
    // Map style preference to AI storyboard options
    const aiStylePreference = 
      options.style_preference === 'static' ? 'minimal' as const :
      options.style_preference === 'balanced' ? 'cinematic' as const :
      'dynamic' as const;

    // Use existing Phase 2 implementation
    return await generateExpressStoryboard(productionPack, {
      workspace: options.workspace as WorkspaceType,
      style_preference: aiStylePreference,
      detail_level: options.detail_level || 'detailed',
    });
  }
}

