/**
 * Education Content for Coach Mode
 * 分镜理论教学内容库
 */

import chalk from 'chalk';

/**
 * Shot Type Education Tips
 */
export const SHOT_TYPE_TIPS: Record<string, string> = {
  远景: '远景用于建立空间关系,展示角色与环境的关系。适合开场或场景切换。',
  全景: '全景展示角色全身和周围环境,适合动作场景和对话场景。',
  中景: '中景从腰部以上拍摄,适合对话和人物互动,最常用的景别。',
  近景: '近景从胸部以上拍摄,强调表情和情绪。',
  特写: '特写聚焦面部或物体细节,用于情绪高潮或重要信息展示。',
  大特写: '大特写拍摄眼睛或物体局部,极强的情绪冲击力。',
};

/**
 * Camera Angle Education Tips
 */
export const CAMERA_ANGLE_TIPS: Record<string, string> = {
  平视: '平视是最自然的角度,让观众感觉与角色处于平等地位。',
  俯视: '俯视展示空间布局,或营造角色弱势、压抑的感觉。',
  仰视: '仰视增强角色的气势和力量感,营造高大、威严的印象。',
  斜角: '斜角增加画面动态感和不安定感,常用于悬疑或动作场景。',
  鸟瞰: '鸟瞰从极高角度俯视,展示全局视野,营造史诗感。',
  虫视: '虫视从极低角度仰视,营造压迫感或展示角色的高大威严。',
};

/**
 * Camera Movement Education Tips
 */
export const CAMERA_MOVEMENT_TIPS: Record<string, string> = {
  静止: '静止镜头强调稳定性和构图,让观众专注于画面内容。',
  推: '推镜逐渐靠近主体,引导观众注意力,营造紧张感或揭示细节。',
  拉: '拉镜逐渐远离主体,展示更大范围,常用于场景切换或展示空间关系。',
  摇: '摇镜水平移动,跟随动作或展示环境,自然流畅。',
  移: '移镜跟随角色移动,保持视角连贯,适合动作场景。',
  跟: '跟镜紧跟角色,营造代入感,适合追逐或探索场景。',
  升: '升镜向上移动,展现宏大场面或揭示更广阔的视野。',
  降: '降镜向下移动,聚焦地面细节或营造下沉感。',
  环绕: '环绕镜头围绕主体旋转,营造立体空间感和戏剧性。',
};

/**
 * Pacing Education Tips
 */
export const PACING_TIPS: Record<string, string> = {
  fast: `快节奏场景建议:
  - 更多短镜头(2-3秒)
  - 动态运镜(推/摇/移)
  - 多角度切换
  - 少用静止镜头`,
  medium: `中等节奏场景建议:
  - 镜头时长 3-6 秒
  - 静止和运镜结合
  - 平视和仰俯视混合`,
  slow: `慢节奏场景建议:
  - 更多长镜头(5-10秒)
  - 静止或缓慢运镜
  - 多用特写展示情绪
  - 少切换角度`,
};

/**
 * Mood-based Education Tips
 */
export const MOOD_TIPS: Record<string, string> = {
  紧张: '紧张氛围建议使用快节奏、短镜头、动态运镜和俯视角度',
  温馨: '温馨氛围建议使用慢节奏、长镜头、静止或缓慢运镜和平视角度',
  悲伤: '悲伤氛围建议多用特写展示情绪,配合慢节奏和柔和的运镜',
  欢快: '欢快氛围建议使用中快节奏、动态运镜和多角度切换',
  神秘: '神秘氛围建议使用中慢节奏、斜角和阴影,配合推拉镜头',
  恐怖: '恐怖氛围建议使用低角度、阴暗色调、慢节奏推镜营造压迫感',
};

/**
 * Display an education tip
 */
export function showEducationTip(category: 'shot_type' | 'angle' | 'movement' | 'pacing' | 'mood', key: string): void {
  let tip: string | undefined;

  switch (category) {
    case 'shot_type':
      tip = SHOT_TYPE_TIPS[key];
      break;
    case 'angle':
      tip = CAMERA_ANGLE_TIPS[key];
      break;
    case 'movement':
      tip = CAMERA_MOVEMENT_TIPS[key];
      break;
    case 'pacing':
      tip = PACING_TIPS[key];
      break;
    case 'mood':
      tip = MOOD_TIPS[key];
      break;
  }

  if (tip) {
    console.log(chalk.blue(`\n💡 分镜技巧: ${tip}\n`));
  }
}

/**
 * Get all tips for a category
 */
export function getAllTips(category: 'shot_type' | 'angle' | 'movement'): Record<string, string> {
  switch (category) {
    case 'shot_type':
      return SHOT_TYPE_TIPS;
    case 'angle':
      return CAMERA_ANGLE_TIPS;
    case 'movement':
      return CAMERA_MOVEMENT_TIPS;
    default:
      return {};
  }
}

