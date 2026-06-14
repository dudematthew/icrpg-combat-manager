import { useCombatStore } from "@/stores/combat";
import { useBoardsStore } from "@/features/boards/stores/boards";
import { useSettingsStore } from "@/stores/settings";
import { useInfoMonitorStore } from "@/stores/infoMonitor";
import { clearCloudCredentials } from "@/features/backup/cloudCredentials";
import type { BoardsState } from "@/features/boards/types";
import type { CombatState } from "@/types";

const EMPTY_COMBAT: CombatState = {
  sceneTargetNumber: 12,
  monsters: [],
  timers: [],
  currentTurn: 1,
  currentRound: 1,
};

const EMPTY_BOARDS: BoardsState = {
  boards: [],
  cards: {},
  activeBoardId: null,
};

const SESSION_STORAGE_KEYS = [
  "icrpg-active-column",
  "icrpg-scroll-combat",
  "icrpg-scroll-boards",
  "icrpg-last-target-tn",
  "icrpg-cloud-backup",
] as const;

/** Wipes local session data and returns stores to a fresh default state. */
export function resetAppSession(): void {
  const combatStore = useCombatStore();
  const boardsStore = useBoardsStore();
  const settingsStore = useSettingsStore();
  const infoMonitorStore = useInfoMonitorStore();

  combatStore.importState(EMPTY_COMBAT);
  boardsStore.importState(EMPTY_BOARDS);
  settingsStore.resetToDefaults();
  clearCloudCredentials();
  infoMonitorStore.clearQueue();

  localStorage.removeItem("icrpg-monster-library");
  for (const key of SESSION_STORAGE_KEYS) {
    sessionStorage.removeItem(key);
  }
}
