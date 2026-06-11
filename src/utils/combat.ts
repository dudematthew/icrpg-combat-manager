import { randomService, RandomSource } from "./randomService";

// Legacy synchronous functions (kept for backward compatibility)
export const rollD20 = (): number => {
  return Math.floor(Math.random() * 20) + 1;
};

export const rollDie = (sides: number): number => {
  return Math.floor(Math.random() * sides) + 1;
};

// New async functions using true random service
export const rollD20Async = async (
  forcePseudo: boolean = false
): Promise<{
  value: number;
  source: RandomSource;
}> => {
  return randomService.rollD20(forcePseudo);
};

export const rollDieAsync = async (
  sides: number,
  forcePseudo: boolean = false
): Promise<{
  value: number;
  source: RandomSource;
}> => {
  return randomService.rollDie(sides, forcePseudo);
};

export const PRESET_TARGET_NUMBERS = [10, 12, 15, 18] as const;

export type RollDifficulty = "easy" | "normal" | "hard";

export function adjustTarget(baseTarget: number, difficulty: RollDifficulty): number {
  if (difficulty === "hard") return baseTarget + 3;
  if (difficulty === "easy") return baseTarget - 3;
  return baseTarget;
}

export interface CheckRollResult {
  naturalRoll: number;
  totalRoll: number;
  baseTarget: number;
  targetNumber: number;
  hit: boolean;
  critical: boolean;
  randomSource?: RandomSource;
}

export interface EffortRollResult {
  die: number;
  roll: number;
  bonus: number;
  total: number;
  randomSource?: RandomSource;
}

export interface AttackResult {
  success: boolean;
  naturalRoll: number;
  totalRoll: number;
  targetNumber: number;
  effort?: number;
  baseEffort?: number;
  criticalBonus?: number;
  critical?: boolean;
  randomSource?: RandomSource;
}

export const makeAttack = (
  statBonus: number,
  targetNumber: number,
  effortDie: number,
  isHard: boolean = false,
  isEasy: boolean = false
): AttackResult => {
  const naturalRoll = rollD20();
  const adjustedTarget = isHard ? targetNumber + 3 : isEasy ? targetNumber - 3 : targetNumber;
  const totalRoll = naturalRoll + statBonus;
  const success = totalRoll >= adjustedTarget;
  const critical = naturalRoll === 20;

  let effort: number | undefined;
  let baseEffort: number | undefined;
  let criticalBonus: number | undefined;
  if (success && effortDie > 0) {
    baseEffort = rollDie(effortDie);
    effort = baseEffort;
    if (critical) {
      criticalBonus = rollDie(12); // Critical bonus d12
      effort += criticalBonus;
    }
  }

  return {
    success,
    naturalRoll,
    totalRoll,
    targetNumber: adjustedTarget,
    effort,
    baseEffort,
    criticalBonus,
    critical,
  };
};

// New async version using true random service
export const makeAttackAsync = async (
  statBonus: number,
  targetNumber: number,
  effortDie: number,
  isHard: boolean = false,
  isEasy: boolean = false,
  forcePseudo: boolean = false
): Promise<AttackResult> => {
  const naturalRollResult = await rollD20Async(forcePseudo);
  const naturalRoll = naturalRollResult.value;
  const adjustedTarget = isHard ? targetNumber + 3 : isEasy ? targetNumber - 3 : targetNumber;
  const totalRoll = naturalRoll + statBonus;
  const success = totalRoll >= adjustedTarget;
  const critical = naturalRoll === 20;

  let effort: number | undefined;
  let baseEffort: number | undefined;
  let criticalBonus: number | undefined;
  if (success && effortDie > 0) {
    const effortResult = await rollDieAsync(effortDie, forcePseudo);
    baseEffort = effortResult.value;
    effort = baseEffort;
    if (critical) {
      const critResult = await rollDieAsync(12, forcePseudo);
      criticalBonus = critResult.value;
      effort += criticalBonus;
    }
  }

  return {
    success,
    naturalRoll,
    totalRoll,
    targetNumber: adjustedTarget,
    effort,
    baseEffort,
    criticalBonus,
    critical,
    randomSource: naturalRollResult.source,
  };
};

export interface MonsterAttackPreview {
  naturalRoll: number;
  totalRoll: number;
  targets: {
    easy: number;
    normal: number;
    hard: number;
  };
  randomSource?: RandomSource;
}

/** One d20 + stat; totals for easy/normal/hard targets (no success/fail). */
export const rollCheckOnly = (
  statBonus: number,
  baseTarget: number,
  difficulty: RollDifficulty = "normal",
): CheckRollResult => {
  const naturalRoll = rollD20();
  const targetNumber = adjustTarget(baseTarget, difficulty);
  const totalRoll = naturalRoll + statBonus;
  return {
    naturalRoll,
    totalRoll,
    baseTarget,
    targetNumber,
    hit: totalRoll >= targetNumber,
    critical: naturalRoll === 20,
  };
};

export const rollCheckOnlyAsync = async (
  statBonus: number,
  baseTarget: number,
  difficulty: RollDifficulty = "normal",
  forcePseudo = false,
): Promise<CheckRollResult> => {
  const naturalRollResult = await rollD20Async(forcePseudo);
  const naturalRoll = naturalRollResult.value;
  const targetNumber = adjustTarget(baseTarget, difficulty);
  const totalRoll = naturalRoll + statBonus;
  return {
    naturalRoll,
    totalRoll,
    baseTarget,
    targetNumber,
    hit: totalRoll >= targetNumber,
    critical: naturalRoll === 20,
    randomSource: naturalRollResult.source,
  };
};

export const rollEffort = (die: number, bonus = 0): EffortRollResult => {
  const roll = die > 0 ? rollDie(die) : 0;
  return { die, roll, bonus, total: roll + bonus };
};

export const rollEffortAsync = async (
  die: number,
  bonus = 0,
  forcePseudo = false,
): Promise<EffortRollResult> => {
  if (die <= 0) return { die, roll: 0, bonus, total: bonus };
  const result = await rollDieAsync(die, forcePseudo);
  return { die, roll: result.value, bonus, total: result.value + bonus, randomSource: result.source };
};

export interface MonsterCheckOutcomes {
  easy: boolean;
  normal: boolean;
  hard: boolean;
}

/** Pass/fail vs easy, normal, and hard targets for a picked base TN. */
export function monsterCheckOutcomes(totalRoll: number, baseTarget: number): MonsterCheckOutcomes {
  return {
    easy: totalRoll >= baseTarget - 3,
    normal: totalRoll >= baseTarget,
    hard: totalRoll >= baseTarget + 3,
  };
}

/** Which preset TNs the total beats at normal difficulty. */
export function presetTargetSummary(totalRoll: number): { beats: number[]; misses: number[] } {
  const beats: number[] = [];
  const misses: number[] = [];
  for (const tn of PRESET_TARGET_NUMBERS) {
    if (totalRoll >= tn) beats.push(tn);
    else misses.push(tn);
  }
  return { beats, misses };
}

export const rollMonsterAttackPreview = (
  statBonus: number,
  baseTarget: number,
): MonsterAttackPreview => {
  const naturalRoll = rollD20();
  const totalRoll = naturalRoll + statBonus;
  return {
    naturalRoll,
    totalRoll,
    targets: {
      easy: baseTarget - 3,
      normal: baseTarget,
      hard: baseTarget + 3,
    },
  };
};

export const rollMonsterAttackPreviewAsync = async (
  statBonus: number,
  baseTarget: number,
  forcePseudo = false,
): Promise<MonsterAttackPreview> => {
  const naturalRollResult = await rollD20Async(forcePseudo);
  const naturalRoll = naturalRollResult.value;
  const totalRoll = naturalRoll + statBonus;
  return {
    naturalRoll,
    totalRoll,
    targets: {
      easy: baseTarget - 3,
      normal: baseTarget,
      hard: baseTarget + 3,
    },
    randomSource: naturalRollResult.source,
  };
};

export const getEffortDie = (effortType: string): number => {
  switch (effortType) {
    case "none":
      return 0;
    case "Basic":
      return 4;
    case "Weapons & Tools":
      return 6;
    case "Guns":
      return 8;
    case "Magic & Energy":
      return 10;
    case "Ultimate":
      return 12;
    default:
      return 6;
  }
};

export const heartsToHP = (hearts: number): number => {
  return hearts * 10;
};

export const hpToHearts = (hp: number): number => {
  return Math.ceil(hp / 10);
};

export const formatMonsterIdentifier = (color: string, letter: string): string => {
  return `${color}-${letter}`;
};

export const getTierColor = (tier: string): string => {
  switch (tier) {
    case "I":
      return "#059669";
    case "II":
      return "#d97706";
    case "III":
      return "#dc2626";
    case "IV":
      return "#7c2d12";
    default:
      return "#525252";
  }
};

export const getMonsterColor = (color: string): string => {
  switch (color.toLowerCase()) {
    case "red":
      return "#dc2626";
    case "blue":
      return "#2563eb";
    case "green":
      return "#16a34a";
    case "yellow":
      return "#eab308";
    case "purple":
      return "#9333ea";
    case "orange":
      return "#ea580c";
    case "black":
      return "#171717";
    case "white":
      return "#f5f5f5";
    case "grey":
    case "gray":
      return "#6b7280";
    case "brown":
      return "#92400e";
    default:
      return "#525252";
  }
};

// Helper function to calculate relative luminance of a color
const getLuminance = (hex: string): number => {
  // Remove the # if present
  const cleanHex = hex.replace("#", "");

  // Convert hex to RGB
  const r = parseInt(cleanHex.substr(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substr(2, 2), 16) / 255;
  const b = parseInt(cleanHex.substr(4, 2), 16) / 255;

  // Apply gamma correction
  const sR = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const sG = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const sB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  // Calculate relative luminance
  return 0.2126 * sR + 0.7152 * sG + 0.0722 * sB;
};

// Function to determine if text should be light or dark based on background color
export const getTextColorForBackground = (backgroundColor: string): string => {
  const luminance = getLuminance(backgroundColor);
  // If background is light (luminance > 0.5), use dark text; otherwise use light text
  return luminance > 0.5 ? "#171717" : "#ffffff";
};
