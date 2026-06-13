import { describe, it, expect } from "vitest";
import { createEmptyDrawing, normalizeDrawingDocument, type DrawingStroke } from "../types";
import { hasRenderableDrawing, renderDrawingSvg } from "../strokeRender";

describe("strokeRender", () => {
  it("renders SVG path for a simple stroke", () => {
    const stroke: DrawingStroke = {
      id: "s1",
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

  it("renders fills and labels", () => {
    const doc = {
      ...createEmptyDrawing(),
      fills: [{ id: "f1", color: "#eab308", size: "m" as const, x: 0.5, y: 0.5, opacity: 0.35 }],
      labels: [{ id: "l1", x: 0.5, y: 0.5, text: "A", color: "#171717", size: "m" as const }],
    };
    const svg = renderDrawingSvg(doc);
    expect(svg).toContain("<rect");
    expect(svg).toContain("<text");
    expect(svg).toContain(">A<");
  });

  it("migrates v1 whiteout to eraser", () => {
    const v1 = {
      v: 1 as const,
      width: 400,
      height: 240,
      strokes: [
        {
          tool: "whiteout",
          color: "#fffef8",
          size: 10,
          opacity: 1,
          points: [
            [0, 0],
            [1, 1],
          ],
        },
      ],
    };
    const doc = normalizeDrawingDocument(v1);
    expect(doc.v).toBe(2);
    expect(doc.strokes[0].tool).toBe("eraser");
  });

  it("detects renderable drawings", () => {
    expect(hasRenderableDrawing(undefined)).toBe(false);
    expect(hasRenderableDrawing(createEmptyDrawing())).toBe(false);
    expect(
      hasRenderableDrawing({
        ...createEmptyDrawing(),
        strokes: [
          {
            id: "s1",
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
