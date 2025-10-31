/**
 * 智能运镜优化器
 * 根据镜头类型、场景节奏、情绪等因素,优化运镜参数
 */

import type { CameraMovement, Shot } from '../types/index.js';

export interface CameraOptimizationContext {
  shot_type: string; // 景别
  scene_pacing: 'slow' | 'medium' | 'fast'; // 场景节奏
  mood?: string; // 情绪
  is_dialogue: boolean; // 是否有对话
  is_action: boolean; // 是否有动作
  shot_position: 'opening' | 'middle' | 'climax' | 'closing'; // 镜头位置
}

export interface OptimizedCamera {
  movement: {
    type: '静止' | '推' | '拉' | '摇' | '移' | '跟' | '升' | '降' | '环绕';
    speed?: '极慢' | '慢速' | '中速' | '快速' | '极快';
    description: string;
  };
  angle: {
    type: '俯视' | '平视' | '仰视' | '倾斜' | '主观视角';
    degree?: string; // 如"45度俯视"
  };
  focus: {
    type: 'shallow' | 'deep'; // 景深
    subject: string; // 对焦主体
  };
  duration?: string; // 建议时长
  rationale: string; // 设计理由
}

/**
 * 根据景别和节奏选择运镜方式
 */
function selectCameraMovement(
  shot_type: string,
  pacing: string,
  is_action: boolean
): CameraMovement['type'] {
  // 动作场景:优先跟镜和移镜
  if (is_action) {
    if (shot_type.includes('全景') || shot_type.includes('远景')) return '移';
    if (shot_type.includes('特写')) return '跟';
    return '摇';
  }

  // 快节奏:动态运镜
  if (pacing === 'fast') {
    if (shot_type.includes('全景')) return '摇';
    if (shot_type.includes('特写')) return '推';
    return '移';
  }

  // 慢节奏:静态或缓慢推拉
  if (pacing === 'slow') {
    if (shot_type.includes('特写')) return '推';
    if (shot_type.includes('全景')) return '静止';
    return '移';
  }

  // 中等节奏:平衡
  if (shot_type.includes('全景')) return '移';
  if (shot_type.includes('特写')) return '推';
  return '摇';
}

/**
 * 根据节奏和运镜类型确定速度
 */
function determineCameraSpeed(
  movement_type: string,
  pacing: string,
  is_dialogue: boolean
): '极慢' | '慢速' | '中速' | '快速' | '极快' {
  // 静止镜头无速度
  if (movement_type === '静止') return '中速';

  // 对话场景:较慢
  if (is_dialogue) {
    return pacing === 'fast' ? '中速' : '慢速';
  }

  // 根据节奏映射
  const speed_map: Record<string, ('极慢' | '慢速' | '中速' | '快速' | '极快')> = {
    slow: '慢速',
    medium: '中速',
    fast: '快速',
  };

  return speed_map[pacing] || '中速';
}

/**
 * 根据情绪和位置选择角度
 */
function selectCameraAngle(
  mood: string | undefined,
  shot_position: string,
  shot_type: string
): OptimizedCamera['angle'] {
  // 开场:平视建立
  if (shot_position === 'opening') {
    return {
      type: '平视',
      degree: undefined,
    };
  }

  // 高潮:根据情绪调整
  if (shot_position === 'climax') {
    if (mood?.includes('紧张') || mood?.includes('恐惧')) {
      return {
        type: '俯视',
        degree: '30度俯视',
      };
    }
    if (mood?.includes('激昂') || mood?.includes('振奋')) {
      return {
        type: '仰视',
        degree: '15度仰视',
      };
    }
  }

  // 特写:微仰增加感染力
  if (shot_type.includes('特写')) {
    return {
      type: '仰视',
      degree: '10度微仰',
    };
  }

  // 全景:俯视展示空间
  if (shot_type.includes('全景') || shot_type.includes('远景')) {
    return {
      type: '俯视',
      degree: '20度俯视',
    };
  }

  // 默认平视
  return {
    type: '平视',
    degree: undefined,
  };
}

/**
 * 确定景深策略
 */
function determineFocus(
  shot_type: string,
  is_dialogue: boolean
): OptimizedCamera['focus'] {
  // 特写和近景:浅景深突出主体
  if (shot_type.includes('特写') || shot_type.includes('近景')) {
    return {
      type: 'shallow',
      subject: '人物面部/关键物体',
    };
  }

  // 对话:浅景深聚焦说话者
  if (is_dialogue && !shot_type.includes('全景')) {
    return {
      type: 'shallow',
      subject: '对话人物',
    };
  }

  // 全景和中景:深景深展示环境
  return {
    type: 'deep',
    subject: '整体场景',
  };
}

/**
 * 估算镜头时长
 */
function estimateDuration(
  shot_type: string,
  pacing: string,
  is_dialogue: boolean
): string {
  const base_duration: Record<string, number> = {
    slow: 5,
    medium: 3,
    fast: 2,
  };

  let duration = base_duration[pacing] || 3;

  // 特写可以更短
  if (shot_type.includes('特写')) {
    duration -= 1;
  }

  // 全景需要更长
  if (shot_type.includes('全景')) {
    duration += 1;
  }

  // 对话镜头更长
  if (is_dialogue) {
    duration += 2;
  }

  return `${Math.max(duration, 1)}-${duration + 2}秒`;
}

/**
 * 生成设计理由
 */
function generateRationale(
  movement_type: string,
  angle_type: string,
  _shot_type: string,
  pacing: string,
  is_action: boolean,
  is_dialogue: boolean
): string {
  const reasons: string[] = [];

  // 运镜理由
  const movement_reasons: Record<string, string> = {
    静止: '静态构图强调稳定性',
    推: '推镜聚焦情绪或细节',
    拉: '拉镜展示空间关系',
    摇: '摇镜展示环境或跟随动作',
    移: '移镜营造流畅的视觉流动',
    跟: '跟镜紧随人物或物体',
    升: '升镜展现宏大场面',
    降: '降镜聚焦地面细节',
    环绕: '环绕镜头营造立体空间感',
  };
  reasons.push(movement_reasons[movement_type] || '动态构图');

  // 角度理由
  if (angle_type === '俯视') {
    reasons.push('俯视角度展示空间布局');
  } else if (angle_type === '仰视') {
    reasons.push('仰视角度增强气势');
  }

  // 节奏理由
  if (pacing === 'fast') {
    reasons.push('快节奏剪辑增强紧张感');
  } else if (pacing === 'slow') {
    reasons.push('慢节奏营造沉浸氛围');
  }

  // 场景特性理由
  if (is_action) reasons.push('动作场景需要动态跟随');
  if (is_dialogue) reasons.push('对话场景保持视觉稳定');

  return reasons.join('; ');
}

/**
 * 优化运镜参数
 */
export function optimizeCameraParameters(context: CameraOptimizationContext): OptimizedCamera {
  // 1. 选择运镜方式
  const movement_type = selectCameraMovement(
    context.shot_type,
    context.scene_pacing,
    context.is_action
  );

  // 2. 确定速度
  const speed = determineCameraSpeed(
    movement_type,
    context.scene_pacing,
    context.is_dialogue
  );

  // 3. 选择角度
  const angle = selectCameraAngle(context.mood, context.shot_position, context.shot_type);

  // 4. 确定景深
  const focus = determineFocus(context.shot_type, context.is_dialogue);

  // 5. 估算时长
  const duration = estimateDuration(context.shot_type, context.scene_pacing, context.is_dialogue);

  // 6. 生成运镜描述
  const movement_description = `${speed}${movement_type}${movement_type === '静止' ? '镜头' : '镜'}`;

  // 7. 生成设计理由
  const rationale = generateRationale(
    movement_type,
    angle.type,
    context.shot_type,
    context.scene_pacing,
    context.is_action,
    context.is_dialogue
  );

  return {
    movement: {
      type: movement_type,
      speed,
      description: movement_description,
    },
    angle,
    focus,
    duration,
    rationale,
  };
}

/**
 * 为一系列镜头批量优化运镜
 */
export function optimizeShotsCamera(
  shots: Partial<Shot>[],
  scene_pacing: 'slow' | 'medium' | 'fast'
): OptimizedCamera[] {
  return shots.map((shot, index) => {
    const total = shots.length;
    let shot_position: CameraOptimizationContext['shot_position'] = 'middle';

    if (index === 0) shot_position = 'opening';
    else if (index === total - 1) shot_position = 'closing';
    else if (index / total > 0.6 && index / total < 0.8) shot_position = 'climax';

    const context: CameraOptimizationContext = {
      shot_type: shot.shot_type || '中景',
      scene_pacing,
      mood: shot.mood?.emotion,
      is_dialogue: (shot.content?.includes('「') || shot.content?.includes('"')) || false,
      is_action: shot.content?.match(/走|跑|打|推|拉|转身|坐下|站起/) !== null || false,
      shot_position,
    };

    return optimizeCameraParameters(context);
  });
}
