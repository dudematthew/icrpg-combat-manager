import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useBoardsStore } from "../boards";
import type { MonsterTemplate } from "@/types";

describe("library migration", () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  it("migrates monster library templates to Stash board cards", () => {
    const templates: MonsterTemplate[] = [
      {
        color: "Green",
        tier: "I",
        heartsMax: 1,
        statsBonus: 2,
        effortBonus: 0,
        actions: 1,
        conditions: [],
        notes: "scary",
        name: "Zombie",
        label: "Green Zombie",
        savedAt: "2024-06-01T00:00:00.000Z",
      },
    ];
    localStorage.setItem("icrpg-monster-library", JSON.stringify(templates));

    const boardsStore = useBoardsStore();

    expect(boardsStore.boards).toHaveLength(1);
    expect(boardsStore.boards[0].name).toBe("Stash");
    expect(boardsStore.cardsForActiveBoard).toHaveLength(1);
    expect(boardsStore.cardsForActiveBoard[0].kind).toBe("monster");
    expect(boardsStore.cardsForActiveBoard[0].title).toBe("Green Zombie");
    expect(boardsStore.cardsForActiveBoard[0].payload?.kind).toBe("monster");
    expect(localStorage.getItem("icrpg-monster-library")).toBeNull();
  });
});
