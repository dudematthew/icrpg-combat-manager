import { describe, it, expect } from "vitest";
import { appendNormalizedPoint, densifyNormalizedPoints } from "../strokePoints";

describe("strokePoints", () => {
  it("inserts interpolated points across large pointer-move gaps", () => {
    const result = appendNormalizedPoint([[0, 0]], [0.12, 0]);
    expect(result.length).toBeGreaterThan(10);
    expect(result[result.length - 1]).toEqual([0.12, 0]);
  });

  it("ignores micro-movement noise", () => {
    const start: [number, number][] = [[0.5, 0.5]];
    const result = appendNormalizedPoint(start, [0.5001, 0.5001]);
    expect(result).toEqual(start);
  });

  it("densifies an entire stroke on commit", () => {
    const sparse: [number, number][] = [
      [0, 0],
      [0.2, 0],
    ];
    const dense = densifyNormalizedPoints(sparse);
    expect(dense.length).toBeGreaterThan(sparse.length);
    expect(dense[0]).toEqual([0, 0]);
    expect(dense[dense.length - 1]).toEqual([0.2, 0]);
  });
});
