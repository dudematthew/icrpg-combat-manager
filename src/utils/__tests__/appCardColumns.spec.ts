import { describe, it, expect } from "vitest";
import {
  BOARDS_CARD_ID,
  mergeAppCardSections,
  sanitizeAppCards,
  splitAppCardsBySection,
  splitAppCardsForSettings,
  mergeSettingsSections,
  boardsColumnVisible,
  validateSectionMerge,
  pinNotesToBoardsColumn,
  canDragAppCardInSettings,
} from "../appCardColumns";
import type { AppCard } from "@/stores/settings";

const sampleCards = (): AppCard[] =>
  sanitizeAppCards([
    {
      id: "timers",
      name: "Timers",
      description: "",
      enabled: true,
      column: "boards",
    },
    {
      id: BOARDS_CARD_ID,
      name: "Boards",
      description: "",
      enabled: true,
      column: "combat",
    },
    {
      id: "battlefield",
      name: "Battlefield",
      description: "",
      enabled: true,
      column: "boards",
    },
    {
      id: "target",
      name: "Target",
      description: "",
      enabled: true,
      column: "combat",
    },
  ]);

describe("appCardColumns", () => {
  it("pins notes to boards column on sanitize", () => {
    const cards = sampleCards();
    expect(cards.find((c) => c.id === BOARDS_CARD_ID)?.column).toBe("boards");
  });

  it("splits cards by assigned column", () => {
    const { combat, boards } = splitAppCardsBySection(sampleCards());
    expect(combat.map((c) => c.id)).toEqual(["target"]);
    expect(boards.map((c) => c.id)).toEqual(["timers", BOARDS_CARD_ID, "battlefield"]);
  });

  it("shows boards column when notes card is enabled", () => {
    expect(boardsColumnVisible(sampleCards())).toBe(true);
    const notesDisabled = sampleCards().map((c) =>
      c.id === BOARDS_CARD_ID ? { ...c, enabled: false } : c,
    );
    expect(boardsColumnVisible(notesDisabled)).toBe(false);
  });

  it("preserves list order when merging sections", () => {
    const merged = mergeAppCardSections(
      [
        { id: "inspirations", name: "Inspirations", description: "", enabled: true, column: "combat" },
        { id: "target", name: "Target", description: "", enabled: true, column: "combat" },
      ],
      [
        { id: "timers", name: "Timers", description: "", enabled: true, column: "boards" },
        { id: BOARDS_CARD_ID, name: "Boards", description: "", enabled: true, column: "boards" },
      ],
    );
    expect(merged.map((c) => c.id)).toEqual([
      "inspirations",
      "target",
      "timers",
      BOARDS_CARD_ID,
    ]);
  });

  it("rejects notes on combat list", () => {
    const result = validateSectionMerge(
      [{ ...sampleCards()[0], id: BOARDS_CARD_ID, column: "combat" }],
      [],
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("notes-on-combat");
  });

  it("rejects empty combat list", () => {
    const result = validateSectionMerge([], sampleCards().filter((c) => c.column === "boards"));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("combat-empty");
  });

  it("merges sections with column assignment from list membership", () => {
    const merged = mergeAppCardSections(
      [{ ...sampleCards()[0], id: "target", name: "Target", column: "combat" }],
      [{ ...sampleCards()[1], id: BOARDS_CARD_ID, column: "boards" }],
    );
    expect(merged.find((c) => c.id === BOARDS_CARD_ID)?.column).toBe("boards");
    expect(merged.find((c) => c.id === "target")?.column).toBe("combat");
  });

  it("assignColumn keeps notes on boards", () => {
    const notes = pinNotesToBoardsColumn({
      id: BOARDS_CARD_ID,
      name: "Boards",
      description: "",
      enabled: true,
      column: "combat",
    });
    expect(notes.column).toBe("boards");
  });

  it("controls settings drag handles", () => {
    expect(canDragAppCardInSettings(BOARDS_CARD_ID, "boards", 2)).toBe(false);
    expect(canDragAppCardInSettings("timers", "combat", 1)).toBe(false);
    expect(canDragAppCardInSettings("timers", "combat", 2)).toBe(true);
    expect(canDragAppCardInSettings("timers", "boards", 1)).toBe(true);
  });

  it("keeps boards out of settings drag lists and splits above/below pinned", () => {
    const { combat, boardsAbovePinned, boardsBelowPinned, boardsPinned } =
      splitAppCardsForSettings(sampleCards());
    expect(combat.map((c) => c.id)).toEqual(["target"]);
    expect(boardsAbovePinned.map((c) => c.id)).toEqual(["timers"]);
    expect(boardsBelowPinned.map((c) => c.id)).toEqual(["battlefield"]);
    expect(boardsPinned?.id).toBe(BOARDS_CARD_ID);
  });

  it("merges settings sections with cards above and below pinned boards", () => {
    const { combat, boardsAbovePinned, boardsBelowPinned, boardsPinned } =
      splitAppCardsForSettings(sampleCards());
    const merged = mergeSettingsSections(
      combat,
      boardsAbovePinned,
      boardsBelowPinned,
      boardsPinned,
    );
    expect(merged.map((c) => c.id)).toEqual(["target", "timers", BOARDS_CARD_ID, "battlefield"]);
    expect(merged.find((c) => c.id === BOARDS_CARD_ID)?.column).toBe("boards");
    expect(merged.find((c) => c.id === "timers")?.column).toBe("boards");
    expect(merged.some((c) => c.id === BOARDS_CARD_ID && c.column === "combat")).toBe(false);
  });

  it("places moved card below boards when in below list", () => {
    const merged = mergeSettingsSections(
      [{ id: "target", name: "Target", description: "", enabled: true, column: "combat" }],
      [],
      [{ id: "timers", name: "Timers", description: "", enabled: true, column: "boards" }],
      { id: BOARDS_CARD_ID, name: "Boards", description: "", enabled: true, column: "boards" },
    );
    expect(merged.map((c) => c.id)).toEqual(["target", BOARDS_CARD_ID, "timers"]);
  });
});
