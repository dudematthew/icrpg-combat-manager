<template>
  <div class="rpg-container">
    <!-- Header -->
    <div class="mb-6 rpg-card">
      <h1 class="rpg-title">ICRPG Combat Manager</h1>
      <div class="mt-2 text-neutral-500 text-sm text-center" style="font-family: 'Chalkduster', cursive;">
        <GitHubVersion /> by <a href="https://github.com/dudematthew" target="_blank"
          class="text-primary hover:text-red-600 underline transition-colors">@dudematthew</a>
      </div>
    </div>

    <!-- Main Content -->
    <div class="space-y-6">
      <!-- Timers & Battlefield (Most Used Features) -->
      <div class="space-y-4">
        <TimerManager />

        <!-- Battlefield -->
        <div class="rpg-card">
          <!-- Battlefield Title at Top -->
          <div class="flex items-baseline gap-3 mb-4">
            <img src="/images/sword_icon.png" class="flex-shrink-0 w-6 h-6 text-accent icon-filter" alt="Battlefield" />
            <h2 class="flex-shrink-0 rpg-heading">Battlefield</h2>
            <span class="flex-shrink-0 font-body font-semibold text-accent text-sm">({{ activeMonsters.length }}
              active)</span>
          </div>

          <!-- Turn/Round Info -->
          <div class="bg-neutral-50 mb-4 p-3 border border-neutral-200 rounded-lg text-center">
            <div class="text-neutral-700 text-lg rpg-heading">
              Turn <span class="font-bold text-accent">{{ currentTurn }}</span> | Round <span
                class="font-bold text-accent">{{ currentRound }}</span>
            </div>
          </div>

          <!-- Turn/Round Control Buttons -->
          <div class="flex justify-center gap-3 mb-6">
            <button @click="nextTurn" class="rpg-button rpg-button-primary rpg-button-sm">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clip-rule="evenodd" />
              </svg>
              Next Turn
            </button>
            <button @click="nextRound" class="rpg-button rpg-button-secondary rpg-button-sm">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                  clip-rule="evenodd" />
                <path fill-rule="evenodd"
                  d="M3.293 15.707a1 1 0 010-1.414L7.586 10 3.293 5.707a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                  clip-rule="evenodd" />
              </svg>
              Next Round
            </button>
          </div>

          <!-- Monster Grid -->
          <div v-if="activeMonsters.length > 0" class="space-y-4 mb-6">
            <div v-for="monster in activeMonsters" :key="monster.id">
              <MonsterCard :monster="monster" :compact="shouldUseCompactView" @remove="removeMonster(monster.id)"
                @update="updateMonster(monster.id, $event)" />
            </div>
          </div>

          <!-- No Monsters Message -->
          <div v-else class="flex items-center mb-6 py-12 text-center" style="flex-direction: column;">
            <img src="/images/battlefield_empty_state.png" class="mx-auto mb-4 h-24 text-neutral-400 icon-filter"
              alt="No monsters" />
            <div class="mb-2 text-neutral-600 rpg-body">No monsters on the battlefield</div>
            <div class="mb-4 text-neutral-500 text-sm">Add monsters using the form below</div>
            <button @click="scrollToCreator"
              class="flex justify-center items-center gap-2 text-xs rpg-button rpg-button-secondary">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style="transform: rotate(180deg);">
                <path fill-rule="evenodd"
                  d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                  clip-rule="evenodd" />
              </svg>
              Go to Quick Monster Entry
            </button>
          </div>

          <!-- Clear Battlefield Button at Bottom -->
          <div class="flex justify-center gap-3 pt-4 border-neutral-200 border-t">
            <button @click="resetRoundsAndTurns"
              class="bg-warning hover:bg-yellow-600 px-3 py-2 border-2 border-warning rounded-md font-heading text-white text-sm uppercase tracking-wide transition-colors cursor-pointer">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clip-rule="evenodd" />
              </svg>
              Reset Rounds
            </button>
            <button @click="confirmClear"
              class="bg-danger hover:bg-red-700 px-3 py-2 border-2 border-danger rounded-md font-heading text-white text-sm uppercase tracking-wide transition-colors cursor-pointer">
              <img src="/images/sword_icon.png" class="w-4 h-4 icon-filter" alt="Clear battlefield" />
              Clear Battlefield
            </button>
          </div>
        </div>

      </div>

      <!-- Target -->
      <CombatMechanics />

      <!-- Monster Creation -->
      <div id="monster-creator">
        <MonsterCreator />
      </div>

      <!-- Clear Confirmation Modal -->
      <div v-if="showClearDialog"
        class="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4">
        <div class="bg-white shadow-xl p-6 rounded-lg w-full max-w-md">
          <div class="mb-4">
            <h3 class="mb-2 text-lg rpg-heading">Clear All Data</h3>
            <p class="mb-2 text-neutral-700 rpg-body">Are you sure you want to clear all monsters, timers, and reset the
              combat state?</p>
            <p class="text-neutral-500 text-sm">This action cannot be undone.</p>
          </div>
          <div class="flex justify-end gap-3">
            <button @click="clearAll" class="bg-danger hover:bg-red-700 border-danger text-white rpg-button">
              Clear All
            </button>
            <button @click="showClearDialog = false" class="rpg-button rpg-button-secondary">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCombatStore } from '@/stores/combat'
import MonsterCreator from '@/components/MonsterCreator.vue'
import MonsterCard from '@/components/MonsterCard.vue'
import CombatMechanics from '@/components/CombatMechanics.vue'
import TimerManager from '@/components/TimerManager.vue'
import GitHubVersion from '@/components/GitHubVersion.vue'
import AppFooter from '@/components/AppFooter.vue'

const combatStore = useCombatStore()

const showClearDialog = ref(false)

const currentTurn = computed(() => combatStore.currentTurn)
const currentRound = computed(() => combatStore.currentRound)
const activeMonsters = computed(() => combatStore.activeMonsters)
const shouldUseCompactView = computed(() => activeMonsters.value.length > 2)

const nextTurn = () => {
  combatStore.nextTurn()
}

const nextRound = () => {
  combatStore.nextRound()
}

const removeMonster = (id: string) => {
  combatStore.removeMonster(id)
}

const updateMonster = (id: string, updates: any) => {
  combatStore.updateMonster(id, updates)
}

const confirmClear = () => {
  showClearDialog.value = true
}

const clearAll = () => {
  combatStore.clearAll()
  showClearDialog.value = false
}

const scrollToCreator = () => {
  const element = document.getElementById('monster-creator')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const resetRoundsAndTurns = () => {
  combatStore.resetRoundsAndTurns()
}
</script>
