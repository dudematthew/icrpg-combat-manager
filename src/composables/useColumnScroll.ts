import { ref, watch, nextTick, onMounted, type Ref } from "vue";

const SCROLL_KEY_COMBAT = "icrpg-scroll-combat";
const SCROLL_KEY_BOARDS = "icrpg-scroll-boards";

function loadScroll(key: string): number {
  const saved = sessionStorage.getItem(key);
  const n = saved ? parseInt(saved, 10) : 0;
  return Number.isFinite(n) ? n : 0;
}

function saveScroll(key: string, value: number) {
  sessionStorage.setItem(key, String(Math.round(value)));
}

export function useColumnScroll(activeColumn: Ref<0 | 1>) {
  const combatColumnEl = ref<HTMLElement | null>(null);
  const boardsColumnEl = ref<HTMLElement | null>(null);

  const scrollMemory = {
    combat: loadScroll(SCROLL_KEY_COMBAT),
    boards: loadScroll(SCROLL_KEY_BOARDS),
  };

  const columnEl = (col: 0 | 1) => (col === 0 ? combatColumnEl.value : boardsColumnEl.value);
  const scrollKey = (col: 0 | 1) => (col === 0 ? SCROLL_KEY_COMBAT : SCROLL_KEY_BOARDS);
  const memoryKey = (col: 0 | 1) => (col === 0 ? "combat" : "boards") as "combat" | "boards";

  const persistColumnScroll = (col: 0 | 1) => {
    const el = columnEl(col);
    if (!el) return;
    scrollMemory[memoryKey(col)] = el.scrollTop;
    saveScroll(scrollKey(col), el.scrollTop);
  };

  const restoreColumnScroll = (col: 0 | 1) => {
    const el = columnEl(col);
    if (!el) return;
    const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight);
    el.scrollTop = Math.min(scrollMemory[memoryKey(col)], maxScroll);
  };

  const onColumnScroll = (col: 0 | 1) => {
    persistColumnScroll(col);
  };

  watch(activeColumn, (next, prev) => {
    if (prev !== undefined) persistColumnScroll(prev);
    nextTick(() => restoreColumnScroll(next));
  });

  onMounted(() => {
    nextTick(() => restoreColumnScroll(activeColumn.value));
  });

  return { combatColumnEl, boardsColumnEl, onColumnScroll, persistColumnScroll };
}
