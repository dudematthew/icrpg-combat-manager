import { describe, it, expect } from "vitest";
import { splitCardMarkdown } from "../renderCardMarkdown";
import { createEmptyDrawing } from "../../drawing/types";

describe("splitCardMarkdown", () => {
  it("returns empty array for blank body", () => {
    expect(splitCardMarkdown("")).toEqual([]);
    expect(splitCardMarkdown("   ")).toEqual([]);
  });

  it("returns html segment for text-only markdown", () => {
    const segments = splitCardMarkdown("Hello **world**");
    expect(segments).toHaveLength(1);
    expect(segments[0].type).toBe("html");
    if (segments[0].type === "html") {
      expect(segments[0].content).toContain("<strong>world</strong>");
    }
  });

  it("splits text and drawing refs into segments", () => {
    const body = "Intro\n\n![Map](icrpg-draw:map1)\n\nOutro";
    const segments = splitCardMarkdown(body);

    expect(segments).toHaveLength(3);
    expect(segments[0].type).toBe("html");
    expect(segments[1]).toEqual({ type: "drawing", id: "map1", alt: "Map" });
    expect(segments[2].type).toBe("html");
  });

  it("round-trips drawing data through card shape", () => {
    const drawing = createEmptyDrawing();
    drawing.strokes.push({
      id: "draw-stroke",
      tool: "pen",
      color: "#171717",
      size: 2,
      opacity: 1,
      points: [
        [0.1, 0.2],
        [0.8, 0.7],
      ],
    });

    const card = {
      body: "![Sketch](icrpg-draw:draw-1)",
      drawings: { "draw-1": drawing },
    };

    const segments = splitCardMarkdown(card.body);
    expect(segments).toHaveLength(1);
    expect(segments[0]).toMatchObject({ type: "drawing", id: "draw-1" });
    expect(card.drawings["draw-1"].strokes).toHaveLength(1);
  });
});
