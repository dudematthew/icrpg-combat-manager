import { defineStore } from "pinia";
import { ref } from "vue";

export interface InfoMonitorData {
  message: string;
  duration?: number;
}

export const useInfoMonitorStore = defineStore("infoMonitor", () => {
  const isVisible = ref(false);
  const message = ref("");
  const duration = ref(4000);

  const showMonitor = (data: InfoMonitorData) => {
    message.value = data.message;
    duration.value = data.duration || 4000;
    isVisible.value = true;
  };

  const hideMonitor = () => {
    isVisible.value = false;
  };

  return {
    isVisible,
    message,
    duration,
    showMonitor,
    hideMonitor,
  };
});
