import { describe, it, expect, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { applyBackupEnvelope } from "../apply";
import {
  canUpdateActiveCloudBackup,
  clearCloudCredentials,
  getCloudBackupState,
  setCloudCredentials,
} from "../cloudCredentials";
import { parseBackupFile } from "../validate";
import { BACKUP_FORMAT, BACKUP_VERSION, type BackupEnvelopeV1 } from "../types";

const fixturePath = join(dirname(fileURLToPath(import.meta.url)), "../../../../tests/fixtures/icrpg-backup-2026-06-13.json");

describe("applyBackupEnvelope cloud credentials", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    clearCloudCredentials();
    localStorage.clear();
  });

  it("links cloud credentials when backup file includes cloud block", () => {
    const envelope: BackupEnvelopeV1 = {
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      data: {
        combat: { sceneTargetNumber: 12, monsters: [], timers: [], currentTurn: 1, currentRound: 1 },
        boards: {
          boards: [{ id: "b1", name: "Session", createdAt: "2026-01-01T00:00:00.000Z", cardIds: [] }],
          cards: {},
          activeBoardId: "b1",
        },
        settings: {
          appCards: [{ id: "timers", name: "Timers", description: "", enabled: true, column: "combat" }],
        },
      },
      cloud: { slug: "juggly-apple-terminator-cosmos", writeToken: "a".repeat(32) },
    };

    applyBackupEnvelope(envelope);
    expect(canUpdateActiveCloudBackup()).toBe(true);
    expect(getCloudBackupState()?.activeSlug).toBe("juggly-apple-terminator-cosmos");
  });

  it("clears write token when backup file has no cloud block", () => {
    setCloudCredentials({ slug: "juggly-apple-terminator-cosmos", writeToken: "b".repeat(32) });
    const parsed = parseBackupFile(readFileSync(fixturePath, "utf-8"));
    expect(parsed.envelope.cloud).toBeUndefined();

    applyBackupEnvelope(parsed.envelope);
    expect(getCloudBackupState()?.activeSlug).toBe("juggly-apple-terminator-cosmos");
    expect(getCloudBackupState()?.writeToken).toBeUndefined();
    expect(canUpdateActiveCloudBackup()).toBe(false);
  });
});
