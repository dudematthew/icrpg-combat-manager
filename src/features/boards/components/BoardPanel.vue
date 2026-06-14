<template>
  <div id="notes" class="board-panel rpg-card">
    <div class="rpg-card-header">
      <BookMarked class="flex-shrink-0 w-5 h-5 text-accent" />
      <h2 class="rpg-heading">Boards</h2>
    </div>

    <div class="board-panel__toolbar">
      <select v-model="selectedBoardId" class="flex-1 text-sm rpg-input" @change="onBoardChange">
        <option v-for="b in boardsStore.boards" :key="b.id" :value="b.id">{{ b.name }}</option>
      </select>
      <button type="button" class="text-xs rpg-button rpg-button-secondary rpg-button-sm" @click="showBoardModal = true">
        + Board
      </button>
    </div>

    <div class="board-panel__actions">
      <button type="button" class="text-xs rpg-button rpg-button-primary rpg-button-sm" @click="addTextCard">
        + Card
      </button>
      <button type="button" class="text-xs rpg-button rpg-button-secondary rpg-button-sm" @click="showCaptureModal = true">
        Capture Session
      </button>
      <button
        v-if="boardsStore.cardsForActiveBoard.length > 0"
        type="button"
        class="text-xs rpg-button rpg-button-secondary rpg-button-sm"
        @click="copyAllNotes"
      >
        Copy notes
      </button>
    </div>
    <p v-if="boardsStore.cardsForActiveBoard.length > 0" class="board-panel__hint rpg-body">
      Ctrl+N new card<span v-if="!showBoardBar"> · sticky + Card at bottom of long lists</span>
    </p>

    <EmptySectionState
      v-if="boardsStore.cardsForActiveBoard.length === 0"
      image="images/shelf_of_monsters.png"
      alt="Empty board"
      message="No index cards yet"
      hint="Add a card or push from combat"
      :creator-above="false"
      @jump="addTextCard"
    />

    <div v-else ref="cardListParent" class="board-panel__list">
      <IndexCardView
        v-for="(card, index) in cardListRef"
        :key="card.id"
        :index="index"
        :card="card"
        @deploy="deployCard"
        @edit="openEdit"
        @toggle-expand="boardsStore.toggleCardCollapsed"
        @update-body="(body) => boardsStore.updateCard(card.id, { body })"
      />
      <div v-if="cardListRef.length > 0 && !showBoardBar" class="board-panel__sticky-add">
        <button type="button" class="board-panel__sticky-btn rpg-button rpg-button-primary" @click="addTextCard">
          + Card
        </button>
      </div>
    </div>

    <IndexCardEditorModal
      v-model="editorOpen"
      :card="editingCard"
      @save="onSave"
      @delete="onDelete"
    />

    <ConfirmModal
      v-model="showCaptureModal"
      title="Capture Session"
      message="Save current monsters, timers, round, and turn to a snapshot card on this board?"
      confirm-label="Capture"
      @confirm="boardsStore.captureSnapshot()"
    />

    <ConfirmModal
      v-model="showRestoreModal"
      title="Restore Snapshot"
      :message="restoreMessage"
      detail="This replaces your current battlefield and timers."
      confirm-label="Restore"
      @confirm="confirmRestore"
    />

    <PromptModal
      v-model="showBoardModal"
      title="New Board"
      label="Board name"
      placeholder="Scene"
      initial-value="Scene"
      submit-label="Create"
      @submit="onCreateBoard"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import { BookMarked } from "lucide-vue-next";
import { useDragAndDrop } from "vue-fluid-dnd";
import EmptySectionState from "@/components/EmptySectionState.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import PromptModal from "@/components/PromptModal.vue";
import { useDragClickGuard } from "@/composables/useDragClickGuard";
import { useActiveColumn } from "@/composables/useActiveColumn";
import { useBoardsStore } from "../stores/boards";
import { useSettingsStore } from "@/stores/settings";
import { useInfoMonitorStore } from "@/stores/infoMonitor";
import { buildBoardNotesPlainText } from "../utils/exportBoardNotes";
import { getAdapter } from "../adapters";
import IndexCardView from "./IndexCardView.vue";
import IndexCardEditorModal from "./IndexCardEditorModal.vue";
import type { DrawingDocument } from "../drawing/types";
import type { IndexCard } from "../types";

const boardsStore = useBoardsStore();
const settingsStore = useSettingsStore();
const infoMonitor = useInfoMonitorStore();
const { activeColumn } = useActiveColumn();
const { shouldBlockClick, onDragInteraction } = useDragClickGuard();

const showBoardBar = computed(
  () => settingsStore.showSectionNav && settingsStore.showBoardsColumn && activeColumn.value === 1,
);

const editorOpen = ref(false);
const editingCardId = ref<string | null>(null);
const cardListRef = ref<IndexCard[]>([]);
const showCaptureModal = ref(false);
const showRestoreModal = ref(false);
const showBoardModal = ref(false);
const pendingDeployId = ref<string | null>(null);
const pendingDeployHeld = ref(false);
let syncingFromStore = false;

const selectedBoardId = computed({
  get: () => boardsStore.activeBoardId ?? "",
  set: (id: string) => boardsStore.setActiveBoard(id),
});

const editingCard = computed((): IndexCard | null => {
  if (!editingCardId.value) return null;
  return boardsStore.cards[editingCardId.value] ?? null;
});

const restoreMessage = computed(() => {
  if (!pendingDeployId.value) return "";
  const card = boardsStore.cards[pendingDeployId.value];
  if (!card?.payload || card.payload.kind !== "snapshot") return "";
  const { monsters, timers, round, turn } = card.payload.data;
  return `Restore snapshot with ${monsters.length} monsters, ${timers.length} timers, round ${round}, turn ${turn}?`;
});

const syncCardListFromStore = () => {
  if (syncingFromStore) return;
  const storeCards = boardsStore.cardsForActiveBoard;
  const currentIds = cardListRef.value.map((c) => c.id).join(",");
  const storeIds = storeCards.map((c) => c.id).join(",");

  if (currentIds === storeIds && cardListRef.value.length > 0) {
    cardListRef.value = cardListRef.value.map((c) => boardsStore.cards[c.id] ?? c);
  } else {
    cardListRef.value = storeCards.map((c) => ({ ...c }));
  }
};

watch(
  () => boardsStore.cardsForActiveBoard.map((c) => `${c.id}:${c.updatedAt}`).join("|"),
  syncCardListFromStore,
  { immediate: true },
);

const { parent: cardListParent } = useDragAndDrop(cardListRef, {
  handlerSelector: ".index-card__drag-handle",
  onDragStart: onDragInteraction,
  onDragEnd: onDragInteraction,
});

watch(cardListRef, (newOrder) => {
  const ids = newOrder.map((c) => c.id);
  const current = boardsStore.activeBoard?.cardIds.join(",") ?? "";
  if (ids.join(",") !== current) {
    syncingFromStore = true;
    boardsStore.reorderBoardCards(ids);
    nextTick(() => {
      syncingFromStore = false;
    });
  }
}, { deep: true });

const onBoardChange = () => {};

const onCreateBoard = (name: string) => {
  boardsStore.createBoard(name);
};

const addTextCard = () => {
  const card = boardsStore.addTextCard("New note", settingsStore.defaultNewCardColor);
  openEdit(card.id);
};

const copyAllNotes = async () => {
  const cards = boardsStore.cardsForActiveBoard;
  const text = buildBoardNotesPlainText(cards);
  if (!text.trim()) {
    infoMonitor.showMonitor({ type: "error", title: "Nothing to copy", message: "No note text on this board." });
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    infoMonitor.showMonitor({ type: "info", title: "Copied", message: "All notes from this board copied to clipboard." });
  } catch {
    infoMonitor.showMonitor({ type: "error", title: "Copy failed", message: "Could not access the clipboard." });
  }
};

const openEdit = (id: string) => {
  if (shouldBlockClick()) return;
  editingCardId.value = id;
  editorOpen.value = true;
};

const deployCard = (id: string, held = false) => {
  const card = boardsStore.cards[id];
  if (!card) return;
  if (card.kind === "snapshot") {
    pendingDeployId.value = id;
    pendingDeployHeld.value = held;
    showRestoreModal.value = true;
    return;
  }
  getAdapter(card.kind).deploy(card, held);
};

const confirmRestore = () => {
  if (!pendingDeployId.value) return;
  const card = boardsStore.cards[pendingDeployId.value];
  if (card) getAdapter(card.kind).deploy(card, pendingDeployHeld.value);
  pendingDeployId.value = null;
  pendingDeployHeld.value = false;
};

const onSave = (data: {
  title: string;
  color: string;
  body: string;
  drawings?: Record<string, DrawingDocument>;
}) => {
  if (!editingCardId.value) return;
  boardsStore.updateCard(editingCardId.value, data);
  editingCardId.value = null;
};

const onDelete = () => {
  if (!editingCardId.value) return;
  boardsStore.removeCard(editingCardId.value);
  editingCardId.value = null;
};

defineExpose({ addTextCard });
</script>

<style scoped>
.board-panel {
  display: flex;
  flex-direction: column;
}

.board-panel__toolbar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.board-panel__actions {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.board-panel__list {
  flex: 1;
}

.board-panel__hint {
  margin: -0.5rem 0 0.75rem;
  color: #737373;
  font-size: 0.7rem;
}

.board-panel__sticky-add {
  position: sticky;
  bottom: 0;
  z-index: 2;
  padding: 0.75rem 0 0;
  margin-top: 0.5rem;
  border-top: 1px solid #e5e5e5;
  background: white;
}

.board-panel__sticky-btn {
  width: 100%;
  justify-content: center;
}
</style>
