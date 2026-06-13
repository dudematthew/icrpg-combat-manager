import { describe, it, expect } from "vitest";
import { buildBoardNotesPlainText } from "../exportBoardNotes";
import type { IndexCard } from "../../types";

const textCard = (overrides: Partial<IndexCard>): IndexCard => ({
  id: "c1",
  boardId: "b1",
  kind: "text",
  title: "Room 3",
  color: "Yellow",
  body: "A dusty hall.\n\n![Sketch](icrpg-draw:abc)",
  collapsed: false,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

describe("buildBoardNotesPlainText", () => {
  it("joins cards with title headers and separators", () => {
    const text = buildBoardNotesPlainText([
      textCard({ id: "c1", title: "Room 3", body: "Hall notes" }),
      textCard({ id: "c2", title: "Trap", body: "Spikes" }),
    ]);
    expect(text).toContain("## Room 3");
    expect(text).toContain("Hall notes");
    expect(text).toContain("---");
    expect(text).toContain("## Trap");
  });

  it("strips drawing and image markdown lines", () => {
    const text = buildBoardNotesPlainText([
      textCard({
        body: "Notes here\n\n![Sketch](icrpg-draw:abc)\n\n![map](https://example.com/map.png)",
      }),
    ]);
    expect(text).toContain("Notes here");
    expect(text).not.toContain("icrpg-draw");
    expect(text).not.toContain("example.com");
  });
});
