<template>
  <div class="mb-6">
    <h4 class="mb-3 rpg-label">Application Cards</h4>
    <p class="mb-3 text-neutral-600 text-xs rpg-body">
      Drag cards between sections to choose a column, or reorder within a section. Boards stays fixed; other cards can
      sit above or below it. At least one card stays at the table.
    </p>

    <p class="mb-2 font-bold text-xs uppercase tracking-wide rpg-label">At the table</p>
    <div ref="combatListParent" class="space-y-1 mb-4">
      <div v-for="(card, index) in combatDraft" :key="card.id" :index="index" :data-card-id="card.id"
        class="flex items-center gap-2 bg-neutral-50 p-2 border border-neutral-200 rounded-lg">
        <div v-if="canDragAppCardInSettings(card.id, 'combat', combatDraft.length)"
          class="flex-shrink-0 text-neutral-400 cursor-move drag-handle">
          <GripVertical class="w-4 h-4" />
        </div>
        <div v-else class="flex-shrink-0 w-4" aria-hidden="true" />
        <div class="flex-1 min-w-0">
          <div class="font-medium text-sm rpg-heading">{{ card.name }}</div>
          <div class="text-neutral-600 text-xs truncate rpg-body">{{ card.description }}</div>
        </div>
        <SettingsControl variant="visibility" :active="card.enabled" @click="toggleCard(card.id)" />
      </div>
    </div>

    <div class="mb-2 settings-boards-section-label">
      <span class="font-bold text-xs uppercase tracking-wide rpg-label">On the board</span>
      <SettingsControl variant="visibility" :active="settingsStore.boardsColumnEnabled"
        @click="settingsStore.toggleBoardsColumn()" />
    </div>
    <div class="space-y-1">
      <div ref="boardsAboveListParent" class="space-y-1 settings-boards-dropzone">
        <p v-if="boardsAboveDraft.length === 0"
          class="px-2 py-1 text-neutral-400 text-xs pointer-events-none settings-boards-dropzone__placeholder rpg-body">
          Drop cards above board
        </p>
        <div v-for="(card, index) in boardsAboveDraft" :key="card.id" :index="index" :data-card-id="card.id"
          class="flex items-center gap-2 bg-neutral-50 p-2 border border-neutral-200 rounded-lg">
          <div v-if="canDragAppCardInSettings(card.id, 'boards', combatDraft.length)"
            class="flex-shrink-0 text-neutral-400 cursor-move drag-handle">
            <GripVertical class="w-4 h-4" />
          </div>
          <div v-else class="flex-shrink-0 w-4" aria-hidden="true" />
          <div class="flex-1 min-w-0">
            <div class="font-medium text-sm rpg-heading">{{ card.name }}</div>
            <div class="text-neutral-600 text-xs truncate rpg-body">{{ card.description }}</div>
          </div>
          <SettingsControl variant="visibility" :active="card.enabled" @click="toggleCard(card.id)" />
        </div>
      </div>

      <div v-if="boardsPinned" class="flex items-center gap-2 bg-neutral-50 p-2 border border-neutral-200 rounded-lg">
        <div class="flex-shrink-0 w-4" aria-hidden="true" />
        <div class="flex-1 min-w-0">
          <div class="font-medium text-sm rpg-heading">{{ boardsPinned.name }}</div>
          <div class="text-neutral-600 text-xs truncate rpg-body">{{ boardsPinned.description }}</div>
        </div>
      </div>

      <div ref="boardsBelowListParent" class="space-y-1 settings-boards-dropzone">
        <p v-if="boardsBelowDraft.length === 0"
          class="px-2 py-1 text-neutral-400 text-xs pointer-events-none settings-boards-dropzone__placeholder rpg-body">
          Drop cards below board
        </p>
        <div v-for="(card, index) in boardsBelowDraft" :key="card.id" :index="index" :data-card-id="card.id"
          class="flex items-center gap-2 bg-neutral-50 p-2 border border-neutral-200 rounded-lg">
          <div v-if="canDragAppCardInSettings(card.id, 'boards', combatDraft.length)"
            class="flex-shrink-0 text-neutral-400 cursor-move drag-handle">
            <GripVertical class="w-4 h-4" />
          </div>
          <div v-else class="flex-shrink-0 w-4" aria-hidden="true" />
          <div class="flex-1 min-w-0">
            <div class="font-medium text-sm rpg-heading">{{ card.name }}</div>
            <div class="text-neutral-600 text-xs truncate rpg-body">{{ card.description }}</div>
          </div>
          <SettingsControl variant="visibility" :active="card.enabled" @click="toggleCard(card.id)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { GripVertical } from "lucide-vue-next";
import { useDragAndDrop } from "vue-fluid-dnd";
import SettingsControl from "@/components/SettingsControl.vue";
import { useSettingsStore, type AppCard } from "@/stores/settings";
import {
  canDragAppCardInSettings,
  splitAppCardsForSettings,
} from "@/utils/appCardColumns";

const settingsStore = useSettingsStore();

const combatDraft = ref<AppCard[]>([]);
const boardsAboveDraft = ref<AppCard[]>([]);
const boardsBelowDraft = ref<AppCard[]>([]);
const boardsPinned = ref<AppCard | null>(null);
const isDragging = ref(false);

const loadDraftFromStore = () => {
  const { combat, boardsAbovePinned, boardsBelowPinned, boardsPinned: pinned } =
    settingsStore.splitAppCardsForSettings(settingsStore.appCards);
  combatDraft.value = combat.map((c) => ({ ...c }));
  boardsAboveDraft.value = boardsAbovePinned.map((c) => ({ ...c }));
  boardsBelowDraft.value = boardsBelowPinned.map((c) => ({ ...c }));
  boardsPinned.value = pinned ? { ...pinned } : null;
};

const persistDraftToStore = () => {
  settingsStore.reorderCardsFromSections(
    combatDraft.value,
    boardsAboveDraft.value,
    boardsBelowDraft.value,
    boardsPinned.value,
  );
  loadDraftFromStore();
};

const schedulePersistFromDrag = () => {
  isDragging.value = false;
  window.setTimeout(persistDraftToStore, 0);
};

const settingsCardIsDraggable = (section: "combat" | "boards") => (element: HTMLElement) => {
  const cardId = element.dataset.cardId;
  if (!cardId) return false;
  return canDragAppCardInSettings(cardId, section, combatDraft.value.length);
};

const sharedDndConfig = {
  droppableGroup: "settings-app-cards",
  handlerSelector: ".drag-handle",
  delayBeforeRemove: 0,
  delayBeforeInsert: 0,
  onDragStart: () => {
    isDragging.value = true;
  },
  onDragEnd: schedulePersistFromDrag,
};

const { parent: combatListParent } = useDragAndDrop(combatDraft, {
  ...sharedDndConfig,
  isDraggable: settingsCardIsDraggable("combat"),
});

const boardsDndConfig = {
  ...sharedDndConfig,
  isDraggable: settingsCardIsDraggable("boards"),
};

const { parent: boardsAboveListParent } = useDragAndDrop(boardsAboveDraft, boardsDndConfig);
const { parent: boardsBelowListParent } = useDragAndDrop(boardsBelowDraft, boardsDndConfig);

const toggleCard = (cardId: string) => {
  settingsStore.toggleCard(cardId);
  if (!isDragging.value) loadDraftFromStore();
};

watch(
  () => settingsStore.appCards,
  () => {
    if (isDragging.value) return;
    loadDraftFromStore();
  },
  { deep: true },
);

onMounted(loadDraftFromStore);
</script>

<style scoped>
.settings-boards-section-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  line-height: 1.25rem;
}

.settings-boards-section-label :deep(.settings-control) {
  flex-shrink: 0;
  height: 1.5rem;
  width: 1.5rem;
}

.settings-boards-section-label :deep(.settings-control__knob) {
  margin-top: 0;
  width: 1.25rem;
  height: 1.25rem;
}

.settings-boards-dropzone {
  min-height: 2.5rem;
}
</style>
