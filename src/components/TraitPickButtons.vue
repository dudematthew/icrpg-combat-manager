<template>
  <div class="space-y-3">
    <div class="flex flex-wrap gap-1">
      <button
        v-for="btn in stateMotivationButtons"
        :key="btn.key"
        type="button"
        class="flex items-center gap-1 text-xs rpg-button rpg-button-secondary"
        style="padding-inline: 16px"
        v-bind="getHandlers(btn.key)"
      >
        <img :src="assetUrl('images/d6_dice_icon.png')" class="w-4 h-4 icon-filter" :alt="btn.label" />
        {{ btn.label }}
      </button>
    </div>
    <div v-if="showStatePreview" class="flex flex-wrap gap-1">
      <button type="button" class="text-xs rpg-button rpg-button-primary" @click="applyStateMotivation">Apply</button>
      <button type="button" class="text-xs rpg-button rpg-button-secondary" @click="clearStateMotivation">Clear</button>
    </div>
    <div v-if="previewState || previewMotivation" class="space-y-2 bg-neutral-50 p-2 border border-neutral-200 rounded">
      <div v-if="previewState" class="text-neutral-700 text-sm"><strong>State:</strong> {{ previewState }}</div>
      <div v-if="previewMotivation" class="text-neutral-700 text-sm"><strong>Motivation:</strong> {{ previewMotivation }}</div>
    </div>

    <div class="flex flex-wrap gap-1">
      <button
        v-for="btn in abilityButtons"
        :key="btn.key"
        type="button"
        class="flex items-center gap-1 text-xs rpg-button rpg-button-secondary"
        style="padding-inline: 16px"
        v-bind="getHandlers(btn.key)"
      >
        <img :src="assetUrl('images/d6_dice_icon.png')" class="w-4 h-4 icon-filter" :alt="btn.label" />
        {{ btn.label }}
      </button>
    </div>
    <div v-if="showAbilityPreview" class="flex flex-wrap gap-1">
      <button type="button" class="text-xs rpg-button rpg-button-primary" @click="applyAbilities">Apply</button>
      <button type="button" class="text-xs rpg-button rpg-button-secondary" @click="clearAbilities">Clear</button>
    </div>
    <div v-if="previewAbilities || previewUpgrades" class="space-y-2 bg-neutral-50 p-2 border border-neutral-200 rounded">
      <div v-if="previewAbilities" class="text-neutral-700 text-sm"><strong>Abilities:</strong> {{ previewAbilities }}</div>
      <div v-if="previewUpgrades" class="text-neutral-700 text-sm"><strong>Upgrades:</strong> {{ previewUpgrades }}</div>
    </div>

    <QuickPickModal v-model="pickModalOpen" :title="pickModalTitle" :options="pickModalOptions" :searchable="pickModalOptions.length > 20" @pick="onPick" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import QuickPickModal from "@/components/QuickPickModal.vue";
import { useHoldToPick } from "@/composables/useHoldToPick";
import { assetUrl } from "@/utils/assetUrl";
import {
  MONSTER_STATES,
  MONSTER_MOTIVATIONS,
  MONSTER_ABILITIES,
  MONSTER_UPGRADES,
  rollMonsterState,
  rollMonsterMotivation,
  generateMonsterAbilities,
  generateMonsterUpgrades,
  resolveAbilityPick,
  resolveUpgradePick,
  rollUntilDifferent,
} from "@/utils/monsterGenerator";

const props = defineProps<{
  notes: string;
  specialAbilities: string;
  instantApply?: boolean;
}>();

const emit = defineEmits<{
  "update:notes": [value: string];
  "update:specialAbilities": [value: string];
}>();

type TraitKey = "state" | "motivation" | "abilities" | "upgrades";

const previewState = ref("");
const previewMotivation = ref("");
const previewAbilities = ref("");
const previewUpgrades = ref("");
const pickModalOpen = ref(false);
const pickModalTitle = ref("");
const pickModalOptions = ref<string[]>([]);
const activePickKey = ref<TraitKey | null>(null);

const stateMotivationButtons = [
  { key: "state" as const, label: "State" },
  { key: "motivation" as const, label: "Motivation" },
];
const abilityButtons = [
  { key: "abilities" as const, label: "Abilities" },
  { key: "upgrades" as const, label: "Upgrades" },
];

const showStatePreview = computed(() => !props.instantApply && (previewState.value || previewMotivation.value));
const showAbilityPreview = computed(() => !props.instantApply && (previewAbilities.value || previewUpgrades.value));

const getCurrentValue = (key: TraitKey): string => {
  if (props.instantApply) {
    return key === "state" || key === "motivation" ? props.notes : props.specialAbilities;
  }
  switch (key) {
    case "state": return previewState.value;
    case "motivation": return previewMotivation.value;
    case "abilities": return previewAbilities.value;
    case "upgrades": return previewUpgrades.value;
  }
};

const rollForKey = (key: TraitKey): string => {
  switch (key) {
    case "state": return rollMonsterState();
    case "motivation": return rollMonsterMotivation();
    case "abilities": return generateMonsterAbilities();
    case "upgrades": return generateMonsterUpgrades();
  }
};

const rollDistinctForKey = (key: TraitKey): string =>
  rollUntilDifferent(() => rollForKey(key), getCurrentValue(key));

const resolvePick = (key: TraitKey, raw: string): string => {
  if (key === "abilities") return resolveAbilityPick(raw);
  if (key === "upgrades") return resolveUpgradePick(raw);
  return raw;
};

const applyValue = (key: TraitKey, value: string) => {
  if (props.instantApply) {
    if (key === "state" || key === "motivation") emit("update:notes", value);
    else emit("update:specialAbilities", value);
    return;
  }
  if (key === "state") previewState.value = value;
  if (key === "motivation") previewMotivation.value = value;
  if (key === "abilities") previewAbilities.value = value;
  if (key === "upgrades") previewUpgrades.value = value;
};

const openPick = (key: TraitKey) => {
  activePickKey.value = key;
  switch (key) {
    case "state":
      pickModalTitle.value = "Pick State";
      pickModalOptions.value = MONSTER_STATES;
      break;
    case "motivation":
      pickModalTitle.value = "Pick Motivation";
      pickModalOptions.value = MONSTER_MOTIVATIONS;
      break;
    case "abilities":
      pickModalTitle.value = "Pick Abilities";
      pickModalOptions.value = MONSTER_ABILITIES;
      break;
    case "upgrades":
      pickModalTitle.value = "Pick Upgrades";
      pickModalOptions.value = MONSTER_UPGRADES;
      break;
  }
  pickModalOpen.value = true;
};

const onPick = (value: string) => {
  if (!activePickKey.value) return;
  const key = activePickKey.value;
  applyValue(key, resolvePick(key, value));
};

const tap = (key: TraitKey) => applyValue(key, rollDistinctForKey(key));

const handlerMap = new Map<TraitKey, ReturnType<typeof useHoldToPick>>();
(["state", "motivation", "abilities", "upgrades"] as TraitKey[]).forEach((key) => {
  handlerMap.set(key, useHoldToPick(() => tap(key), () => openPick(key)));
});

const getHandlers = (key: TraitKey) => {
  const h = handlerMap.get(key)!;
  return {
    onPointerdown: h.onPointerDown,
    onPointerup: h.onPointerUp,
    onPointerleave: h.onPointerLeave,
    onPointercancel: h.onPointerLeave,
  };
};

const applyStateMotivation = () => {
  const parts = [previewState.value, previewMotivation.value].filter(Boolean);
  if (parts.length) emit("update:notes", parts.join("\n\n"));
  previewState.value = "";
  previewMotivation.value = "";
};

const clearStateMotivation = () => {
  previewState.value = "";
  previewMotivation.value = "";
};

const applyAbilities = () => {
  const parts = [previewAbilities.value, previewUpgrades.value].filter(Boolean);
  if (parts.length) emit("update:specialAbilities", parts.join("\n\n"));
  previewAbilities.value = "";
  previewUpgrades.value = "";
};

const clearAbilities = () => {
  previewAbilities.value = "";
  previewUpgrades.value = "";
};
</script>
