<template>
  <div class="rpg-card monster-card" :class="[
      { 'dead': monster.heartsCurrent <= 0 },
      { 'compact': compact },
      { 'done-turn': monster.doneTurn && monster.heartsCurrent > 0 }
    ]" :style="{
      borderTopColor: getMonsterColor(monster.color),
      borderBottomColor: getMonsterColor(monster.color),
      borderLeftColor: monster.doneTurn && monster.heartsCurrent > 0 ? getMonsterColor(monster.color) : 'transparent',
      borderRightColor: monster.doneTurn && monster.heartsCurrent > 0 ? getMonsterColor(monster.color) : 'transparent'
    }" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">

    <!-- Header -->
    <div class="flex justify-between items-center">
      <div class="flex flex-1 items-center gap-3">
        <div class="flex justify-center items-center rounded-full w-8 h-8 font-bold text-sm cursor-pointer" :style="{
            backgroundColor: getTierColor(monster.tier),
            color: getTextColorForBackground(getTierColor(monster.tier)),
            boxShadow: `0 0 0 2px ${getMonsterColor(monster.color)}88`,
            border: `1px solid ${getMonsterColor(monster.color)}`
          }" @click="showEditModal = true">
          {{ monster.letter }}
        </div>
        <div class="flex-1">
          <div class="flex flex-row items-center gap-2 mb-2 text-base rpg-heading">
            <img v-if="monster.heartsCurrent <= 0" src="/images/skull_icon.png" class="inline icon-filter" alt="Dead"
              style="height: 1.1rem;" />
            <span :class="{ 'line-through': monster.doneTurn && monster.heartsCurrent > 0 }" class="cursor-pointer"
              @click="showEditModal = true">
              {{ monster.name || formatMonsterIdentifier(monster.color, monster.letter) }}
            </span>
            <span :style="{ color: getMonsterColor(monster.color) }" class="font-bold text-lg">+{{
              monster.statsBonus
              }}</span>

          </div>
          <div class="flex flex-wrap items-center gap-2 text-neutral-500 text-sm rpg-body">
            <div class="flex items-center gap-2">
              <div class="bg-neutral-700 px-2 py-0.5 rounded font-bold text-white text-sm">
                {{ monster.actions }} Action{{ monster.actions > 1 ? 's' : '' }}
              </div>
              <span v-if="monster.effortBonus > 0" class="ml-1 font-bold text-red-500 text-sm">+{{
                monster.effortBonus
                }} EFFORT</span>
            </div>
            <!-- Hearts unit - completely separate -->
            <div v-if="(compact && !isHoverDelayed) && monster.heartsCurrent > 0" class="flex items-center">
              <!-- Show x/y format for monsters with >10 hearts, otherwise show heart icons -->
              <div v-if="monster.heartsMax > 10" class="mb-[0.1rem] font-bold text-danger text-base">
                {{ monster.heartsCurrent }}/{{ monster.heartsMax }} ♥
              </div>
              <div v-else class="flex gap-[0.1rem] font-bold text-base">
                <i v-for="i in monster.heartsMax" :key="i" class="font-bold heart"
                  :class="{ 'empty': i > monster.heartsCurrent }">♥</i>
              </div>
            </div>
            <!-- Conditions unit - completely separate div -->
            <div
              v-if="(compact && !isHoverDelayed) && monster.heartsCurrent > 0 && monster.conditions.length > 0 && settingsStore.showCompactConditions"
              class="flex flex-wrap gap-0 mt-[0.2rem]">
              <span v-for="condition in monster.conditions" :key="condition"
                class="text-clip leading-tight condition-badge active"
                style="font-size: 0.4rem; padding-inline: 0.2rem;">
                {{ condition }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex xs:flex-row flex-col gap-1">
        <button v-if="monster.heartsCurrent <= 0" @click="reviveMonster"
          class="flex items-center gap-1 rpg-icon-button rpg-icon-button-neutral" title="Revive Monster to Full Health">
          <img src="/images/revive_icon.png" class="h-4 icon-filter" alt="Revive Monster" />
        </button>
        <!-- For alive monsters: show done turn button -->
        <button v-if="monster.heartsCurrent > 0" @click="toggleDoneTurn" class="p-1 rpg-icon-button"
          :class="monster.doneTurn ? 'rpg-icon-button-warning' : 'rpg-icon-button-success'"
          :title="monster.doneTurn ? 'Reset turn (mark as not done)' : 'Mark turn as done'">
          <Undo2 v-if="monster.doneTurn" class="w-4 h-4 icon-filter" alt="Reset turn" />
          <img v-else src="/images/checkmark_icon.png" class="w-4 h-4 icon-filter" alt="Mark done" />
        </button>
        <!-- For dead monsters: show remove button -->
        <button v-if="monster.heartsCurrent <= 0" @click="$emit('remove')"
          class="rpg-icon-button rpg-icon-button-danger">
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Hearts Display -->
    <div v-if="(!compact || isHoverDelayed) && (monster.heartsCurrent > 0 || isHoverDelayed)"
      class="mt-4 mb-4 hearts-display">
      <div class="flex items-center gap-2">
        <span class="font-medium rpg-body">Hearts:</span>
        <div class="flex flex-wrap gap-1">
          <i v-for="i in monster.heartsMax" :key="i" class="heart" :class="{ 'empty': i > monster.heartsCurrent }">♥</i>
        </div>
        <span class="text-neutral-500 text-sm rpg-body">({{ Math.round(monster.heartsCurrent * 10) }}/{{
          monster.heartsMax
          * 10 }} HP)</span>
      </div>
    </div>

    <!-- Quick HP Adjust Buttons -->
    <div v-if="(!compact || isHoverDelayed) && (monster.heartsCurrent > 0 || isHoverDelayed)"
      class="flex flex-wrap gap-2 mb-4">
      <button @click="applyDamage(-1)"
        class="bg-white hover:bg-danger px-3 py-1 border-2 border-danger rounded-md font-heading font-black text-danger hover:text-white text-sm uppercase tracking-wide transition-colors">
        -1
      </button>
      <button @click="applyDamage(-5)"
        class="bg-white hover:bg-danger px-3 py-1 border-2 border-danger rounded-md font-heading font-black text-danger hover:text-white text-sm uppercase tracking-wide transition-colors">
        -5
      </button>
      <button @click="applyDamage(1)"
        class="bg-white hover:bg-success px-3 py-1 border-2 border-success rounded-md font-heading font-black text-success hover:text-white text-sm uppercase tracking-wide transition-colors">
        +1
      </button>
      <button @click="applyDamage(5)"
        class="bg-white hover:bg-success px-3 py-1 border-2 border-success rounded-md font-heading font-black text-success hover:text-white text-sm uppercase tracking-wide transition-colors">
        +5
      </button>
      <button @click="showDamageDialog = true"
        class="px-3 py-1 font-heading font-black text-sm uppercase tracking-wide rpg-button rpg-button-secondary">
        Custom
      </button>
    </div>

    <!-- Conditions -->
    <div v-if="(!compact || isHoverDelayed) && (monster.heartsCurrent > 0 || isHoverDelayed)" class="mb-4">
      <div class="mb-3 font-medium text-sm rpg-body">Conditions:</div>
      <div class="flex flex-wrap gap-2">
        <span v-for="condition in CONDITIONS" :key="condition.name" @click="toggleCondition(condition.name)"
          class="condition-badge" :class="{ 'active': monster.conditions.includes(condition.name) }">
          {{ condition.name }}
        </span>
      </div>
    </div>

    <!-- Expandable Details -->
    <details v-if="(!compact || isHoverDelayed) && (monster.heartsCurrent > 0 || isHoverDelayed)" class="group">
      <summary class="cursor-pointer list-none">
        <div
          class="flex justify-between items-center bg-neutral-50 hover:bg-neutral-100 p-3 rounded-lg transition-colors">
          <span class="text-sm rpg-heading">Details & Notes</span>
          <ChevronDown class="w-4 h-4 group-open:rotate-180 transition-transform" />
        </div>
      </summary>
      <div class="space-y-4 mt-4">
        <div>
          <label class="mb-2 rpg-label">Notes</label>
          <InlineEditableText v-model="localNotes" placeholder="Add notes about this monster..."
            @update:modelValue="updateNotes" :rows="3" />
        </div>
        <div>
          <label class="mb-2 rpg-label">Special Abilities</label>
          <InlineEditableText v-model="localAbilities" placeholder="Describe special abilities..."
            @update:modelValue="updateAbilities" :rows="4" />
        </div>
      </div>
    </details>

    <!-- Full-width delete button for alive monsters -->
    <div v-if="(!compact || isHoverDelayed) && monster.heartsCurrent > 0" class="mt-4">
      <button @click="$emit('remove')"
        class="flex justify-center items-center gap-2 hover:bg-red-700 px-4 py-2 border-2 border-danger rounded-md w-full font-heading text-white text-xs uppercase tracking-wide transition-colors cursor-pointer rpg-icon-button rpg-icon-button-danger">
        <Trash2 class="w-4 h-4" />
        Remove Monster
      </button>
    </div>
  </div>

  <!-- Edit Monster Modal -->
  <div v-if="showEditModal" class="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4"
    @click="cancelEdit">
    <div class="bg-white shadow-xl mx-4 my-8 p-6 rounded-lg w-full max-w-md"
      style="max-height: 90vh; overflow-y: auto; overflow-x: none;" @click.stop>
      <div class="mb-4">
        <h3 class="mb-4 text-lg rpg-heading">Edit Monster</h3>
        <div class="space-y-4">
          <div>
            <label class="rpg-label">Monster Letter</label>
            <input v-model="localLetter" type="text" maxlength="1" class="rpg-input" placeholder="Letter (A, B, C...)"
              @keyup.enter="saveChanges" />
          </div>
          <div>
            <label class="rpg-label">Monster Name</label>
            <input v-model="localName" type="text" class="rpg-input"
              :placeholder="formatMonsterIdentifier(localColor, localLetter)" @keyup.enter="saveChanges" />
          </div>
          <div>
            <label class="rpg-label">Color</label>
            <select v-model="localColor" class="rpg-input">
              <option v-for="color in colors" :key="color.value" :value="color.value">
                {{ color.label }}
              </option>
            </select>
          </div>
          <div>
            <label class="rpg-label">Tier</label>
            <select v-model="localTier" @change="updateTierDefaults" class="rpg-input">
              <option v-for="tier in tierOptions" :key="tier.value" :value="tier.value">
                {{ tier.label }}
              </option>
            </select>
          </div>

          <!-- Notes and Special Abilities (moved out of Advanced Options) -->
          <div class="mb-4">
            <label class="rpg-label">Notes</label>
            <textarea v-model="localNotes" rows="4" class="rpg-input" @blur="() => updateNotes(localNotes)"
              placeholder="Add notes about this monster..."></textarea>
          </div>
          <div class="mb-4">
            <label class="rpg-label">Special Abilities</label>
            <textarea v-model="localAbilities" rows="4" class="rpg-input" @blur="() => updateAbilities(localAbilities)"
              placeholder="Describe special abilities..."></textarea>
          </div>


          <!-- Advanced Options -->
          <details class="group">
            <summary class="cursor-pointer list-none">
              <div
                class="flex justify-between items-center bg-neutral-100 hover:bg-neutral-200 p-4 rounded-lg transition-colors"
                style="border-bottom: 2px solid #d4d4d4;">
                <span class="font-bold text-base rpg-heading">Advanced Options</span>
                <ChevronDown class="w-5 h-5 group-open:rotate-180 transition-transform" />
              </div>
            </summary>
            <div class="space-y-4 mt-4">
              <!-- Manual Overrides -->
              <div class="gap-4 grid grid-cols-2">
                <div>
                  <label class="rpg-label">Stats Bonus Override</label>
                  <input v-model.number="localStatsBonus" type="number" :min="0" :max="20" class="rpg-input"
                    placeholder="Default from tier" />
                </div>
                <div>
                  <label class="rpg-label">Effort Bonus Override</label>
                  <input v-model.number="localEffortBonus" type="number" :min="0" :max="10" class="rpg-input"
                    placeholder="Default from tier" />
                </div>
                <div>
                  <label class="rpg-label">Actions Override</label>
                  <input v-model.number="localActions" type="number" :min="1" :max="5" class="rpg-input"
                    placeholder="Default from tier" />
                </div>
                <div>
                  <label class="rpg-label">Hearts Override</label>
                  <input v-model.number="localHearts" type="number" :min="1" :max="18" class="rpg-input"
                    placeholder="Default from tier" />
                </div>
              </div>

              <!-- Generator Section -->
              <div class="space-y-3 bg-neutral-50 p-3 border border-neutral-200 rounded-lg">
                <div class="flex justify-between items-center">
                  <h4 class="rpg-label">Generate Traits</h4>
                </div>

                <!-- State & Motivation -->
                <div class="flex flex-wrap gap-1 mb-2 grow">
                  <button @click="generateState" class="flex items-center gap-1 text-xs rpg-button rpg-button-secondary"
                    title="Generate monster state" style="padding-inline: 16px;">
                    <img src="/images/d6_dice_icon.png" class="w-4 h-4 icon-filter" alt="Generate state" />
                    State
                  </button>
                  <button @click="generateMotivation"
                    class="flex items-center gap-1 text-xs rpg-button rpg-button-secondary"
                    title="Generate monster motivation" style="padding-inline: 16px;">
                    <img src="/images/d6_dice_icon.png" class="w-4 h-4 icon-filter" alt="Generate motivation" />
                    Motivation
                  </button>
                </div>
                <div v-if="hasStateOrMotivation" class="flex flex-wrap gap-1 mb-3">
                  <button @click="applyStateAndMotivation" class="text-xs rpg-button rpg-button-primary">Apply</button>
                  <button @click="clearStateAndMotivation"
                    class="text-xs rpg-button rpg-button-secondary">Clear</button>
                </div>
                <div class="space-y-2 bg-neutral-50 py-2 rounded">
                  <div v-if="generatedState" class="mb-2 text-md text-neutral-700">
                    <strong class="font-semibold">State:</strong> {{ generatedState }}
                  </div>
                  <div v-if="generatedMotivation" class="mb-2 text-md text-neutral-700">
                    <strong class="font-semibold">Motivation:</strong> {{ generatedMotivation }}
                  </div>
                  <div v-if="!generatedState && !generatedMotivation" class="text-neutral-400 text-sm">...</div>
                </div>

                <!-- Abilities & Upgrades -->
                <div class="flex flex-wrap gap-1 mb-2 grow">
                  <button @click="generateAbilities"
                    class="flex items-center gap-1 text-xs rpg-button rpg-button-secondary" title="Generate abilities"
                    style="padding-inline: 16px;">
                    <img src="/images/d6_dice_icon.png" class="w-4 h-4 icon-filter" alt="Generate abilities" />
                    Ability
                  </button>
                  <button @click="generateUpgrades"
                    class="flex items-center gap-1 text-xs rpg-button rpg-button-secondary" title="Generate upgrades"
                    style="padding-inline: 16px;">
                    <img src="/images/d6_dice_icon.png" class="w-4 h-4 icon-filter" alt="Generate upgrades" />
                    Upgrade
                  </button>
                </div>
                <div v-if="hasAbilitiesOrUpgrades" class="flex flex-wrap gap-1 mb-3">
                  <button @click="applyAbilitiesAndUpgrades"
                    class="text-xs rpg-button rpg-button-primary">Apply</button>
                  <button @click="clearAbilitiesAndUpgrades"
                    class="text-xs rpg-button rpg-button-secondary">Clear</button>
                </div>
                <div class="space-y-2 bg-neutral-50 py-2 rounded">
                  <div v-if="generatedAbilities" class="mb-2 text-md text-neutral-700">
                    <strong class="font-semibold">Ability:</strong> {{ generatedAbilities }}
                  </div>
                  <div v-if="generatedUpgrades" class="mb-2 text-md text-neutral-700">
                    <strong class="font-semibold">Upgrade:</strong> {{ generatedUpgrades }}
                  </div>
                  <div v-if="!generatedAbilities && !generatedUpgrades" class="text-neutral-400 text-sm">...</div>
                </div>
              </div>
            </div>
          </details>

          <div class="flex justify-end gap-3">
            <button @click="saveChanges" class="rpg-button rpg-button-primary">
              Save
            </button>
            <button @click="cancelEdit" class="rpg-button rpg-button-secondary">
              Cancel
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- Damage Dialog -->
  <div v-if="showDamageDialog" class="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4"
    @click="showDamageDialog = false">
    <div class="bg-white shadow-xl p-6 rounded-lg w-full max-w-sm" @click.stop>
      <div class="mb-4">
        <h3 class="mb-4 text-lg rpg-heading">Adjust HP</h3>
        <div>
          <label class="rpg-label">Adjust HP (negative = damage, positive = heal)</label>
          <input v-model.number="customDamage" type="number" :min="-100" :max="100" class="rpg-input"
            placeholder="Enter HP adjustment (e.g. -3 or 5)" @keyup.enter="applyCustomDamage" />
          <div class="mt-1 text-neutral-500 text-xs">
            Monsters have {{ monster.heartsMax }} hearts = {{ monster.heartsMax * 10 }} total HP
          </div>
        </div>
      </div>
      <div class="flex justify-end gap-3">
        <button @click="applyCustomDamage" :disabled="!customDamage || customDamage === 0"
          class="disabled:opacity-50 disabled:cursor-not-allowed rpg-button rpg-button-primary">
          Apply
        </button>
        <button @click="showDamageDialog = false" class="rpg-button rpg-button-secondary">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Monster } from '@/types'
import { CONDITIONS, TIER_CONFIGS } from '@/types'
import { formatMonsterIdentifier, getTierColor, getMonsterColor, getTextColorForBackground } from '@/utils/combat'
import { generateMonsterAbilities, generateMonsterUpgrades, rollMonsterState, rollMonsterMotivation } from '@/utils/monsterGenerator'
import { Trash2, ChevronDown, Undo2 } from 'lucide-vue-next'
import InlineEditableText from './InlineEditableText.vue'
import { useHoverDelay } from '@/composables/useHoverDelay'
import { useSettingsStore } from '@/stores/settings'

interface Props {
  monster: Monster
  compact?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  remove: []
  update: [updates: Partial<Monster>]
}>()

const settingsStore = useSettingsStore()

const showDamageDialog = ref(false)
const showEditModal = ref(false)
const customDamage = ref<number | null>(null)
const localNotes = ref(props.monster.notes)
const localAbilities = ref(props.monster.specialAbilities || '')
const localName = ref(props.monster.name || '')
const localColor = ref(props.monster.color)
const localLetter = ref(props.monster.letter)
const localTier = ref(props.monster.tier)
const localStatsBonus = ref(props.monster.manualStatsBonus || props.monster.statsBonus)
const localEffortBonus = ref(props.monster.manualEffortBonus || props.monster.effortBonus)
const localActions = ref(props.monster.manualActions || props.monster.actions)
const localHearts = ref(props.monster.manualHearts || props.monster.heartsMax)

// Hover delay for compact view
const { isHoverDelayed, handleMouseEnter, handleMouseLeave, forceReset } = useHoverDelay({
  delay: 100, // 100ms delay before showing content
  hoverEndDelay: 300 // 300ms delay before hiding content
})

// Generator preview state
const generatedState = ref('')
const generatedMotivation = ref('')
const generatedAbilities = ref('')
const generatedUpgrades = ref('')

// Computed properties for conditional buttons
const hasStateOrMotivation = computed(() =>
  generatedState.value !== '' || generatedMotivation.value !== ''
)

const hasAbilitiesOrUpgrades = computed(() =>
  generatedAbilities.value !== '' || generatedUpgrades.value !== ''
)

const colors = [
  { label: 'Red', value: 'Red' },
  { label: 'Blue', value: 'Blue' },
  { label: 'Green', value: 'Green' },
  { label: 'Yellow', value: 'Yellow' },
  { label: 'Purple', value: 'Purple' },
  { label: 'Orange', value: 'Orange' },
  { label: 'Black', value: 'Black' },
  { label: 'Grey', value: 'Grey' },
  { label: 'Brown', value: 'Brown' }
]

const tierOptions = [
  { label: 'Tier I (+2, 1 action, 1 heart)', value: 'I' },
  { label: 'Tier II (+4, 1 action, 2 hearts)', value: 'II' },
  { label: 'Tier III (+6, +2 effort, 2 actions, 4 hearts)', value: 'III' },
  { label: 'Tier IV (+8, +4 effort, 3 actions, 4+ hearts)', value: 'IV' }
]

const applyDamage = (amount: number) => {
  const currentHP = props.monster.heartsCurrent * 10;
  const maxHP = props.monster.heartsMax * 10;
  let newHP = currentHP + amount;
  newHP = Math.max(0, Math.min(newHP, maxHP));
  const newHearts = newHP / 10;
  emit('update', { heartsCurrent: newHearts });
}

const applyCustomDamage = () => {
  if (customDamage.value && customDamage.value !== 0) {
    applyDamage(customDamage.value);
    customDamage.value = null;
    showDamageDialog.value = false;
  }
}

const toggleCondition = (condition: string) => {
  const conditions = props.monster.conditions.includes(condition)
    ? props.monster.conditions.filter(c => c !== condition)
    : [...props.monster.conditions, condition]
  emit('update', { conditions })
}

const updateNotes = (value: string) => {
  localNotes.value = value
  emit('update', { notes: value })
}

const updateAbilities = (value: string) => {
  localAbilities.value = value
  emit('update', { specialAbilities: value })
}

const updateTierDefaults = () => {
  if (localTier.value) {
    const config = TIER_CONFIGS[localTier.value]
    if (config) {
      emit('update', {
        tier: localTier.value,
        statsBonus: config.bonus,
        effortBonus: config.effortBonus || 0,
        actions: config.actions,
        heartsMax: config.hearts,
        heartsCurrent: config.hearts
      })
    }
  }
}

const saveChanges = () => {
  const updates: Partial<Monster> = {
    name: localName.value,
    color: localColor.value,
    letter: localLetter.value.toUpperCase(),
    tier: localTier.value
  }

  // Add manual overrides if they differ from tier defaults
  const config = TIER_CONFIGS[localTier.value]
  if (config) {
    if (localStatsBonus.value !== config.bonus) {
      updates.manualStatsBonus = localStatsBonus.value
      updates.statsBonus = localStatsBonus.value
    }
    if (localEffortBonus.value !== config.effortBonus) {
      updates.manualEffortBonus = localEffortBonus.value
      updates.effortBonus = localEffortBonus.value
    }
    if (localActions.value !== config.actions) {
      updates.manualActions = localActions.value
      updates.actions = localActions.value
    }
    if (localHearts.value !== config.hearts) {
      updates.manualHearts = localHearts.value
      updates.heartsMax = localHearts.value
    }
  }

  emit('update', updates)
  showEditModal.value = false
}

const cancelEdit = () => {
  // Reset local values to original
  localName.value = props.monster.name || ''
  localColor.value = props.monster.color
  localLetter.value = props.monster.letter
  localTier.value = props.monster.tier
  localStatsBonus.value = props.monster.manualStatsBonus || props.monster.statsBonus
  localEffortBonus.value = props.monster.manualEffortBonus || props.monster.effortBonus
  localActions.value = props.monster.manualActions || props.monster.actions
  localHearts.value = props.monster.manualHearts || props.monster.heartsMax
  clearPreviews()
  showEditModal.value = false
}

const reviveMonster = () => {
  emit('update', { heartsCurrent: props.monster.heartsMax })
  // Reset hover state after clicking button to collapse compact view
  if (props.compact) {
    forceReset()
  }
}

const toggleDoneTurn = () => {
  emit('update', { doneTurn: !props.monster.doneTurn })
  // Reset hover state after clicking button to collapse compact view
  if (props.compact) {
    forceReset()
  }
}

const clearPreviews = () => {
  generatedState.value = ''
  generatedMotivation.value = ''
  generatedAbilities.value = ''
  generatedUpgrades.value = ''
}

// Monster generator functions - populate preview instead of directly updating fields
const generateState = () => {
  generatedState.value = rollMonsterState()
}

const generateMotivation = () => {
  generatedMotivation.value = rollMonsterMotivation()
}

const generateAbilities = () => {
  generatedAbilities.value = generateMonsterAbilities()
}

const generateUpgrades = () => {
  generatedUpgrades.value = generateMonsterUpgrades()
}

const applyStateAndMotivation = () => {
  const parts = []
  if (generatedState.value) {
    parts.push(generatedState.value)
    generatedState.value = ''
  }
  if (generatedMotivation.value) {
    parts.push(generatedMotivation.value)
    generatedMotivation.value = ''
  }
  if (parts.length > 0) {
    localNotes.value = parts.join('\n\n')
  }
}

const applyAbilitiesAndUpgrades = () => {
  const parts = []
  if (generatedAbilities.value) {
    parts.push(generatedAbilities.value)
    generatedAbilities.value = ''
  }
  if (generatedUpgrades.value) {
    parts.push(generatedUpgrades.value)
    generatedUpgrades.value = ''
  }
  if (parts.length > 0) {
    localAbilities.value = parts.join('\n\n')
  }
}

// Clear functions - clear generated content without applying
const clearStateAndMotivation = () => {
  generatedState.value = ''
  generatedMotivation.value = ''
}

const clearAbilitiesAndUpgrades = () => {
  generatedAbilities.value = ''
  generatedUpgrades.value = ''
}
</script>

<style scoped>
/* Compact view styles */
.monster-card.compact {
  padding: 1rem;
  margin-bottom: 0.5rem;
}

/* Done turn styles */
.monster-card.done-turn {
  border-width: 3px;
  opacity: 0.8;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(255, 255, 255, 1) 100%);
}

/* Strikethrough for done monsters */
.line-through {
  text-decoration: line-through;
  text-decoration-thickness: 2px;
  text-decoration-color: currentColor;
}
</style>
