import { describe, it, expect } from "vitest";
import { createEmptyDrawing, type DrawingStroke } from "../types";
import { hasRenderableDrawing, renderDrawingSvg } from "../strokeRender";

describe("strokeRender", () => {
  it("renders SVG path for a simple stroke", () => {
    const stroke: DrawingStroke = {
      tool: "pen",
      color: "#171717",
      size: 2,
      opacity: 1,
      points: [
        [0.1, 0.1],
        [0.5, 0.5],
        [0.9, 0.2],
      ],
    };
    const doc = { ...createEmptyDrawing(), strokes: [stroke] };
    const svg = renderDrawingSvg(doc);

    expect(svg).toContain("<svg");
    expect(svg).toContain('viewBox="0 0 400 240"');
    expect(svg).toContain("<path");
    expect(svg).toContain('fill="#171717"');
  });

  it("detects renderable drawings", () => {
    expect(hasRenderableDrawing(undefined)).toBe(false);
    expect(hasRenderableDrawing(createEmptyDrawing())).toBe(false);
    expect(
      hasRenderableDrawing({
        ...createEmptyDrawing(),
        strokes: [
          {
            tool: "pen",
            color: "#171717",
            size: 2,
            opacity: 1,
            points: [[0, 0], [1, 1]],
          },
        ],
      }),
    ).toBe(true);
  });
});
