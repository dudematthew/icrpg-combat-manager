<template>
  <div class="rpg-card monster-card" :class="[
      `monster-tier-${monster.tier.toLowerCase()}`,
      { 'dead': monster.heartsCurrent <= 0 },
      { 'compact': compact }
    ]" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">

    <!-- Header -->
    <div class="flex justify-between items-center mb-4">
      <div class="flex flex-1 items-center gap-3">
        <div class="flex justify-center items-center rounded-full w-8 h-8 font-bold text-sm cursor-pointer" :style="{ 
            backgroundColor: getTierColor(monster.tier),
            color: getTextColorForBackground(getTierColor(monster.tier)),
            boxShadow: `0 0 0 2px ${getMonsterColor(monster.color)}88`,
            border: `1px solid ${getMonsterColor(monster.color)}`
          }" @click="showEditModal = true">
          {{ monster.letter }}
        </div>
        <div class="flex-1 cursor-pointer" @click="showEditModal = true">
          <div class="text-base rpg-heading">
            {{ monster.name || formatMonsterIdentifier(monster.color, monster.letter) }}
          </div>
          <div class="flex items-center gap-2 text-neutral-500 text-sm rpg-body">
            <span :style="{ color: getMonsterColor(monster.color) }" class="font-medium">{{ monster.color }}</span>
            <span>Tier {{ monster.tier }} (+{{ monster.statsBonus }}, {{ monster.actions }} action{{ monster.actions > 1
              ? 's' : '' }})</span>
          </div>
        </div>
      </div>
      <div class="flex gap-2">
        <button v-if="monster.heartsCurrent <= 0" @click="reviveMonster" class="rpg-icon-button rpg-icon-button-neutral"
          title="Revive Monster to Full Health">
          <img src="/images/monster_icon.png" class="w-6 h-6 icon-filter" alt="Revive monster" />
          <span class="ml-1 text-xs">Revive</span>
        </button>
        <button @click="$emit('remove')" class="rpg-icon-button rpg-icon-button-danger">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Hearts Display -->
    <div class="compact-hidden mb-4 hearts-display" :class="{ 'show': isHoverDelayed }">
      <span class="font-medium rpg-body">Hearts:</span>
      <div class="flex gap-1">
        <i v-for="i in monster.heartsMax" :key="i" class="heart" :class="{ 'empty': i > monster.heartsCurrent }">♥</i>
      </div>
      <span class="text-neutral-500 text-sm rpg-body">({{ Math.round(monster.heartsCurrent * 10) }}/{{ monster.heartsMax
        * 10 }} HP)</span>
    </div>

    <!-- Quick Damage Buttons -->
    <div class="compact-hidden flex flex-wrap gap-2 mb-4" :class="{ 'show': isHoverDelayed }">
      <button v-for="damage in [1, 2, 5, 10]" :key="damage" @click="applyDamage(damage)"
        class="bg-white hover:bg-danger px-3 py-1 border-2 border-danger rounded-md font-heading font-black text-danger hover:text-white text-sm uppercase tracking-wide transition-colors">
        -{{ damage }}
      </button>
      <button @click="showDamageDialog = true"
        class="px-3 py-1 font-heading font-black text-sm uppercase tracking-wide rpg-button rpg-button-secondary">
        Custom
      </button>
    </div>

    <!-- Conditions -->
    <div class="compact-hidden mb-4" :class="{ 'show': isHoverDelayed }">
      <div class="mb-3 font-medium text-sm rpg-body">Conditions:</div>
      <div class="flex flex-wrap gap-2">
        <span v-for="condition in CONDITIONS" :key="condition.name" @click="toggleCondition(condition.name)"
          class="condition-badge" :class="{ 'active': monster.conditions.includes(condition.name) }">
          {{ condition.name }}
        </span>
      </div>
    </div>

    <!-- Expandable Details -->
    <details class="group compact-hidden" :class="{ 'show': isHoverDelayed }">
      <summary class="cursor-pointer list-none">
        <div
          class="flex justify-between items-center bg-neutral-50 hover:bg-neutral-100 p-3 border border-neutral-200 rounded-lg transition-colors">
          <span class="text-sm rpg-heading">Details & Notes</span>
          <svg class="w-4 h-4 group-open:rotate-180 transition-transform" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd" />
          </svg>
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
  </div>

  <!-- Edit Monster Modal -->
  <div v-if="showEditModal" class="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4"
    @click="cancelEdit">
    <div class="bg-white shadow-xl mx-4 my-8 p-6 rounded-lg w-full max-w-md"
      style="max-height: 95vh; overflow-y: auto; overflow-x: none;" @click.stop>
      <div class="mb-4">
        <h3 class="mb-4 text-lg rpg-heading">Edit Monster</h3>
        <div class="space-y-4">
          <div>
            <label class="rpg-label">Monster Letter</label>
            <input v-model="localLetter" type="text" maxlength="1" class="rpg-input"
              placeholder="Letter (A, B, C...)" />
          </div>
          <div>
            <label class="rpg-label">Monster Name</label>
            <input v-model="localName" type="text" class="rpg-input"
              :placeholder="formatMonsterIdentifier(localColor, localLetter)" />
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

          <!-- Advanced Options -->
          <details class="group">
            <summary class="cursor-pointer list-none">
              <div
                class="flex justify-between items-center bg-neutral-50 hover:bg-neutral-100 p-3 border border-neutral-200 rounded-lg transition-colors">
                <span class="text-sm rpg-heading">Advanced Options</span>
                <svg class="w-4 h-4 group-open:rotate-180 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clip-rule="evenodd" />
                </svg>
              </div>
            </summary>
            <div class="space-y-4 mt-4">
              <div>
                <label class="rpg-label">Notes</label>
                <textarea v-model="localNotes" rows="4" class="rpg-input" @blur="() => updateNotes(localNotes)"
                  placeholder="Add notes about this monster..."></textarea>
              </div>
              <div>
                <label class="rpg-label">Special Abilities</label>
                <textarea v-model="localAbilities" rows="4" class="rpg-input"
                  @blur="() => updateAbilities(localAbilities)" placeholder="Describe special abilities..."></textarea>
              </div>

              <!-- Generator Section -->
              <div class="space-y-3 bg-neutral-50 p-3 border border-neutral-200 rounded-lg">
                <div class="flex justify-between items-center">
                  <h4 class="rpg-label">Generate Monster</h4>
                </div>

                <!-- State & Motivation -->
                <div class="mb-3">
                  <span class="font-semibold text-neutral-600 text-xs">🎲 STATE & MOTIVATION</span>
                </div>
                <div class="flex flex-wrap gap-1 mb-3">
                  <button @click="generateState" class="text-xs rpg-button rpg-button-secondary"
                    title="Generate monster state">
                    <img src="/images/d6_dice_icon.png" class="w-3 h-3 icon-filter" alt="Generate state" />
                  </button>
                  <button @click="generateMotivation" class="text-xs rpg-button rpg-button-secondary"
                    title="Generate monster motivation">
                    <img src="/images/d6_dice_icon.png" class="w-3 h-3 icon-filter" alt="Generate motivation" />
                  </button>
                  <button @click="applyStateAndMotivation" class="text-xs rpg-button rpg-button-primary">Apply</button>
                </div>
                <div v-if="generatedState || generatedMotivation"
                  class="space-y-2 bg-neutral-50 py-2 border border-neutral-200 rounded">
                  <div v-if="generatedState" class="mb-2 text-neutral-700 text-sm">
                    <strong class="font-semibold">State:</strong> {{ generatedState }}
                  </div>
                  <div v-if="generatedMotivation" class="text-neutral-700 text-sm">
                    <strong class="font-semibold">Motivation:</strong> {{ generatedMotivation }}
                  </div>
                </div>

                <!-- Abilities & Upgrades -->
                <div class="mb-3">
                  <span class="font-semibold text-neutral-600 text-xs">⚔️ ABILITIES & UPGRADES</span>
                </div>
                <div class="flex flex-wrap gap-1 mb-3">
                  <button @click="generateAbilities" class="text-xs rpg-button rpg-button-secondary"
                    title="Generate abilities">
                    <img src="/images/d6_dice_icon.png" class="w-3 h-3 icon-filter" alt="Generate abilities" />
                  </button>
                  <button @click="generateUpgrades" class="text-xs rpg-button rpg-button-secondary"
                    title="Generate upgrades">
                    <img src="/images/d6_dice_icon.png" class="w-3 h-3 icon-filter" alt="Generate upgrades" />
                  </button>
                  <button @click="applyAbilitiesAndUpgrades"
                    class="text-xs rpg-button rpg-button-primary">Apply</button>
                </div>
                <div v-if="generatedAbilities || generatedUpgrades"
                  class="space-y-2 bg-neutral-50 py-2 border border-neutral-200 rounded">
                  <div v-if="generatedAbilities" class="mb-2 text-neutral-700 text-sm">
                    <strong class="font-semibold">Abilities:</strong> {{ generatedAbilities }}
                  </div>
                  <div v-if="generatedUpgrades" class="text-neutral-700 text-sm">
                    <strong class="font-semibold">Upgrades:</strong> {{ generatedUpgrades }}
                  </div>
                </div>
              </div>
            </div>
          </details>
        </div>
      </div>
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

  <!-- Damage Dialog -->
  <div v-if="showDamageDialog" class="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4"
    @click="showDamageDialog = false">
    <div class="bg-white shadow-xl p-6 rounded-lg w-full max-w-sm" @click.stop>
      <div class="mb-4">
        <h3 class="mb-4 text-lg rpg-heading">Apply Damage</h3>
        <div>
          <label class="rpg-label">Damage Amount (HP)</label>
          <input v-model.number="customDamage" type="number" :min="1" :max="100" class="rpg-input"
            placeholder="Enter HP damage (1-100)" />
          <div class="mt-1 text-neutral-500 text-xs">
            Monsters have {{ monster.heartsMax }} hearts = {{ monster.heartsMax * 10 }} total HP
          </div>
        </div>
      </div>
      <div class="flex justify-end gap-3">
        <button @click="applyCustomDamage" :disabled="!customDamage || customDamage <= 0"
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
import InlineEditableText from './InlineEditableText.vue'
import { useHoverDelay } from '@/composables/useHoverDelay'

interface Props {
  monster: Monster
  compact?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  remove: []
  update: [updates: Partial<Monster>]
}>()

const showDamageDialog = ref(false)
const showEditModal = ref(false)
const customDamage = ref<number | null>(null)
const localNotes = ref(props.monster.notes)
const localAbilities = ref(props.monster.specialAbilities || '')
const localName = ref(props.monster.name || '')
const localColor = ref(props.monster.color)
const localLetter = ref(props.monster.letter)
const localTier = ref(props.monster.tier)

// Hover delay for compact view
const { isHoverDelayed, handleMouseEnter, handleMouseLeave } = useHoverDelay({
  delay: 100, // 100ms delay before showing content
  hoverEndDelay: 300 // 300ms delay before hiding content
})

// Generator preview state
const generatedState = ref('')
const generatedMotivation = ref('')
const generatedAbilities = ref('')
const generatedUpgrades = ref('')

const colors = [
  { label: 'Red', value: 'Red' },
  { label: 'Blue', value: 'Blue' },
  { label: 'Green', value: 'Green' },
  { label: 'Yellow', value: 'Yellow' },
  { label: 'Purple', value: 'Purple' },
  { label: 'Orange', value: 'Orange' },
  { label: 'Black', value: 'Black' },
  { label: 'White', value: 'White' },
  { label: 'Grey', value: 'Grey' },
  { label: 'Brown', value: 'Brown' }
]

const tierOptions = [
  { label: 'Tier I (+2, 1 action, 1 heart)', value: 'I' },
  { label: 'Tier II (+4, 1 action, 2 hearts)', value: 'II' },
  { label: 'Tier III (+6, 2 actions, 4 hearts)', value: 'III' },
  { label: 'Tier IV (+8, 3 actions, 4+ hearts)', value: 'IV' }
]

const applyDamage = (damage: number) => {
  // In ICRPG, monsters have hearts but take HP damage. Hearts * 10 = total HP.
  // We track current HP (heartsCurrent * 10) and apply damage directly to HP
  const currentHP = props.monster.heartsCurrent * 10
  const newHP = Math.max(0, currentHP - damage)
  const newHearts = newHP / 10
  emit('update', { heartsCurrent: newHearts })
}

const applyCustomDamage = () => {
  if (customDamage.value) {
    applyDamage(customDamage.value)
    customDamage.value = null
    showDamageDialog.value = false
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
        actions: config.actions,
        heartsMax: config.hearts,
        heartsCurrent: config.hearts
      })
    }
  }
}

const saveChanges = () => {
  emit('update', { 
    name: localName.value,
    color: localColor.value,
    letter: localLetter.value.toUpperCase(),
    tier: localTier.value
  })
  showEditModal.value = false
}

const cancelEdit = () => {
  // Reset local values to original
  localName.value = props.monster.name || ''
  localColor.value = props.monster.color
  localLetter.value = props.monster.letter
  localTier.value = props.monster.tier
  clearPreviews()
  showEditModal.value = false
}

const reviveMonster = () => {
  emit('update', { heartsCurrent: props.monster.heartsMax })
}

const editMonster = () => {
  showEditModal.value = true
  clearPreviews()
}

const clearPreviews = () => {
  generatedState.value = ''
  generatedMotivation.value = ''
  generatedAbilities.value = ''
  generatedUpgrades.value = ''
}

// Monster generator functions - now populate preview instead of directly updating fields
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

// Apply functions - replace existing content with generated content
const applyState = () => {
  if (generatedState.value) {
    localNotes.value = generatedState.value
    generatedState.value = ''
  }
}

const applyMotivation = () => {
  if (generatedMotivation.value) {
    localNotes.value = generatedMotivation.value
    generatedMotivation.value = ''
  }
}

const applyAbilities = () => {
  if (generatedAbilities.value) {
    localAbilities.value = generatedAbilities.value
    generatedAbilities.value = ''
  }
}

const applyUpgrades = () => {
  if (generatedUpgrades.value) {
    localAbilities.value = generatedUpgrades.value
    generatedUpgrades.value = ''
  }
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
</script>

<style scoped>
/* Compact view styles */
.monster-card.compact {
  padding: 1rem;
  margin-bottom: 0.5rem;
}

.monster-card.compact .compact-hidden {
  display: none;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.monster-card.compact .compact-hidden.show {
  display: block;
  opacity: 1;
}

.monster-card.compact .compact-hidden.show.flex {
  display: flex;
}

.monster-card.compact .compact-hidden.show details {
  display: block;
}
</style>
