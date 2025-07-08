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

// Legacy interface for backward compatibility with old localStorage data
interface LegacyAppCard extends AppCard {
  order?: number;
}

export const useSettingsStore = defineStore("settings", () => {
  // Default app cards configuration (order is based on array index)
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
      id: "monster-creator",
      name: "Monster Creator",
      description: "Quick monster creation and management",
      enabled: true,
    },
  ];

  // Default notification settings
  const defaultNotifications: NotificationSettings = {
    timerDone: true,
    turnAutoIncremented: true,
    roundEnded: false,
  };

  const appCards = ref<AppCard[]>([]);
  const tierMode = ref(true); // true = tier mode, false = manual mode
  const compactThreshold = ref(2); // Number of monsters before switching to compact view
  const showTitleCard = ref(true); // Whether to show the title card at the top
  const showCompactConditions = ref(false); // Whether to show condition pills in compact view
  const autoTurnIncrement = ref(true); // Whether to auto-increment turn when all monsters are done
  const notifications = ref<NotificationSettings>({ ...defaultNotifications });

  // Load settings from localStorage
  const loadSettings = () => {
    const saved = localStorage.getItem("icrpg-settings");
    if (saved) {
      const settings = JSON.parse(saved);

      // Handle appCards - clean up any old order properties and ensure proper array
      if (settings.appCards && Array.isArray(settings.appCards)) {
        appCards.value = settings.appCards.map((card: LegacyAppCard) => ({
          id: card.id,
          name: card.name,
          description: card.description,
          enabled: card.enabled,
        }));
      } else {
        appCards.value = [...defaultAppCards];
      }

      tierMode.value = settings.tierMode !== undefined ? settings.tierMode : true;
      compactThreshold.value =
        settings.compactThreshold !== undefined ? settings.compactThreshold : 2;
      showTitleCard.value = settings.showTitleCard !== undefined ? settings.showTitleCard : true;
      showCompactConditions.value =
        settings.showCompactConditions !== undefined ? settings.showCompactConditions : false;
      autoTurnIncrement.value =
        settings.autoTurnIncrement !== undefined ? settings.autoTurnIncrement : true;

      // Handle notifications settings
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
      tierMode.value = true;
      compactThreshold.value = 2;
      showTitleCard.value = true;
      showCompactConditions.value = false;
      autoTurnIncrement.value = true;
      notifications.value = { ...defaultNotifications };
    }

    console.log(
      "Loaded appCards:",
      appCards.value.map((c, i) => `${i}: ${c.name}`)
    );
  };

  // Save settings to localStorage
  const saveSettings = () => {
    const settings = {
      appCards: appCards.value,
      tierMode: tierMode.value,
      compactThreshold: compactThreshold.value,
      showTitleCard: showTitleCard.value,
      showCompactConditions: showCompactConditions.value,
      autoTurnIncrement: autoTurnIncrement.value,
      notifications: notifications.value,
    };
    console.log(
      "Saving appCards:",
      appCards.value.map((c, i) => `${i}: ${c.name}`)
    );
    localStorage.setItem("icrpg-settings", JSON.stringify(settings));
  };

  // Initialize
  loadSettings();

  // Toggle card visibility
  const toggleCard = (cardId: string) => {
    const card = appCards.value.find((c) => c.id === cardId);
    if (card) {
      card.enabled = !card.enabled;

      // If battlefield is disabled, also disable monster creator
      if (cardId === "battlefield" && !card.enabled) {
        const monsterCreator = appCards.value.find((c) => c.id === "monster-creator");
        if (monsterCreator) {
          monsterCreator.enabled = false;
        }
      }

      // If monster creator is disabled, also disable battlefield
      if (cardId === "monster-creator" && !card.enabled) {
        const battlefield = appCards.value.find((c) => c.id === "battlefield");
        if (battlefield) {
          battlefield.enabled = false;
        }
      }

      saveSettings();
    }
  };

  // Reorder cards (just update the array order)
  const reorderCards = (newOrder: AppCard[]) => {
    console.log(
      "Reordering from:",
      appCards.value.map((c, i) => `${i}: ${c.name}`)
    );
    console.log(
      "Reordering to:",
      newOrder.map((c, i) => `${i}: ${c.name}`)
    );
    appCards.value = [...newOrder];
    console.log(
      "After reorder:",
      appCards.value.map((c, i) => `${i}: ${c.name}`)
    );
    saveSettings();
  };

  // Get visible cards in order (based on array index)
  const getVisibleCards = () => {
    return appCards.value.filter((card) => card.enabled);
  };

  // Toggle tier mode
  const toggleTierMode = () => {
    tierMode.value = !tierMode.value;
    saveSettings();
  };

  // Update compact threshold
  const updateCompactThreshold = (threshold: number) => {
    compactThreshold.value = Math.max(1, threshold); // Minimum of 1
    saveSettings();
  };

  // Toggle title card visibility
  const toggleTitleCard = () => {
    showTitleCard.value = !showTitleCard.value;
    saveSettings();
  };

  // Toggle compact conditions visibility
  const toggleCompactConditions = () => {
    showCompactConditions.value = !showCompactConditions.value;
    saveSettings();
  };

  // Toggle auto turn increment
  const toggleAutoTurnIncrement = () => {
    autoTurnIncrement.value = !autoTurnIncrement.value;
    saveSettings();
  };

  // Toggle notification settings
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

  // Reset to defaults
  const resetToDefaults = () => {
    appCards.value = [...defaultAppCards];
    tierMode.value = true;
    compactThreshold.value = 2;
    showTitleCard.value = true;
    showCompactConditions.value = false;
    autoTurnIncrement.value = true;
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
    notifications,
    toggleCard,
    toggleTierMode,
    updateCompactThreshold,
    toggleTitleCard,
    toggleCompactConditions,
    toggleAutoTurnIncrement,
    toggleTimerDoneNotification,
    toggleTurnAutoIncrementedNotification,
    toggleRoundEndedNotification,
    reorderCards,
    getVisibleCards,
    resetToDefaults,
  };
});
