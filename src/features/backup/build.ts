import { useCombatStore } from "@/stores/combat";
import { useBoardsStore } from "@/features/boards/stores/boards";
import { useSettingsStore } from "@/stores/settings";
import { BACKUP_FORMAT, BACKUP_VERSION, type BackupCloudMeta, type BackupEnvelopeV1 } from "./types";
import { prepareBackupEnvelopeForExport } from "./prepareBackupExport";

export function buildBackupEnvelope(
  cloud?: BackupCloudMeta,
  includeOptions = false,
): BackupEnvelopeV1 {
  const combatStore = useCombatStore();
  const boardsStore = useBoardsStore();
  const settingsStore = useSettingsStore();

  const draft: BackupEnvelopeV1 = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      combat: combatStore.exportSnapshot(),
      boards: boardsStore.exportState(),
      settings: settingsStore.exportSettingsForBackup(includeOptions),
    },
  };

  if (cloud) {
    draft.cloud = { slug: cloud.slug, writeToken: cloud.writeToken };
  }

  return prepareBackupEnvelopeForExport(draft, includeOptions);
}

export function downloadBackupEnvelope(envelope: BackupEnvelopeV1): void {
  const date = envelope.exportedAt.slice(0, 10);
  const blob = new Blob([JSON.stringify(envelope, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `icrpg-backup-${date}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
