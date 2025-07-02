import { defineStore } from "pinia";
import { ref } from "vue";

export interface AppCard {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  order: number;
}

export const useSettingsStore = defineStore("settings", () => {
  // Default app cards configuration
  const defaultAppCards: AppCard[] = [
    {
      id: "timers",
      name: "Timers",
      description: "Manage round and turn-based timers",
      enabled: true,
      order: 1,
    },
    {
      id: "battlefield",
      name: "Battlefield",
      description: "Combat management and monster tracking",
      enabled: true,
      order: 2,
    },
    {
      id: "target",
      name: "Target",
      description: "Scene target numbers and attack rolls",
      enabled: true,
      order: 3,
    },
    {
      id: "monster-creator",
      name: "Monster Creator",
      description: "Quick monster creation and management",
      enabled: true,
      order: 4,
    },
  ];

  const appCards = ref<AppCard[]>([]);
  const tierMode = ref(true); // true = tier mode, false = manual mode

  // Load settings from localStorage
  const loadSettings = () => {
    const saved = localStorage.getItem("icrpg-settings");
    if (saved) {
      const settings = JSON.parse(saved);
      appCards.value = settings.appCards || defaultAppCards;
      tierMode.value = settings.tierMode !== undefined ? settings.tierMode : true;
    } else {
      appCards.value = [...defaultAppCards];
      tierMode.value = true;
    }
  };

  // Save settings to localStorage
  const saveSettings = () => {
    const settings = {
      appCards: appCards.value,
      tierMode: tierMode.value,
    };
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

  // Reorder cards
  const reorderCards = (newOrder: AppCard[]) => {
    appCards.value = newOrder.map((card, index) => ({
      ...card,
      order: index + 1,
    }));
    saveSettings();
  };

  // Get visible cards in order
  const getVisibleCards = () => {
    return appCards.value.filter((card) => card.enabled).sort((a, b) => a.order - b.order);
  };

  // Toggle tier mode
  const toggleTierMode = () => {
    tierMode.value = !tierMode.value;
    saveSettings();
  };

  // Reset to defaults
  const resetToDefaults = () => {
    appCards.value = [...defaultAppCards];
    tierMode.value = true;
    saveSettings();
  };

  return {
    appCards,
    tierMode,
    toggleCard,
    toggleTierMode,
    reorderCards,
    getVisibleCards,
    resetToDefaults,
  };
});
