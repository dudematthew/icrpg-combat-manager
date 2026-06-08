import { describe, it, expect } from "vitest";
import { generateMonsterName, getAllMonsterNames, getMonsterNameCount } from "../monsterNameGenerator";

describe("monsterNameGenerator", () => {
  it("returns a non-empty name from the table", () => {
    const name = generateMonsterName();
    expect(name.length).toBeGreaterThan(0);
    expect(getAllMonsterNames()).toContain(name);
  });

  it("reports the name table size", () => {
    expect(getMonsterNameCount()).toBe(getAllMonsterNames().length);
    expect(getMonsterNameCount()).toBeGreaterThan(0);
  });
});
