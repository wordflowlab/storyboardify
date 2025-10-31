/**
 * 场景智能拆分算法
 * 根据场景内容、长度和情节密度,智能决定镜头数量和划分
 */

import type { Scene, SceneSheet } from '../types/index.js';

export interface ShotPlan {
  shot_number: number;
  content_focus: string; // 这个镜头重点展示什么
  suggested_shot_type: string; // 建议的景别
  suggested_angle: string; // 建议的角度
  rationale: string; // 为什么这样设计
}

export interface SceneSplitResult {
  scene_id: string;
  estimated_shots: number;
  shot_plans: ShotPlan[];
  pacing: 'slow' | 'medium' | 'fast'; // 节奏
  complexity: 'simple' | 'moderate' | 'complex'; // 复杂度
}

/**
 * 分析场景复杂度
 */
function analyzeSceneComplexity(
  scene: Scene,
  _sceneSheet?: SceneSheet
): 'simple' | 'moderate' | 'complex' {
  let complexity_score = 0;

  const content = scene.content || `${scene.location} ${scene.time}`;

  // 1. 内容长度
  const content_length = content.length;
  if (content_length > 500) complexity_score += 2;
  else if (content_length > 200) complexity_score += 1;

  // 2. 对话轮数
  const dialogue_count = (content.match(/[「『"]/g) || []).length;
  if (dialogue_count > 6) complexity_score += 2;
  else if (dialogue_count > 3) complexity_score += 1;

  // 3. 场景元素 (使用时需要解除注释)
  // if (sceneSheet) {
  //   const layout_elements = sceneSheet.layout_description.split('、').length;
  //   if (layout_elements > 5) complexity_score += 1;
  // }

  // 4. 动作描述
  const action_keywords = ['走', '跑', '打', '推', '拉', '转身', '坐下', '站起'];
  const action_count = action_keywords.filter(kw => content.includes(kw)).length;
  if (action_count > 5) complexity_score += 2;
  else if (action_count > 2) complexity_score += 1;

  if (complexity_score >= 5) return 'complex';
  if (complexity_score >= 3) return 'moderate';
  return 'simple';
}

/**
 * 根据复杂度和情节密度估算镜头数
 */
function estimateShotCount(scene: Scene, complexity: string): number {
  const base_shots = {
    simple: 3,
    moderate: 5,
    complex: 8,
  }[complexity] || 5;

  const content = scene.content || `${scene.location} ${scene.time}`;

  // 根据对话数调整
  const dialogue_count = (content.match(/[「『"]/g) || []).length;
  const dialogue_adjustment = Math.floor(dialogue_count / 2);

  // 根据内容长度调整
  const length_adjustment = Math.floor(content.length / 300);

  return Math.min(base_shots + dialogue_adjustment + length_adjustment, 15); // 最多15个镜头
}

/**
 * 决定场景节奏
 */
function determineScenePacing(scene: Scene): 'slow' | 'medium' | 'fast' {
  const content = scene.content || `${scene.location} ${scene.time}`;

  // 快节奏关键词
  const fast_keywords = ['急', '快', '跑', '冲', '追', '打', '爆炸', '紧张'];
  const fast_count = fast_keywords.filter(kw => content.includes(kw)).length;

  // 慢节奏关键词
  const slow_keywords = ['慢', '静', '沉默', '凝视', '回忆', '思考'];
  const slow_count = slow_keywords.filter(kw => content.includes(kw)).length;

  if (fast_count > slow_count && fast_count > 2) return 'fast';
  if (slow_count > fast_count && slow_count > 2) return 'slow';
  return 'medium';
}

/**
 * 生成镜头规划
 */
function generateShotPlans(
  scene: Scene,
  _sceneSheet: SceneSheet | undefined,
  shot_count: number,
  pacing: string
): ShotPlan[] {
  const plans: ShotPlan[] = [];

  // 第一个镜头:建立环境
  plans.push({
    shot_number: 1,
    content_focus: `${scene.name}的整体环境`,
    suggested_shot_type: '全景',
    suggested_angle: '平视',
    rationale: '开场建立空间感,让观众了解场景位置和布局',
  });

  // 中间镜头:内容展开
  const middle_shots = shot_count - 2;
  for (let i = 0; i < middle_shots; i++) {
    const shot_num = i + 2;
    const progress = i / middle_shots; // 0到1的进度

    // 根据进度和节奏调整景别
    let shot_type = '中景';
    let angle = '平视';

    if (progress < 0.3) {
      // 前30%: 建立中景
      shot_type = '中景';
    } else if (progress > 0.7) {
      // 后30%: 推向特写
      shot_type = pacing === 'fast' ? '特写' : '近景';
      angle = '微仰视';
    } else {
      // 中间: 灵活运用
      shot_type = shot_num % 2 === 0 ? '中景' : '近景';
    }

    plans.push({
      shot_number: shot_num,
      content_focus: `场景进展 - 第${shot_num}段落`,
      suggested_shot_type: shot_type,
      suggested_angle: angle,
      rationale: `根据${pacing === 'fast' ? '快节奏' : pacing === 'slow' ? '慢节奏' : '中等节奏'}设计`,
    });
  }

  // 最后一个镜头:结尾或转场
  plans.push({
    shot_number: shot_count,
    content_focus: '场景结束或转场',
    suggested_shot_type: pacing === 'fast' ? '特写' : '中景',
    suggested_angle: '平视',
    rationale: `${pacing === 'fast' ? '快节奏场景用特写强化情绪收尾' : '用中景平稳过渡到下一场景'}`,
  });

  return plans;
}

/**
 * 智能拆分场景为镜头规划
 */
export function splitSceneIntoShots(
  scene: Scene,
  sceneSheet?: SceneSheet
): SceneSplitResult {
  // 1. 分析场景复杂度
  const complexity = analyzeSceneComplexity(scene, sceneSheet);

  // 2. 估算镜头数
  const estimated_shots = estimateShotCount(scene, complexity);

  // 3. 确定节奏
  const pacing = determineScenePacing(scene);

  // 4. 生成镜头规划
  const shot_plans = generateShotPlans(scene, sceneSheet, estimated_shots, pacing);

  return {
    scene_id: scene.id,
    estimated_shots,
    shot_plans,
    pacing,
    complexity,
  };
}

/**
 * 为整个剧本生成场景拆分规划
 */
export function generateSceneSplitPlan(
  scenes: Scene[],
  sceneSheets: SceneSheet[]
): SceneSplitResult[] {
  const scene_sheet_map = new Map(sceneSheets.map(sheet => [sheet.scene_id, sheet]));

  return scenes.map(scene => {
    const sheet = scene_sheet_map.get(scene.id);
    return splitSceneIntoShots(scene, sheet);
  });
}
