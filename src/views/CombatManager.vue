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
      <!-- Dynamic Content Based on Settings -->
      <template v-for="card in settingsStore.getVisibleCards()" :key="card.id">
        <!-- Timers -->
        <TimerManager v-if="card.id === 'timers'" />

        <!-- Battlefield -->
        <div v-if="card.id === 'battlefield'" class="rpg-card battlefield-section">
          <!-- Battlefield Title at Top -->
          <div class="flex items-baseline gap-3 mb-4">
            <img src="/images/sword_icon.png" class="flex-shrink-0 w-6 h-6 text-accent icon-filter" alt="Battlefield" />
            <h2 class="flex-shrink-0 rpg-heading">Battlefield</h2>
            <span class="flex-shrink-0 font-body font-semibold text-accent text-sm">({{ activeMonsters.length }}
              active)</span>
          </div>

          <!-- Turn/Round Info -->
          <div class="bg-neutral-50 mb-4 p-3 text-center">
            <div class="text-neutral-700 text-lg rpg-heading">
              Turn <span class="font-bold text-accent">{{ currentTurn }}</span> | Round <span
                class="font-bold text-accent">{{ currentRound }}</span>
            </div>
          </div>

          <!-- Turn/Round Control Buttons -->
          <div class="flex justify-center gap-3 mb-6">
            <button @click="nextTurn" class="rpg-button rpg-button-primary rpg-button-sm">
              <ChevronRight class="w-4 h-4" />
              Next Turn
            </button>
            <button @click="nextRound" class="rpg-button rpg-button-secondary rpg-button-sm">
              <ChevronsRight class="w-4 h-4" />
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
          <div v-else class="flex justify-center items-center mb-6 py-12 text-center" style="flex-direction: column;">
            <img src="/images/battlefield_empty_state.png" class="mx-auto mb-4 h-24 text-neutral-400 icon-filter"
              alt="No monsters" />
            <div class="mb-2 text-neutral-600 rpg-body">No monsters on the battlefield</div>
            <div class="mb-4 text-neutral-500 text-sm">Add monsters using the form <span
                v-if="isMonsterCreatorAboveBattlefield">above</span><span v-else>below</span></div>
            <button @click="scrollToCreator"
              class="flex justify-center items-center gap-1 bg-neutral-100 hover:bg-neutral-200 px-3 py-1 rounded text-neutral-600 text-xs transition-colors cursor-pointer">
              <ChevronUp v-if="isMonsterCreatorAboveBattlefield" class="w-3 h-3" />
              <ChevronDown v-else class="w-3 h-3" />
              Jump
            </button>
          </div>

          <!-- Clear Battlefield Button at Bottom -->
          <div class="flex justify-center items-center gap-3 pt-4 border-neutral-200 border-t">
            <button @click="resetRoundsAndTurns"
              class="flex flex-row items-center gap-1 bg-warning hover:bg-yellow-600 px-3 py-2 border-2 border-warning rounded-md font-heading text-white text-sm uppercase tracking-wide transition-colors cursor-pointer">
              <RotateCcw class="h-6 icon-filter" />
              Reset Rounds
            </button>
            <button @click="confirmClear"
              class="flex flex-row items-center gap-1 bg-danger hover:bg-red-700 px-3 py-2 border-2 border-danger rounded-md font-heading text-white text-sm uppercase tracking-wide transition-colors cursor-pointer">
              <img src="/images/sword_icon.png" class="h-6 icon-filter" alt="Clear battlefield" />
              Clear Battlefield
            </button>
          </div>
        </div>

        <!-- Target -->
        <CombatMechanics v-if="card.id === 'target'" />

        <!-- Monster Creation -->
        <div v-if="card.id === 'monster-creator'" id="monster-creator">
          <MonsterCreator :isAboveBattlefield="isMonsterCreatorAboveBattlefield" />
        </div>
      </template>

      <!-- Settings -->
      <div class="rpg-card">
        <button @click="showSettingsModal = true" class="w-full rpg-button rpg-button-secondary">
          <Settings class="w-6 h-6" />
          Settings
        </button>
      </div>

      <!-- Settings Modal -->
      <div v-if="showSettingsModal"
        class="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4"
        @click="showSettingsModal = false" style="top: -24px;">
        <div class="bg-white shadow-xl rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto" @click.stop>
          <div class="p-6">
            <div class="mb-6">
              <h3 class="mb-4 text-lg rpg-title">Settings</h3>

              <!-- Tier Mode Setting -->
              <div class="mb-6">
                <h4 class="mb-3 rpg-label">Monster Creation Mode</h4>
                <div class="flex justify-between items-center bg-neutral-50 p-3 border border-neutral-200 rounded-lg">
                  <div>
                    <div class="font-medium text-sm rpg-heading">
                      {{ settingsStore.tierMode ? 'Tier Mode' : 'Manual Mode' }}
                    </div>
                    <div class="text-neutral-600 text-xs rpg-body">
                      {{ settingsStore.tierMode
                      ? 'Tier automatically sets stats, actions, and hearts'
                      : 'Manually set stats, actions, and hearts' }}
                    </div>
                  </div>
                  <button ref="tierModeButton"
                    class="inline-flex relative items-center rounded-full w-10 h-5 transition-colors"
                    style="pointer-events: auto; position: relative; z-index: 10;" @mousedown.prevent.stop
                    @touchstart.prevent.stop @click.prevent.stop="handleTierModeToggle">
                    <span :class="settingsStore.tierMode ? 'translate-x-5' : 'translate-x-0.5'"
                      class="inline-block flex justify-center items-center bg-white shadow-sm rounded-full w-4 h-4 transition-transform transform">
                      <EyeOff v-if="settingsStore.tierMode" class="w-4 h-4 text-neutral-400" />
                      <Eye v-else class="w-4 h-4 text-accent" />
                    </span>
                  </button>
                </div>
              </div>

              <!-- App Cards Management -->
              <div class="mb-6">
                <h4 class="mb-3 rpg-label">Application Cards</h4>
                <p class="mb-4 text-neutral-600 rpg-body">Drag to reorder and toggle visibility of application sections.
                </p>

                <div ref="cardListParent" class="space-y-1">
                  <div v-for="(card, index) in appCardsRef" :key="card.id" :index="index"
                    class="flex items-center gap-2 bg-neutral-50 p-2 border border-neutral-200 rounded-lg">

                    <!-- Drag Handle -->
                    <div class="flex-shrink-0 text-neutral-400 cursor-move drag-handle">
                      <GripVertical class="w-4 h-4" />
                    </div>

                    <!-- Card Info -->
                    <div class="flex-1">
                      <div class="font-medium text-sm rpg-heading">{{ card.name }}</div>
                      <div class="text-neutral-600 text-xs rpg-body">{{ card.description }}</div>
                    </div>

                    <!-- Toggle Switch -->
                    <div class="flex-shrink-0" style="pointer-events: auto;">
                      <button class="inline-flex relative items-center rounded-full w-10 h-5 transition-colors"
                        style="pointer-events: auto; position: relative; z-index: 10;" @mousedown.prevent.stop
                        @touchstart.prevent.stop @click.prevent.stop="() => handleCardToggle(card.id)">
                        <span :class="card.enabled ? 'translate-x-5' : 'translate-x-0.5'"
                          class="inline-block flex justify-center items-center bg-white shadow-sm rounded-full w-4 h-4 transition-transform transform">
                          <Eye v-if="card.enabled" class="w-4 h-4 text-accent" />
                          <EyeOff v-else class="w-4 h-4 text-neutral-400" />
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>



            <div class="flex sm:flex-row flex-col justify-between gap-3">
              <button @click="settingsStore.resetToDefaults"
                class="px-3 sm:px-4 py-2 text-sm sm:text-base rpg-button rpg-button-secondary">
                Reset to Defaults
              </button>
              <button @click="showSettingsModal = false"
                class="px-3 sm:px-4 py-2 text-sm sm:text-base rpg-button rpg-button-primary">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Clear Confirmation Modal -->
      <div v-if="showClearDialog"
        class="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4">
        <div class="bg-white shadow-xl p-6 rounded-lg w-full max-w-md">
          <div class="mb-4">
            <h3 class="mb-2 text-lg rpg-heading">Clear All Data</h3>
            <p class="mb-2 text-neutral-700 rpg-body">Are you sure you want to clear all monsters, timers, and reset
              the
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
import { useSettingsStore, type AppCard } from '@/stores/settings'
import { useDragAndDrop } from 'vue-fluid-dnd'
import { Settings, ChevronRight, RotateCcw, Trash2, GripVertical, ChevronDown, ChevronUp, Eye, EyeOff, ChevronsRight } from 'lucide-vue-next'
import MonsterCreator from '@/components/MonsterCreator.vue'
import MonsterCard from '@/components/MonsterCard.vue'
import CombatMechanics from '@/components/CombatMechanics.vue'
import TimerManager from '@/components/TimerManager.vue'
import GitHubVersion from '@/components/GitHubVersion.vue'
import AppFooter from '@/components/AppFooter.vue'

const combatStore = useCombatStore()
const settingsStore = useSettingsStore()

const showClearDialog = ref(false)
const showSettingsModal = ref(false)



// Vue Fluid DnD setup for application cards
const appCardsRef = computed({
  get: () => settingsStore.appCards,
  set: (newCards: AppCard[]) => {
    settingsStore.reorderCards(newCards)
  }
})
const { parent: cardListParent } = useDragAndDrop(appCardsRef)

const currentTurn = computed(() => combatStore.currentTurn)
const currentRound = computed(() => combatStore.currentRound)
const activeMonsters = computed(() => combatStore.activeMonsters)
const shouldUseCompactView = computed(() => activeMonsters.value.length > 2)

const isMonsterCreatorAboveBattlefield = computed(() => {
  const monsterCreatorCard = settingsStore.appCards.find(card => card.id === 'monster-creator')
  const battlefieldCard = settingsStore.appCards.find(card => card.id === 'battlefield')
  
  if (!monsterCreatorCard || !battlefieldCard) return false
  return monsterCreatorCard.order < battlefieldCard.order
})

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

const handleTierModeToggle = () => {
  settingsStore.toggleTierMode()
}

const handleCardToggle = (cardId: string) => {
  settingsStore.toggleCard(cardId)
}
</script>
