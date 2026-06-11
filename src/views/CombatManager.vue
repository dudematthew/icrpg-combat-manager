<template>
  <div
    class="rpg-app"
    :class="{
      'has-section-nav': settingsStore.showSectionNav,
      'has-header': settingsStore.showTitleCard,
    }"
  >
    <div v-if="settingsStore.showTitleCard" class="rpg-app__header rpg-card">
      <h1 class="rpg-title">ICRPG Combat Manager</h1>
      <div class="mt-2 text-neutral-500 text-sm text-center" style="font-family: 'Chalkduster', cursive;">
        <GitHubVersion /> by <a href="https://github.com/dudematthew" target="_blank"
          class="text-primary hover:text-red-600 underline transition-colors">@dudematthew</a>
      </div>
    </div>

    <AppColumns
      ref="columnsRef"
      class="rpg-app__columns"
      :has-section-nav="settingsStore.showSectionNav"
      :has-header="settingsStore.showTitleCard"
      :show-boards-column="settingsStore.showBoardsColumn"
    >
      <template #combat>
        <div class="space-y-6">
          <ColumnAppCards
            ref="combatColumnCardsRef"
            :cards="combatColumnCards"
            :current-turn="currentTurn"
            :current-round="currentRound"
            :active-monsters="activeMonsters"
            :all-monsters-done="allMonstersDone"
            :should-use-compact-view="shouldUseCompactView"
            :is-monster-creator-above-battlefield="isMonsterCreatorAboveBattlefield"
            :on-next-turn="nextTurn"
            :on-next-round="nextRound"
            :on-remove-monster="removeMonster"
            :on-update-monster="updateMonster"
            :on-roll-damage="handleRollDamage"
            :on-scroll-to-creator="scrollToCreator"
            :on-reset-rounds-and-turns="resetRoundsAndTurns"
            :on-confirm-clear="confirmClear"
          />

          <div class="rpg-card">
            <button @click="showSettingsModal = true" class="w-full rpg-button rpg-button-secondary">
              <Settings class="w-6 h-6" />
              Settings
            </button>
          </div>

          <CreditsCard v-if="settingsStore.showCreditsCard" />
        </div>
      </template>

      <template #boards>
        <div class="space-y-6">
          <ColumnAppCards
            ref="boardsColumnCardsRef"
            :cards="boardsColumnCards"
            :current-turn="currentTurn"
            :current-round="currentRound"
            :active-monsters="activeMonsters"
            :all-monsters-done="allMonstersDone"
            :should-use-compact-view="shouldUseCompactView"
            :is-monster-creator-above-battlefield="isMonsterCreatorAboveBattlefield"
            :on-next-turn="nextTurn"
            :on-next-round="nextRound"
            :on-remove-monster="removeMonster"
            :on-update-monster="updateMonster"
            :on-roll-damage="handleRollDamage"
            :on-scroll-to-creator="scrollToCreator"
            :on-reset-rounds-and-turns="resetRoundsAndTurns"
            :on-confirm-clear="confirmClear"
          />
        </div>
      </template>
    </AppColumns>

    <div v-if="showSettingsModal"
      class="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4"
      @mousedown.self="showSettingsModal = false" style="margin-top: 0;">
      <div class="bg-white shadow-xl rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto" @click.stop>
        <div class="p-6">
          <div class="mb-6">
            <h3 class="mb-2 text-lg rpg-title">Settings</h3>
            <p class="settings-legend">
              <span class="settings-legend__item">
                <Eye class="settings-legend__icon" /> show/hide
              </span>
              <span class="settings-legend__sep">·</span>
              <span class="settings-legend__item">
                <ToggleRight class="settings-legend__icon" /> on/off
              </span>
              <span class="settings-legend__sep">·</span>
              <span class="settings-legend__item">
                <CircleDot class="settings-legend__icon" /> pick one
              </span>
            </p>

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
                <SettingsControl variant="enabled" :active="settingsStore.tierMode" @click="handleTierModeToggle" />
              </div>
            </div>

            <div class="mb-6">
              <h4 class="mb-3 rpg-label">Fast Monster Creator</h4>
              <div class="bg-neutral-50 p-3 border border-neutral-200 rounded-lg">
                <div class="flex justify-between items-center">
                  <span class="font-bold text-sm rpg-body">Fast monster creator at the table</span>
                  <SettingsControl variant="enabled" :active="settingsStore.fastMode" @click="settingsStore.toggleFastMode" />
                </div>
                <div class="mt-2 text-neutral-600 text-xs rpg-body">
                  Hides advanced options in the Monster Creator for quicker stat blocks mid-fight
                </div>
              </div>
            </div>

            <div class="mb-6">
              <h4 class="mb-3 rpg-label">Section Navigation</h4>
              <div class="bg-neutral-50 p-3 border border-neutral-200 rounded-lg">
                <div class="flex justify-between items-center">
                  <span class="font-bold text-sm rpg-body">Sticky jump bar at bottom</span>
                  <SettingsControl variant="visibility" :active="settingsStore.showSectionNav" @click="settingsStore.toggleSectionNav" />
                </div>
                <div class="mt-2 text-neutral-600 text-xs rpg-body">
                  Combat column: jump between Timers, Battlefield, and other cards. Boards column: board bar.
                </div>
              </div>
            </div>

            <div class="mb-6">
              <h4 class="mb-3 rpg-label">Board Deploy</h4>
              <div class="space-y-3 bg-neutral-50 p-3 border border-neutral-200 rounded-lg">
                <p class="text-neutral-600 text-xs rpg-body">
                  When you deploy a card from the board column, jump to the matching combat section (timers, battlefield, etc.).
                </p>
                <div class="flex justify-between items-center">
                  <div>
                    <div class="font-bold text-sm rpg-body">Always scroll after deploy</div>
                    <div class="text-neutral-600 text-xs rpg-body">Switches to the combat column on mobile, then scrolls</div>
                  </div>
                  <SettingsControl variant="choice" :active="settingsStore.scrollOnDeployMode === 'always'" @click="settingsStore.setScrollOnDeployMode('always')" />
                </div>
                <div class="flex justify-between items-center">
                  <div>
                    <div class="font-bold text-sm rpg-body">Hold deploy to scroll</div>
                    <div class="text-neutral-600 text-xs rpg-body">Tap deploys only; long-press deploy also scrolls</div>
                  </div>
                  <SettingsControl variant="choice" :active="settingsStore.scrollOnDeployMode === 'hold'" @click="settingsStore.setScrollOnDeployMode('hold')" />
                </div>
              </div>
            </div>

            <div class="mb-6">
              <h4 class="mb-3 rpg-label">Boards</h4>
              <div class="space-y-3 bg-neutral-50 p-3 border border-neutral-200 rounded-lg">
                <div class="flex justify-between items-center">
                  <span class="font-bold text-sm rpg-body">Expand card previews</span>
                  <SettingsControl variant="enabled" :active="settingsStore.boardCardExpandPreview" @click="settingsStore.toggleBoardCardExpandPreview" />
                </div>
                <div class="settings-color-field">
                  <label class="font-bold text-sm rpg-body">Default new card color</label>
                  <ColorSwatchPicker
                    class="settings-color-field__picker"
                    :model-value="settingsStore.defaultNewCardColor"
                    @update:model-value="settingsStore.setDefaultNewCardColor"
                  />
                </div>
              </div>
            </div>

            <div class="mb-6">
              <h4 class="mb-3 rpg-label">Timers</h4>
              <div class="space-y-3 bg-neutral-50 p-3 border border-neutral-200 rounded-lg">
                <div class="flex justify-between items-center">
                  <div>
                    <div class="font-bold text-sm rpg-body">Named timers only</div>
                    <div class="text-neutral-600 text-xs rpg-body">Type a custom name for each timer</div>
                  </div>
                  <SettingsControl variant="choice" :active="settingsStore.timerNamingMode === 'named'" @click="settingsStore.setTimerNamingMode('named')" />
                </div>
                <div class="flex justify-between items-center">
                  <div>
                    <div class="font-bold text-sm rpg-body">Color timers only</div>
                    <div class="text-neutral-600 text-xs rpg-body">Pick a swatch — no typing required</div>
                  </div>
                  <SettingsControl variant="choice" :active="settingsStore.timerNamingMode === 'color'" @click="settingsStore.setTimerNamingMode('color')" />
                </div>
                <div class="flex justify-between items-center">
                  <div>
                    <div class="font-bold text-sm rpg-body">Named and Color tabs</div>
                    <div class="text-neutral-600 text-xs rpg-body">Switch between both styles in the Timers card</div>
                  </div>
                  <SettingsControl variant="choice" :active="settingsStore.timerNamingMode === 'both'" @click="settingsStore.setTimerNamingMode('both')" />
                </div>
                <div v-if="settingsStore.timerNamingMode === 'both'" class="flex justify-between items-center pt-2 border-neutral-200 border-t">
                  <div>
                    <div class="font-bold text-sm rpg-body">Open on Color tab</div>
                    <div class="text-neutral-600 text-xs rpg-body">Which tab is selected when you open Timers</div>
                  </div>
                  <SettingsControl variant="enabled" :active="settingsStore.timerColorModeDefault" @click="settingsStore.toggleTimerColorModeDefault" />
                </div>
              </div>
            </div>

            <div class="mb-6">
              <h4 class="mb-3 rpg-label">Header & Credits</h4>
              <div class="space-y-3 bg-neutral-50 p-3 border border-neutral-200 rounded-lg">
                <div class="flex justify-between items-center">
                  <span class="font-bold text-sm rpg-body">Show title card at top</span>
                  <SettingsControl variant="visibility" :active="settingsStore.showTitleCard" @click="settingsStore.toggleTitleCard" />
                </div>
                <div class="flex justify-between items-center">
                  <span class="font-bold text-sm rpg-body">Show credits card at bottom</span>
                  <SettingsControl variant="visibility" :active="settingsStore.showCreditsCard" @click="settingsStore.toggleCreditsCard" />
                </div>
              </div>
            </div>

            <div class="mb-6">
              <h4 class="mb-3 rpg-label">Compact View</h4>
              <div class="space-y-3 bg-neutral-50 p-3 border border-neutral-200 rounded-lg">
                <div>
                  <label class="font-bold text-sm rpg-body">Monsters before compact view activates</label>
                  <input :value="settingsStore.compactThreshold"
                    @input="(e) => settingsStore.updateCompactThreshold(parseInt((e.target as HTMLInputElement).value))"
                    @keyup.enter="showSettingsModal = false" type="number" :min="1" :max="10" class="rpg-input"
                    style="max-width: 120px;" />
                </div>
                <div class="flex justify-between items-center">
                  <span class="font-bold text-sm rpg-body">Show condition pills in compact view</span>
                  <SettingsControl variant="visibility" :active="settingsStore.showCompactConditions" @click="settingsStore.toggleCompactConditions" />
                </div>
              </div>
            </div>

            <div class="mb-6">
              <h4 class="mb-3 rpg-label">Turn Management</h4>
              <div class="bg-neutral-50 p-3 border border-neutral-200 rounded-lg">
                <div class="flex justify-between items-center">
                  <span class="font-bold text-sm rpg-body">Auto-increment turn when all monsters are done</span>
                  <SettingsControl variant="enabled" :active="settingsStore.autoTurnIncrement" @click="settingsStore.toggleAutoTurnIncrement" />
                </div>
              </div>
            </div>

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
              </div>
            </div>

            <SettingsBackupPanel v-if="showSettingsModal" />

            <SettingsAppCardsEditor v-if="showSettingsModal" />

          </div>

          <div class="flex sm:flex-row flex-col justify-between gap-3">
            <button @click="settingsStore.resetToDefaults" class="px-3 sm:px-4 py-2 text-sm sm:text-base rpg-button rpg-button-secondary">
              Reset to Defaults
            </button>
            <button @click="showSettingsModal = false" class="px-3 sm:px-4 py-2 text-sm sm:text-base rpg-button rpg-button-primary">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showClearDialog"
      class="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4">
      <div class="bg-white shadow-xl p-6 rounded-lg w-full max-w-md">
        <div class="mb-4">
          <h3 class="mb-2 text-lg rpg-heading">Clear All Data</h3>
          <p class="mb-2 text-neutral-700 rpg-body">Are you sure you want to clear all monsters, timers, and reset the combat state?</p>
          <p class="text-neutral-500 text-sm">This action cannot be undone.</p>
        </div>
        <div class="flex justify-end gap-3">
          <button @click="clearAll" class="bg-danger hover:bg-red-700 border-danger text-white rpg-button">Clear All</button>
          <button @click="showClearDialog = false" class="rpg-button rpg-button-secondary">Cancel</button>
        </div>
      </div>
    </div>

    <SectionNav v-if="activeColumn === 0" />
    <BoardBar
      v-else-if="settingsStore.showBoardsColumn"
      @go-combat="goCombat"
      @add-card="handleAddCard"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useCombatStore } from '@/stores/combat'
import { useSettingsStore } from '@/stores/settings'
import type { Monster } from '@/types'
import { useScrollLock } from '@/composables/useScrollLock'
import { useActiveColumn } from '@/composables/useActiveColumn'
import {
  Settings,
  Eye, ToggleRight, CircleDot,
} from 'lucide-vue-next'
import SettingsControl from '@/components/SettingsControl.vue'
import ColorSwatchPicker from '@/components/ColorSwatchPicker.vue'
import SectionNav from '@/components/SectionNav.vue'
import BoardBar from '@/components/BoardBar.vue'
import AppColumns from '@/components/layout/AppColumns.vue'
import ColumnAppCards from '@/components/layout/ColumnAppCards.vue'
import SettingsBackupPanel from '@/components/settings/SettingsBackupPanel.vue'
import SettingsAppCardsEditor from '@/components/settings/SettingsAppCardsEditor.vue'
import GitHubVersion from '@/components/GitHubVersion.vue'
import CreditsCard from '@/components/CreditsCard.vue'

const combatStore = useCombatStore()
const settingsStore = useSettingsStore()
const { activeColumn, goCombat } = useActiveColumn()

const showClearDialog = ref(false)
const showSettingsModal = ref(false)
const combatColumnCardsRef = ref<InstanceType<typeof ColumnAppCards> | null>(null)
const boardsColumnCardsRef = ref<InstanceType<typeof ColumnAppCards> | null>(null)

const isModalOpen = computed(() => showSettingsModal.value || showClearDialog.value)
useScrollLock(isModalOpen)

watch(
  () => settingsStore.showBoardsColumn,
  (visible) => {
    if (!visible && activeColumn.value === 1) goCombat()
  },
)

const combatColumnCards = computed(() => settingsStore.getVisibleCards('combat'))
const boardsColumnCards = computed(() => settingsStore.getVisibleCards('boards'))

const currentTurn = computed(() => combatStore.currentTurn)
const currentRound = computed(() => combatStore.currentRound)
const activeMonsters = computed(() => combatStore.activeMonsters)
const allMonstersDone = computed(() => combatStore.allMonstersDone)
const shouldUseCompactView = computed(() => activeMonsters.value.length > settingsStore.compactThreshold)

const isMonsterCreatorAboveBattlefield = computed(() => {
  const monsterCreatorIndex = settingsStore.appCards.findIndex((card) => card.id === 'monster-creator')
  const battlefieldIndex = settingsStore.appCards.findIndex((card) => card.id === 'battlefield')
  if (monsterCreatorIndex === -1 || battlefieldIndex === -1) return false
  return monsterCreatorIndex < battlefieldIndex
})

const nextTurn = () => combatStore.nextTurn()
const nextRound = () => combatStore.nextRound()
const removeMonster = (id: string) => combatStore.removeMonster(id)

const updateMonster = (id: string, updates: Partial<Monster>) => {
  if ('doneTurn' in updates && Object.keys(updates).length === 1) {
    combatStore.toggleDoneTurn(id)
  } else {
    combatStore.updateMonster(id, updates)
  }
}

const confirmClear = () => { showClearDialog.value = true }
const clearAll = () => {
  combatStore.clearAll()
  showClearDialog.value = false
}

const scrollToCreator = () => {
  document.getElementById('monster-creator')?.scrollIntoView({ behavior: 'smooth' })
}

const resetRoundsAndTurns = () => combatStore.resetRoundsAndTurns()
const handleTierModeToggle = () => settingsStore.toggleTierMode()

const handleAddCard = () => {
  const panel = boardsColumnCardsRef.value?.boardPanelRef ?? combatColumnCardsRef.value?.boardPanelRef
  if (panel && typeof panel.addTextCard === 'function') {
    panel.addTextCard()
  }
}

const handleRollDamage = (monster: Monster) => {
  const allRefs = [
    ...(combatColumnCardsRef.value?.monsterCardRefs ?? []),
    ...(boardsColumnCardsRef.value?.monsterCardRefs ?? []),
  ]
  allRefs.forEach((cardRef) => {
    if (cardRef && typeof cardRef.forceReset === 'function') {
      cardRef.forceReset()
    }
  })
  setTimeout(() => {
    const targetElement = document.getElementById('difficulty-modifiers')
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    const combatMechanicsComponent =
      combatColumnCardsRef.value?.combatMechanicsRef?.[0]
      ?? boardsColumnCardsRef.value?.combatMechanicsRef?.[0]
    if (combatMechanicsComponent?.setAttackStat) {
      combatMechanicsComponent.setAttackStat(monster.statsBonus)
    }
  }, 50)
}
</script>

<style scoped>
.settings-legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.5rem 0.75rem;
  margin: 0 0 1.25rem;
  text-align: center;
  color: #525252;
  font-size: 0.75rem;
}

.settings-legend__item {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.settings-legend__icon {
  width: 0.875rem;
  height: 0.875rem;
  flex-shrink: 0;
}

.settings-legend__sep {
  color: #a3a3a3;
}

.settings-color-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.settings-color-field__picker {
  margin-top: 0.125rem;
}

.rpg-app__header {
  flex-shrink: 0;
  margin-bottom: 0.75rem;
}
</style>
