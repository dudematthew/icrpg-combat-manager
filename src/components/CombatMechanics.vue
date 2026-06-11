<template>
  <div id="target" class="rpg-card combat-mechanics">
    <div class="flex items-center gap-3 mb-4">
      <img :src="assetUrl('images/target_icon.png')" class="w-5 h-5 text-accent icon-filter" alt="Checks" />
      <h2 class="rpg-heading">Checks</h2>
    </div>
    <div class="space-y-4">
      <div>
        <label class="mb-2 rpg-label">Target</label>
        <TargetPicker v-model="baseTarget" />
      </div>

      <div>
        <label class="mb-2 rpg-label">Difficulty</label>
        <div class="checks-fill-row">
          <button v-for="opt in difficultyOptions" :key="opt.value" type="button"
            class="checks-diff-btn checks-fill-item"
            :class="{ 'checks-diff-btn--active': difficulty === opt.value }" @click="difficulty = opt.value">
            {{ opt.label }}
          </button>
        </div>
      </div>

      <div class="checks-fill-row checks-fill-row--align-end">
        <div class="checks-action-row__field checks-fill-item checks-fill-item--wide">
          <label class="rpg-label">Stat bonus</label>
          <input v-model.number="checkStat" type="number" :min="-5" :max="20" class="checks-control rpg-input" />
        </div>
        <button type="button"
          class="checks-fill-item checks-fill-item--action checks-control rpg-button rpg-button-primary rpg-button-sm"
          :disabled="isCheckRolling"
          @click="rollCheck">
          {{ isCheckRolling ? "Rolling…" : "Roll Check" }}
        </button>
      </div>

      <div class="pt-3 border-neutral-200 border-t">
        <label class="mb-2 rpg-label">Effort</label>
        <div class="checks-fill-row">
          <button
            v-for="type in effortTypes"
            :key="type.die"
            type="button"
            class="checks-effort-btn checks-fill-item"
            :class="{
              'checks-effort-btn--active': selectedEffortDie === type.die,
              'checks-effort-btn--ultimate': type.die === 12 && effortCritHint,
            }"
            :title="type.useCase"
            @click="selectEffortDie(type.die)"
          >
            d{{ type.die }}
          </button>
          <button
            type="button"
            class="checks-effort-roll checks-fill-item checks-control rpg-button rpg-button-secondary rpg-button-sm"
            :disabled="isEffortRolling"
            @click="rollEffortAction"
          >
            {{ isEffortRolling ? "Rolling…" : "Roll" }}
          </button>
        </div>
        <p v-if="effortCritHint" class="mt-2 text-violet-700 text-xs rpg-body">
          Natural 20 — Ultimate effort (d12) selected for crit.
        </p>
      </div>

      <div class="checks-history">
        <div class="checks-history__title rpg-label">Recent rolls</div>
        <div v-if="rollHistory.length === 0" class="text-neutral-500 text-xs checks-history__empty rpg-body">
          No rolls yet
        </div>
        <ul v-else class="checks-history__list">
          <li v-for="(entry, index) in rollHistory" :key="index" class="text-sm checks-history__item rpg-body">
            <template v-if="entry.kind === 'check'">
              Check · d20 {{ entry.naturalRoll }} + {{ entry.statBonus }} = {{ entry.totalRoll }}
              vs {{ entry.targetNumber }} ·
              <span
                class="checks-history__result"
                :class="entry.hit ? 'checks-history__result--hit' : 'checks-history__result--miss'"
              >
                {{ entry.hit ? "Hit" : "Miss" }}
              </span>
              <span v-if="entry.critical" class="checks-history__result checks-history__result--crit"> · Nat 20</span>
            </template>
            <template v-else>
              Effort ·
              <template v-if="entry.die > 0">
                d{{ entry.die }} {{ entry.roll }}<template v-if="entry.bonus > 0"> + {{ entry.bonus }}</template> =
                <span class="checks-history__result checks-history__result--effort">{{ entry.total }}</span>
              </template>
              <template v-else>
                <span class="checks-history__result checks-history__result--effort">{{ entry.total }}</span>
              </template>
            </template>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { EFFORT_TYPES } from "@/types";
import TargetPicker from "@/components/TargetPicker.vue";
import {
  rollCheckOnly,
  rollCheckOnlyAsync,
  rollEffort,
  rollEffortAsync,
  type RollDifficulty,
} from "@/utils/combat";
import { loadLastUsedTarget, saveLastUsedTarget } from "@/utils/lastUsedTarget";
import { assetUrl } from "@/utils/assetUrl";

const HISTORY_LIMIT = 5;
const ULTIMATE_DIE = 12;
const DEFAULT_EFFORT_DIE = 6;

type RollHistoryEntry =
  | {
      kind: "check";
      naturalRoll: number;
      totalRoll: number;
      targetNumber: number;
      statBonus: number;
      hit: boolean;
      critical: boolean;
    }
  | {
      kind: "effort";
      die: number;
      roll: number;
      bonus: number;
      total: number;
    };

const baseTarget = ref(loadLastUsedTarget());
const difficulty = ref<RollDifficulty>("normal");
const checkStat = ref(0);
const selectedEffortDie = ref(DEFAULT_EFFORT_DIE);
const effortCritHint = ref(false);
const rollHistory = ref<RollHistoryEntry[]>([]);
const isCheckRolling = ref(false);
const isEffortRolling = ref(false);

const difficultyOptions: { value: RollDifficulty; label: string }[] = [
  { value: "easy", label: "Easy (−3)" },
  { value: "normal", label: "Normal" },
  { value: "hard", label: "Hard (+3)" },
];

const effortTypes = EFFORT_TYPES;

watch(baseTarget, (tn) => saveLastUsedTarget(tn));

const pushHistory = (entry: RollHistoryEntry) => {
  rollHistory.value = [entry, ...rollHistory.value].slice(0, HISTORY_LIMIT);
};

const selectEffortDie = (die: number) => {
  selectedEffortDie.value = die;
  if (die !== ULTIMATE_DIE) effortCritHint.value = false;
};

const applyCheckResult = (result: ReturnType<typeof rollCheckOnly>) => {
  pushHistory({
    kind: "check",
    naturalRoll: result.naturalRoll,
    totalRoll: result.totalRoll,
    targetNumber: result.targetNumber,
    statBonus: checkStat.value,
    hit: result.hit,
    critical: result.critical,
  });
  if (result.critical) {
    selectedEffortDie.value = ULTIMATE_DIE;
    effortCritHint.value = true;
  }
};

const rollCheck = async () => {
  if (isCheckRolling.value) return;
  isCheckRolling.value = true;
  saveLastUsedTarget(baseTarget.value);
  try {
    applyCheckResult(await rollCheckOnlyAsync(checkStat.value, baseTarget.value, difficulty.value));
  } catch {
    applyCheckResult(rollCheckOnly(checkStat.value, baseTarget.value, difficulty.value));
  } finally {
    isCheckRolling.value = false;
  }
};

const rollEffortAction = async () => {
  if (isEffortRolling.value) return;
  isEffortRolling.value = true;
  try {
    const result = await rollEffortAsync(selectedEffortDie.value);
    pushHistory({
      kind: "effort",
      die: result.die,
      roll: result.roll,
      bonus: result.bonus,
      total: result.total,
    });
  } catch {
    const result = rollEffort(selectedEffortDie.value);
    pushHistory({
      kind: "effort",
      die: result.die,
      roll: result.roll,
      bonus: result.bonus,
      total: result.total,
    });
  } finally {
    isEffortRolling.value = false;
  }
};
</script>

<style scoped>
.combat-mechanics .checks-control {
  min-height: 2.375rem;
  max-height: 2.375rem;
  min-width: 0;
  box-sizing: border-box;
}

.combat-mechanics .checks-control.rpg-input {
  padding: 0.5rem 0.75rem;
  resize: none;
}

.combat-mechanics .checks-control.rpg-button-sm {
  padding-top: 0;
  padding-bottom: 0;
  justify-content: center;
}

.checks-action-row__field {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.checks-diff-btn {
  padding: 0.35rem 0.25rem;
  min-height: 2.375rem;
  box-sizing: border-box;
  border: 2px solid #d4d4d4;
  border-radius: 0.375rem;
  background: #fafafa;
  font-family: "nusaliver", "Arial Black", sans-serif;
  font-size: 0.7rem;
  font-weight: 900;
  text-transform: uppercase;
  cursor: pointer;
  text-align: center;
}

.checks-diff-btn--active {
  border-color: #dc2626;
  background: #dc2626;
  color: white;
}

.checks-effort-btn {
  padding: 0.35rem 0.25rem;
  min-height: 2.375rem;
  box-sizing: border-box;
  border: 2px solid #d4d4d4;
  border-radius: 0.375rem;
  background: #fafafa;
  font-family: "nusaliver", "Arial Black", sans-serif;
  font-size: 0.75rem;
  font-weight: 900;
  cursor: pointer;
  text-align: center;
  justify-content: center;
}

.checks-effort-roll {
  padding-left: 0.35rem;
  padding-right: 0.35rem;
}

.checks-effort-btn--active {
  border-color: #525252;
  background: #e5e5e5;
  color: #171717;
}

.checks-effort-btn--ultimate {
  border-color: #7c3aed;
  background: #faf5ff;
  color: #7c3aed;
}

.checks-effort-btn--ultimate.checks-effort-btn--active {
  border-color: #7c3aed;
  background: #7c3aed;
  color: white;
}

.checks-history {
  padding: 0.65rem 0.75rem;
  background: #fafafa;
  border: 1px solid #e5e5e5;
  border-radius: 0.5rem;
}

.checks-history__title {
  margin-bottom: 0.5rem;
}

.checks-history__empty {
  margin: 0;
}

.checks-history__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.checks-history__item {
  padding: 0.35rem 0;
  border-bottom: 1px solid #ebebeb;
}

.checks-history__item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.checks-history__item:first-child {
  padding-top: 0;
}

.checks-history__result {
  font-family: "nusaliver", "Arial Black", sans-serif;
  font-weight: 900;
}

.checks-history__result--hit {
  color: #16a34a;
}

.checks-history__result--miss {
  color: #dc2626;
}

.checks-history__result--crit {
  color: #d97706;
}

.checks-history__result--effort {
  color: #7c3aed;
}
</style>
