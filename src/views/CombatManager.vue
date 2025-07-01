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
            <svg class="flex-shrink-0 w-6 h-6 text-accent" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
            </svg>
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
            <button @click="nextTurn" class="rpg-button rpg-button-primary">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clip-rule="evenodd" />
              </svg>
              Next Turn
            </button>
            <button @click="nextRound" class="rpg-button rpg-button-secondary">
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
              <MonsterCard :monster="monster" @remove="removeMonster(monster.id)"
                @update="updateMonster(monster.id, $event)" />
            </div>
          </div>

          <!-- No Monsters Message -->
          <div v-else class="mb-6 py-12 text-center">
            <svg class="mx-auto mb-4 w-16 h-16 text-neutral-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
            </svg>
            <div class="mb-2 text-neutral-600 rpg-body">No monsters on the battlefield</div>
            <div class="mb-4 text-neutral-500 text-sm">Add monsters using the form above</div>
            <button @click="scrollToCreator" class="text-xs rpg-button rpg-button-secondary">
              <svg style="width: 25px; height: 25px;" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                  clip-rule="evenodd" />
              </svg>
              Go to Quick Monster Entry
            </button>
          </div>

          <!-- Clear Battlefield Button at Bottom -->
          <div class="flex justify-center pt-4 border-neutral-200 border-t">
            <button @click="confirmClear"
              class="bg-danger hover:bg-red-700 px-3 py-2 border-2 border-danger rounded-md font-heading text-white text-sm uppercase tracking-wide transition-colors cursor-pointer">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd" />
              </svg>
              Clear Battlefield
            </button>
          </div>
        </div>

      </div>

      <!-- Target -->
      <CombatMechanics />

      <!-- Monster Creation -->
      <MonsterCreator />

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
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}
</script>
