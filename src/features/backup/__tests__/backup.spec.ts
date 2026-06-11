import { describe, it, expect } from "vitest";
import { parseBackupEnvelope, parseBackupJson, isValidCloudSlug, stripCloudMeta } from "../validate";
import { BACKUP_FORMAT, BACKUP_VERSION, type BackupEnvelopeV1 } from "../types";

const fixtureEnvelope = (): BackupEnvelopeV1 => ({
  format: BACKUP_FORMAT,
  version: BACKUP_VERSION,
  exportedAt: "2026-06-09T12:00:00.000Z",
  data: {
    combat: {
      sceneTargetNumber: 12,
      monsters: [],
      timers: [],
      currentTurn: 1,
      currentRound: 1,
    },
    boards: {
      boards: [{ id: "b1", name: "Session", createdAt: "2026-01-01T00:00:00.000Z", cardIds: [] }],
      cards: {},
      activeBoardId: "b1",
    },
    settings: {
      appCards: [
        {
          id: "timers",
          name: "Timers",
          description: "",
          enabled: true,
          column: "combat",
        },
      ],
      tierMode: true,
      compactThreshold: 2,
      showTitleCard: true,
      showCreditsCard: true,
      showCompactConditions: false,
      autoTurnIncrement: true,
      showSectionNav: true,
      timerColorModeDefault: true,
      timerNamingMode: "both",
      fastMode: false,
      keepCreatorFieldsOnBoardSave: true,
      boardCardExpandPreview: false,
      defaultNewCardColor: "Yellow",
      notifications: { timerDone: true, turnAutoIncremented: true, roundEnded: false },
    },
  },
});

describe("backup validate", () => {
  it("parses a valid envelope", () => {
    const parsed = parseBackupEnvelope(fixtureEnvelope());
    expect(parsed.format).toBe(BACKUP_FORMAT);
    expect(parsed.data.boards.activeBoardId).toBe("b1");
  });

  it("round-trips JSON", () => {
    const json = JSON.stringify(fixtureEnvelope());
    const parsed = parseBackupJson(json);
    expect(parsed.exportedAt).toBe("2026-06-09T12:00:00.000Z");
  });

  it("rejects wrong format", () => {
    expect(() => parseBackupEnvelope({ ...fixtureEnvelope(), format: "other" })).toThrow();
  });

  it("rejects wrong version", () => {
    expect(() => parseBackupEnvelope({ ...fixtureEnvelope(), version: 99 })).toThrow();
  });

  it("validates cloud slug pattern", () => {
    expect(isValidCloudSlug("juggly-apple-terminator-cosmos")).toBe(true);
    expect(isValidCloudSlug("bad slug")).toBe(false);
  });

  it("normalizes empty cards array from PHP round-trip", () => {
    const withEmptyCardsArray = {
      ...fixtureEnvelope(),
      data: {
        ...fixtureEnvelope().data,
        boards: { ...fixtureEnvelope().data.boards, cards: [] as unknown as Record<string, never> },
      },
    };
    const parsed = parseBackupEnvelope(withEmptyCardsArray);
    expect(parsed.data.boards.cards).toEqual({});
  });

  it("strips cloud metadata for server upload", () => {
    const stripped = stripCloudMeta({
      ...fixtureEnvelope(),
      cloud: { slug: "juggly-apple-terminator-cosmos", writeToken: "a".repeat(32) },
    });
    expect(stripped.cloud).toBeUndefined();
  });
});
