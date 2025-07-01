<template>
  <div class="rpg-card combat-mechanics">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <svg class="w-6 h-6 text-accent" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
          clip-rule="evenodd" />
      </svg>
      <h2 class="rpg-heading">Target</h2>
    </div>

    <!-- Scene Target Number and Difficulty Modifiers stacked vertically -->
    <div class="space-y-6 mb-6">
      <div>
        <label class="rpg-label">Scene Target Number</label>
        <div class="flex items-center gap-2">
          <button @click="adjustTarget(-1)" class="rpg-icon-button rpg-icon-button-neutral">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clip-rule="evenodd" />
            </svg>
          </button>
          <input v-model.number="sceneTargetNumber" type="number" :min="1" :max="25" @change="updateTarget"
            class="px-2 py-1 border-2 border-accent rounded-md w-16 font-bold text-xl text-center" />
          <button @click="adjustTarget(1)" class="rpg-icon-button rpg-icon-button-neutral">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <div>
        <label class="rpg-label">Difficulty Modifiers</label>
        <div class="flex flex-wrap gap-2">
          <button @click="setDifficulty('easy')"
            :class="difficulty === 'easy' ? 'bg-success text-white' : 'bg-white text-success border-success hover:bg-green-50 cursor-pointer'"
            class="px-3 py-2 border-2 rounded-md font-heading font-black text-sm uppercase tracking-wide transition-colors">
            Easy (-3)
          </button>
          <button @click="setDifficulty('normal')"
            :class="difficulty === 'normal' ? 'bg-info text-white' : 'bg-white text-info border-info hover:bg-blue-50 cursor-pointer'"
            class="px-3 py-2 border-2 rounded-md font-heading font-black text-sm uppercase tracking-wide transition-colors">
            Normal
          </button>
          <button @click="setDifficulty('hard')"
            :class="difficulty === 'hard' ? 'bg-danger text-white' : 'bg-white text-danger border-danger hover:bg-red-50 cursor-pointer'"
            class="px-3 py-2 border-2 rounded-md font-heading font-black text-sm uppercase tracking-wide transition-colors">
            Hard (+3)
          </button>
        </div>
        <div class="mt-2 text-md text-neutral-700 rpg-body">
          Current target: <span class="font-bold text-accent">{{ effectiveTarget }}</span> ({{ difficulty }})
        </div>
      </div>
    </div>

    <!-- Attack Roll Section -->
    <div>
      <h3 class="mb-4 text-base rpg-heading">Quick Attack Roll</h3>

      <!-- Stat Bonus and Effort Type in one row -->
      <div class="gap-4 grid grid-cols-1 md:grid-cols-2 mb-4">
        <div>
          <label class="rpg-label">Stat Bonus</label>
          <input v-model.number="attackStat" type="number" :min="-5" :max="20" class="w-full rpg-input" />
        </div>
        <div>
          <label class="rpg-label">Effort Type</label>
          <select v-model="attackEffortType" class="rpg-input">
            <option value="">Choose type</option>
            <option v-for="type in effortTypes" :key="type.value" :value="type.value">
              {{ type.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- Roll Button -->
      <div class="mb-6">
        <button @click="rollAttack" :disabled="!attackEffortType || isRolling"
          class="disabled:opacity-50 w-full disabled:cursor-not-allowed rpg-button rpg-button-primary">
          <svg v-if="!isRolling" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5zm2 2a1 1 0 11-2 0 1 1 0 012 0zm0 14a1 1 0 11-2 0 1 1 0 012 0zm6-7a1 1 0 11-2 0 1 1 0 012 0zm6-7a1 1 0 11-2 0 1 1 0 012 0zm0 14a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
          <div v-else class="border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin"></div>
          {{ isRolling ? 'Rolling...' : 'Roll' }}
        </button>
      </div>

      <!-- Last Roll Result -->
      <div>
        <h3 class="mb-4 text-base rpg-heading">Last Roll Result</h3>
        <div v-if="lastAttackResult" class="bg-white p-4 border-2 border-neutral-300 rounded-lg">
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

          <!-- Effort and Random Source in one row -->
          <div class="gap-4 grid grid-cols-2 text-center">
            <div v-if="lastAttackResult.success">
              <div class="mb-1 text-neutral-700 text-sm rpg-body">Effort:</div>
              <div class="font-bold text-xl">
                <span class="text-accent">{{ lastAttackResult.effort }}</span>
                <span v-if="lastAttackResult.critical" class="ml-2 text-warning">+ CRIT!</span>
              </div>
            </div>
            <div v-if="lastAttackResult.randomSource">
              <div class="mb-1 text-neutral-700 text-sm rpg-body">Random Source:</div>
              <div class="font-medium text-sm"
                :class="lastAttackResult.randomSource === 'true-random' ? 'text-primary' : 'text-neutral-600'">
                {{ lastAttackResult.randomSource === 'true-random' ? '🎲 True Random' : '🎯 Pseudo Random' }}
              </div>
            </div>
          </div>
        </div>
        <div v-else class="bg-white p-8 border-2 border-neutral-300 rounded-lg text-center">
          <div class="text-neutral-700 rpg-body">No roll yet</div>
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
import { randomService, RandomSource } from '@/utils/randomService'

const combatStore = useCombatStore()

const sceneTargetNumber = ref(combatStore.sceneTargetNumber)
const difficulty = ref<'easy' | 'normal' | 'hard'>('normal')
const attackStat = ref(0)
const attackEffortType = ref('')
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
  if (!attackEffortType.value || isRolling.value) return

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
