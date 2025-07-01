<template>
  <div class="rpg-card monster-card" :class="[
      `monster-tier-${monster.tier.toLowerCase()}`,
      { 'dead': monster.heartsCurrent <= 0 }
    ]">

    <!-- Header -->
    <div class="flex justify-between items-center mb-4">
      <div class="flex flex-1 items-center gap-3">
        <div class="flex justify-center items-center rounded-full w-8 h-8 font-bold text-white text-sm cursor-pointer"
          :style="{ 
            backgroundColor: getTierColor(monster.tier),
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
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clip-rule="evenodd" />
          </svg>
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
    <div class="mb-4 hearts-display">
      <span class="font-medium rpg-body">Hearts:</span>
      <div class="flex gap-1">
        <i v-for="i in monster.heartsMax" :key="i" class="heart" :class="{ 'empty': i > monster.heartsCurrent }">♥</i>
      </div>
      <span class="text-neutral-500 text-sm rpg-body">({{ Math.round(monster.heartsCurrent * 10) }}/{{ monster.heartsMax
        * 10 }} HP)</span>
    </div>

    <!-- Quick Damage Buttons -->
    <div class="flex flex-wrap gap-2 mb-4">
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
    <div class="mb-4">
      <div class="mb-3 font-medium text-sm rpg-body">Conditions:</div>
      <div class="flex flex-wrap gap-2">
        <span v-for="condition in CONDITIONS" :key="condition.name" @click="toggleCondition(condition.name)"
          class="condition-badge" :class="{ 'active': monster.conditions.includes(condition.name) }">
          {{ condition.name }}
        </span>
      </div>
    </div>

    <!-- Expandable Details -->
    <details class="group">
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
      <div class="gap-4 grid grid-cols-1 md:grid-cols-2 mt-4">
        <div>
          <label class="rpg-label">Notes</label>
          <textarea v-model="localNotes" rows="3" class="rpg-input" @blur="updateNotes"
            placeholder="Add notes about this monster..."></textarea>
        </div>
        <div>
          <label class="rpg-label">Special Abilities</label>
          <textarea v-model="localAbilities" rows="3" class="rpg-input" @blur="updateAbilities"
            placeholder="Describe special abilities..."></textarea>
        </div>
      </div>
    </details>
  </div>

  <!-- Edit Monster Modal -->
  <div v-if="showEditModal" class="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4">
    <div class="bg-white shadow-xl p-6 rounded-lg w-full max-w-sm">
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
  <div v-if="showDamageDialog" class="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4">
    <div class="bg-white shadow-xl p-6 rounded-lg w-full max-w-sm">
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
import { CONDITIONS } from '@/types'
import { formatMonsterIdentifier, getTierColor, getMonsterColor } from '@/utils/combat'

interface Props {
  monster: Monster
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

const updateNotes = () => {
  emit('update', { notes: localNotes.value })
}

const updateAbilities = () => {
  emit('update', { specialAbilities: localAbilities.value })
}

const saveChanges = () => {
  emit('update', { 
    name: localName.value,
    color: localColor.value,
    letter: localLetter.value.toUpperCase()
  })
  showEditModal.value = false
}

const cancelEdit = () => {
  // Reset local values to original
  localName.value = props.monster.name || ''
  localColor.value = props.monster.color
  localLetter.value = props.monster.letter
  showEditModal.value = false
}

const reviveMonster = () => {
  emit('update', { heartsCurrent: props.monster.heartsMax })
}
</script>
