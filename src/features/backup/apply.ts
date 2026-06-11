import { useCombatStore } from "@/stores/combat";
import { useBoardsStore } from "@/features/boards/stores/boards";
import { useSettingsStore } from "@/stores/settings";
import { setCloudCredentials } from "./cloudCredentials";
import type { ParsedBackup } from "./types";

export function applyBackupEnvelope(envelope: ParsedBackup): void {
  const combatStore = useCombatStore();
  const boardsStore = useBoardsStore();
  const settingsStore = useSettingsStore();

  combatStore.importState(envelope.data.combat);
  boardsStore.importState(envelope.data.boards);
  settingsStore.importSettingsBackup(envelope.data.settings);

  if (envelope.cloud) {
    setCloudCredentials(envelope.cloud);
  }
}
