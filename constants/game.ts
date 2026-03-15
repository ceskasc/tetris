export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
export const PREVIEW_ROWS = 4;
export const INITIAL_QUEUE_SIZE = 5;
export const LOCK_DELAY_MS = 550;
export const SOFT_DROP_SCORE = 1;
export const HARD_DROP_SCORE = 2;
export const INPUT_BUFFER_MS = 120;
export const DAILY_REWARD_RESET_HOUR = 4;

export const LEVEL_CURVE = [
  100,
  160,
  230,
  310,
  400,
  500,
  610,
  730,
  860,
  1000,
] as const;

export const LINE_CLEAR_POINTS = {
  tek: 100,
  cift: 300,
  uc: 500,
  dort: 800,
} as const;

export const COMBO_POINTS = 50;
export const BACK_TO_BACK_BONUS = 1.25;
export const PERFECT_CLEAR_BONUS = 1200;
