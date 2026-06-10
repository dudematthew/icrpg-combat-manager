<template>
  <nav v-if="settingsStore.showSectionNav" class="board-bar" aria-label="Board navigation">
    <button type="button" class="board-bar__item" @click="emit('go-combat')">
      <ChevronLeft class="w-4 h-4" />
      <span class="board-bar__label">Table</span>
    </button>
    <div class="board-bar__item board-bar__item--name" aria-current="page">
      <BookMarked class="w-4 h-4" />
      <span class="board-bar__label">{{ boardName }}</span>
    </div>
    <button type="button" class="board-bar__item" title="Add text card" @click="emit('add-card')">
      <Plus class="w-4 h-4" />
      <span class="board-bar__label">Card</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ChevronLeft, Plus, BookMarked } from "lucide-vue-next";
import { useSettingsStore } from "@/stores/settings";
import { useBoardsStore } from "@/features/boards/stores/boards";

const settingsStore = useSettingsStore();
const boardsStore = useBoardsStore();

const emit = defineEmits<{
  "go-combat": [];
  "add-card": [];
}>();

const boardName = computed(() => boardsStore.activeBoard?.name ?? "Boards");
</script>

<style scoped>
.board-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 40;
  display: flex;
  gap: 0.25rem;
  width: 100%;
  max-width: 480px;
  padding: 0.35rem 0.5rem calc(0.35rem + env(safe-area-inset-bottom, 0px));
  background: rgba(255, 255, 255, 0.95);
  border-top: 2px solid #e5e5e5;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(4px);
}

.board-bar__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
  padding: 0.25rem 0.125rem;
  border: none;
  background: transparent;
  color: #525252;
  cursor: pointer;
  border-radius: 0.375rem;
  transition: color 0.15s, background 0.15s;
}

.board-bar__item:hover {
  color: #dc2626;
  background: #fef2f2;
}

.board-bar__item--name {
  cursor: default;
  pointer-events: none;
}

.board-bar__item--name:hover {
  background: transparent;
  color: #525252;
}

.board-bar__label {
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  line-height: 1;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
