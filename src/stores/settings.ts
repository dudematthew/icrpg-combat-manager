import { defineStore } from "pinia";
import { ref } from "vue";

export interface AppCard {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface NotificationSettings {
  timerDone: boolean;
  turnAutoIncremented: boolean;
  roundEnded: boolean;
}

interface LegacyAppCard extends AppCard {
  order?: number;
}

const CARD_IDS = ["timers", "battlefield", "target", "library", "monster-creator", "inspirations"] as const;

export type TimerNamingMode = "both" | "named" | "color";

export const useSettingsStore = defineStore("settings", () => {
  const defaultAppCards: AppCard[] = [
    {
      id: "timers",
      name: "Timers",
      description: "Manage round and turn-based timers",
      enabled: true,
    },
    {
      id: "battlefield",
      name: "Battlefield",
      description: "Combat management and monster tracking",
      enabled: true,
    },
    {
      id: "target",
      name: "Target",
      description: "Scene target numbers and attack rolls",
      enabled: true,
    },
    {
      id: "library",
      name: "Library",
      description: "Saved monster templates for quick deploy",
      enabled: true,
    },
    {
      id: "monster-creator",
      name: "Monster Creator",
      description: "Quick monster creation and management",
      enabled: true,
    },
    {
      id: "inspirations",
      name: "Inspirations",
      description: "NPC and session inspiration rolls",
      enabled: true,
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
  const showCompactConditions = ref(false);
  const autoTurnIncrement = ref(true);
  const showSectionNav = ref(true);
  const timerColorModeDefault = ref(true);
  const timerNamingMode = ref<TimerNamingMode>("both");
  const fastMode = ref(false);
  const keepCreatorFieldsOnLibrarySave = ref(true);
  const notifications = ref<NotificationSettings>({ ...defaultNotifications });

  const migrateAppCards = (saved: LegacyAppCard[] | undefined): AppCard[] => {
    const cleaned = (saved && Array.isArray(saved) ? saved : []).map((card) => ({
      id: card.id,
      name: card.name,
      description: card.description,
      enabled: card.enabled,
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
      keepCreatorFieldsOnLibrarySave.value =
        settings.keepCreatorFieldsOnLibrarySave !== undefined
          ? settings.keepCreatorFieldsOnLibrarySave
          : true;

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
      showCompactConditions: showCompactConditions.value,
      autoTurnIncrement: autoTurnIncrement.value,
      showSectionNav: showSectionNav.value,
      timerColorModeDefault: timerColorModeDefault.value,
      timerNamingMode: timerNamingMode.value,
      fastMode: fastMode.value,
      keepCreatorFieldsOnLibrarySave: keepCreatorFieldsOnLibrarySave.value,
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

  const getVisibleCards = () => appCards.value.filter((card) => card.enabled);

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
    showCompactConditions.value = false;
    autoTurnIncrement.value = true;
    showSectionNav.value = true;
    timerColorModeDefault.value = true;
    timerNamingMode.value = "both";
    fastMode.value = false;
    keepCreatorFieldsOnLibrarySave.value = true;
    notifications.value = { ...defaultNotifications };
    saveSettings();
  };

  return {
    appCards,
    tierMode,
    compactThreshold,
    showTitleCard,
    showCompactConditions,
    autoTurnIncrement,
    showSectionNav,
    timerColorModeDefault,
    timerNamingMode,
    fastMode,
    keepCreatorFieldsOnLibrarySave,
    notifications,
    toggleCard,
    toggleTierMode,
    updateCompactThreshold,
    toggleTitleCard,
    toggleCompactConditions,
    toggleAutoTurnIncrement,
    toggleSectionNav,
    toggleTimerColorModeDefault,
    setTimerNamingMode,
    toggleFastMode,
    toggleTimerDoneNotification,
    toggleTurnAutoIncrementedNotification,
    toggleRoundEndedNotification,
    reorderCards,
    getVisibleCards,
    resetToDefaults,
  };
});
