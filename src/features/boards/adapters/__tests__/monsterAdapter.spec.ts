import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useCombatStore } from "@/stores/combat";
import {
  captureMonsterPayload,
  deployMonsterPayload,
  nextBattlefieldLetter,
} from "../monsterAdapter";
import type { MonsterTemplate } from "@/types";

describe("monsterAdapter", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it("captures monster template payload", () => {
    const template: MonsterTemplate = {
      color: "Red",
      tier: "II",
      heartsMax: 2,
      statsBonus: 4,
      effortBonus: 0,
      actions: 1,
      conditions: [],
      notes: "test",
      name: "Goblin",
      label: "Red Goblin",
      savedAt: "2024-01-01",
    };
    const payload = captureMonsterPayload(template);
    expect(payload).toEqual({ v: 1, kind: "monster", data: template });
  });

  it("deploys monster to combat store with next letter", () => {
    const combatStore = useCombatStore();
    const template: MonsterTemplate = {
      color: "Blue",
      tier: "I",
      heartsMax: 1,
      statsBonus: 2,
      effortBonus: 0,
      actions: 1,
      conditions: [],
      notes: "",
      name: "Slime",
      label: "Blue Slime",
      savedAt: "2024-01-01",
    };

    expect(nextBattlefieldLetter()).toBe("A");
    deployMonsterPayload(template);

    expect(combatStore.monsters).toHaveLength(1);
    expect(combatStore.monsters[0].letter).toBe("A");
    expect(combatStore.monsters[0].color).toBe("Blue");
    expect(combatStore.monsters[0].name).toBe("Slime");
  });
});
