<template>
  <div id="inspirations" class="mb-3 inspiration-panel rpg-card">
    <div class="rpg-card-header">
      <Sparkles class="flex-shrink-0 w-5 h-5 text-accent" />
      <h2 class="rpg-heading">Inspirations</h2>
    </div>

    <button type="button" class="mb-4 w-full rpg-button rpg-button-primary rpg-button-sm" @click="rollFull">
      Roll Full NPC
    </button>

    <div class="inspiration-chips">
      <button v-for="chip in chips" :key="chip.key" type="button" class="w-full text-xs rpg-button rpg-button-secondary"
        v-bind="chipHandlers(chip.key)">
        {{ chip.label }}
      </button>
    </div>

    <div v-if="result" class="bg-neutral-50 p-3 border border-neutral-200 rounded-lg">
      <div class="flex justify-between items-baseline gap-3 mb-2">
        <span class="font-bold text-base normal-case tracking-normal rpg-heading">{{ resultLabel }}</span>
        <div class="flex flex-shrink-0 gap-3">
          <button type="button" class="text-neutral-500 hover:text-accent text-xs underline" @click="copyResult">
            Copy
          </button>
          <button type="button" class="text-neutral-500 hover:text-accent text-xs underline" @click="reroll">
            Re-roll
          </button>
        </div>
      </div>
      <pre class="m-0 text-sm whitespace-pre-wrap rpg-body">{{ result }}</pre>
    </div>

    <QuickPickModal v-model="pickOpen" :title="pickTitle" :options="pickOptions" searchable @pick="onPick" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Sparkles } from "lucide-vue-next";
import QuickPickModal from "@/components/QuickPickModal.vue";
import { useHoldToPick } from "@/composables/useHoldToPick";
import {
  INSPIRATION_CHIPS,
  rollCategory,
  rollFullNpc,
  getCategoryOptions,
  type InspirationCategory,
} from "@/utils/inspirationRoll";

const chips = INSPIRATION_CHIPS;

const result = ref("");
const resultLabel = ref("");
const lastCategory = ref<InspirationCategory | "full">("full");

const pickOpen = ref(false);
const pickTitle = ref("");
const pickOptions = ref<string[]>([]);
const pickCategory = ref<InspirationCategory | null>(null);

const setResult = (label: string, text: string) => {
  resultLabel.value = label;
  result.value = text;
};

const rollFull = () => {
  lastCategory.value = "full";
  setResult("Full NPC", rollFullNpc());
};

const rollChip = (key: InspirationCategory) => {
  lastCategory.value = key;
  const label = chips.find((c) => c.key === key)?.label ?? key;
  setResult(label, rollCategory(key));
};

const openPick = (key: InspirationCategory) => {
  pickCategory.value = key;
  pickTitle.value = `Pick ${chips.find((c) => c.key === key)?.label ?? key}`;
  pickOptions.value = getCategoryOptions(key);
  if (pickOptions.value.length === 0) {
    rollChip(key);
    return;
  }
  pickOpen.value = true;
};

const onPick = (value: string) => {
  if (pickCategory.value) {
    lastCategory.value = pickCategory.value;
    const label = chips.find((c) => c.key === pickCategory.value)?.label ?? pickCategory.value;
    setResult(label, value);
  }
};

const reroll = () => {
  if (lastCategory.value === "full") rollFull();
  else rollChip(lastCategory.value);
};

const copyResult = async () => {
  if (result.value) await navigator.clipboard.writeText(result.value);
};

const chipHandlerMap = new Map<InspirationCategory, ReturnType<typeof useHoldToPick>>();
for (const chip of chips) {
  chipHandlerMap.set(
    chip.key,
    useHoldToPick(
      () => rollChip(chip.key),
      () => openPick(chip.key),
    ),
  );
}

const chipHandlers = (key: InspirationCategory) => {
  const h = chipHandlerMap.get(key)!;
  return {
    onPointerdown: h.onPointerDown,
    onPointerup: h.onPointerUp,
    onPointerleave: h.onPointerLeave,
    onPointercancel: h.onPointerLeave,
  };
};
</script>

<style scoped>
.inspiration-chips {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
}
</style>
