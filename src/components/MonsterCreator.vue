<template>
  <div class="monster-creator">
    <div class="mb-3 rpg-card">
      <div class="flex items-center gap-2 mb-6">
        <img :src="assetUrl('images/monster_icon.png')" class="mb-3 w-5 h-5 text-accent icon-filter"
          alt="Add monster" />
        <h2 class="rpg-heading">Monster Creator</h2>
      </div>

      <div class="space-y-4">
        <div class="gap-4 grid grid-cols-1 md:grid-cols-2">
          <div>
            <label for="color" class="rpg-label">Color</label>
            <select id="color" v-model="newMonster.color" class="rpg-input">
              <option value="">Choose color</option>
              <option v-for="color in MONSTER_COLORS" :key="color.value" :value="color.value">
                {{ color.label }}
              </option>
            </select>
          </div>
          <div>
            <label for="letter" class="rpg-label">Letter</label>
            <select id="letter" v-model="newMonster.letter" class="rpg-input">
              <option value="">Choose letter</option>
              <option v-for="letter in MONSTER_LETTERS" :key="letter.value" :value="letter.value">
                {{ letter.label }}
              </option>
            </select>
          </div>
          <div class="md:col-span-2">
            <label for="tier" class="rpg-label">Tier</label>
            <select id="tier" v-model="newMonster.tier" @change="updateTierDefaults" class="rpg-input">
              <option value="">Choose tier</option>
              <option v-for="tier in TIER_OPTIONS" :key="tier.value" :value="tier.value">
                {{ tier.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="md:col-span-2">
          <label for="notes" class="rpg-label">Notes (Optional)</label>
          <textarea id="notes" v-model="newMonster.notes" placeholder="Add notes about this monster..." rows="4"
            class="rpg-input" />
        </div>
        <div class="md:col-span-2">
          <label for="abilities" class="rpg-label">Special Abilities (Optional)</label>
          <textarea id="abilities" v-model="newMonster.specialAbilities" placeholder="Poison, blast, regeneration, etc."
            rows="4" class="rpg-input" />
        </div>

        <div v-if="!settingsStore.fastMode" class="mt-6 pt-6 border-neutral-300 border-t-2">
          <details class="group">
            <summary class="cursor-pointer list-none">
              <div
                class="flex justify-between items-center bg-neutral-100 hover:bg-neutral-200 p-4 rounded-lg transition-colors"
                style="border-bottom: 2px solid #d4d4d4;">
                <span class="font-bold text-base rpg-heading">Advanced Options</span>
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
                  <input id="name" v-model="newMonster.name" placeholder="Custom name" class="flex-1 rpg-input" />
                  <button type="button" @click="generateMonsterName" class="p-0 rpg-button rpg-button-secondary"
                    title="Generate random monster name">
                    <img :src="assetUrl('images/d6_dice_icon.png')" class="h-5 icon-filter" alt="Generate name" />
                  </button>
                </div>
              </div>

              <div v-if="settingsStore.tierMode">
                <label for="hearts" class="rpg-label">Hearts Override</label>
                <input id="hearts" v-model.number="newMonster.heartsMax" type="number" :min="1" :max="18"
                  placeholder="Default from tier" class="rpg-input" />
              </div>

              <template v-if="!settingsStore.tierMode">
                <div>
                  <label class="rpg-label">Stats Bonus Override</label>
                  <input v-model.number="newMonster.manualStatsBonus" type="number" :min="0" :max="20"
                    class="rpg-input" />
                </div>
                <div>
                  <label class="rpg-label">Effort Bonus Override</label>
                  <input v-model.number="newMonster.manualEffortBonus" type="number" :min="0" :max="10"
                    class="rpg-input" />
                </div>
                <div>
                  <label class="rpg-label">Actions Override</label>
                  <input v-model.number="newMonster.manualActions" type="number" :min="1" :max="5" class="rpg-input" />
                </div>
                <div>
                  <label class="rpg-label">Hearts Override</label>
                  <input v-model.number="newMonster.manualHearts" type="number" :min="1" :max="18" class="rpg-input" />
                </div>
              </template>

              <div class="md:col-span-2">
                <div class="space-y-3 bg-neutral-50 p-3 border border-neutral-200 rounded-lg">
                  <h4 class="rpg-label">Generate Traits</h4>
                  <TraitPickButtons :notes="newMonster.notes" :special-abilities="newMonster.specialAbilities"
                    @update:notes="newMonster.notes = $event"
                    @update:special-abilities="newMonster.specialAbilities = $event" />
                </div>
              </div>
            </div>
          </details>
        </div>

        <div class="bg-neutral-50 p-4 border border-neutral-200 rounded-lg">
          <div class="mb-2 rpg-label">Preview:</div>
          <div class="rpg-body">
            <strong class="font-semibold">{{ formatMonsterIdentifier(newMonster.color || 'Grey', newMonster.letter ||
              '?')
              }}</strong>
            <br />
            Tier {{ newMonster.tier || '?' }}: +{{ effectiveStatsBonus }}{{ effectiveEffortBonus > 0 ? `,
            +${effectiveEffortBonus} effort` : '' }}, {{ effectiveActions }} action(s), {{ effectiveHearts }} heart(s)
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <div class="flex gap-2">
            <button type="button" @click="addToBattlefield" :disabled="!canAddToBattlefield"
              class="flex-1 disabled:opacity-50 text-xs disabled:cursor-not-allowed rpg-button rpg-button-sm rpg-button-primary">
              <img :src="assetUrl('images/sword_icon.png')" class="icon-filter" alt="" />
              To Battlefield
            </button>
            <button type="button" @click="saveToLibrary" :disabled="!canSaveToLibrary"
              class="flex-1 disabled:opacity-50 text-xs disabled:cursor-not-allowed rpg-button rpg-button-sm rpg-button-secondary">
              <BookMarked class="w-4 h-4" />
              To Library
            </button>
          </div>
          <div class="flex gap-2">
            <button type="button" @click="addBlankMonster" class="flex-1 text-xs rpg-button rpg-button-secondary">
              <Plus class="h-5" />
              Add Blank
            </button>
            <button v-if="combatStore.lastAddedMonsterPayload" type="button" @click="combatStore.duplicateLastMonster()"
              class="flex-1 text-xs rpg-button rpg-button-secondary">
              Duplicate Last
            </button>
          </div>
        </div>

        <div class="flex justify-center">
          <button type="button" @click="scrollToBattlefield"
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
import { reactive, computed } from "vue";
import { useCombatStore } from "@/stores/combat";
import { useSettingsStore } from "@/stores/settings";
import { useMonsterLibraryStore } from "@/stores/monsterLibrary";
import { TIER_CONFIGS } from "@/types";
import { formatMonsterIdentifier } from "@/utils/combat";
import { assetUrl } from "@/utils/assetUrl";
import { buildMonsterPayload, buildTemplateFromForm, getEffectiveStats } from "@/utils/monsterForm";
import { generateMonsterName as getRandomMonsterName } from "@/utils/monsterNameGenerator";
import { MONSTER_COLORS, MONSTER_LETTERS, TIER_OPTIONS } from "@/constants/monsterOptions";
import TraitPickButtons from "@/components/TraitPickButtons.vue";
import { BookMarked, ChevronDown, ChevronUp, Plus } from "lucide-vue-next";

interface Props {
  isAboveBattlefield?: boolean;
}

const props = withDefaults(defineProps<Props>(), { isAboveBattlefield: false });

const combatStore = useCombatStore();
const settingsStore = useSettingsStore();
const libraryStore = useMonsterLibraryStore();

const newMonster = reactive({
  color: "",
  letter: "",
  tier: "" as "I" | "II" | "III" | "IV" | "",
  name: "",
  notes: "",
  heartsMax: 0,
  specialAbilities: "",
  manualStatsBonus: 0,
  manualEffortBonus: 0,
  manualActions: 0,
  manualHearts: 0,
});

const stats = computed(() => getEffectiveStats(newMonster, settingsStore.tierMode));
const effectiveStatsBonus = computed(() => stats.value.statsBonus);
const effectiveEffortBonus = computed(() => stats.value.effortBonus);
const effectiveActions = computed(() => stats.value.actions);
const effectiveHearts = computed(() => stats.value.heartsMax);

const canSaveToLibrary = computed(() => Boolean(newMonster.color && newMonster.tier));
const canAddToBattlefield = computed(() => Boolean(newMonster.color && newMonster.letter && newMonster.tier));

const updateTierDefaults = () => {
  if (!newMonster.tier) return;
  const config = TIER_CONFIGS[newMonster.tier];
  if (!config) return;
  if (newMonster.heartsMax === 0) newMonster.heartsMax = config.hearts;
  if (newMonster.manualStatsBonus === 0) newMonster.manualStatsBonus = config.bonus;
  if (newMonster.manualEffortBonus === 0) newMonster.manualEffortBonus = config.effortBonus || 0;
  if (newMonster.manualActions === 0) newMonster.manualActions = config.actions;
  if (newMonster.manualHearts === 0) newMonster.manualHearts = config.hearts;
};

const clearFormAfterAdd = (keepColorTier: boolean) => {
  if (keepColorTier) {
    newMonster.name = "";
    newMonster.notes = "";
    newMonster.specialAbilities = "";
  } else {
    newMonster.color = "";
    newMonster.letter = "";
    newMonster.tier = "";
    newMonster.name = "";
    newMonster.notes = "";
    newMonster.specialAbilities = "";
    newMonster.heartsMax = 0;
    newMonster.manualStatsBonus = 0;
    newMonster.manualEffortBonus = 0;
    newMonster.manualActions = 0;
    newMonster.manualHearts = 0;
  }
};

const incrementLetter = () => {
  const idx = MONSTER_LETTERS.findIndex((l) => l.value === newMonster.letter);
  if (idx >= 0 && idx < MONSTER_LETTERS.length - 1) {
    newMonster.letter = MONSTER_LETTERS[idx + 1].value;
  }
};

const addToBattlefield = () => {
  if (!canAddToBattlefield.value) return;
  combatStore.addMonster(buildMonsterPayload(newMonster, settingsStore.tierMode, newMonster.letter));
  incrementLetter();
  clearFormAfterAdd(settingsStore.keepCreatorFieldsOnLibrarySave);
};

const saveToLibrary = () => {
  if (!canSaveToLibrary.value) return;
  libraryStore.saveTemplate(buildTemplateFromForm(newMonster, settingsStore.tierMode), newMonster.name || undefined);
  clearFormAfterAdd(settingsStore.keepCreatorFieldsOnLibrarySave);
};

const addBlankMonster = () => {
  combatStore.addMonster({
    color: "Grey",
    letter: "?",
    tier: "I",
    heartsMax: 1,
    heartsCurrent: 1,
    statsBonus: 2,
    effortBonus: 0,
    actions: 1,
    conditions: [],
    notes: "",
    name: "Blank Monster",
  });
};

const generateMonsterName = () => {
  newMonster.name = getRandomMonsterName();
};

const scrollToBattlefield = () => {
  document.getElementById("battlefield")?.scrollIntoView({ behavior: "smooth" });
};
</script>
