<template>
  <div class="monster-creator">
    <div class="mb-3 rpg-card">
      <div class="flex items-center gap-2 mb-6">
        <svg class="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clip-rule="evenodd" />
        </svg>
        <h2 class="rpg-heading">Quick Monster Entry</h2>
      </div>

      <div class="gap-4 grid grid-cols-1 md:grid-cols-2">
        <!-- Color and Letter Selection -->
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

        <!-- Tier Selection -->
        <div class="md:col-span-2">
          <label for="tier" class="rpg-label">Tier</label>
          <select id="tier" v-model="newMonster.tier" @change="updateTierDefaults" class="rpg-input">
            <option value="">Choose tier</option>
            <option v-for="tier in tierOptions" :key="tier.value" :value="tier.value">
              {{ tier.label }}
            </option>
          </select>
        </div>

        <!-- Optional Fields -->
        <div>
          <label for="name" class="rpg-label">Name (Optional)</label>
          <input id="name" v-model="newMonster.name" placeholder="Custom name" class="rpg-input" />
        </div>

        <div>
          <label for="notes" class="rpg-label">Notes (Optional)</label>
          <textarea id="notes" v-model="newMonster.notes" placeholder="Add notes about this monster..." rows="2"
            class="rpg-input"></textarea>
        </div>

        <div>
          <label for="hearts" class="rpg-label">Hearts Override</label>
          <input id="hearts" v-model.number="newMonster.heartsMax" type="number" :min="1" :max="10"
            placeholder="Default from tier" class="rpg-input" />
        </div>

        <!-- Special Abilities -->
        <div class="md:col-span-2">
          <div class="flex justify-between items-center mb-2">
            <label for="abilities" class="rpg-label">Special Abilities (Optional)</label>
            <button @click="generateAbilitiesForNewMonster" class="text-xs rpg-button rpg-button-secondary"
              title="Generate random abilities">
              <svg width="16px" height="16px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                id="create-note-alt" class="icon glyph">
                <path
                  d="M20,22H4a2,2,0,0,1-2-2V4A2,2,0,0,1,4,2h8a1,1,0,0,1,0,2H4V20H20V12a1,1,0,0,1,2,0v8A2,2,0,0,1,20,22Z"
                  style="fill:#231f20"></path>
                <path
                  d="M22,1.94a1,1,0,0,0-.87-.9,9.45,9.45,0,0,0-2.83.17,1,1,0,0,0-.76.72l-.18.72-.83-.33a1,1,0,0,0-1,.13,4.87,4.87,0,0,0-.7.67C13,5.15,13,8.36,13,9.58l-1.72,1.71a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0L14.42,11h.36a7.2,7.2,0,0,0,5.41-2.12h0C22.37,6.39,22,2.12,22,1.94Z">
                </path>
              </svg>
              Generate
            </button>
          </div>
          <textarea id=" abilities" v-model="newMonster.specialAbilities"
            placeholder="Poison, blast, regeneration, etc." rows="6" class="rpg-input"></textarea>
        </div>

        <!-- Preview -->
        <div class="md:col-span-2">
          <div class="bg-neutral-50 p-4 border border-neutral-200 rounded-lg">
            <div class="mb-2 rpg-label">Preview:</div>
            <div class="rpg-body">
              <strong>{{ formatMonsterIdentifier(newMonster.color || 'Grey', newMonster.letter || '?') }}</strong>
              <br>
              Tier {{ newMonster.tier || '?' }}: +{{ getTierBonus(newMonster.tier) }}, {{
              getTierActions(newMonster.tier) }} action(s), {{ newMonster.heartsMax || getTierHearts(newMonster.tier)
              }} heart(s)
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-3 md:col-span-2">
          <button @click="addMonster" :disabled="!newMonster.color || !newMonster.letter || !newMonster.tier"
            class="disabled:opacity-50 disabled:cursor-not-allowed rpg-button rpg-button-primary">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clip-rule="evenodd" />
            </svg>
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
import { generateMonsterAbilities } from '@/utils/monsterGenerator'

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

const generateAbilitiesForNewMonster = () => {
  newMonster.specialAbilities = generateMonsterAbilities()
}
</script>
