import { describe, it, expect } from "vitest";
import {
  buildDrawingMarkdown,
  cleanupOrphanDrawings,
  extractDrawingIds,
  findDrawingRefAtLine,
  findDrawingRefNearCursor,
  DRAWING_REF_PREFIX,
} from "../drawingRefs";
import { createEmptyDrawing } from "../types";

describe("drawingRefs", () => {
  it("builds icrpg-draw markdown token", () => {
    expect(buildDrawingMarkdown("abc123")).toBe("![Sketch](icrpg-draw:abc123)");
    expect(buildDrawingMarkdown("abc123", "Room")).toBe("![Room](icrpg-draw:abc123)");
  });

  it("extracts drawing ids from body", () => {
    const body = "Notes\n\n![A](icrpg-draw:id1)\n\n![B](icrpg-draw:id2)";
    expect(extractDrawingIds(body)).toEqual(["id1", "id2"]);
  });

  it("cleans orphan drawings not referenced in body", () => {
    const doc = createEmptyDrawing();
    const drawings = {
      kept: doc,
      orphan: doc,
    };
    const body = buildDrawingMarkdown("kept");
    const cleaned = cleanupOrphanDrawings(body, drawings);
    expect(cleaned).toEqual({ kept: doc });
  });

  it("returns undefined when all drawings are orphaned", () => {
    const cleaned = cleanupOrphanDrawings("no refs", { orphan: createEmptyDrawing() });
    expect(cleaned).toBeUndefined();
  });

  it("finds drawing ref on cursor line", () => {
    const body = "text\n![Sketch](icrpg-draw:line-id)\nmore";
    expect(findDrawingRefAtLine(body, 1)).toBe("line-id");
    expect(findDrawingRefNearCursor(body, body.indexOf("line-id"))).toBe("line-id");
  });

  it("uses icrpg-draw prefix constant", () => {
    expect(DRAWING_REF_PREFIX).toBe("icrpg-draw:");
  });
});
