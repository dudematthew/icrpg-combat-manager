import { describe, it, expect } from "vitest";
import { findInkStrokeAtPoint, findStrokeAtPoint } from "../hitTest";
import type { DrawingStroke } from "../types";

describe("findStrokeAtPoint", () => {
  it("finds the nearest stroke at a click point", () => {
    const strokes: DrawingStroke[] = [
      {
        id: "far",
        tool: "pen",
        color: "#171717",
        size: 2,
        opacity: 1,
        points: [
          [0.1, 0.1],
          [0.2, 0.2],
        ],
      },
      {
        id: "near",
        tool: "pen",
        color: "#171717",
        size: 2,
        opacity: 1,
        points: [
          [0.5, 0.5],
          [0.6, 0.55],
        ],
      },
    ];

    const hit = findStrokeAtPoint(strokes, 400, 240, 0.55, 0.52);
    expect(hit?.id).toBe("near");
  });
});

describe("findInkStrokeAtPoint", () => {
  it("skips eraser overlays and picks ink beneath", () => {
    const strokes: DrawingStroke[] = [
      {
        id: "ink",
        tool: "pen",
        color: "#171717",
        size: 2,
        opacity: 1,
        points: [
          [0.5, 0.5],
          [0.6, 0.55],
        ],
      },
      {
        id: "cover",
        tool: "eraser",
        color: "#fffef8",
        size: 10,
        opacity: 1,
        points: [
          [0.5, 0.5],
          [0.6, 0.55],
        ],
      },
    ];

    const hit = findInkStrokeAtPoint(strokes, 400, 240, 0.55, 0.52);
    expect(hit?.id).toBe("ink");
  });
});
