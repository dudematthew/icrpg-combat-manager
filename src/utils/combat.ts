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

export interface AttackResult {
  success: boolean;
  naturalRoll: number;
  totalRoll: number;
  targetNumber: number;
  effort?: number;
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
  if (success) {
    effort = rollDie(effortDie);
    if (critical) {
      effort += rollDie(12); // Critical bonus d12
    }
  }

  return {
    success,
    naturalRoll,
    totalRoll,
    targetNumber: adjustedTarget,
    effort,
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
  if (success) {
    const effortResult = await rollDieAsync(effortDie, forcePseudo);
    effort = effortResult.value;
    if (critical) {
      const critResult = await rollDieAsync(12, forcePseudo);
      effort += critResult.value;
    }
  }

  return {
    success,
    naturalRoll,
    totalRoll,
    targetNumber: adjustedTarget,
    effort,
    critical,
    randomSource: naturalRollResult.source,
  };
};

export const getEffortDie = (effortType: string): number => {
  switch (effortType) {
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
