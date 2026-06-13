import { describe, it, expect } from "vitest";
import { BACKUP_FORMAT, BACKUP_VERSION, type BackupEnvelopeV1 } from "../types";
import {
  normalizeBoardsState,
  normalizeCombatState,
  normalizeSettingsBackup,
  prepareBackupEnvelopeForExport,
} from "../prepareBackupExport";
import { parseBackupEnvelope } from "../validate";

describe("prepareBackupExport", () => {
  it("converts legacy inspiration cards and empty cards array for export", () => {
    const boards = normalizeBoardsState({
      boards: [{ id: "b1", name: "Session", createdAt: "2024-01-01T00:00:00.000Z", cardIds: ["c1"] }],
      cards: [],
      activeBoardId: "b1",
    });

    expect(boards.cards).toEqual({});

    const migrated = normalizeBoardsState({
      boards: [{ id: "b1", name: "Session", createdAt: "2024-01-01T00:00:00.000Z", cardIds: ["c1"] }],
      cards: {
        c1: {
          id: "c1",
          boardId: "b1",
          kind: "inspiration",
          color: "Purple",
          title: "Inspiration",
          body: "",
          collapsed: true,
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
          payload: { v: 1, kind: "inspiration", data: { category: "Job", text: "Blacksmith" } },
        },
      },
      activeBoardId: "b1",
    });

    expect(migrated.cards.c1.kind).toBe("text");
    expect(migrated.cards.c1.title).toBe("Job");
    expect(migrated.cards.c1.body).toBe("Blacksmith");
    expect(migrated.cards.c1.payload).toBeUndefined();
  });

  it("fills missing combat fields with defaults", () => {
    const combat = normalizeCombatState({ sceneTargetNumber: 15 });
    expect(combat.monsters).toEqual([]);
    expect(combat.timers).toEqual([]);
    expect(combat.currentTurn).toBe(1);
    expect(combat.currentRound).toBe(1);
    expect(combat.sceneTargetNumber).toBe(15);
  });

  it("migrates legacy flat settings into nested options on export", () => {
    const settings = normalizeSettingsBackup(
      {
        appCards: [{ id: "timers", name: "Timers", description: "", enabled: true, column: "combat" }],
        tierMode: true,
        fastMode: false,
        compactThreshold: 3,
        showTitleCard: false,
        showCreditsCard: true,
        showCompactConditions: false,
        autoTurnIncrement: true,
        showSectionNav: true,
        timerColorModeDefault: true,
        timerNamingMode: "both",
        keepCreatorFieldsOnBoardSave: true,
        boardCardExpandPreview: false,
        defaultNewCardColor: "Blue",
        scrollOnDeployMode: "always",
        notifications: { timerDone: true, turnAutoIncremented: false, roundEnded: false },
      },
      true,
    );

    expect(settings.options?.creatorLayout).toBe("standard");
    expect(settings.options?.creatorStatSource).toBe("tier");
    expect(settings.options?.compactThreshold).toBe(3);
    expect(settings.options?.defaultNewCardColor).toBe("Blue");
  });

  it("returns an envelope that passes backup validation", () => {
    const broken: BackupEnvelopeV1 = {
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      exportedAt: "2026-06-09T12:00:00.000Z",
      data: {
        combat: { sceneTargetNumber: 12 } as BackupEnvelopeV1["data"]["combat"],
        boards: {
          boards: [{ id: "b1", name: "Session", createdAt: "2024-01-01T00:00:00.000Z", cardIds: [] }],
          cards: [] as unknown as BackupEnvelopeV1["data"]["boards"]["cards"],
          activeBoardId: "b1",
        },
        settings: { appCards: [] },
      },
    };

    const prepared = prepareBackupEnvelopeForExport(broken, false);
    expect(() => parseBackupEnvelope(prepared)).not.toThrow();
    expect(prepared.data.boards.cards).toEqual({});
    expect(Array.isArray(prepared.data.combat.monsters)).toBe(true);
    expect(prepared.data.settings.appCards.length).toBeGreaterThan(0);
  });
});
