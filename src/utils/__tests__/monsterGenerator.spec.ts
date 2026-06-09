import { describe, it, expect, vi, afterEach } from "vitest";
import {
  MONSTER_ABILITIES,
  resolveAbilityPick,
  rollUntilDifferent,
} from "../monsterGenerator";

describe("resolveAbilityPick", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("resolves Two Abilities with a second rolled ability", () => {
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0.95) // d20 = 20 → Two Abilities for second roll path
      .mockReturnValueOnce(0); // d20 = 1 → Grappler

    const result = resolveAbilityPick(MONSTER_ABILITIES[19]);
    expect(result).toContain("Two Abilities");
    expect(result).toContain("Grappler");
    expect(result).toContain("|");
  });
});

describe("rollUntilDifferent", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("re-rolls when the first result matches current", () => {
    let n = 0;
    const roll = () => {
      n++;
      return n === 1 ? "same" : "different";
    };
    expect(rollUntilDifferent(roll, "same")).toBe("different");
    expect(n).toBe(2);
  });
});
