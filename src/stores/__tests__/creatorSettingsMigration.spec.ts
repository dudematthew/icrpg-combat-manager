import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useSettingsStore } from "../settings";

describe("settings creator migration", () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  it("migrates legacy flat tierMode and fastMode on load", () => {
    localStorage.setItem(
      "icrpg-settings",
      JSON.stringify({
        appCards: [],
        tierMode: true,
        fastMode: true,
        compactThreshold: 2,
        showTitleCard: true,
        showCreditsCard: true,
        showCompactConditions: false,
        autoTurnIncrement: true,
        showSectionNav: true,
        timerColorModeDefault: true,
        timerNamingMode: "both",
        keepCreatorFieldsOnBoardSave: true,
        boardCardExpandPreview: false,
        defaultNewCardColor: "Yellow",
        scrollOnDeployMode: "always",
        notifications: { timerDone: true, turnAutoIncremented: true, roundEnded: false },
      }),
    );

    const store = useSettingsStore();
    expect(store.creatorLayout).toBe("quick");
    expect(store.creatorStatSource).toBe("tier");
  });

  it("loads new creatorLayout and creatorStatSource directly", () => {
    localStorage.setItem(
      "icrpg-settings",
      JSON.stringify({
        appCards: [],
        creatorLayout: "full",
        creatorStatSource: "manual",
        compactThreshold: 2,
        showTitleCard: true,
        showCreditsCard: true,
        showCompactConditions: false,
        autoTurnIncrement: true,
        showSectionNav: true,
        timerColorModeDefault: true,
        timerNamingMode: "both",
        keepCreatorFieldsOnBoardSave: true,
        boardCardExpandPreview: false,
        defaultNewCardColor: "Yellow",
        scrollOnDeployMode: "always",
        notifications: { timerDone: true, turnAutoIncremented: true, roundEnded: false },
      }),
    );

    const store = useSettingsStore();
    expect(store.creatorLayout).toBe("full");
    expect(store.creatorStatSource).toBe("manual");
  });

  it("downgrades manual stat source when layout is not full", () => {
    localStorage.setItem(
      "icrpg-settings",
      JSON.stringify({
        appCards: [],
        creatorLayout: "standard",
        creatorStatSource: "manual",
        compactThreshold: 2,
        showTitleCard: true,
        showCreditsCard: true,
        showCompactConditions: false,
        autoTurnIncrement: true,
        showSectionNav: true,
        timerColorModeDefault: true,
        timerNamingMode: "both",
        keepCreatorFieldsOnBoardSave: true,
        boardCardExpandPreview: false,
        defaultNewCardColor: "Yellow",
        scrollOnDeployMode: "always",
        notifications: { timerDone: true, turnAutoIncremented: true, roundEnded: false },
      }),
    );

    const store = useSettingsStore();
    expect(store.creatorLayout).toBe("standard");
    expect(store.creatorStatSource).toBe("tier");
  });

  it("resets creator defaults on resetToDefaults", () => {
    const store = useSettingsStore();
    store.setCreatorLayout("quick");
    store.setCreatorStatSource("tier");
    store.resetToDefaults();
    expect(store.creatorLayout).toBe("standard");
    expect(store.creatorStatSource).toBe("tier");
  });
});
