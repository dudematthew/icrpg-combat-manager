export interface Monster {
  id: string;
  color: string;
  letter: string;
  heartsMax: number;
  heartsCurrent: number;
  tier: "I" | "II" | "III" | "IV";
  statsBonus: number;
  actions: number;
  conditions: string[];
  notes: string;
  name?: string;
  specialAbilities?: string;
  // Manual mode overrides
  manualStatsBonus?: number;
  manualActions?: number;
  manualHearts?: number;
}

export interface Timer {
  id: string;
  name: string;
  duration: number;
  remaining: number;
  type: "rounds" | "turns";
}

export interface CombatState {
  sceneTargetNumber: number;
  monsters: Monster[];
  timers: Timer[];
  currentTurn: number;
  currentRound: number;
}

export interface TierConfig {
  bonus: number;
  actions: number;
  hearts: number;
  effortBonus?: number;
}

export const TIER_CONFIGS: Record<string, TierConfig> = {
  I: { bonus: 2, actions: 1, hearts: 1 },
  II: { bonus: 4, actions: 1, hearts: 2 },
  III: { bonus: 6, actions: 2, hearts: 4, effortBonus: 2 },
  IV: { bonus: 8, actions: 3, hearts: 4, effortBonus: 4 },
};

export interface Condition {
  name: string;
  effect: string;
  autoDamage?: number;
  modifier?: number;
}

export const CONDITIONS: Condition[] = [
  { name: "Paralyzed", effect: "Cannot take actions" },
  { name: "Poisoned", effect: "Roll HARD on checks", autoDamage: 1 },
  { name: "Burning", effect: "Take damage each round", autoDamage: 1 },
  { name: "Stunned", effect: "Skip next turn" },
  { name: "Bleeding", effect: "Take damage each turn", autoDamage: 1 },
];

export interface EffortConfig {
  type: string;
  die: number;
  useCase: string;
}

export const EFFORT_TYPES: EffortConfig[] = [
  { type: "Basic", die: 4, useCase: "Bare hands, wits, raw muscle, deciphering coded writing" },
  {
    type: "Weapons & Tools",
    die: 6,
    useCase: "Standard ranged or melee weapon, pry bar, bandages, torch",
  },
  { type: "Guns", die: 8, useCase: "Firearms for attack and damage, devastating damage" },
  {
    type: "Magic & Energy",
    die: 10,
    useCase: "Explosive magic, arcane energy, particle beams, lasers, plasma, magical healing",
  },
  { type: "Ultimate", die: 12, useCase: "Critical success on natural 20 - ultimate results!" },
];
