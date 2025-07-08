<template>
  <div class="rpg-container">
    <!-- Header -->
    <div v-if="settingsStore.showTitleCard" class="mb-6 rpg-card">
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
            <button @click="nextRound"
              :class="allMonstersDone ? 'rpg-button rpg-icon-button-success rpg-button-sm' : 'rpg-button rpg-button-secondary rpg-button-sm'">
              <ChevronsRight class="w-4 h-4" />
              Next Round
            </button>
          </div>

          <!-- Monster Grid -->
          <div v-if="activeMonsters.length > 0" class="space-y-4 mb-6">
            <div v-for="monster in activeMonsters" :key="monster.id">
              <MonsterCard ref="monsterCardRefs" :monster="monster" :compact="shouldUseCompactView"
                @remove="removeMonster(monster.id)" @update="updateMonster(monster.id, $event)"
                @rollDamage="handleRollDamage" />
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
              class="flex flex-row items-center gap-1 bg-warning hover:bg-yellow-600 px-3 py-2 border-2 border-warning rounded-md font-heading text-white text-xs uppercase tracking-wide transition-colors cursor-pointer">
              <RotateCcw class="h-5 icon-filter" />
              Reset Rounds
            </button>
            <button @click="confirmClear"
              class="flex flex-row items-center gap-1 bg-danger hover:bg-red-700 px-3 py-2 border-2 border-danger rounded-md font-heading text-white text-xs uppercase tracking-wide transition-colors cursor-pointer">
              <img src="/images/sword_icon.png" class="h-5 icon-filter" alt="Clear battlefield" />
              Clear Battlefield
            </button>
          </div>
        </div>

        <!-- Target -->
        <CombatMechanics v-if="card.id === 'target'" ref="combatMechanicsRef" data-target-section />

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
        @click="showSettingsModal = false" style="margin-top: 0;">
        <div class="bg-white shadow-xl rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto" @click.stop>
          <div class="p-6">
            <div class="mb-6">
              <h3 class="mb-4 text-lg rpg-title">Settings</h3>

              <!-- Tier Mode Setting -->
              <div class="mb-6">
                <h4 class="mb-3 rpg-label">Monster Creation Mode</h4>
                <div class="flex justify-between items-center bg-neutral-50 p-3 border border-neutral-200 rounded-lg">
                  <div>
                    <div class="font-bold text-sm rpg-body">
                      {{ settingsStore.tierMode ? 'Tier Mode' : 'Manual Mode' }}
                    </div>
                    <div class="text-neutral-600 text-xs rpg-body">
                      {{ settingsStore.tierMode
                      ? 'Tier automatically sets stats, actions, and hearts'
                      : 'Manually set stats, actions, and hearts' }}
                    </div>
                  </div>
                  <button ref="tierModeButton"
                    class="inline-flex relative items-center rounded-full w-10 h-10 transition-colors cursor-pointer"
                    style="pointer-events: auto; position: relative; z-index: 10; touch-action: manipulation; user-select: none;"
                    @click="handleTierModeToggle">
                    <span
                      class="inline-block flex justify-center items-center bg-white shadow-sm mt-1 rounded-full w-6 h-6 transition-transform transform">
                      <EyeOff v-if="settingsStore.tierMode" class="w-5 h-5 text-neutral-400" />
                      <Eye v-else class="w-5 h-5 text-accent" />
                    </span>
                  </button>
                </div>
              </div>

              <!-- Title Card Visibility -->
              <div class="mb-6">
                <h4 class="mb-3 rpg-label">Title Card</h4>
                <div class="bg-neutral-50 p-3 border border-neutral-200 rounded-lg">
                  <div class="flex justify-between items-center">
                    <span class="font-bold text-sm rpg-body">Show title card at top</span>
                    <button @click="settingsStore.toggleTitleCard"
                      class="inline-flex relative items-center rounded-full w-10 h-10 transition-colors cursor-pointer">
                      <span
                        class="inline-block flex justify-center items-center bg-white shadow-sm mt-1 rounded-full w-6 h-6 transition-transform transform">
                        <Eye v-if="settingsStore.showTitleCard" class="w-5 h-5 text-accent" />
                        <EyeOff v-else class="w-5 h-5 text-neutral-400" />
                      </span>
                    </button>
                  </div>
                  <div class="mt-2 text-neutral-600 text-xs rpg-body">
                    Hide the title card to save space on mobile devices
                  </div>
                </div>
              </div>

              <!-- Compact View Settings -->
              <div class="mb-6">
                <h4 class="mb-3 rpg-label">Compact View</h4>
                <div class="space-y-3 bg-neutral-50 p-3 border border-neutral-200 rounded-lg">
                  <div>
                    <label class="font-bold text-sm rpg-body">Monsters before compact view activates</label>
                    <input :value="settingsStore.compactThreshold"
                      @input="(e) => settingsStore.updateCompactThreshold(parseInt((e.target as HTMLInputElement).value))"
                      @keyup.enter="showSettingsModal = false" type="number" :min="1" :max="10" class="rpg-input"
                      style="max-width: 120px;" />
                    <div class="mt-1 text-neutral-600 text-xs rpg-body">
                      Monsters will switch to compact view when there are more than {{ settingsStore.compactThreshold }}
                      monsters
                    </div>
                  </div>

                  <div class="flex justify-between items-center">
                    <span class="font-bold text-sm rpg-body">Show condition pills in compact view</span>
                    <button @click="settingsStore.toggleCompactConditions"
                      class="inline-flex relative items-center rounded-full w-10 h-10 transition-colors cursor-pointer">
                      <span
                        class="inline-block flex justify-center items-center bg-white shadow-sm mt-1 rounded-full w-6 h-6 transition-transform transform">
                        <Eye v-if="settingsStore.showCompactConditions" class="w-5 h-5 text-accent" />
                        <EyeOff v-else class="w-5 h-5 text-neutral-400" />
                      </span>
                    </button>
                  </div>
                  <div class="text-neutral-600 text-xs rpg-body">
                    Show small condition pills (bleeding, paralyzed, etc.) next to hearts in compact view
                  </div>
                </div>
              </div>

              <!-- Turn Management Settings -->
              <div class="mb-6">
                <h4 class="mb-3 rpg-label">Turn Management</h4>
                <div class="bg-neutral-50 p-3 border border-neutral-200 rounded-lg">
                  <div class="flex justify-between items-center">
                    <span class="font-bold text-sm rpg-body">Auto-increment turn when all monsters are done</span>
                    <button @click="settingsStore.toggleAutoTurnIncrement"
                      class="inline-flex relative items-center rounded-full w-10 h-10 transition-colors cursor-pointer">
                      <span
                        class="flex justify-center items-center bg-white shadow-sm mt-1 rounded-full w-6 h-6 transition-transform transform">
                        <Eye v-if="settingsStore.autoTurnIncrement" class="w-5 h-5 text-accent" />
                        <EyeOff v-else class="w-5 h-5 text-neutral-400" />
                      </span>
                    </button>
                  </div>
                  <div class="mt-2 text-neutral-600 text-xs rpg-body">
                    When enabled, the turn counter automatically increments by 1 when all alive monsters have completed
                    their
                    turns. In ICRPG, the GM controls all monsters, so only one turn should pass when all are done.
                  </div>
                </div>
              </div>

              <!-- Notifications Settings -->
              <div class="mb-6">
                <h4 class="mb-3 rpg-label">Notifications</h4>
                <div class="space-y-3 bg-neutral-50 p-3 border border-neutral-200 rounded-lg">
                  <!-- Timer Done Notifications -->
                  <div class="flex justify-between items-center">
                    <span class="font-bold text-sm rpg-body">Timer completed notifications</span>
                    <button @click="settingsStore.toggleTimerDoneNotification"
                      class="inline-flex relative items-center rounded-full w-10 h-10 transition-colors cursor-pointer">
                      <span
                        class="inline-block flex justify-center items-center bg-white shadow-sm mt-1 rounded-full w-6 h-6 transition-transform transform">
                        <Eye v-if="settingsStore.notifications.timerDone" class="w-5 h-5 text-accent" />
                        <EyeOff v-else class="w-5 h-5 text-neutral-400" />
                      </span>
                    </button>
                  </div>

                  <!-- Turn Auto-incremented Notifications -->
                  <div class="flex justify-between items-center">
                    <span class="font-bold text-sm rpg-body">Turn auto-incremented notifications</span>
                    <button @click="settingsStore.toggleTurnAutoIncrementedNotification"
                      class="inline-flex relative items-center rounded-full w-10 h-10 transition-colors cursor-pointer">
                      <span
                        class="inline-block flex justify-center items-center bg-white shadow-sm mt-1 rounded-full w-6 h-6 transition-transform transform">
                        <Eye v-if="settingsStore.notifications.turnAutoIncremented" class="w-5 h-5 text-accent" />
                        <EyeOff v-else class="w-5 h-5 text-neutral-400" />
                      </span>
                    </button>
                  </div>

                  <!-- Round Ended Notifications -->
                  <div class="flex justify-between items-center">
                    <span class="font-bold text-sm rpg-body">Round end notifications</span>
                    <button @click="settingsStore.toggleRoundEndedNotification"
                      class="inline-flex relative items-center rounded-full w-10 h-10 transition-colors cursor-pointer">
                      <span
                        class="inline-block flex justify-center items-center bg-white shadow-sm mt-1 rounded-full w-6 h-6 transition-transform transform">
                        <Eye v-if="settingsStore.notifications.roundEnded" class="w-5 h-5 text-accent" />
                        <EyeOff v-else class="w-5 h-5 text-neutral-400" />
                      </span>
                    </button>
                  </div>

                  <div class="text-neutral-600 text-xs rpg-body">
                    Control which notifications are shown. Disabled notifications will not appear even
                    when
                    triggered.
                  </div>
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
                      <button
                        class="inline-flex relative items-center rounded-full w-10 h-10 transition-colors cursor-pointer"
                        style="pointer-events: auto; position: relative; z-index: 10; touch-action: manipulation; user-select: none;"
                        @click="() => handleCardToggle(card.id)">
                        <span
                          class="inline-block flex justify-center items-center bg-white shadow-sm mt-1 rounded-full w-6 h-6 transition-transform transform">
                          <Eye v-if="card.enabled" class="w-5 h-5 text-accent" />
                          <EyeOff v-else class="w-5 h-5 text-neutral-400" />
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
import { ref, computed, watch } from 'vue'
import { useCombatStore } from '@/stores/combat'
import { useSettingsStore } from '@/stores/settings'
import type { Monster } from '@/types'
import { useDragAndDrop } from 'vue-fluid-dnd'
import { useScrollLock } from '@/composables/useScrollLock'
import { Settings, ChevronRight, RotateCcw, GripVertical, ChevronDown, ChevronUp, Eye, EyeOff, ChevronsRight } from 'lucide-vue-next'
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
const combatMechanicsRef = ref()
const monsterCardRefs = ref<Array<{ forceReset: () => void } | null>>([])

// Computed for combined modal state for scroll lock
const isModalOpen = computed(() => showSettingsModal.value || showClearDialog.value)

// Apply scroll lock when any modal is open
useScrollLock(isModalOpen)



// Vue Fluid DnD setup for application cards
const appCardsRef = ref([...settingsStore.appCards])

// Keep ref in sync with store
watch(() => settingsStore.appCards, (newCards) => {
  appCardsRef.value = [...newCards]
}, { immediate: true })

// Set up drag and drop with callback
const { parent: cardListParent } = useDragAndDrop(appCardsRef)

// Watch for drag changes and update store
watch(appCardsRef, (newCards) => {
  // Only update store if the order actually changed
  const currentOrder = settingsStore.appCards.map(c => c.id).join(',')
  const newOrder = newCards.map(c => c.id).join(',')

  if (currentOrder !== newOrder) {
    console.log('Drag detected, updating store')
    settingsStore.reorderCards(newCards)
  }
}, { deep: true })

const currentTurn = computed(() => combatStore.currentTurn)
const currentRound = computed(() => combatStore.currentRound)
const activeMonsters = computed(() => combatStore.activeMonsters)
const allMonstersDone = computed(() => combatStore.allMonstersDone)
const shouldUseCompactView = computed(() => activeMonsters.value.length > settingsStore.compactThreshold)

const isMonsterCreatorAboveBattlefield = computed(() => {
  const monsterCreatorIndex = settingsStore.appCards.findIndex(card => card.id === 'monster-creator')
  const battlefieldIndex = settingsStore.appCards.findIndex(card => card.id === 'battlefield')

  if (monsterCreatorIndex === -1 || battlefieldIndex === -1) return false
  return monsterCreatorIndex < battlefieldIndex
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

const updateMonster = (id: string, updates: Partial<Monster>) => {
  // If this is a doneTurn update, use the special toggleDoneTurn method
  if ('doneTurn' in updates && Object.keys(updates).length === 1) {
    combatStore.toggleDoneTurn(id)
  } else {
    combatStore.updateMonster(id, updates)
  }
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

const handleRollDamage = (monster: Monster) => {
  // Force reset all monster cards to collapse them before scrolling
  if (monsterCardRefs.value) {
    monsterCardRefs.value.forEach((cardRef) => {
      if (cardRef && typeof cardRef.forceReset === 'function') {
        cardRef.forceReset()
      }
    })
  }

  // Small delay to allow the cards to collapse before scrolling
  setTimeout(() => {
    // Scroll to the difficulty modifiers section
    const targetElement = document.getElementById('difficulty-modifiers')
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    // Set the stat bonus directly
    const combatMechanicsComponent = combatMechanicsRef.value?.[0]
    if (combatMechanicsComponent?.setAttackStat) {
      combatMechanicsComponent.setAttackStat(monster.statsBonus)
    }
  }, 50)
}
</script>
