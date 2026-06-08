import { defineStore } from "pinia";
import { ref } from "vue";
import type { Monster, MonsterTemplate } from "@/types";
import { templateLabel } from "@/utils/monsterForm";
import { useCombatStore } from "./combat";

const STORAGE_KEY = "icrpg-monster-library";

export const useMonsterLibraryStore = defineStore("monsterLibrary", () => {
  const templates = ref<MonsterTemplate[]>([]);

  const load = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      templates.value = JSON.parse(saved) as MonsterTemplate[];
    }
  };

  const persist = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates.value));
  };

  load();

  const saveTemplate = (data: Omit<MonsterTemplate, "label" | "savedAt">, label?: string) => {
    const template: MonsterTemplate = {
      ...data,
      label: label || templateLabel(data as MonsterTemplate),
      savedAt: new Date().toISOString(),
    };
    templates.value.push(template);
    persist();
    return template;
  };

  const updateTemplate = (index: number, updates: Partial<MonsterTemplate>) => {
    if (index < 0 || index >= templates.value.length) return;
    templates.value[index] = { ...templates.value[index], ...updates };
    persist();
  };

  const removeTemplate = (index: number) => {
    templates.value.splice(index, 1);
    persist();
  };

  const duplicateTemplate = (index: number) => {
    const source = templates.value[index];
    if (!source) return;
    saveTemplate(source, `${source.label || templateLabel(source)} (copy)`);
  };

  const deployToBattlefield = (index: number) => {
    const template = templates.value[index];
    if (!template) return null;

    const combatStore = useCombatStore();
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const usedLetters = new Set(combatStore.monsters.map((m) => m.letter));
    const nextLetter = letters.split("").find((l) => !usedLetters.has(l)) || "?";

    const monster: Omit<Monster, "id"> = {
      color: template.color,
      letter: nextLetter,
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
    return monster;
  };

  const saveMonsterAsTemplate = (monster: Monster) => {
    const { id, letter, doneTurn, turnOrder, completionOrder, heartsCurrent, ...rest } = monster;
    void id;
    void letter;
    void doneTurn;
    void turnOrder;
    void completionOrder;
    void heartsCurrent;
    return saveTemplate(rest, monster.name || `${monster.color}-${monster.letter}`);
  };

  return {
    templates,
    saveTemplate,
    updateTemplate,
    removeTemplate,
    duplicateTemplate,
    deployToBattlefield,
    saveMonsterAsTemplate,
  };
});
