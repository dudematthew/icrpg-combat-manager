import { describe, it, expect, vi, afterEach } from "vitest";
import {
  rollTheIdea,
  formatTheIdea,
  rollName,
  rollJob,
  rollFullNpc,
  getCategoryOptions,
} from "../inspirationRoll";
import theIdea from "@/data/inspiration/theIdea.json";
import jobs from "@/data/inspiration/jobs.json";
import nameParts from "@/data/inspiration/nameParts.json";

describe("inspirationRoll", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rollTheIdea returns a row within table bounds", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const row = rollTheIdea();
    expect(theIdea).toContainEqual(row);
    expect(row.adjective).toBeTruthy();
    expect(row.motivatedBy).toBeTruthy();
  });

  it("formatTheIdea concatenates all columns", () => {
    const formatted = formatTheIdea({
      adjective: "Bold",
      background: "Noble",
      type: "Paladin",
      motivatedBy: "honor",
    });
    expect(formatted).toBe("Bold Noble Paladin, motivated by honor");
  });

  it("rollName joins prefix and suffix", () => {
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0);
    const name = rollName();
    const parts = nameParts as { prefixes: string[]; suffixes: string[] };
    expect(name).toBe(`${parts.prefixes[0]}${parts.suffixes[0]}`);
  });

  it("rollJob picks from jobs table", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const job = rollJob();
    expect(jobs).toContain(job);
  });

  it("rollFullNpc includes name, idea, and quirk lines", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const result = rollFullNpc();
    const lines = result.split("\n");
    expect(lines.length).toBeGreaterThanOrEqual(3);
    expect(lines[2]).toMatch(/^Quirk: /);
  });

  it("getCategoryOptions returns non-empty lists for d100 categories", () => {
    expect(getCategoryOptions("job").length).toBeGreaterThan(0);
    expect(getCategoryOptions("hook").length).toBe(20);
  });
});
