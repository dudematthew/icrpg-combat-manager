import type { Monster, MonsterFormData, MonsterTemplate } from "@/types";
import { TIER_CONFIGS } from "@/types";

export interface EffectiveMonsterStats {
  heartsMax: number;
  statsBonus: number;
  effortBonus: number;
  actions: number;
}

export function getEffectiveStats(
  form: MonsterFormData,
  tierMode: boolean,
): EffectiveMonsterStats {
  const tier = form.tier;
  const config = tier ? TIER_CONFIGS[tier] : undefined;
  if (!config) {
    return { heartsMax: 1, statsBonus: 0, effortBonus: 0, actions: 1 };
  }
  if (tierMode) {
    return {
      heartsMax: form.heartsMax || config.hearts,
      statsBonus: config.bonus,
      effortBonus: config.effortBonus || 0,
      actions: config.actions,
    };
  }
  return {
    heartsMax: form.manualHearts || config.hearts,
    statsBonus: form.manualStatsBonus || config.bonus,
    effortBonus: form.manualEffortBonus ?? config.effortBonus ?? 0,
    actions: form.manualActions || config.actions,
  };
}

export function buildMonsterPayload(
  form: MonsterFormData,
  tierMode: boolean,
  letter: string,
): Omit<Monster, "id"> {
  const stats = getEffectiveStats(form, tierMode);
  const payload: Omit<Monster, "id"> = {
    color: form.color,
    letter,
    tier: form.tier as Monster["tier"],
    heartsMax: stats.heartsMax,
    heartsCurrent: stats.heartsMax,
    statsBonus: stats.statsBonus,
    effortBonus: stats.effortBonus,
    actions: stats.actions,
    conditions: [],
    notes: form.notes,
    name: form.name || undefined,
    specialAbilities: form.specialAbilities || undefined,
  };
  if (!tierMode) {
    if (form.manualStatsBonus > 0) payload.manualStatsBonus = form.manualStatsBonus;
    if (form.manualEffortBonus > 0) payload.manualEffortBonus = form.manualEffortBonus;
    if (form.manualActions > 0) payload.manualActions = form.manualActions;
    if (form.manualHearts > 0) payload.manualHearts = form.manualHearts;
  }
  return payload;
}

export function buildTemplateFromForm(
  form: MonsterFormData,
  tierMode: boolean,
): Omit<MonsterTemplate, "label" | "savedAt"> {
  const stats = getEffectiveStats(form, tierMode);
  const template: Omit<MonsterTemplate, "label" | "savedAt"> = {
    color: form.color,
    tier: form.tier as Monster["tier"],
    heartsMax: stats.heartsMax,
    statsBonus: stats.statsBonus,
    effortBonus: stats.effortBonus,
    actions: stats.actions,
    conditions: [],
    notes: form.notes,
    name: form.name || undefined,
    specialAbilities: form.specialAbilities || undefined,
  };
  if (!tierMode) {
    if (form.manualStatsBonus > 0) template.manualStatsBonus = form.manualStatsBonus;
    if (form.manualEffortBonus > 0) template.manualEffortBonus = form.manualEffortBonus;
    if (form.manualActions > 0) template.manualActions = form.manualActions;
    if (form.manualHearts > 0) template.manualHearts = form.manualHearts;
  }
  return template;
}

export function templateLabel(template: MonsterTemplate): string {
  if (template.name) return template.name;
  return `${template.color} Tier ${template.tier}`;
}

export function monsterToTemplate(monster: Monster): Omit<MonsterTemplate, "label" | "savedAt"> {
  const { id, letter, doneTurn, turnOrder, completionOrder, heartsCurrent, ...rest } = monster;
  void id;
  void letter;
  void doneTurn;
  void turnOrder;
  void completionOrder;
  void heartsCurrent;
  return rest;
}
