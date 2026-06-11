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
        <div class="flex flex-wrap gap-2">
          <button v-for="opt in difficultyOptions" :key="opt.value" type="button" class="checks-diff-btn"
            :class="{ 'checks-diff-btn--active': difficulty === opt.value }" @click="difficulty = opt.value">
            {{ opt.label }}
          </button>
        </div>
      </div>

      <div class="flex flex-wrap items-end gap-2">
        <div class="flex-1 min-w-[5rem]">
          <label class="rpg-label">Stat bonus</label>
          <input v-model.number="checkStat" type="number" :min="-5" :max="20" class="w-full rpg-input" />
        </div>
        <button type="button" class="rpg-button rpg-button-primary rpg-button-sm" :disabled="isCheckRolling"
          @click="rollCheck">
          {{ isCheckRolling ? "Rolling…" : "Roll Check" }}
        </button>
      </div>

      <div class="pt-3 border-neutral-200 border-t">
        <label class="mb-2 rpg-label">Effort</label>
        <div class="flex flex-wrap items-end gap-2">
          <div class="flex-1 min-w-[8rem]">
            <select v-model="effortType" class="w-full rpg-input">
              <option value="none">None (d0)</option>
              <option v-for="type in effortTypes" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </select>
          </div>
          <button type="button" class="rpg-button rpg-button-secondary rpg-button-sm"
            :disabled="isEffortRolling || effortDie === 0" @click="rollEffortAction">
            {{ isEffortRolling ? "Rolling…" : "Roll Effort" }}
          </button>
        </div>
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
              <span :class="entry.hit ? 'text-success' : 'text-danger'">
                {{ entry.hit ? "Hit" : "Miss" }}
              </span>
              <span v-if="entry.critical" class="text-warning"> · Nat 20</span>
            </template>
            <template v-else>
              Effort ·
              <template v-if="entry.die > 0">
                d{{ entry.die }} {{ entry.roll }}
                <template v-if="entry.bonus > 0"> + {{ entry.bonus }}</template>
                = {{ entry.total }}
              </template>
              <template v-else>{{ entry.total }}</template>
            </template>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { EFFORT_TYPES } from "@/types";
import TargetPicker from "@/components/TargetPicker.vue";
import {
  getEffortDie,
  rollCheckOnly,
  rollCheckOnlyAsync,
  rollEffort,
  rollEffortAsync,
  type RollDifficulty,
} from "@/utils/combat";
import { loadLastUsedTarget, saveLastUsedTarget } from "@/utils/lastUsedTarget";
import { assetUrl } from "@/utils/assetUrl";

const HISTORY_LIMIT = 5;

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
const effortType = ref("Weapons & Tools");
const rollHistory = ref<RollHistoryEntry[]>([]);
const isCheckRolling = ref(false);
const isEffortRolling = ref(false);

const difficultyOptions: { value: RollDifficulty; label: string }[] = [
  { value: "easy", label: "Easy (−3)" },
  { value: "normal", label: "Normal" },
  { value: "hard", label: "Hard (+3)" },
];

const effortTypes = EFFORT_TYPES.map((type) => ({
  label: `${type.type} (d${type.die})`,
  value: type.type,
}));

const effortDie = computed(() => getEffortDie(effortType.value));

watch(baseTarget, (tn) => saveLastUsedTarget(tn));

const pushHistory = (entry: RollHistoryEntry) => {
  rollHistory.value = [entry, ...rollHistory.value].slice(0, HISTORY_LIMIT);
};

const rollCheck = async () => {
  if (isCheckRolling.value) return;
  isCheckRolling.value = true;
  saveLastUsedTarget(baseTarget.value);
  try {
    const result = await rollCheckOnlyAsync(checkStat.value, baseTarget.value, difficulty.value);
    pushHistory({
      kind: "check",
      naturalRoll: result.naturalRoll,
      totalRoll: result.totalRoll,
      targetNumber: result.targetNumber,
      statBonus: checkStat.value,
      hit: result.hit,
      critical: result.critical,
    });
  } catch {
    const result = rollCheckOnly(checkStat.value, baseTarget.value, difficulty.value);
    pushHistory({
      kind: "check",
      naturalRoll: result.naturalRoll,
      totalRoll: result.totalRoll,
      targetNumber: result.targetNumber,
      statBonus: checkStat.value,
      hit: result.hit,
      critical: result.critical,
    });
  } finally {
    isCheckRolling.value = false;
  }
};

const rollEffortAction = async () => {
  if (isEffortRolling.value || effortDie.value === 0) return;
  isEffortRolling.value = true;
  try {
    const result = await rollEffortAsync(effortDie.value);
    pushHistory({
      kind: "effort",
      die: result.die,
      roll: result.roll,
      bonus: result.bonus,
      total: result.total,
    });
  } catch {
    const result = rollEffort(effortDie.value);
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
.checks-diff-btn {
  padding: 0.35rem 0.65rem;
  border: 2px solid #d4d4d4;
  border-radius: 0.375rem;
  background: #fafafa;
  font-family: "nusaliver", "Arial Black", sans-serif;
  font-size: 0.7rem;
  font-weight: 900;
  text-transform: uppercase;
  cursor: pointer;
}

.checks-diff-btn--active {
  border-color: #dc2626;
  background: #dc2626;
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
</style>
