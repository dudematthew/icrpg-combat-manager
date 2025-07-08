<template>
  <div class="rpg-card combat-mechanics">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <img src="/images/target_icon.png" class="mb-3 w-6 h-6 text-accent icon-filter" alt="Target" />
      <h2 class="rpg-heading">Target</h2>
    </div>

    <!-- Scene Target Number and Difficulty Modifiers stacked vertically -->
    <div class="flex flex-col items-center space-y-6 mx-auto mb-6 max-w-md" style="flex-direction: column;">
      <!-- Base Target Number Section -->
      <div class="bg-neutral-50 p-4 rounded-lg">
        <label class="mb-3 rpg-label">Base Scene Target Number</label>
        <div class="flex justify-center items-center gap-3">
          <button @click="adjustTarget(-1)" class="rpg-icon-button rpg-icon-button-neutral">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clip-rule="evenodd" />
            </svg>
          </button>
          <div class="text-center">
            <input v-model.number="sceneTargetNumber" type="number" :min="1" :max="25" @change="updateTarget"
              @keyup.enter="updateTarget"
              class="bg-white px-4 py-2 border-2 border-accent rounded-lg w-20 font-black text-2xl text-center" />
            <div class="mt-1 text-neutral-600 text-xs">Base Target</div>
          </div>
          <button @click="adjustTarget(1)" class="rpg-icon-button rpg-icon-button-neutral">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Difficulty Modifiers Section -->
      <div class="flex flex-col items-center bg-neutral-50 p-4 rounded-lg" style="flex-direction: column;">
        <label class="mb-3 rpg-label">Difficulty Modifiers</label>
        <div class="flex flex-wrap gap-2">
          <button @click="setDifficulty('easy')"
            :class="difficulty === 'easy' ? 'bg-success text-[#fff]' : 'bg-white text-success border-success hover:bg-green-50 cursor-pointer'"
            class="px-3 py-2 border-2 rounded-md font-heading font-black text-xs uppercase tracking-wide transition-colors">
            Easy (-3)
          </button>
          <button @click="setDifficulty('normal')"
            :class="difficulty === 'normal' ? 'bg-info text-[#fff]' : 'bg-white text-info border-info hover:bg-blue-50 cursor-pointer'"
            class="px-3 py-2 border-2 rounded-md font-heading font-black text-xs uppercase tracking-wide transition-colors">
            Normal
          </button>
          <button @click="setDifficulty('hard')"
            :class="difficulty === 'hard' ? 'bg-danger text-[#fff]' : 'bg-white text-danger border-danger hover:bg-red-50 cursor-pointer'"
            class="px-3 py-2 border-2 rounded-md font-heading font-black text-xs uppercase tracking-wide transition-colors">
            Hard (+3)
          </button>
        </div>
      </div>
      <!-- Current Target Display -->
      <div class="bg-gradient-to-r from-accent to-red-600 shadow-lg mt-4 p-4 rounded-lg">
        <div class="text-center">
          <div class="mb-1 font-heading text-white text-sm uppercase tracking-wider">Current Target</div>
          <div class="mb-1 font-black text-white text-4xl">{{ effectiveTarget }}</div>
          <div class="font-medium text-white/90 text-sm capitalize">{{ difficulty }} difficulty</div>
        </div>
      </div>
    </div>
    <!-- Attack Roll Section -->
    <div>
      <h3 class="mb-4 text-base rpg-heading">Quick Roll</h3>

      <!-- Stat Bonus and Effort Type in one row -->
      <div class="gap-4 grid grid-cols-1 md:grid-cols-2 mb-4">
        <div>
          <label class="rpg-label">Stat Bonus</label>
          <input v-model.number="attackStat" type="number" :min="-5" :max="20" class="w-full rpg-input" />
        </div>
        <div>
          <label class="rpg-label">Effort Type</label>
          <select v-model="attackEffortType" class="rpg-input">
            <option value="none">None</option>
            <option v-for="type in effortTypes" :key="type.value" :value="type.value">
              {{ type.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- Roll Button -->
      <div class="mb-2">
        <button @click="rollAttack" :disabled="isRolling"
          class="disabled:opacity-50 w-full disabled:cursor-not-allowed rpg-button rpg-button-primary">
          <img v-if="!isRolling" src="/images/d20_dice_icon.png" class="w-5 h-5 icon-filter" alt="Roll" />
          <div v-else class="border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin"></div>
          {{ isRolling ? 'Rolling...' : 'Roll' }}
        </button>
      </div>

      <!-- Last Roll Result -->
      <div v-if="lastAttackResult" class="mt-4">
        <h3 class="mb-4 text-base rpg-heading">Last Roll Result</h3>
        <div class="bg-white p-4 border-2 border-neutral-300 rounded-lg">
          <div class="gap-4 grid grid-cols-4 mb-4 text-center">
            <div>
              <div class="mb-1 text-neutral-700 text-sm rpg-body">Roll:</div>
              <div class="font-bold text-accent text-2xl">{{ lastAttackResult.naturalRoll }}</div>
            </div>
            <div>
              <div class="mb-1 text-neutral-700 text-sm rpg-body">Total:</div>
              <div class="font-bold text-2xl">{{ lastAttackResult.totalRoll }}</div>
            </div>
            <div>
              <div class="mb-1 text-neutral-700 text-sm rpg-body">Target:</div>
              <div class="font-bold text-lg">{{ lastAttackResult.targetNumber }}</div>
            </div>
            <div>
              <div class="mb-1 text-neutral-700 text-sm rpg-body">Result:</div>
              <div class="font-bold text-lg" :class="lastAttackResult.success ? 'text-success' : 'text-danger'">
                {{ lastAttackResult.success ? 'SUCCESS' : 'FAIL' }}
              </div>
            </div>
          </div>

          <!-- Effort Display -->
          <div v-if="lastAttackResult.success && lastAttackResult.effort !== undefined" class="text-center">
            <div class="mb-1 text-md text-neutral-700 rpg-body">Effort:</div>
            <div class="font-bold text-xl">
              <span class="text-accent">{{ lastAttackResult.effort }}</span>
              <span v-if="lastAttackResult.critical" class="ml-2 text-warning">+ CRIT!</span>
            </div>
            <!-- Critical Hit Breakdown -->
            <div v-if="lastAttackResult.critical"
              class="bg-warning/10 mt-2 p-2 border border-warning/20 rounded text-sm">
              <div class="mb-1 font-semibold text-warning">Critical Hit Breakdown:</div>
              <div class="text-neutral-600">
                <div>Base effort: <span class="font-medium">{{ lastAttackResult.baseEffort }}</span></div>
                <div>Critical bonus (d12): <span class="font-medium text-warning">+{{ lastAttackResult.criticalBonus
                    }}</span></div>
                <div class="mt-1 text-neutral-500 text-xs">Natural 20 grants +1d12 to effort!</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCombatStore } from '@/stores/combat'
import { EFFORT_TYPES } from '@/types'
import { makeAttack, makeAttackAsync, getEffortDie } from '@/utils/combat'
import type { AttackResult } from '@/utils/combat'

const combatStore = useCombatStore()

const sceneTargetNumber = ref(combatStore.sceneTargetNumber)
const difficulty = ref<'easy' | 'normal' | 'hard'>('normal')
const attackStat = ref(0)
const attackEffortType = ref('none')
const lastAttackResult = ref<AttackResult | null>(null)
const isRolling = ref(false)

const effortTypes = EFFORT_TYPES.map(type => ({
  label: `${type.type} (d${type.die})`,
  value: type.type
}))

const effectiveTarget = computed(() => {
  const base = sceneTargetNumber.value
  switch (difficulty.value) {
    case 'easy': return base - 3
    case 'hard': return base + 3
    default: return base
  }
})

const updateTarget = () => {
  combatStore.sceneTargetNumber = sceneTargetNumber.value
}

const adjustTarget = (amount: number) => {
  sceneTargetNumber.value = Math.max(1, Math.min(25, sceneTargetNumber.value + amount))
  updateTarget()
}

const setDifficulty = (newDifficulty: 'easy' | 'normal' | 'hard') => {
  difficulty.value = newDifficulty
}

const rollAttack = async () => {
  if (isRolling.value) return

  const effortDie = getEffortDie(attackEffortType.value)
  const isHard = difficulty.value === 'hard'
  const isEasy = difficulty.value === 'easy'

  isRolling.value = true

  try {
    // Always use true random with automatic fallback
    lastAttackResult.value = await makeAttackAsync(
      attackStat.value,
      sceneTargetNumber.value,
      effortDie,
      isHard,
      isEasy,
      false // Don't force pseudo-random
    )
  } catch (error) {
    console.error('Roll failed:', error)
    // Fallback to pseudo-random on error
    lastAttackResult.value = makeAttack(
      attackStat.value,
      sceneTargetNumber.value,
      effortDie,
      isHard,
      isEasy
    )
  } finally {
    isRolling.value = false
  }
}
</script>
