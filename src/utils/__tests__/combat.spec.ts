import { describe, it, expect, vi, afterEach } from "vitest";
import {
  getEffortDie,
  heartsToHP,
  hpToHearts,
  makeAttack,
  rollMonsterAttackPreview,
  rollCheckOnly,
  rollEffort,
  presetTargetSummary,
  monsterCheckOutcomes,
  adjustTarget,
  getTierColor,
  getTextColorForBackground,
} from "../combat";

describe("getEffortDie", () => {
  it("maps effort types to die sizes", () => {
    expect(getEffortDie("none")).toBe(0);
    expect(getEffortDie("Basic")).toBe(4);
    expect(getEffortDie("Weapons & Tools")).toBe(6);
    expect(getEffortDie("Guns")).toBe(8);
    expect(getEffortDie("Magic & Energy")).toBe(10);
    expect(getEffortDie("Ultimate")).toBe(12);
    expect(getEffortDie("unknown")).toBe(6);
  });
});

describe("heartsToHP / hpToHearts", () => {
  it("converts between hearts and HP", () => {
    expect(heartsToHP(3)).toBe(30);
    expect(hpToHearts(30)).toBe(3);
    expect(hpToHearts(25)).toBe(3);
    expect(hpToHearts(1)).toBe(1);
  });
});

describe("makeAttack", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("succeeds when total meets target", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5); // d20 = 11
    const result = makeAttack(5, 15, 6);
    expect(result.naturalRoll).toBe(11);
    expect(result.totalRoll).toBe(16);
    expect(result.success).toBe(true);
    expect(result.critical).toBe(false);
  });

  it("fails when total is below target", () => {
    vi.spyOn(Math, "random").mockReturnValue(0); // d20 = 1
    const result = makeAttack(0, 15, 6);
    expect(result.success).toBe(false);
    expect(result.effort).toBeUndefined();
  });

  it("applies hard and easy target modifiers", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5); // d20 = 11, total 11
    expect(makeAttack(0, 10, 0, true, false).targetNumber).toBe(13);
    expect(makeAttack(0, 10, 0, true, false).success).toBe(false);
    expect(makeAttack(0, 10, 0, false, true).targetNumber).toBe(7);
    expect(makeAttack(0, 10, 0, false, true).success).toBe(true);
  });

  it("rolls effort on success and adds critical d12 bonus on nat 20", () => {
    const random = vi.spyOn(Math, "random");
    random.mockReturnValueOnce(0.95); // d20 = 20
    random.mockReturnValueOnce(0.5); // effort d6 = 4
    random.mockReturnValueOnce(0.5); // crit d12 = 7
    const result = makeAttack(0, 10, 6);
    expect(result.critical).toBe(true);
    expect(result.baseEffort).toBe(4);
    expect(result.criticalBonus).toBe(7);
    expect(result.effort).toBe(11);
  });
});

describe("rollCheckOnly", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("hits when total meets adjusted target", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5); // d20 = 11
    const result = rollCheckOnly(5, 15, "normal");
    expect(result.totalRoll).toBe(16);
    expect(result.targetNumber).toBe(15);
    expect(result.hit).toBe(true);
  });

  it("applies difficulty to target only", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5); // total 11
    expect(rollCheckOnly(0, 10, "hard").targetNumber).toBe(13);
    expect(rollCheckOnly(0, 10, "easy").targetNumber).toBe(7);
  });
});

describe("rollEffort", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rolls die plus bonus", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5); // d6 = 4
    expect(rollEffort(6, 2)).toEqual({ die: 6, roll: 4, bonus: 2, total: 6 });
  });
});

describe("monsterCheckOutcomes", () => {
  it("evaluates pass/fail for easy, normal, and hard targets", () => {
    expect(monsterCheckOutcomes(16, 12)).toEqual({ easy: true, normal: true, hard: true });
    expect(monsterCheckOutcomes(14, 12)).toEqual({ easy: true, normal: true, hard: false });
    expect(monsterCheckOutcomes(11, 12)).toEqual({ easy: true, normal: false, hard: false });
    expect(monsterCheckOutcomes(8, 12)).toEqual({ easy: false, normal: false, hard: false });
  });
});

describe("presetTargetSummary", () => {
  it("lists preset TNs beaten at normal difficulty", () => {
    expect(presetTargetSummary(14)).toEqual({ beats: [10, 12], misses: [15, 18] });
    expect(presetTargetSummary(18)).toEqual({ beats: [10, 12, 15, 18], misses: [] });
  });
});

describe("adjustTarget", () => {
  it("shifts base TN by difficulty", () => {
    expect(adjustTarget(15, "easy")).toBe(12);
    expect(adjustTarget(15, "normal")).toBe(15);
    expect(adjustTarget(15, "hard")).toBe(18);
  });
});

describe("rollMonsterAttackPreview", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns one total against easy, normal, and hard targets", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5); // d20 = 11
    const result = rollMonsterAttackPreview(5, 12);
    expect(result.naturalRoll).toBe(11);
    expect(result.totalRoll).toBe(16);
    expect(result.targets).toEqual({ easy: 9, normal: 12, hard: 15 });
  });
});

describe("getTierColor", () => {
  it("returns tier colors", () => {
    expect(getTierColor("I")).toBe("#059669");
    expect(getTierColor("IV")).toBe("#7c2d12");
    expect(getTierColor("unknown")).toBe("#525252");
  });
});

describe("getTextColorForBackground", () => {
  it("returns dark text on light backgrounds and light text on dark", () => {
    expect(getTextColorForBackground("#ffffff")).toBe("#171717");
    expect(getTextColorForBackground("#171717")).toBe("#ffffff");
  });
});
