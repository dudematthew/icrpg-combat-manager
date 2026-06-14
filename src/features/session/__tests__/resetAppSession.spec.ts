import { describe, it, expect, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { resetAppSession } from "../resetAppSession";
import { applyBackupEnvelope } from "@/features/backup/apply";
import {
  canUpdateActiveCloudBackup,
  clearCloudCredentials,
  getCloudBackupState,
  setCloudCredentials,
} from "@/features/backup/cloudCredentials";
import { parseBackupFile } from "@/features/backup/validate";
import { useCombatStore } from "@/stores/combat";
import { useBoardsStore } from "@/features/boards/stores/boards";
import { useSettingsStore } from "@/stores/settings";

const fixturePath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../../tests/fixtures/icrpg-backup-2026-06-13.json",
);

describe("resetAppSession", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    clearCloudCredentials();
    localStorage.clear();
    sessionStorage.clear();
  });

  it("clears loaded backup data, settings, and cloud association", () => {
    const parsed = parseBackupFile(readFileSync(fixturePath, "utf-8"));
    applyBackupEnvelope(parsed.envelope);
    setCloudCredentials({ slug: "honey-quiet-berry-tiger", writeToken: "c".repeat(32) });
    sessionStorage.setItem("icrpg-active-column", "1");
    sessionStorage.setItem("icrpg-last-target-tn", "18");

    expect(useBoardsStore().boards.length).toBeGreaterThan(1);
    expect(canUpdateActiveCloudBackup()).toBe(true);

    resetAppSession();

    const combatStore = useCombatStore();
    const boardsStore = useBoardsStore();
    const settingsStore = useSettingsStore();

    expect(combatStore.monsters).toEqual([]);
    expect(combatStore.timers).toEqual([]);
    expect(combatStore.sceneTargetNumber).toBe(12);
    expect(boardsStore.cardsForActiveBoard).toEqual([]);
    expect(boardsStore.boards).toHaveLength(1);
    expect(boardsStore.boards[0]?.name).toBe("Session");
    expect(settingsStore.showSectionNav).toBe(true);
    expect(getCloudBackupState()).toBeNull();
    expect(sessionStorage.getItem("icrpg-active-column")).toBeNull();
    expect(sessionStorage.getItem("icrpg-last-target-tn")).toBeNull();
  });
});
