<template>
  <div id="inspirations" class="mb-3 inspiration-panel rpg-card">
    <div class="rpg-card-header">
      <Sparkles class="flex-shrink-0 w-5 h-5 text-accent" />
      <h2 class="rpg-heading">Inspirations</h2>
    </div>

    <button type="button" class="mb-4 w-full rpg-button rpg-button-primary rpg-button-sm" @click="rollFull">
      Roll Full NPC
    </button>

    <div class="inspiration-chips inspiration-chips--top">
      <button v-for="chip in topChips" :key="chip.key" type="button" class="w-full text-xs rpg-button rpg-button-secondary"
        v-bind="chipHandlers(chip.key)">
        {{ chip.label }}
      </button>
    </div>
    <div class="inspiration-chips inspiration-chips--bottom">
      <button v-for="chip in bottomChips" :key="chip.key" type="button" class="w-full text-xs rpg-button rpg-button-secondary"
        v-bind="chipHandlers(chip.key)">
        {{ chip.label }}
      </button>
    </div>

    <div v-if="result" class="bg-neutral-50 p-3 border border-neutral-200 rounded-lg">
      <div class="flex justify-between items-baseline gap-3 mb-2">
        <span class="font-bold text-base normal-case tracking-normal rpg-heading">{{ resultLabel }}</span>
        <div class="flex flex-shrink-0 gap-3">
          <button type="button" class="optional-action" @click="copyResult">
            Copy
          </button>
          <button type="button" class="optional-action" @click="pushToBoard">
            To Board
          </button>
          <button type="button" class="optional-action" @click="reroll">
            Re-roll
          </button>
        </div>
      </div>
      <div v-if="fullNpcParts" class="text-sm whitespace-pre-wrap rpg-body">
        <div class="mb-1 font-bold text-base">{{ fullNpcParts.name }}</div>
        <div>{{ fullNpcParts.rest }}</div>
      </div>
      <pre v-else class="m-0 text-sm whitespace-pre-wrap rpg-body">{{ result }}</pre>
    </div>

    <QuickPickModal v-model="pickOpen" :title="pickTitle" :options="pickOptions" searchable @pick="onPick" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Sparkles } from "lucide-vue-next";
import QuickPickModal from "@/components/QuickPickModal.vue";
import { useHoldToPick, bindHoldHandlers } from "@/composables/useHoldToPick";
import {
  INSPIRATION_TOP_CHIPS,
  INSPIRATION_BOTTOM_CHIPS,
  rollCategory,
  rollFullNpc,
  getCategoryOptions,
  type InspirationCategory,
} from "@/utils/inspirationRoll";
import { useBoardsStore } from "@/features/boards/stores/boards";
import { useSettingsStore } from "@/stores/settings";

const boardsStore = useBoardsStore();
const settingsStore = useSettingsStore();
const topChips = INSPIRATION_TOP_CHIPS;
const bottomChips = INSPIRATION_BOTTOM_CHIPS;
const allChips = [...topChips, ...bottomChips];

const result = ref("");
const resultLabel = ref("");
const lastCategory = ref<InspirationCategory | "full">("full");

const pickOpen = ref(false);
const pickTitle = ref("");
const pickOptions = ref<string[]>([]);
const pickCategory = ref<InspirationCategory | null>(null);

const fullNpcParts = computed(() => {
  if (lastCategory.value !== "full" || !result.value) return null;
  const newline = result.value.indexOf("\n");
  if (newline === -1) return { name: result.value, rest: "" };
  return {
    name: result.value.slice(0, newline),
    rest: result.value.slice(newline + 1),
  };
});

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
  const label = allChips.find((c) => c.key === key)?.label ?? key;
  setResult(label, rollCategory(key));
};

const openPick = (key: InspirationCategory) => {
  pickCategory.value = key;
  pickTitle.value = `Pick ${allChips.find((c) => c.key === key)?.label ?? key}`;
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
    const label = allChips.find((c) => c.key === pickCategory.value)?.label ?? pickCategory.value;
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

const pushToBoard = () => {
  if (!result.value) return;
  if (lastCategory.value === "full" && fullNpcParts.value) {
    boardsStore.addCard({
      kind: "text",
      color: settingsStore.defaultNewCardColor,
      title: fullNpcParts.value.name,
      body: fullNpcParts.value.rest,
    });
    return;
  }
  boardsStore.addCard({
    kind: "text",
    color: settingsStore.defaultNewCardColor,
    title: resultLabel.value,
    body: result.value,
  });
};

const chipHandlerMap = new Map<InspirationCategory, ReturnType<typeof useHoldToPick>>();
for (const chip of allChips) {
  chipHandlerMap.set(
    chip.key,
    useHoldToPick(
      () => rollChip(chip.key),
      () => openPick(chip.key),
    ),
  );
}

const chipHandlers = (key: InspirationCategory) => bindHoldHandlers(chipHandlerMap.get(key)!);
</script>

<style scoped>
.inspiration-chips {
  display: grid;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.inspiration-chips--top {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.inspiration-chips--bottom {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-bottom: 1rem;
}

.inspiration-chips :deep(.rpg-button) {
  padding-left: 0.35rem;
  padding-right: 0.35rem;
  font-size: 0.65rem;
  letter-spacing: 0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (min-width: 480px) {
  .inspiration-chips :deep(.rpg-button) {
    font-size: 0.75rem;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
}
</style>
