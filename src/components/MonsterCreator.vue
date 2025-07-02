<template>
  <div class="monster-creator">
    <div class="mb-3 rpg-card">
      <div class="flex items-center gap-2 mb-6">
        <img src="/images/monster_icon.png" class="mb-3 w-5 h-5 text-accent icon-filter" alt="Add monster" />
        <h2 class="rpg-heading">Quick Monster Entry</h2>
      </div>

      <div class="space-y-4">
        <!-- Core Fields -->
        <div class="gap-4 grid grid-cols-1 md:grid-cols-2">
          <div>
            <label for="color" class="rpg-label">Color</label>
            <select id="color" v-model="newMonster.color" class="rpg-input">
              <option value="">Choose color</option>
              <option v-for="color in colors" :key="color.value" :value="color.value">
                {{ color.label }}
              </option>
            </select>
          </div>

          <div>
            <label for="letter" class="rpg-label">Letter</label>
            <select id="letter" v-model="newMonster.letter" class="rpg-input">
              <option value="">Choose letter</option>
              <option v-for="letter in letters" :key="letter.value" :value="letter.value">
                {{ letter.label }}
              </option>
            </select>
          </div>

          <div class="md:col-span-2">
            <label for="tier" class="rpg-label">Tier</label>
            <select id="tier" v-model="newMonster.tier" @change="updateTierDefaults" class="rpg-input">
              <option value="">Choose tier</option>
              <option v-for="tier in tierOptions" :key="tier.value" :value="tier.value">
                {{ tier.label }}
              </option>
            </select>
          </div>
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
          <div class="gap-4 grid grid-cols-1 md:grid-cols-2 mt-4">
            <div>
              <label for="name" class="rpg-label">Name (Optional)</label>
              <input id="name" v-model="newMonster.name" placeholder="Custom name" class="rpg-input" />
            </div>

            <div>
              <label for="hearts" class="rpg-label">Hearts Override</label>
              <input id="hearts" v-model.number="newMonster.heartsMax" type="number" :min="1" :max="10"
                placeholder="Default from tier" class="rpg-input" />
            </div>

            <div class="md:col-span-2">
              <label for="notes" class="rpg-label">Notes (Optional)</label>
              <textarea id="notes" v-model="newMonster.notes" placeholder="Add notes about this monster..." rows="6"
                class="rpg-input"></textarea>
            </div>

            <div class="md:col-span-2">
              <label for="abilities" class="rpg-label">Special Abilities (Optional)</label>
              <textarea id="abilities" v-model="newMonster.specialAbilities"
                placeholder="Poison, blast, regeneration, etc." rows="6" class="rpg-input"></textarea>
            </div>

            <!-- Generator Section -->
            <div class="md:col-span-2">
              <div class="space-y-3 bg-neutral-50 p-3 border border-neutral-200 rounded-lg">
                <div class="flex justify-between items-center">
                  <h4 class="rpg-label">Generate Traits</h4>
                </div>

                <!-- State & Motivation -->
                <div class="flex flex-wrap gap-1 mb-3 grow">
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
                  <button @click="applyStateAndMotivation" class="text-xs rpg-button rpg-button-primary">Apply</button>
                </div>
                <div v-if="generatedState || generatedMotivation"
                  class="space-y-2 bg-neutral-50 p-2 border border-neutral-200 rounded">
                  <div v-if="generatedState" class="mb-2 text-neutral-700 text-sm">
                    <strong class="font-semibold">State:</strong> {{ generatedState }}
                  </div>
                  <div v-if="generatedMotivation" class="mb-2 text-neutral-700 text-sm">
                    <strong class="font-semibold">Motivation:</strong> {{ generatedMotivation }}
                  </div>
                </div>

                <!-- Abilities & Upgrades -->
                <div class="flex flex-wrap gap-1 mb-3 grow">
                  <button @click="generateAbilities"
                    class="flex items-center gap-1 text-xs rpg-button rpg-button-secondary" title="Generate abilities"
                    style="padding-inline: 16px;">
                    <img src="/images/d6_dice_icon.png" class="w-4 h-4 icon-filter" alt="Generate abilities" />
                    Abilities
                  </button>
                  <button @click="generateUpgrades"
                    class="flex items-center gap-1 text-xs rpg-button rpg-button-secondary" title="Generate upgrades"
                    style="padding-inline: 16px;">
                    <img src="/images/d6_dice_icon.png" class="w-4 h-4 icon-filter" alt="Generate upgrades" />
                    Upgrades
                  </button>
                  <button @click="applyAbilitiesAndUpgrades"
                    class="text-xs rpg-button rpg-button-primary">Apply</button>
                </div>
                <div v-if="generatedAbilities || generatedUpgrades"
                  class="space-y-2 bg-neutral-50 p-2 border border-neutral-200 rounded">
                  <div v-if="generatedAbilities" class="mb-2 text-neutral-700 text-sm">
                    <strong class="font-semibold">Abilities:</strong> {{ generatedAbilities }}
                  </div>
                  <div v-if="generatedUpgrades" class="text-neutral-700 text-sm">
                    <strong class="font-semibold">Upgrades:</strong> {{ generatedUpgrades }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </details>

        <!-- Preview -->
        <div class="bg-neutral-50 p-4 border border-neutral-200 rounded-lg">
          <div class="mb-2 rpg-label">Preview:</div>
          <div class="rpg-body">
            <strong class="font-semibold">{{ formatMonsterIdentifier(newMonster.color || 'Grey', newMonster.letter ||
              '?') }}</strong>
            <br>
            Tier {{ newMonster.tier || '?' }}: +{{ getTierBonus(newMonster.tier) }}, {{
            getTierActions(newMonster.tier) }} action(s), {{ newMonster.heartsMax || getTierHearts(newMonster.tier)
            }} heart(s)
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-3">
          <button @click="addMonster" :disabled="!newMonster.color || !newMonster.letter || !newMonster.tier"
            class="disabled:opacity-50 disabled:cursor-not-allowed rpg-button rpg-button-primary">
            <img src="/images/monster_icon.png" class="w-6 h-6 icon-filter" alt="Add monster" />
            Add Monster
          </button>
          <button @click="addBlankMonster" class="rpg-button rpg-button-secondary"
            title="Add blank monster (editable in Details)">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fill-rule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clip-rule="evenodd" />
            </svg>
            Quick Add
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useCombatStore } from '@/stores/combat'
import { TIER_CONFIGS } from '@/types'
import { formatMonsterIdentifier } from '@/utils/combat'
import { generateMonsterAbilities, generateMonsterUpgrades, rollMonsterState, rollMonsterMotivation } from '@/utils/monsterGenerator'

const combatStore = useCombatStore()

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

const letters = [
  { label: 'A', value: 'A' }, { label: 'B', value: 'B' }, { label: 'C', value: 'C' },
  { label: 'D', value: 'D' }, { label: 'E', value: 'E' }, { label: 'F', value: 'F' },
  { label: 'G', value: 'G' }, { label: 'H', value: 'H' }, { label: 'I', value: 'I' },
  { label: 'J', value: 'J' }, { label: 'K', value: 'K' }, { label: 'L', value: 'L' },
  { label: 'M', value: 'M' }, { label: 'N', value: 'N' }, { label: 'O', value: 'O' },
  { label: 'P', value: 'P' }, { label: 'Q', value: 'Q' }, { label: 'R', value: 'R' },
  { label: 'S', value: 'S' }, { label: 'T', value: 'T' }, { label: 'U', value: 'U' },
  { label: 'V', value: 'V' }, { label: 'W', value: 'W' }, { label: 'X', value: 'X' },
  { label: 'Y', value: 'Y' }, { label: 'Z', value: 'Z' }
]

const tierOptions = [
  { label: 'Tier I (+2, 1 action, 1 heart)', value: 'I' },
  { label: 'Tier II (+4, 1 action, 2 hearts)', value: 'II' },
  { label: 'Tier III (+6, 2 actions, 4 hearts)', value: 'III' },
  { label: 'Tier IV (+8, 3 actions, 4+ hearts)', value: 'IV' }
]

const newMonster = reactive({
  color: '',
  letter: '',
  tier: '' as 'I' | 'II' | 'III' | 'IV' | '',
  name: '',
  notes: '',
  heartsMax: 0,
  specialAbilities: ''
})

// Generator preview state
const generatedState = ref('')
const generatedMotivation = ref('')
const generatedAbilities = ref('')
const generatedUpgrades = ref('')

const getTierBonus = (tier: string) => TIER_CONFIGS[tier as keyof typeof TIER_CONFIGS]?.bonus || 0
const getTierActions = (tier: string) => TIER_CONFIGS[tier as keyof typeof TIER_CONFIGS]?.actions || 1
const getTierHearts = (tier: string) => TIER_CONFIGS[tier as keyof typeof TIER_CONFIGS]?.hearts || 1

const updateTierDefaults = () => {
  if (newMonster.tier) {
    const config = TIER_CONFIGS[newMonster.tier]
    if (config && newMonster.heartsMax === 0) {
      newMonster.heartsMax = config.hearts
    }
  }
}

const addMonster = () => {
  if (!newMonster.tier) return
  
  const config = TIER_CONFIGS[newMonster.tier]
  if (!config) return

  combatStore.addMonster({
    color: newMonster.color,
    letter: newMonster.letter,
    tier: newMonster.tier,
    heartsMax: newMonster.heartsMax || config.hearts,
    heartsCurrent: newMonster.heartsMax || config.hearts,
    statsBonus: config.bonus,
    actions: config.actions,
    conditions: [],
    notes: newMonster.notes,
    name: newMonster.name || undefined,
    specialAbilities: newMonster.specialAbilities || undefined
  })

  // Auto-increment letter for easier batch creation
  const currentLetterIndex = letters.findIndex(l => l.value === newMonster.letter)
  if (currentLetterIndex >= 0 && currentLetterIndex < letters.length - 1) {
    newMonster.letter = letters[currentLetterIndex + 1].value
  }
  
  // Clear name and notes for next monster (but keep other fields)
  newMonster.name = ''
  newMonster.notes = ''
}

const addBlankMonster = () => {
  combatStore.addMonster({
    color: 'Grey',
    letter: '?',
    tier: 'I',
    heartsMax: 1,
    heartsCurrent: 1,
    statsBonus: 2,
    actions: 1,
    conditions: [],
    notes: '',
    name: 'Blank Monster'
  })
}

// Generator functions - populate preview instead of directly updating fields
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
    newMonster.notes = parts.join('\n\n')
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
    newMonster.specialAbilities = parts.join('\n\n')
  }
}
</script>
