import type { BoardsState } from "@/features/boards/types";
import type { CombatState } from "@/types";
import type { SettingsBackupData } from "@/stores/settings";

export const BACKUP_FORMAT = "icrpg-combat-manager-backup" as const;
export const BACKUP_VERSION = 1 as const;

export interface BackupCloudMeta {
  slug: string;
  writeToken: string;
}

export interface BackupEnvelopeV1 {
  format: typeof BACKUP_FORMAT;
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  data: {
    combat: CombatState;
    boards: BoardsState;
    settings: SettingsBackupData;
  };
  cloud?: BackupCloudMeta;
}

export type ParsedBackup = BackupEnvelopeV1;
