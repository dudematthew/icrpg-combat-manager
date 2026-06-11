export type CreatorLayout = "quick" | "standard" | "full";
export type CreatorStatSource = "tier" | "manual";

export function migrateCreatorSettingsFromLegacy(
  fastMode: boolean,
  tierMode: boolean,
): { creatorLayout: CreatorLayout; creatorStatSource: CreatorStatSource } {
  if (fastMode && tierMode) return { creatorLayout: "quick", creatorStatSource: "tier" };
  if (fastMode && !tierMode) return { creatorLayout: "full", creatorStatSource: "manual" };
  if (!fastMode && tierMode) return { creatorLayout: "standard", creatorStatSource: "tier" };
  return { creatorLayout: "full", creatorStatSource: "manual" };
}

export function resolveCreatorSettings(input: {
  creatorLayout?: CreatorLayout;
  creatorStatSource?: CreatorStatSource;
  fastMode?: boolean;
  tierMode?: boolean;
}): { creatorLayout: CreatorLayout; creatorStatSource: CreatorStatSource } {
  const hasNewLayout =
    input.creatorLayout === "quick" ||
    input.creatorLayout === "standard" ||
    input.creatorLayout === "full";

  if (hasNewLayout) {
    let statSource: CreatorStatSource =
      input.creatorStatSource === "manual" ? "manual" : "tier";
    const layout = input.creatorLayout!;
    if (layout !== "full" && statSource === "manual") {
      statSource = "tier";
    }
    return { creatorLayout: layout, creatorStatSource: statSource };
  }

  return migrateCreatorSettingsFromLegacy(input.fastMode ?? false, input.tierMode ?? true);
}
