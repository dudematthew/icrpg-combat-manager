<template>
  <div
    class="app-columns-root"
    :class="{
      'has-section-nav': hasSectionNav,
      'has-header': hasHeader,
      'has-boards-column': showBoardsColumn,
    }"
  >
    <button
      v-if="showBoardsColumn && showArrows && activeColumn === 1"
      type="button"
      class="column-arrow column-arrow--left"
      aria-label="Table column"
      @click="goCombat"
    >
      <ChevronLeft class="w-5 h-5" />
    </button>

    <div class="app-columns-viewport">
      <div class="app-columns-track">
        <div
          ref="combatColumnEl"
          class="app-column app-column--combat"
          :class="{ 'app-column--active': activeColumn === 0 }"
          @scroll="onColumnScroll(0)"
        >
          <slot name="combat" />
        </div>
        <div
          v-if="showBoardsColumn"
          ref="boardsColumnEl"
          class="app-column app-column--boards"
          :class="{ 'app-column--active': activeColumn === 1 }"
          @scroll="onColumnScroll(1)"
        >
          <slot name="boards" />
        </div>
      </div>
    </div>

    <button
      v-if="showBoardsColumn && showArrows && activeColumn === 0"
      type="button"
      class="column-arrow column-arrow--right"
      aria-label="Boards column"
      @click="goBoards"
    >
      <ChevronRight class="w-5 h-5" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";
import { useActiveColumn } from "@/composables/useActiveColumn";
import { useColumnScroll } from "@/composables/useColumnScroll";

const {
  showBoardsColumn = true,
  hasSectionNav = false,
  hasHeader = false,
} = defineProps<{
  hasSectionNav?: boolean;
  hasHeader?: boolean;
  showBoardsColumn?: boolean;
}>();

const { activeColumn, goCombat, goBoards, setColumn } = useActiveColumn();
const { combatColumnEl, boardsColumnEl, onColumnScroll } = useColumnScroll(activeColumn);

const showArrows = ref(false);
let touchStartX = 0;

const onTouchStart = (e: Event) => {
  touchStartX = (e as TouchEvent).touches[0].clientX;
};

const onTouchEnd = (e: Event) => {
  if (!showBoardsColumn) return;
  const dx = (e as TouchEvent).changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) < 60) return;
  if (dx < 0 && activeColumn.value === 0) goBoards();
  if (dx > 0 && activeColumn.value === 1) goCombat();
};

const checkArrows = () => {
  showArrows.value = window.matchMedia("(max-width: 767px)").matches;
};

onMounted(() => {
  checkArrows();
  window.addEventListener("resize", checkArrows);
  const viewport = document.querySelector(".app-columns-viewport");
  viewport?.addEventListener("touchstart", onTouchStart, { passive: true });
  viewport?.addEventListener("touchend", onTouchEnd, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener("resize", checkArrows);
});

defineExpose({ activeColumn, setColumn, goCombat, goBoards, combatColumnEl, boardsColumnEl });
</script>

<style scoped>
.app-columns-root {
  position: relative;
  flex: 1;
  min-height: 0;
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

.app-columns-viewport {
  overflow: hidden;
  width: 100%;
  flex: 1;
  min-height: 0;
}

.app-columns-track {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 0;
  gap: 1rem;
}

.app-column {
  flex-shrink: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

/* Mobile: one column visible, no transform (keeps drag-and-drop fixed positioning working) */
@media (max-width: 767px) {
  .app-column {
    display: none;
    width: 100%;
    flex: 1 1 auto;
    align-self: stretch;
    min-height: 0;
    padding: 0 0.5rem;
  }

  .app-column--active {
    display: block;
  }

  .app-columns-track {
    align-items: stretch;
  }

  .app-column > * > :last-child {
    margin-bottom: 0;
  }
}

/* Desktop: side-by-side independent scroll */
@media (min-width: 768px) {
  .app-column {
    display: block;
    width: calc(50% - 0.5rem);
    height: 100%;
    padding: 0;
  }

  .app-columns-root:not(.has-boards-column) .app-columns-track {
    justify-content: center;
  }

  .app-columns-root:not(.has-boards-column) .app-column--combat {
    width: calc(50% - 0.5rem);
    max-width: calc(50% - 0.5rem);
  }
}

.column-arrow {
  position: fixed;
  top: 50%;
  z-index: 45;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 3rem;
  border: 2px solid #e5e5e5;
  border-radius: 0.375rem;
  background: rgba(255, 255, 255, 0.95);
  color: #525252;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.column-arrow--left {
  left: 0.25rem;
}

.column-arrow--right {
  right: 0.25rem;
}

@media (min-width: 768px) {
  .column-arrow {
    display: none;
  }
}
</style>
