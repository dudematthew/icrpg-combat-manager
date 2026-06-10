import { defineStore } from "pinia";
import { ref } from "vue";

export type AppColumn = "combat" | "boards";

export interface AppCard {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  column: AppColumn;
}

export interface NotificationSettings {
  timerDone: boolean;
  turnAutoIncremented: boolean;
  roundEnded: boolean;
}

interface LegacyAppCard extends Omit<AppCard, "column"> {
  order?: number;
  column?: AppColumn;
}

const CARD_IDS = ["timers", "battlefield", "target", "monster-creator", "inspirations", "notes"] as const;

export type TimerNamingMode = "both" | "named" | "color";

export const useSettingsStore = defineStore("settings", () => {
  const defaultAppCards: AppCard[] = [
    {
      id: "timers",
      name: "Timers",
      description: "Manage round and turn-based timers",
      enabled: true,
      column: "combat",
    },
    {
      id: "battlefield",
      name: "Battlefield",
      description: "Combat management and monster tracking",
      enabled: true,
      column: "combat",
    },
    {
      id: "target",
      name: "Target",
      description: "Scene target numbers and attack rolls",
      enabled: true,
      column: "combat",
    },
    {
      id: "monster-creator",
      name: "Monster Creator",
      description: "Quick monster creation and management",
      enabled: true,
      column: "combat",
    },
    {
      id: "inspirations",
      name: "Inspirations",
      description: "NPC and session inspiration rolls",
      enabled: true,
      column: "combat",
    },
    {
      id: "notes",
      name: "Boards",
      description: "ICRPG index-card boards and session stash",
      enabled: true,
      column: "boards",
    },
  ];

  const defaultNotifications: NotificationSettings = {
    timerDone: true,
    turnAutoIncremented: true,
    roundEnded: false,
  };

  const appCards = ref<AppCard[]>([]);
  const tierMode = ref(true);
  const compactThreshold = ref(2);
  const showTitleCard = ref(true);
  const showCreditsCard = ref(true);
  const showCompactConditions = ref(false);
  const autoTurnIncrement = ref(true);
  const showSectionNav = ref(true);
  const timerColorModeDefault = ref(true);
  const timerNamingMode = ref<TimerNamingMode>("both");
  const fastMode = ref(false);
  const keepCreatorFieldsOnBoardSave = ref(true);
  const boardCardExpandPreview = ref(false);
  const defaultNewCardColor = ref("Yellow");
  const notifications = ref<NotificationSettings>({ ...defaultNotifications });

  const migrateAppCards = (saved: LegacyAppCard[] | undefined): AppCard[] => {
    const cleaned = (saved && Array.isArray(saved) ? saved : [])
      .filter((card) => card.id !== "library")
      .map((card) => ({
        id: card.id,
        name: card.name,
        description: card.description,
        enabled: card.enabled,
        column: (card.column === "boards" ? "boards" : "combat") as AppColumn,
      }));

    const knownIds = new Set(cleaned.map((c) => c.id));
    const defaultsById = Object.fromEntries(defaultAppCards.map((c) => [c.id, c]));

    for (const id of CARD_IDS) {
      if (!knownIds.has(id)) {
        cleaned.push({ ...defaultsById[id] });
      }
    }

    const orderIndex = Object.fromEntries(CARD_IDS.map((id, i) => [id, i]));
    return cleaned.sort((a, b) => (orderIndex[a.id] ?? 99) - (orderIndex[b.id] ?? 99));
  };

  const loadSettings = () => {
    const saved = localStorage.getItem("icrpg-settings");
    if (saved) {
      const settings = JSON.parse(saved);
      appCards.value = migrateAppCards(settings.appCards);
      tierMode.value = settings.tierMode !== undefined ? settings.tierMode : true;
      compactThreshold.value =
        settings.compactThreshold !== undefined ? settings.compactThreshold : 2;
      showTitleCard.value = settings.showTitleCard !== undefined ? settings.showTitleCard : true;
      showCreditsCard.value =
        settings.showCreditsCard !== undefined ? settings.showCreditsCard : true;
      showCompactConditions.value =
        settings.showCompactConditions !== undefined ? settings.showCompactConditions : false;
      autoTurnIncrement.value =
        settings.autoTurnIncrement !== undefined ? settings.autoTurnIncrement : true;
      showSectionNav.value =
        settings.showSectionNav !== undefined ? settings.showSectionNav : true;
      timerColorModeDefault.value =
        settings.timerColorModeDefault !== undefined ? settings.timerColorModeDefault : true;
      timerNamingMode.value =
        settings.timerNamingMode === "named" ||
        settings.timerNamingMode === "color" ||
        settings.timerNamingMode === "both"
          ? settings.timerNamingMode
          : "both";
      fastMode.value = settings.fastMode !== undefined ? settings.fastMode : false;
      keepCreatorFieldsOnBoardSave.value =
        settings.keepCreatorFieldsOnBoardSave !== undefined
          ? settings.keepCreatorFieldsOnBoardSave
          : settings.keepCreatorFieldsOnLibrarySave !== undefined
            ? settings.keepCreatorFieldsOnLibrarySave
            : true;
      boardCardExpandPreview.value =
        settings.boardCardExpandPreview !== undefined ? settings.boardCardExpandPreview : false;
      defaultNewCardColor.value =
        settings.defaultNewCardColor !== undefined ? settings.defaultNewCardColor : "Yellow";

      if (settings.notifications) {
        notifications.value = {
          timerDone:
            settings.notifications.timerDone !== undefined
              ? settings.notifications.timerDone
              : defaultNotifications.timerDone,
          turnAutoIncremented:
            settings.notifications.turnAutoIncremented !== undefined
              ? settings.notifications.turnAutoIncremented
              : defaultNotifications.turnAutoIncremented,
          roundEnded:
            settings.notifications.roundEnded !== undefined
              ? settings.notifications.roundEnded
              : defaultNotifications.roundEnded,
        };
      } else {
        notifications.value = { ...defaultNotifications };
      }
    } else {
      appCards.value = [...defaultAppCards];
      notifications.value = { ...defaultNotifications };
    }
  };

  const saveSettings = () => {
    const settings = {
      appCards: appCards.value,
      tierMode: tierMode.value,
      compactThreshold: compactThreshold.value,
      showTitleCard: showTitleCard.value,
      showCreditsCard: showCreditsCard.value,
      showCompactConditions: showCompactConditions.value,
      autoTurnIncrement: autoTurnIncrement.value,
      showSectionNav: showSectionNav.value,
      timerColorModeDefault: timerColorModeDefault.value,
      timerNamingMode: timerNamingMode.value,
      fastMode: fastMode.value,
      keepCreatorFieldsOnBoardSave: keepCreatorFieldsOnBoardSave.value,
      boardCardExpandPreview: boardCardExpandPreview.value,
      defaultNewCardColor: defaultNewCardColor.value,
      notifications: notifications.value,
    };
    localStorage.setItem("icrpg-settings", JSON.stringify(settings));
  };

  loadSettings();

  const toggleCard = (cardId: string) => {
    const card = appCards.value.find((c) => c.id === cardId);
    if (card) {
      card.enabled = !card.enabled;

      if (cardId === "battlefield" && !card.enabled) {
        const monsterCreator = appCards.value.find((c) => c.id === "monster-creator");
        if (monsterCreator) monsterCreator.enabled = false;
      }
      if (cardId === "monster-creator" && !card.enabled) {
        const battlefield = appCards.value.find((c) => c.id === "battlefield");
        if (battlefield) battlefield.enabled = false;
      }

      saveSettings();
    }
  };

  const reorderCards = (newOrder: AppCard[]) => {
    appCards.value = [...newOrder];
    saveSettings();
  };

  const setCardColumn = (cardId: string, column: AppColumn) => {
    const card = appCards.value.find((c) => c.id === cardId);
    if (card) {
      card.column = column;
      saveSettings();
    }
  };

  const getVisibleCards = (column?: AppColumn) => {
    const visible = appCards.value.filter((card) => card.enabled);
    if (!column) return visible;
    return visible.filter((card) => card.column === column);
  };

  const getCardsForColumn = (column: AppColumn) => appCards.value.filter((c) => c.column === column);

  const toggleTierMode = () => {
    tierMode.value = !tierMode.value;
    saveSettings();
  };

  const updateCompactThreshold = (threshold: number) => {
    compactThreshold.value = Math.max(1, threshold);
    saveSettings();
  };

  const toggleTitleCard = () => {
    showTitleCard.value = !showTitleCard.value;
    saveSettings();
  };

  const toggleCreditsCard = () => {
    showCreditsCard.value = !showCreditsCard.value;
    saveSettings();
  };

  const toggleCompactConditions = () => {
    showCompactConditions.value = !showCompactConditions.value;
    saveSettings();
  };

  const toggleAutoTurnIncrement = () => {
    autoTurnIncrement.value = !autoTurnIncrement.value;
    saveSettings();
  };

  const toggleSectionNav = () => {
    showSectionNav.value = !showSectionNav.value;
    saveSettings();
  };

  const setTimerNamingMode = (mode: TimerNamingMode) => {
    timerNamingMode.value = mode;
    saveSettings();
  };

  const toggleTimerColorModeDefault = () => {
    timerColorModeDefault.value = !timerColorModeDefault.value;
    saveSettings();
  };

  const toggleFastMode = () => {
    fastMode.value = !fastMode.value;
    saveSettings();
  };

  const toggleBoardCardExpandPreview = () => {
    boardCardExpandPreview.value = !boardCardExpandPreview.value;
    saveSettings();
  };

  const setDefaultNewCardColor = (color: string) => {
    defaultNewCardColor.value = color;
    saveSettings();
  };

  const toggleTimerDoneNotification = () => {
    notifications.value.timerDone = !notifications.value.timerDone;
    saveSettings();
  };

  const toggleTurnAutoIncrementedNotification = () => {
    notifications.value.turnAutoIncremented = !notifications.value.turnAutoIncremented;
    saveSettings();
  };

  const toggleRoundEndedNotification = () => {
    notifications.value.roundEnded = !notifications.value.roundEnded;
    saveSettings();
  };

  const resetToDefaults = () => {
    appCards.value = [...defaultAppCards];
    tierMode.value = true;
    compactThreshold.value = 2;
    showTitleCard.value = true;
    showCreditsCard.value = true;
    showCompactConditions.value = false;
    autoTurnIncrement.value = true;
    showSectionNav.value = true;
    timerColorModeDefault.value = true;
    timerNamingMode.value = "both";
    fastMode.value = false;
    keepCreatorFieldsOnBoardSave.value = true;
    boardCardExpandPreview.value = false;
    defaultNewCardColor.value = "Yellow";
    notifications.value = { ...defaultNotifications };
    saveSettings();
  };

  return {
    appCards,
    tierMode,
    compactThreshold,
    showTitleCard,
    showCreditsCard,
    showCompactConditions,
    autoTurnIncrement,
    showSectionNav,
    timerColorModeDefault,
    timerNamingMode,
    fastMode,
    keepCreatorFieldsOnBoardSave,
    boardCardExpandPreview,
    defaultNewCardColor,
    notifications,
    toggleCard,
    toggleTierMode,
    updateCompactThreshold,
    toggleTitleCard,
    toggleCreditsCard,
    toggleCompactConditions,
    toggleAutoTurnIncrement,
    toggleSectionNav,
    toggleTimerColorModeDefault,
    setTimerNamingMode,
    toggleFastMode,
    toggleBoardCardExpandPreview,
    setDefaultNewCardColor,
    toggleTimerDoneNotification,
    toggleTurnAutoIncrementedNotification,
    toggleRoundEndedNotification,
    reorderCards,
    setCardColumn,
    getVisibleCards,
    getCardsForColumn,
    resetToDefaults,
  };
});
