import { describe, it, expect } from "vitest";
import { getCardDisplayTitle, getCardDisplayNotes } from "../cardDisplay";
import type { IndexCard } from "../../types";

const baseCard = (overrides: Partial<IndexCard>): IndexCard => ({
  id: "1",
  boardId: "b1",
  kind: "text",
  color: "Yellow",
  title: "Title",
  body: "",
  collapsed: true,
  createdAt: "",
  updatedAt: "",
  ...overrides,
});

describe("getCardDisplayTitle", () => {
  it("uses monster name from payload", () => {
    const card = baseCard({
      kind: "monster",
      title: "Stale title",
      payload: {
        v: 1,
        kind: "monster",
        data: {
          color: "Red",
          tier: "II",
          heartsMax: 2,
          statsBonus: 4,
          effortBonus: 0,
          actions: 1,
          conditions: [],
          notes: "",
          name: "Goblin",
        },
      },
    });
    expect(getCardDisplayTitle(card)).toBe("Goblin");
  });

  it("uses NPC name for legacy Full NPC cards", () => {
    const card = baseCard({
      title: "Full NPC",
      body: "Aldric\nIdea line\nQuirk: shy",
    });
    expect(getCardDisplayTitle(card)).toBe("Aldric");
    expect(getCardDisplayNotes(card)).toBe("Idea line\nQuirk: shy");
  });
});
