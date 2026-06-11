import { describe, it, expect } from "vitest";
import {
  getCardDisplayTitle,
  getCardDisplayNotes,
  getPayloadIdentityName,
  mergeIndexCardUpdates,
} from "../cardDisplay";
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
  it("uses card title for monster payload cards", () => {
    const card = baseCard({
      kind: "monster",
      title: "Boss encounter",
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
    expect(getCardDisplayTitle(card)).toBe("Boss encounter");
    expect(getPayloadIdentityName(card)).toBe("Goblin");
  });

  it("falls back to payload monster name when card title is empty", () => {
    const card = baseCard({
      kind: "monster",
      title: "",
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

describe("mergeIndexCardUpdates", () => {
  it("updates card title without changing payload monster name", () => {
    const card = baseCard({
      kind: "monster",
      title: "Old",
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
    const updated = mergeIndexCardUpdates(card, { title: "Hobgoblin Chief" });
    expect(updated.title).toBe("Hobgoblin Chief");
    expect(updated.payload?.kind === "monster" && updated.payload.data.name).toBe("Goblin");
    expect(getCardDisplayTitle(updated)).toBe("Hobgoblin Chief");
    expect(getPayloadIdentityName(updated)).toBe("Goblin");
  });
});
