import type { Monster, MonsterTemplate } from "@/types";
import { useCombatStore } from "@/stores/combat";
import type { CardPayload } from "../types";

export function nextBattlefieldLetter(): string {
  const combatStore = useCombatStore();
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const usedLetters = new Set(combatStore.monsters.map((m) => m.letter));
  return letters.split("").find((l) => !usedLetters.has(l)) || "?";
}

export function deployMonsterPayload(template: MonsterTemplate): Monster | null {
  const combatStore = useCombatStore();
  const monster: Omit<Monster, "id"> = {
    color: template.color,
    letter: nextBattlefieldLetter(),
    tier: template.tier,
    heartsMax: template.heartsMax,
    heartsCurrent: template.heartsMax,
    statsBonus: template.statsBonus,
    effortBonus: template.effortBonus,
    actions: template.actions,
    conditions: [...template.conditions],
    notes: template.notes,
    name: template.name,
    specialAbilities: template.specialAbilities,
    manualStatsBonus: template.manualStatsBonus,
    manualEffortBonus: template.manualEffortBonus,
    manualActions: template.manualActions,
    manualHearts: template.manualHearts,
  };
  combatStore.addMonster(monster);
  return monster as Monster;
}

export function captureMonsterPayload(data: Omit<MonsterTemplate, "label" | "savedAt">): CardPayload {
  return { v: 1, kind: "monster", data: data as MonsterTemplate };
}

export function captureMonsterFromBattlefield(monster: Monster): CardPayload {
  const { id, letter, doneTurn, turnOrder, completionOrder, heartsCurrent, ...rest } = monster;
  void id;
  void letter;
  void doneTurn;
  void turnOrder;
  void completionOrder;
  void heartsCurrent;
  return { v: 1, kind: "monster", data: rest as MonsterTemplate };
}
