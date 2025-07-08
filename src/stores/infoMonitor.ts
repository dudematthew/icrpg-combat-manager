import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { useSettingsStore } from "./settings";

export interface InfoMonitorNotification {
  id: string;
  title: string;
  message: string;
  duration?: number;
  icon?: string;
  iconType?: "image" | "lucide";
  color?: string;
  borderColor?: string;
  type?: "timer" | "turn" | "round" | "info" | "warning" | "error";
}

export interface InfoMonitorData {
  message: string;
  duration?: number;
  title?: string;
  icon?: string;
  iconType?: "image" | "lucide";
  color?: string;
  borderColor?: string;
  type?: "timer" | "turn" | "round" | "info" | "warning" | "error";
}

export const useInfoMonitorStore = defineStore("infoMonitor", () => {
  const queue = ref<InfoMonitorNotification[]>([]);
  const currentNotification = ref<InfoMonitorNotification | null>(null);
  const isVisible = ref(false);

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const getNotificationDefaults = (type?: string): Partial<InfoMonitorNotification> => {
    switch (type) {
      case "timer":
        return {
          title: "Timer Complete!",
          icon: `${import.meta.env.BASE_URL}images/clock_icon.png`,
          iconType: "image",
          color: "#dc2626",
          borderColor: "#dc2626",
          duration: 4000,
        };
      case "turn":
        return {
          title: "All Done!",
          icon: "CircleCheckBig",
          iconType: "lucide",
          color: "#059669",
          borderColor: "#059669",
          duration: 2500,
        };
      case "round":
        return {
          title: "Round Ended",
          icon: "RotateCcw",
          iconType: "lucide",
          color: "#7c3aed",
          borderColor: "#7c3aed",
          duration: 3000,
        };
      case "warning":
        return {
          title: "Warning",
          color: "#d97706",
          borderColor: "#d97706",
          duration: 3000,
        };
      case "error":
        return {
          title: "Error",
          color: "#dc2626",
          borderColor: "#dc2626",
          duration: 4000,
        };
      case "info":
      default:
        return {
          title: "Information",
          color: "#2563eb",
          borderColor: "#2563eb",
          duration: 3000,
        };
    }
  };

  const showMonitor = (data: InfoMonitorData) => {
    // Check if this notification type is enabled in settings
    const settingsStore = useSettingsStore();

    // Skip notification if disabled in settings
    if (data.type === "timer" && !settingsStore.notifications.timerDone) {
      return;
    }
    if (data.type === "turn" && !settingsStore.notifications.turnAutoIncremented) {
      return;
    }
    if (data.type === "round" && !settingsStore.notifications.roundEnded) {
      return;
    }

    const defaults = getNotificationDefaults(data.type);

    const notification: InfoMonitorNotification = {
      id: generateId(),
      title: data.title || defaults.title || "Notification",
      message: data.message,
      duration: data.duration || defaults.duration || 3000,
      icon: data.icon || defaults.icon,
      iconType: data.iconType || defaults.iconType || "image",
      color: data.color || defaults.color || "#2563eb",
      borderColor: data.borderColor || defaults.borderColor || "#2563eb",
      type: data.type || "info",
    };

    queue.value.push(notification);
    processQueue();
  };

  const processQueue = () => {
    if (!isVisible.value && queue.value.length > 0) {
      showNext();
    }
  };

  const showNext = () => {
    if (queue.value.length === 0) return;

    currentNotification.value = queue.value.shift()!;
    isVisible.value = true;
  };

  const hideMonitor = () => {
    isVisible.value = false;
    currentNotification.value = null;

    // Process next in queue after a brief delay
    setTimeout(() => {
      processQueue();
    }, 200);
  };

  const clearQueue = () => {
    queue.value = [];
    hideMonitor();
  };

  // Legacy support for the old interface
  const message = ref("");
  const duration = ref(4000);

  // Keep these for backward compatibility but update them from current notification
  const updateLegacyRefs = () => {
    if (currentNotification.value) {
      message.value = currentNotification.value.message;
      duration.value = currentNotification.value.duration || 4000;
    }
  };

  // Watch for current notification changes and update legacy refs
  watch(currentNotification, updateLegacyRefs, { immediate: true });

  return {
    // New enhanced API
    queue,
    currentNotification,
    isVisible,
    showMonitor,
    hideMonitor,
    clearQueue,

    // Legacy API for backward compatibility
    message,
    duration,
  };
});
