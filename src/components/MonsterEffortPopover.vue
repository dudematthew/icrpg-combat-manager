<template>
  <Teleport to="body">
    <div v-if="open" class="monster-popover-backdrop" @mousedown.self="close">
      <div
        ref="panelRef"
        class="monster-popover"
        :style="panelStyle"
        @click.stop
      >
        <h4 class="monster-popover__title">Monster effort</h4>
        <p class="monster-popover__hint text-neutral-600 text-xs rpg-body">
          Pick effort die type. Monster effort bonus is added automatically.
        </p>
        <label class="mb-1 rpg-label">Effort die</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="type in effortTypes"
            :key="type.die"
            type="button"
            class="effort-die-btn"
            :class="{ 'effort-die-btn--active': selectedDie === type.die }"
            :title="type.useCase"
            @click="selectedDie = type.die"
          >
            d{{ type.die }}
          </button>
        </div>
        <p v-if="effortBonus > 0" class="mt-2 text-neutral-600 text-xs rpg-body">
          +{{ effortBonus }} monster effort bonus
        </p>

        <button
          type="button"
          class="mt-3 w-full rpg-button rpg-button-primary rpg-button-sm"
          :disabled="isRolling"
          @click="roll"
        >
          {{ isRolling ? "Rolling…" : "Roll Effort" }}
        </button>

        <div
          class="monster-popover__result monster-popover__result--effort"
          :class="{ 'monster-popover__result--empty': !result }"
        >
          <template v-if="result">
            <div class="monster-popover__total">{{ result.total }}</div>
            <div class="monster-popover__breakdown text-neutral-600 text-xs">
              d{{ result.die }} {{ result.roll }}
              <template v-if="result.bonus > 0"> + {{ result.bonus }}</template>
            </div>
          </template>
        </div>

        <button type="button" class="mt-3 optional-action" @click="close">Close</button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, toRef } from "vue";
import { EFFORT_TYPES } from "@/types";
import { useAnchoredPopover } from "@/composables/useAnchoredPopover";
import { rollEffort, rollEffortAsync, type EffortRollResult } from "@/utils/combat";

const open = defineModel<boolean>({ default: false });

const props = defineProps<{
  effortBonus: number;
  anchorEl: HTMLElement | null;
}>();

const anchorRef = toRef(() => props.anchorEl);
const effortTypes = EFFORT_TYPES;
const selectedDie = ref(6);
const result = ref<EffortRollResult | null>(null);
const isRolling = ref(false);
const panelRef = ref<HTMLElement | null>(null);

const { panelStyle, positionPanel } = useAnchoredPopover(open, anchorRef, panelRef);

watch(open, (isOpen) => {
  if (isOpen) {
    result.value = null;
    selectedDie.value = 6;
  }
});

const close = () => {
  open.value = false;
};

const roll = async () => {
  if (isRolling.value) return;
  isRolling.value = true;
  try {
    result.value = await rollEffortAsync(selectedDie.value, props.effortBonus);
  } catch {
    result.value = rollEffort(selectedDie.value, props.effortBonus);
  } finally {
    isRolling.value = false;
    await positionPanel();
  }
};
</script>

<style scoped>
.monster-popover-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
}

.monster-popover {
  width: min(18rem, calc(100vw - 1rem));
  max-height: min(70vh, calc(100vh - 1rem));
  overflow-y: auto;
  padding: 1rem;
  background: white;
  border: 2px solid #e5e5e5;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.monster-popover__title {
  margin: 0 0 0.25rem;
  font-family: "nusaliver", "Arial Black", sans-serif;
  font-size: 0.875rem;
  text-transform: uppercase;
}

.monster-popover__hint {
  margin: 0 0 0.75rem;
}

.effort-die-btn {
  padding: 0.35rem 0.55rem;
  border: 2px solid #d4d4d4;
  border-radius: 0.375rem;
  background: #fafafa;
  font-family: "nusaliver", "Arial Black", sans-serif;
  font-size: 0.7rem;
  font-weight: 900;
  cursor: pointer;
}

.effort-die-btn--active {
  border-color: #7c3aed;
  background: #faf5ff;
  color: #7c3aed;
}

.monster-popover__result {
  margin-top: 0.75rem;
  padding: 0.65rem;
  text-align: center;
  background: #faf5ff;
  border: 1px solid #ddd6fe;
  border-radius: 0.375rem;
}

.monster-popover__result--effort {
  min-height: 3.75rem;
}

.monster-popover__result--empty {
  background: transparent;
  border-color: transparent;
}

.monster-popover__total {
  font-family: "nusaliver", "Arial Black", sans-serif;
  font-size: 1.75rem;
  line-height: 1.1;
  color: #7c3aed;
}

.monster-popover__breakdown {
  margin-top: 0.35rem;
}
</style>
