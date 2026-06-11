<template>
  <Teleport to="body">
    <div v-if="open" class="monster-popover-backdrop" @mousedown.self="close">
      <div
        ref="panelRef"
        class="monster-popover"
        :style="panelStyle"
        @click.stop
      >
        <h4 class="monster-popover__title">Monster check</h4>
        <p class="monster-popover__hint text-neutral-600 text-xs rpg-body">
          Player defense or room target for this roll.
        </p>
        <label class="mb-1 rpg-label">Target</label>
        <TargetPicker v-model="baseTarget" />

        <button
          type="button"
          class="mt-3 w-full rpg-button rpg-button-primary rpg-button-sm"
          :disabled="isRolling"
          @click="roll"
        >
          {{ isRolling ? "Rolling…" : "Roll Check" }}
        </button>

        <div
          class="monster-popover__result monster-popover__result--check"
          :class="{ 'monster-popover__result--empty': !preview }"
        >
          <template v-if="preview">
            <div class="monster-popover__total-row">
              <span class="monster-popover__total">{{ preview.totalRoll }}</span>
              <span
                class="monster-popover__verdict"
                :class="outcomes.normal ? 'monster-popover__verdict--pass' : 'monster-popover__verdict--fail'"
              >
                {{ outcomes.normal ? "PASS NORMAL" : "FAIL" }}
              </span>
            </div>
            <div class="monster-popover__breakdown text-neutral-600 text-xs">
              d20 {{ preview.naturalRoll }} + {{ statBonus }}
            </div>
            <div class="monster-popover__badges">
              <span
                class="monster-popover__badge"
                :class="outcomes.easy ? 'monster-popover__badge--pass' : 'monster-popover__badge--fail'"
              >
                {{ outcomes.easy ? "PASS EASY" : "FAIL EASY" }}
              </span>
              <span
                class="monster-popover__badge"
                :class="outcomes.normal ? 'monster-popover__badge--pass' : 'monster-popover__badge--fail'"
              >
                {{ outcomes.normal ? "PASS NORMAL" : "FAIL NORMAL" }}
              </span>
              <span
                class="monster-popover__badge"
                :class="outcomes.hard ? 'monster-popover__badge--pass' : 'monster-popover__badge--fail'"
              >
                {{ outcomes.hard ? "PASS HARD" : "FAIL HARD" }}
              </span>
            </div>
          </template>
        </div>

        <button type="button" class="mt-3 optional-action" @click="close">Close</button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, toRef } from "vue";
import TargetPicker from "@/components/TargetPicker.vue";
import { useAnchoredPopover } from "@/composables/useAnchoredPopover";
import {
  rollMonsterAttackPreview,
  rollMonsterAttackPreviewAsync,
  monsterCheckOutcomes,
  type MonsterAttackPreview,
} from "@/utils/combat";
import { loadLastUsedTarget, saveLastUsedTarget } from "@/utils/lastUsedTarget";

const open = defineModel<boolean>({ default: false });

const props = defineProps<{
  statBonus: number;
  anchorEl: HTMLElement | null;
}>();

const anchorRef = toRef(() => props.anchorEl);
const baseTarget = ref(loadLastUsedTarget());
const preview = ref<MonsterAttackPreview | null>(null);
const isRolling = ref(false);
const panelRef = ref<HTMLElement | null>(null);

const { panelStyle, positionPanel } = useAnchoredPopover(open, anchorRef, panelRef);

const outcomes = computed(() =>
  preview.value
    ? monsterCheckOutcomes(preview.value.totalRoll, baseTarget.value)
    : { easy: false, normal: false, hard: false },
);

watch(open, (isOpen) => {
  if (isOpen) {
    preview.value = null;
    baseTarget.value = loadLastUsedTarget();
  }
});

const close = () => {
  open.value = false;
};

const roll = async () => {
  if (isRolling.value) return;
  isRolling.value = true;
  saveLastUsedTarget(baseTarget.value);
  try {
    preview.value = await rollMonsterAttackPreviewAsync(props.statBonus, baseTarget.value);
  } catch {
    preview.value = rollMonsterAttackPreview(props.statBonus, baseTarget.value);
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

.monster-popover__result {
  margin-top: 0.75rem;
  padding: 0.65rem;
  text-align: center;
  background: #faf5ff;
  border: 1px solid #ddd6fe;
  border-radius: 0.375rem;
}

.monster-popover__result--check {
  min-height: 6.5rem;
}

.monster-popover__result--empty {
  background: transparent;
  border-color: transparent;
}

.monster-popover__total-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: baseline;
  gap: 0.5rem;
}

.monster-popover__total {
  font-family: "nusaliver", "Arial Black", sans-serif;
  font-size: 1.75rem;
  line-height: 1.1;
  color: #7c3aed;
}

.monster-popover__verdict {
  font-family: "nusaliver", "Arial Black", sans-serif;
  font-size: 0.65rem;
  text-transform: uppercase;
}

.monster-popover__verdict--pass {
  color: #16a34a;
}

.monster-popover__verdict--fail {
  color: #dc2626;
}

.monster-popover__breakdown {
  margin-top: 0.35rem;
}

.monster-popover__badges {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.35rem;
  margin-top: 0.5rem;
}

.monster-popover__badge {
  padding: 0.15rem 0.4rem;
  border-radius: 0.25rem;
  font-family: "nusaliver", "Arial Black", sans-serif;
  font-size: 0.55rem;
  text-transform: uppercase;
}

.monster-popover__badge--pass {
  background: #dcfce7;
  color: #166534;
}

.monster-popover__badge--fail {
  background: #f5f5f5;
  color: #737373;
}
</style>
