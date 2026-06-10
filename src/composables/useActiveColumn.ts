import { ref, onMounted } from "vue";

const SESSION_KEY = "icrpg-active-column";

const activeColumn = ref<0 | 1>(0);
let initialized = false;

export function useActiveColumn() {
  onMounted(() => {
    if (initialized) return;
    initialized = true;
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved === "1") activeColumn.value = 1;
  });

  const setColumn = (col: 0 | 1) => {
    activeColumn.value = col;
    sessionStorage.setItem(SESSION_KEY, String(col));
  };

  const goCombat = () => setColumn(0);
  const goBoards = () => setColumn(1);

  return { activeColumn, setColumn, goCombat, goBoards };
}
