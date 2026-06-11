<template>
  <div id="timers" class="timer-manager">
    <div class="mb-3 rpg-card">
      <div class="rpg-card-header">
        <img :src="assetUrl('images/clock_icon.png')" class="flex-shrink-0 w-5 h-5 icon-filter" alt="Timers" />
        <h2 class="rpg-heading">Timers</h2>
      </div>

      <div v-if="showNamingToggle" class="flex gap-2 mb-4">
        <button type="button" @click="namingMode = 'named'"
          :class="['flex-1 text-xs rpg-button', namingMode === 'named' ? 'rpg-button-primary' : 'rpg-button-secondary']">
          Named
        </button>
        <button type="button" @click="namingMode = 'color'"
          :class="['flex-1 text-xs rpg-button', namingMode === 'color' ? 'rpg-button-primary' : 'rpg-button-secondary']">
          Color
        </button>
      </div>

      <div class="flex flex-col flex-wrap gap-4 mb-6">
        <div v-if="effectiveNamingMode === 'named'">
          <label class="rpg-label">Timer Name</label>
          <div class="flex gap-2">
            <input v-model="newTimer.name" placeholder="e.g., Building collapses" @keyup.enter="addTimer"
              class="flex-1 rpg-input" />
            <button type="button" @click="generateTimerName" class="p-0 rpg-button rpg-button-secondary"
              title="Generate random clock name">
              <img :src="assetUrl('images/d6_dice_icon.png')" class="h-5 icon-filter" alt="Generate name" />
            </button>
          </div>
        </div>
        <div v-else>
          <label class="rpg-label">Timer Color</label>
          <ColorSwatchPicker v-model="newTimer.color" />
          <div v-if="newTimer.color" class="mt-2 text-neutral-600 text-xs">{{ colorTimerName }}</div>
        </div>

        <div>
          <label class="rpg-label">Timer Type</label>
          <div class="flex gap-2">
            <button v-for="t in timerTypes" :key="t" type="button" @click="newTimer.type = t"
              :class="['flex-1 text-xs rpg-button', newTimer.type === t ? 'rpg-button-primary' : 'rpg-button-secondary']">
              {{ t === 'rounds' ? 'Rounds' : t === 'turns' ? 'Turns' : 'Manual' }}
            </button>
          </div>
          <div class="mt-2 text-neutral-600 text-xs rpg-body">
            <span v-if="newTimer.type === 'rounds'">Decrements automatically when rounds advance</span>
            <span v-else-if="newTimer.type === 'turns'">Decrements automatically when turns advance</span>
            <span v-else>Decrements only when manually clicked</span>
          </div>
        </div>

        <div>
          <label class="rpg-label">Duration{{ newTimer.type !== 'manual' ? ` (${newTimer.type})` : '' }}</label>
          <div class="flex gap-2">
            <input v-model.number="newTimer.duration" type="number" :min="1" :max="20" placeholder="4"
              @keyup.enter="addTimer" class="flex-1 rpg-input" />
            <button type="button" @click="generateDuration" class="p-0 rpg-button rpg-button-secondary"
              title="Roll d4 for random duration">
              <img :src="assetUrl('images/d4_dice_icon.png')" class="h-5 icon-filter" alt="Roll d4" />
            </button>
          </div>
        </div>

        <div class="flex flex-col gap-2 w-full">
          <div class="flex justify-end">
            <button type="button" class="optional-action" :disabled="!canAddTimer" @click="saveToBoard">
              To Board
            </button>
          </div>
          <button type="button" @click="addTimer" :disabled="!canAddTimer"
            class="disabled:opacity-50 w-full text-xs disabled:cursor-not-allowed rpg-button rpg-button-primary">
            <img :src="assetUrl('images/clock_icon.png')" class="h-5 icon-filter" alt="Add timer" />
            Add Timer
          </button>
          <button
            v-if="doneTimers.length > 0"
            type="button"
            @click="clearDoneTimers"
            class="w-full text-xs rpg-button rpg-button-secondary"
          >
            Clear Done ({{ doneTimers.length }})
          </button>
        </div>
      </div>

      <div v-if="activeTimers.length > 0" class="space-y-3">
        <h3 class="text-base rpg-heading">Active Timers</h3>
        <div v-for="timer in activeTimers" :key="timer.id"
          class="bg-neutral-50 border-l-4 rpg-card rpg-card--plain timer-entry"
          :class="{ 'bg-red-50': timer.remaining <= 0 }" :style="timerStyle(timer)">
          <div class="flex justify-between items-center">
            <div class="flex-1">
              <div class="text-sm rpg-heading">{{ timer.name }}</div>
              <div class="text-neutral-600 text-sm rpg-body">
                Duration: {{ timer.duration }} {{ timer.type === 'manual' ? '' : timer.type }} |
                Remaining:
                <span :class="timer.remaining <= 0 ? 'text-danger font-bold' : 'text-accent font-bold'">
                  {{ timer.remaining <= 0 ? 'done' : timer.type==='manual' ? timer.remaining : `${timer.remaining}
                    ${timer.type}` }} </span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button v-if="timer.type === 'manual'" type="button" @click="incrementTimer(timer.id)"
                class="rpg-icon-button rpg-icon-button-success">+</button>
              <button type="button" @click="decrementTimer(timer.id)"
                class="rpg-icon-button rpg-icon-button-neutral">−</button>
              <button type="button" @click="removeTimer(timer.id)"
                class="rpg-icon-button rpg-icon-button-danger">×</button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="py-8 text-center">
        <img :src="assetUrl('images/hourglass.png')" class="mx-auto mb-3 h-12 text-neutral-400 icon-filter"
          alt="No timers" />
        <div class="text-neutral-500 rpg-body">No active timers</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useCombatStore } from "@/stores/combat";
import { useSettingsStore } from "@/stores/settings";
import { generateClockName } from "@/utils/clockNameGenerator";
import { assetUrl } from "@/utils/assetUrl";
import { getMonsterColor } from "@/utils/combat";
import ColorSwatchPicker from "@/components/ColorSwatchPicker.vue";
import { useBoardsStore } from "@/features/boards/stores/boards";
import { captureTimerPayload } from "@/features/boards/adapters/timerAdapter";
import type { Timer } from "@/types";

const combatStore = useCombatStore();
const settingsStore = useSettingsStore();
const boardsStore = useBoardsStore();

const timerTypes = ["rounds", "turns", "manual"] as const;

const resolveInitialNamingMode = (): "named" | "color" => {
  if (settingsStore.timerNamingMode === "named") return "named";
  if (settingsStore.timerNamingMode === "color") return "color";
  return settingsStore.timerColorModeDefault ? "color" : "named";
};

const namingMode = ref<"named" | "color">(resolveInitialNamingMode());

const showNamingToggle = computed(() => settingsStore.timerNamingMode === "both");

const effectiveNamingMode = computed((): "named" | "color" => {
  if (settingsStore.timerNamingMode === "named") return "named";
  if (settingsStore.timerNamingMode === "color") return "color";
  return namingMode.value;
});

watch(
  () => settingsStore.timerNamingMode,
  (mode) => {
    if (mode === "named") namingMode.value = "named";
    else if (mode === "color") namingMode.value = "color";
  },
);

const rollDuration = () => Math.floor(Math.random() * 4) + 1;

const newTimer = ref({
  name: "",
  color: "",
  duration: rollDuration(),
  type: "rounds" as Timer["type"],
});

onMounted(() => {
  if (!newTimer.value.duration) newTimer.value.duration = rollDuration();
});

watch(effectiveNamingMode, (mode) => {
  if (mode === "color" && !newTimer.value.color) {
    newTimer.value.color = "Blue";
  }
});

const colorTimerName = computed(() =>
  newTimer.value.color ? `${newTimer.value.color} timer` : "",
);

const canAddTimer = computed(() => {
  if (!newTimer.value.duration) return false;
  if (effectiveNamingMode.value === "color") return Boolean(newTimer.value.color);
  return Boolean(newTimer.value.name);
});

const activeTimers = computed(() => combatStore.timers);
const doneTimers = computed(() => combatStore.timers.filter((t) => t.remaining <= 0));

const timerStyle = (timer: Timer) => {
  if (!timer.color) return {};
  const c = getMonsterColor(timer.color);
  return {
    borderLeftColor: c,
    backgroundColor: timer.remaining <= 0 ? undefined : `${c}14`,
  };
};

const addTimer = () => {
  if (!canAddTimer.value || !newTimer.value.duration) return;
  const name = effectiveNamingMode.value === "color" ? colorTimerName.value : newTimer.value.name;
  const prevColor = newTimer.value.color;
  combatStore.addTimer({
    name,
    duration: newTimer.value.duration,
    remaining: newTimer.value.duration,
    type: newTimer.value.type,
    color: effectiveNamingMode.value === "color" ? newTimer.value.color : undefined,
  });
  const type = newTimer.value.type;
  newTimer.value = {
    name: "",
    color: effectiveNamingMode.value === "color" ? prevColor : "",
    duration: rollDuration(),
    type,
  };
};

const removeTimer = (id: string) => combatStore.removeTimer(id);
const decrementTimer = (id: string) => combatStore.decrementTimer(id);
const incrementTimer = (id: string) => combatStore.incrementTimer(id);
const generateTimerName = () => { newTimer.value.name = generateClockName(); };
const generateDuration = () => { newTimer.value.duration = Math.floor(Math.random() * 4) + 1; };
const clearDoneTimers = () => combatStore.clearDoneTimers();

const saveToBoard = () => {
  if (!canAddTimer.value || !newTimer.value.duration) return;
  const name = effectiveNamingMode.value === "color" ? colorTimerName.value : newTimer.value.name;
  const color = effectiveNamingMode.value === "color" ? newTimer.value.color : "Yellow";
  const data = {
    name,
    duration: newTimer.value.duration,
    type: newTimer.value.type,
    color: effectiveNamingMode.value === "color" ? newTimer.value.color : undefined,
  };
  boardsStore.pushPayloadCard("timer", name, color || "Yellow", captureTimerPayload(data));
};
</script>
