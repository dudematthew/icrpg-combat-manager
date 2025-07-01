import { defineStore } from "pinia";
import { ref } from "vue";

export interface Notification {
  id: string;
  message: string;
  type: "timer" | "info" | "warning" | "error";
  duration: number;
}

export const useNotificationStore = defineStore("notifications", () => {
  const notifications = ref<Notification[]>([]);

  const addNotification = (
    message: string,
    type: Notification["type"] = "info",
    duration: number = 3000
  ) => {
    const notification: Notification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      message,
      type,
      duration,
    };

    notifications.value.push(notification);

    // Auto-remove after duration
    setTimeout(() => {
      removeNotification(notification.id);
    }, duration);

    return notification.id;
  };

  const removeNotification = (id: string) => {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  };

  const clearAll = () => {
    notifications.value = [];
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
  };
});
