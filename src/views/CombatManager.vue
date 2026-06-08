<template>
  <div class="rpg-container" :class="{ 'has-section-nav': settingsStore.showSectionNav }">
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
        <div v-if="card.id === 'battlefield'" id="battlefield" class="rpg-card battlefield-section">
          <!-- Battlefield Title at Top -->
          <div class="flex items-baseline gap-3 mb-4">
            <img :src="assetUrl('images/sword_icon.png')" class="flex-shrink-0 w-6 h-6 text-accent icon-filter" alt="Battlefield" />
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
          <EmptySectionState
            v-else
            image="images/battlefield_empty_state.png"
            alt="No monsters"
            message="No monsters on the battlefield"
            hint="Add monsters using the form"
            :creator-above="isMonsterCreatorAboveBattlefield"
            @jump="scrollToCreator"
          />

          <!-- Clear Battlefield Button at Bottom -->
          <div class="flex justify-center items-center gap-3 pt-4 border-neutral-200 border-t">
            <button @click="resetRoundsAndTurns"
              class="flex flex-row items-center gap-1 bg-warning hover:bg-yellow-600 px-3 py-2 border-2 border-warning rounded-md font-heading text-white text-xs uppercase tracking-wide transition-colors cursor-pointer">
              <RotateCcw class="h-5 icon-filter" />
              Reset Rounds
            </button>
            <button @click="confirmClear"
              class="flex flex-row items-center gap-1 bg-danger hover:bg-red-700 px-3 py-2 border-2 border-danger rounded-md font-heading text-white text-xs uppercase tracking-wide transition-colors cursor-pointer">
              <img :src="assetUrl('images/sword_icon.png')" class="h-5 icon-filter" alt="Clear battlefield" />
              Clear Battlefield
            </button>
          </div>
        </div>

        <!-- Target -->
        <CombatMechanics v-if="card.id === 'target'" ref="combatMechanicsRef" data-target-section />

        <MonsterLibrary
          v-if="card.id === 'library'"
          :is-creator-above="isMonsterCreatorAboveLibrary"
          :is-battlefield-above="isBattlefieldAboveLibrary"
        />

        <div v-if="card.id === 'monster-creator'" id="monster-creator">
          <MonsterCreator :isAboveBattlefield="isMonsterCreatorAboveBattlefield" />
        </div>

        <InspirationPanel v-if="card.id === 'inspirations'" />
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
              <h3 class="mb-2 text-lg rpg-title">Settings</h3>
              <p class="mb-4 text-neutral-600 text-xs rpg-body">
                <Eye class="inline w-3.5 h-3.5 align-text-bottom" /> show/hide ·
                <ToggleRight class="inline w-3.5 h-3.5 align-text-bottom" /> on/off ·
                <CircleDot class="inline w-3.5 h-3.5 align-text-bottom" /> pick one
              </p>

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
                  <SettingsControl
                    ref="tierModeButton"
                    variant="enabled"
                    :active="settingsStore.tierMode"
                    @click="handleTierModeToggle"
                  />
                </div>
              </div>

              <!-- Fast Mode -->
              <div class="mb-6">
                <h4 class="mb-3 rpg-label">Fast Mode</h4>
                <div class="bg-neutral-50 p-3 border border-neutral-200 rounded-lg">
                  <div class="flex justify-between items-center">
                    <span class="font-bold text-sm rpg-body">Fast mode at the table</span>
                    <SettingsControl variant="enabled" :active="settingsStore.fastMode" @click="settingsStore.toggleFastMode" />
                  </div>
                  <div class="mt-2 text-neutral-600 text-xs rpg-body">
                    Hides Advanced Options in the monster creator for quicker stat blocks mid-fight
                  </div>
                </div>
              </div>

              <!-- Section Navigation -->
              <div class="mb-6">
                <h4 class="mb-3 rpg-label">Section Navigation</h4>
                <div class="bg-neutral-50 p-3 border border-neutral-200 rounded-lg">
                  <div class="flex justify-between items-center">
                    <span class="font-bold text-sm rpg-body">Sticky jump bar at bottom</span>
                    <SettingsControl variant="visibility" :active="settingsStore.showSectionNav" @click="settingsStore.toggleSectionNav" />
                  </div>
                  <div class="mt-2 text-neutral-600 text-xs rpg-body">
                    Jump between Timers, Battlefield, Library, and other cards without scrolling
                  </div>
                </div>
              </div>

              <!-- Timers -->
              <div class="mb-6">
                <h4 class="mb-3 rpg-label">Timers</h4>
                <div class="space-y-3 bg-neutral-50 p-3 border border-neutral-200 rounded-lg">
                  <div class="flex justify-between items-center">
                    <div>
                      <div class="font-bold text-sm rpg-body">Named timers only</div>
                      <div class="text-neutral-600 text-xs rpg-body">Type a custom name for each timer</div>
                    </div>
                    <SettingsControl
                      variant="choice"
                      :active="settingsStore.timerNamingMode === 'named'"
                      @click="settingsStore.setTimerNamingMode('named')"
                    />
                  </div>

                  <div class="flex justify-between items-center">
                    <div>
                      <div class="font-bold text-sm rpg-body">Color timers only</div>
                      <div class="text-neutral-600 text-xs rpg-body">Pick a swatch — no typing required</div>
                    </div>
                    <SettingsControl
                      variant="choice"
                      :active="settingsStore.timerNamingMode === 'color'"
                      @click="settingsStore.setTimerNamingMode('color')"
                    />
                  </div>

                  <div class="flex justify-between items-center">
                    <div>
                      <div class="font-bold text-sm rpg-body">Named and Color tabs</div>
                      <div class="text-neutral-600 text-xs rpg-body">Switch between both styles in the Timers card</div>
                    </div>
                    <SettingsControl
                      variant="choice"
                      :active="settingsStore.timerNamingMode === 'both'"
                      @click="settingsStore.setTimerNamingMode('both')"
                    />
                  </div>

                  <div v-if="settingsStore.timerNamingMode === 'both'" class="flex justify-between items-center pt-2 border-neutral-200 border-t">
                    <div>
                      <div class="font-bold text-sm rpg-body">Open on Color tab</div>
                      <div class="text-neutral-600 text-xs rpg-body">Which tab is selected when you open Timers</div>
                    </div>
                    <SettingsControl
                      variant="enabled"
                      :active="settingsStore.timerColorModeDefault"
                      @click="settingsStore.toggleTimerColorModeDefault"
                    />
                  </div>

                  <div class="text-neutral-600 text-xs rpg-body">
                    Pick one timer style. The filled circle marks your choice.
                  </div>
                </div>
              </div>

              <!-- Title Card Visibility -->
              <div class="mb-6">
                <h4 class="mb-3 rpg-label">Title Card</h4>
                <div class="bg-neutral-50 p-3 border border-neutral-200 rounded-lg">
                  <div class="flex justify-between items-center">
                    <span class="font-bold text-sm rpg-body">Show title card at top</span>
                    <SettingsControl variant="visibility" :active="settingsStore.showTitleCard" @click="settingsStore.toggleTitleCard" />
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
                    <SettingsControl variant="visibility" :active="settingsStore.showCompactConditions" @click="settingsStore.toggleCompactConditions" />
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
                    <SettingsControl variant="enabled" :active="settingsStore.autoTurnIncrement" @click="settingsStore.toggleAutoTurnIncrement" />
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
                  <div class="flex justify-between items-center">
                    <span class="font-bold text-sm rpg-body">Timer completed notifications</span>
                    <SettingsControl variant="enabled" :active="settingsStore.notifications.timerDone" @click="settingsStore.toggleTimerDoneNotification" />
                  </div>

                  <div class="flex justify-between items-center">
                    <span class="font-bold text-sm rpg-body">Turn auto-incremented notifications</span>
                    <SettingsControl variant="enabled" :active="settingsStore.notifications.turnAutoIncremented" @click="settingsStore.toggleTurnAutoIncrementedNotification" />
                  </div>

                  <div class="flex justify-between items-center">
                    <span class="font-bold text-sm rpg-body">Round end notifications</span>
                    <SettingsControl variant="enabled" :active="settingsStore.notifications.roundEnded" @click="settingsStore.toggleRoundEndedNotification" />
                  </div>

                  <div class="text-neutral-600 text-xs rpg-body">
                    Turn notifications on or off. Disabled ones will not appear when triggered.
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
                      <SettingsControl
                        variant="visibility"
                        :active="card.enabled"
                        @click="() => handleCardToggle(card.id)"
                      />
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
    <SectionNav />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useCombatStore } from '@/stores/combat'
import { useSettingsStore } from '@/stores/settings'
import type { Monster } from '@/types'
import { useDragAndDrop } from 'vue-fluid-dnd'
import { useScrollLock } from '@/composables/useScrollLock'
import { Settings, ChevronRight, RotateCcw, GripVertical, ChevronsRight, Eye, ToggleRight, CircleDot } from 'lucide-vue-next'
import SettingsControl from '@/components/SettingsControl.vue'
import MonsterCreator from '@/components/MonsterCreator.vue'
import MonsterLibrary from '@/components/MonsterLibrary.vue'
import InspirationPanel from '@/components/InspirationPanel.vue'
import SectionNav from '@/components/SectionNav.vue'
import EmptySectionState from '@/components/EmptySectionState.vue'
import MonsterCard from '@/components/MonsterCard.vue'
import CombatMechanics from '@/components/CombatMechanics.vue'
import TimerManager from '@/components/TimerManager.vue'
import GitHubVersion from '@/components/GitHubVersion.vue'
import AppFooter from '@/components/AppFooter.vue'
import { assetUrl } from '@/utils/assetUrl'

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

const isMonsterCreatorAboveLibrary = computed(() => {
  const monsterCreatorIndex = settingsStore.appCards.findIndex(card => card.id === 'monster-creator')
  const libraryIndex = settingsStore.appCards.findIndex(card => card.id === 'library')

  if (monsterCreatorIndex === -1 || libraryIndex === -1) return false
  return monsterCreatorIndex < libraryIndex
})

const isBattlefieldAboveLibrary = computed(() => {
  const battlefieldIndex = settingsStore.appCards.findIndex(card => card.id === 'battlefield')
  const libraryIndex = settingsStore.appCards.findIndex(card => card.id === 'library')

  if (battlefieldIndex === -1 || libraryIndex === -1) return true
  return battlefieldIndex < libraryIndex
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
  document.getElementById('monster-creator')?.scrollIntoView({ behavior: 'smooth' })
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
