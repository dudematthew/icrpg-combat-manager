<template>
  <div class="monster-creator">
    <div class="mb-3 rpg-card">
      <div class="flex items-center gap-2 mb-6">
        <img src="/images/monster_icon.png" class="mb-3 w-5 h-5 text-accent icon-filter" alt="Add monster" />
        <h2 class="rpg-heading">Monster Creator</h2>
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
            <select id="tier" v-model="newMonster.tier" @change="updateTierDefaults" @keyup.enter="addMonster"
              class="rpg-input">
              <option value="">Choose tier</option>
              <option v-for="tier in tierOptions" :key="tier.value" :value="tier.value">
                {{ tier.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Notes and Special Abilities (moved out of Advanced Options) -->
        <div class="md:col-span-2">
          <label for="notes" class="rpg-label">Notes (Optional)</label>
          <textarea id="notes" v-model="newMonster.notes" placeholder="Add notes about this monster..." rows="6"
            class="rpg-input"></textarea>
        </div>
        <div class="md:col-span-2">
          <label for="abilities" class="rpg-label">Special Abilities (Optional)</label>
          <textarea id="abilities" v-model="newMonster.specialAbilities" placeholder="Poison, blast, regeneration, etc."
            rows="6" class="rpg-input"></textarea>
        </div>

        <!-- Advanced Options -->
        <div class="mt-6 pt-6 border-neutral-300 border-t-2">
          <details class="group">
            <summary class="cursor-pointer list-none">
              <div
                class="flex justify-between items-center bg-neutral-100 hover:bg-neutral-200 p-4 rounded-lg transition-colors"
                style="border-bottom: 2px solid #d4d4d4;">
                <span class="font-bold text-base rpg-heading">Advanced
                  Options</span>
                <svg class="w-5 h-5 group-open:rotate-180 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clip-rule="evenodd" />
                </svg>
              </div>
            </summary>
            <div class="gap-4 grid grid-cols-1 md:grid-cols-2 mt-4">
              <div class="md:col-span-2">
                <label for="name" class="rpg-label">Name (Optional)</label>
                <div class="flex gap-2">
                  <input id="name" v-model="newMonster.name" placeholder="Custom name" @keyup.enter="addMonster"
                    class="flex-1 rpg-input" />
                  <button @click="generateMonsterName" class="p-0 rpg-button rpg-button-secondary"
                    title="Generate random monster name">
                    <img src="/images/d6_dice_icon.png" class="h-5 icon-filter" alt="Generate name" />
                  </button>
                </div>
              </div>

              <!-- Hearts field - different for each mode -->
              <div v-if="settingsStore.tierMode">
                <label for="hearts" class="rpg-label">Hearts Override</label>
                <input id="hearts" v-model.number="newMonster.heartsMax" type="number" :min="1" :max="18"
                  placeholder="Default from tier" class="rpg-input" />
              </div>

              <!-- Manual Mode Overrides -->
              <template v-if="!settingsStore.tierMode">
                <div>
                  <label for="statsBonus" class="rpg-label">Stats Bonus Override</label>
                  <input id="statsBonus" v-model.number="newMonster.manualStatsBonus" type="number" :min="0" :max="20"
                    placeholder="Default from tier" class="rpg-input" />
                </div>
                <div>
                  <label for="effortBonus" class="rpg-label">Effort Bonus Override</label>
                  <input id="effortBonus" v-model.number="newMonster.manualEffortBonus" type="number" :min="0" :max="10"
                    placeholder="Default from tier" class="rpg-input" />
                </div>
                <div>
                  <label for="actions" class="rpg-label">Actions Override</label>
                  <input id="actions" v-model.number="newMonster.manualActions" type="number" :min="1" :max="5"
                    placeholder="Default from tier" class="rpg-input" />
                </div>
                <div>
                  <label for="manualHearts" class="rpg-label">Hearts Override</label>
                  <input id="manualHearts" v-model.number="newMonster.manualHearts" type="number" :min="1" :max="18"
                    placeholder="Default from tier" class="rpg-input" />
                </div>
              </template>

              <!-- Generator Section -->
              <div class="md:col-span-2">
                <div class="space-y-3 bg-neutral-50 p-3 border border-neutral-200 rounded-lg">
                  <div class="flex justify-between items-center">
                    <h4 class="rpg-label">Generate Traits</h4>
                  </div>

                  <!-- State & Motivation -->
                  <div class="flex flex-wrap gap-1 mb-2 grow">
                    <button @click="generateState"
                      class="flex items-center gap-1 text-xs rpg-button rpg-button-secondary"
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
                    <button @click="applyStateAndMotivation"
                      class="text-xs rpg-button rpg-button-primary">Apply</button>
                    <button @click="clearStateAndMotivation"
                      class="text-xs rpg-button rpg-button-secondary">Clear</button>
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
                  <div class="flex flex-wrap gap-1 mb-2 grow">
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
                  </div>
                  <div v-if="hasAbilitiesOrUpgrades" class="flex flex-wrap gap-1 mb-3">
                    <button @click="applyAbilitiesAndUpgrades"
                      class="text-xs rpg-button rpg-button-primary">Apply</button>
                    <button @click="clearAbilitiesAndUpgrades"
                      class="text-xs rpg-button rpg-button-secondary">Clear</button>
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
        </div>



        <!-- Preview -->
        <div class="bg-neutral-50 p-4 border border-neutral-200 rounded-lg">
          <div class="mb-2 rpg-label">Preview:</div>
          <div class="rpg-body">
            <strong class="font-semibold">{{ formatMonsterIdentifier(newMonster.color || 'Grey', newMonster.letter ||
              '?') }}</strong>
            <br>
            Tier {{ newMonster.tier || '?' }}: +{{ effectiveStatsBonus }}{{ effectiveEffortBonus > 0 ? `,
            +${effectiveEffortBonus} effort` : '' }}, {{ effectiveActions }} action(s), {{
            effectiveHearts
            }} heart(s)
            <div v-if="hasManualOverrides" class="mt-1 text-neutral-500 text-xs">
              (Manual overrides applied)
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col gap-3">
          <div class="flex justify-end gap-3">
            <button @click="addMonster" :disabled="!newMonster.color || !newMonster.letter || !newMonster.tier"
              class="disabled:opacity-50 text-xs disabled:cursor-not-allowed rpg-button rpg-button-primary grow">
              <img src="/images/monster_icon.png" class="h-5 icon-filter" alt="Add monster" />
              Add Monster
            </button>
            <button @click="addBlankMonster" class="text-xs rpg-button rpg-button-secondary"
              title="Add blank monster (editable in Details)">
              <Plus class="h-5 icon-filter" />
              Add Blank
            </button>
          </div>
        </div>
        <div class="flex justify-center">
          <button @click="scrollToBattlefield"
            class="flex justify-center items-center gap-1 bg-neutral-100 hover:bg-neutral-200 px-3 py-1 text-xs transition-colors cursor-pointer">
            <ChevronDown v-if="props.isAboveBattlefield" class="w-3 h-3" />
            <ChevronUp v-else class="w-3 h-3" />
            Jump to Battlefield
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useCombatStore } from '@/stores/combat'
import { useSettingsStore } from '@/stores/settings'
import { TIER_CONFIGS, type Monster } from '@/types'
import { formatMonsterIdentifier } from '@/utils/combat'
import { generateMonsterAbilities, generateMonsterUpgrades, rollMonsterState, rollMonsterMotivation } from '@/utils/monsterGenerator'
import { generateMonsterName as getRandomMonsterName } from '@/utils/monsterNameGenerator'
import { ChevronDown, ChevronUp, Plus } from 'lucide-vue-next'

interface Props {
  isAboveBattlefield?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isAboveBattlefield: false
})

const combatStore = useCombatStore()
const settingsStore = useSettingsStore()

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
  { label: 'Tier III (+6, +2 effort, 2 actions, 4 hearts)', value: 'III' },
  { label: 'Tier IV (+8, +4 effort, 3 actions, 4+ hearts)', value: 'IV' }
]

const newMonster = reactive({
  color: '',
  letter: '',
  tier: '' as 'I' | 'II' | 'III' | 'IV' | '',
  name: '',
  notes: '',
  heartsMax: 0,
  specialAbilities: '',
  // Manual mode overrides
  manualStatsBonus: 0,
  manualEffortBonus: 0,
  manualActions: 0,
  manualHearts: 0
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

const getTierBonus = (tier: string) => TIER_CONFIGS[tier as keyof typeof TIER_CONFIGS]?.bonus || 0
const getTierEffortBonus = (tier: string) => TIER_CONFIGS[tier as keyof typeof TIER_CONFIGS]?.effortBonus || 0
const getTierActions = (tier: string) => TIER_CONFIGS[tier as keyof typeof TIER_CONFIGS]?.actions || 1
const getTierHearts = (tier: string) => TIER_CONFIGS[tier as keyof typeof TIER_CONFIGS]?.hearts || 1

// Computed properties for tier mode
const effectiveStatsBonus = computed(() => {
  if (settingsStore.tierMode) {
    return getTierBonus(newMonster.tier)
  }
  return newMonster.manualStatsBonus || getTierBonus(newMonster.tier)
})

const effectiveEffortBonus = computed(() => {
  if (settingsStore.tierMode) {
    return getTierEffortBonus(newMonster.tier)
  }
  return newMonster.manualEffortBonus || getTierEffortBonus(newMonster.tier)
})

const effectiveActions = computed(() => {
  if (settingsStore.tierMode) {
    return getTierActions(newMonster.tier)
  }
  return newMonster.manualActions || getTierActions(newMonster.tier)
})

const effectiveHearts = computed(() => {
  if (settingsStore.tierMode) {
    return newMonster.heartsMax || getTierHearts(newMonster.tier)
  }
  return newMonster.manualHearts || getTierHearts(newMonster.tier)
})

// Check if manual values are actually overridden (different from tier defaults)
const hasManualOverrides = computed(() => {
  if (settingsStore.tierMode || !newMonster.tier) return false

  const tierDefaults = TIER_CONFIGS[newMonster.tier]
  if (!tierDefaults) return false

  return (
    newMonster.manualStatsBonus !== tierDefaults.bonus ||
    newMonster.manualEffortBonus !== (tierDefaults.effortBonus || 0) ||
    newMonster.manualActions !== tierDefaults.actions ||
    newMonster.manualHearts !== tierDefaults.hearts
  )
})

const updateTierDefaults = () => {
  if (newMonster.tier) {
    const config = TIER_CONFIGS[newMonster.tier]
    if (config) {
      // Tier mode: populate hearts override if empty
      if (newMonster.heartsMax === 0) {
        newMonster.heartsMax = config.hearts
      }

      // Manual mode: populate all overrides if empty
      if (newMonster.manualStatsBonus === 0) {
        newMonster.manualStatsBonus = config.bonus
      }
      if (newMonster.manualEffortBonus === 0) {
        newMonster.manualEffortBonus = config.effortBonus || 0
      }
      if (newMonster.manualActions === 0) {
        newMonster.manualActions = config.actions
      }
      if (newMonster.manualHearts === 0) {
        newMonster.manualHearts = config.hearts
      }
    }
  }
}

const addMonster = () => {
  if (!newMonster.tier) return

  const config = TIER_CONFIGS[newMonster.tier]
  if (!config) return

  const monsterData: Partial<Monster> = {
    color: newMonster.color,
    letter: newMonster.letter,
    tier: newMonster.tier,
    heartsMax: effectiveHearts.value,
    heartsCurrent: effectiveHearts.value,
    statsBonus: effectiveStatsBonus.value,
    effortBonus: effectiveEffortBonus.value,
    actions: effectiveActions.value,
    conditions: [],
    notes: newMonster.notes,
    name: newMonster.name || undefined,
    specialAbilities: newMonster.specialAbilities || undefined
  }

  // Add manual overrides if in manual mode
  if (!settingsStore.tierMode) {
    if (newMonster.manualStatsBonus > 0) {
      monsterData.manualStatsBonus = newMonster.manualStatsBonus
    }
    if (newMonster.manualEffortBonus > 0) {
      monsterData.manualEffortBonus = newMonster.manualEffortBonus
    }
    if (newMonster.manualActions > 0) {
      monsterData.manualActions = newMonster.manualActions
    }
    if (newMonster.manualHearts > 0) {
      monsterData.manualHearts = newMonster.manualHearts
    }
  }

  combatStore.addMonster(monsterData as Omit<Monster, "id">)

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
    effortBonus: 0,
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

const generateMonsterName = () => {
  newMonster.name = getRandomMonsterName()
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

// Clear functions - clear generated content without applying
const clearStateAndMotivation = () => {
  generatedState.value = ''
  generatedMotivation.value = ''
}

const clearAbilitiesAndUpgrades = () => {
  generatedAbilities.value = ''
  generatedUpgrades.value = ''
}

const scrollToBattlefield = () => {
  const element = document.querySelector('.battlefield-section')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>
