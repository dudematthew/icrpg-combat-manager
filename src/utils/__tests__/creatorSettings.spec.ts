import { describe, it, expect } from "vitest";
import { migrateCreatorSettingsFromLegacy, resolveCreatorSettings } from "../creatorSettings";

describe("creatorSettings migration", () => {
  it("maps legacy fast+tier to quick layout", () => {
    expect(migrateCreatorSettingsFromLegacy(true, true)).toEqual({
      creatorLayout: "quick",
      creatorStatSource: "tier",
    });
  });

  it("maps legacy fast+manual to full layout", () => {
    expect(migrateCreatorSettingsFromLegacy(true, false)).toEqual({
      creatorLayout: "full",
      creatorStatSource: "manual",
    });
  });

  it("maps legacy standard tier combo", () => {
    expect(migrateCreatorSettingsFromLegacy(false, true)).toEqual({
      creatorLayout: "standard",
      creatorStatSource: "tier",
    });
  });

  it("maps legacy full manual combo", () => {
    expect(migrateCreatorSettingsFromLegacy(false, false)).toEqual({
      creatorLayout: "full",
      creatorStatSource: "manual",
    });
  });

  it("prefers new keys when creatorLayout is set", () => {
    expect(
      resolveCreatorSettings({
        creatorLayout: "quick",
        creatorStatSource: "manual",
        fastMode: false,
        tierMode: false,
      }),
    ).toEqual({
      creatorLayout: "quick",
      creatorStatSource: "tier",
    });
  });

  it("falls back to legacy keys when new layout absent", () => {
    expect(
      resolveCreatorSettings({
        fastMode: false,
        tierMode: true,
      }),
    ).toEqual({
      creatorLayout: "standard",
      creatorStatSource: "tier",
    });
  });
});
