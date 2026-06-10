<template>
  <template v-for="card in cards" :key="card.id">
    <TimerManager v-if="card.id === 'timers'" />

    <div v-if="card.id === 'battlefield'" id="battlefield" class="rpg-card battlefield-section">
      <div class="flex items-baseline gap-3 mb-4">
        <img :src="assetUrl('images/sword_icon.png')" class="flex-shrink-0 w-6 h-6 text-accent icon-filter" alt="Battlefield" />
        <h2 class="flex-shrink-0 rpg-heading">Battlefield</h2>
        <span class="flex-shrink-0 font-body font-semibold text-accent text-sm">({{ activeMonsters.length }}
          active)</span>
      </div>

      <div class="bg-neutral-50 mb-4 p-3 text-center">
        <div class="text-neutral-700 text-lg rpg-heading">
          Turn <span class="font-bold text-accent">{{ currentTurn }}</span> | Round <span
            class="font-bold text-accent">{{ currentRound }}</span>
        </div>
      </div>

      <div class="flex justify-center gap-3 mb-6">
        <button @click="onNextTurn" class="rpg-button rpg-button-primary rpg-button-sm">
          <ChevronRight class="w-4 h-4" />
          Next Turn
        </button>
        <button @click="onNextRound"
          :class="allMonstersDone ? 'rpg-button rpg-icon-button-success rpg-button-sm' : 'rpg-button rpg-button-secondary rpg-button-sm'">
          <ChevronsRight class="w-4 h-4" />
          Next Round
        </button>
      </div>

      <div v-if="activeMonsters.length > 0" class="space-y-4 mb-6">
        <div v-for="monster in activeMonsters" :key="monster.id">
          <MonsterCard ref="monsterCardRefs" :monster="monster" :compact="shouldUseCompactView"
            @remove="onRemoveMonster(monster.id)" @update="onUpdateMonster(monster.id, $event)"
            @rollDamage="onRollDamage" />
        </div>
      </div>

      <EmptySectionState
        v-else
        image="images/battlefield_empty_state.png"
        alt="No monsters"
        message="No monsters on the battlefield"
        hint="Add monsters using the form"
        :creator-above="isMonsterCreatorAboveBattlefield"
        @jump="onScrollToCreator"
      />

      <div class="flex justify-center items-center gap-3 pt-4 border-neutral-200 border-t">
        <button @click="onResetRoundsAndTurns"
          class="flex flex-row items-center gap-1 bg-warning hover:bg-yellow-600 px-3 py-2 border-2 border-warning rounded-md font-heading text-white text-xs uppercase tracking-wide transition-colors cursor-pointer">
          <RotateCcw class="h-5 icon-filter" />
          Reset Rounds
        </button>
        <button @click="onConfirmClear"
          class="flex flex-row items-center gap-1 bg-danger hover:bg-red-700 px-3 py-2 border-2 border-danger rounded-md font-heading text-white text-xs uppercase tracking-wide transition-colors cursor-pointer">
          <img :src="assetUrl('images/sword_icon.png')" class="h-5 icon-filter" alt="Clear battlefield" />
          Clear Battlefield
        </button>
      </div>
    </div>

    <CombatMechanics v-if="card.id === 'target'" ref="combatMechanicsRef" data-target-section />

    <div v-if="card.id === 'monster-creator'" id="monster-creator">
      <MonsterCreator :isAboveBattlefield="isMonsterCreatorAboveBattlefield" />
    </div>

    <InspirationPanel v-if="card.id === 'inspirations'" />

    <BoardPanel v-if="card.id === 'notes'" ref="boardPanelRef" />
  </template>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ChevronRight, ChevronsRight, RotateCcw } from "lucide-vue-next";
import type { AppCard } from "@/stores/settings";
import type { Monster } from "@/types";
import TimerManager from "@/components/TimerManager.vue";
import MonsterCard from "@/components/MonsterCard.vue";
import CombatMechanics from "@/components/CombatMechanics.vue";
import MonsterCreator from "@/components/MonsterCreator.vue";
import InspirationPanel from "@/components/InspirationPanel.vue";
import EmptySectionState from "@/components/EmptySectionState.vue";
import BoardPanel from "@/features/boards/components/BoardPanel.vue";
import { assetUrl } from "@/utils/assetUrl";

defineProps<{
  cards: AppCard[];
  currentTurn: number;
  currentRound: number;
  activeMonsters: Monster[];
  allMonstersDone: boolean;
  shouldUseCompactView: boolean;
  isMonsterCreatorAboveBattlefield: boolean;
  onNextTurn: () => void;
  onNextRound: () => void;
  onRemoveMonster: (id: string) => void;
  onUpdateMonster: (id: string, updates: Partial<Monster>) => void;
  onRollDamage: (monster: Monster) => void;
  onScrollToCreator: () => void;
  onResetRoundsAndTurns: () => void;
  onConfirmClear: () => void;
}>();

const monsterCardRefs = ref<Array<{ forceReset: () => void } | null>>([]);
const combatMechanicsRef = ref();
const boardPanelRef = ref<InstanceType<typeof BoardPanel> | null>(null);

defineExpose({ monsterCardRefs, combatMechanicsRef, boardPanelRef });
</script>
