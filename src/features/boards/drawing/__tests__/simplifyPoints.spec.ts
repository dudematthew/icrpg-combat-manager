import { describe, it, expect } from "vitest";
import { simplifyNormalizedPoints } from "../simplifyPoints";

describe("simplifyNormalizedPoints", () => {
  it("default epsilon keeps more detail than a coarse simplify", () => {
    const curve: [number, number][] = [];
    for (let i = 0; i <= 60; i += 1) {
      curve.push([i / 60, 0.4 + Math.sin(i / 3) * 0.08]);
    }
    const defaultSimplified = simplifyNormalizedPoints(curve);
    const coarse = simplifyNormalizedPoints(curve, 0.01);
    expect(defaultSimplified.length).toBeGreaterThan(coarse.length);
  });
});
