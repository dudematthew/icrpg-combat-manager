import { ref } from "vue";

interface UseHoverDelayOptions {
  delay?: number; // Delay in milliseconds before triggering hover start
  hoverEndDelay?: number; // Delay in milliseconds before triggering hover end
}

export function useHoverDelay(options: UseHoverDelayOptions = {}) {
  const {
    delay = 300, // Default 300ms delay
    hoverEndDelay = 100, // Default 100ms delay for hover end
  } = options;

  const isHovered = ref(false);
  const isHoverDelayed = ref(false);

  let hoverStartTimer: number | null = null;
  let hoverEndTimer: number | null = null;

  const handleMouseEnter = () => {
    // Clear any existing end timer
    if (hoverEndTimer) {
      clearTimeout(hoverEndTimer);
      hoverEndTimer = null;
    }

    // Set immediate hover state
    isHovered.value = true;

    // Set delayed hover state after delay
    hoverStartTimer = window.setTimeout(() => {
      isHoverDelayed.value = true;
    }, delay);
  };

  const handleMouseLeave = () => {
    // Clear start timer
    if (hoverStartTimer) {
      clearTimeout(hoverStartTimer);
      hoverStartTimer = null;
    }

    // Set immediate hover state
    isHovered.value = false;

    // Set delayed hover state after delay
    hoverEndTimer = window.setTimeout(() => {
      isHoverDelayed.value = false;
    }, hoverEndDelay);
  };

  // Cleanup function
  const cleanup = () => {
    if (hoverStartTimer) {
      clearTimeout(hoverStartTimer);
      hoverStartTimer = null;
    }
    if (hoverEndTimer) {
      clearTimeout(hoverEndTimer);
      hoverEndTimer = null;
    }
  };

  // Force reset hover state (useful for button clicks)
  const forceReset = () => {
    cleanup();
    isHovered.value = false;
    isHoverDelayed.value = false;
  };

  // Return the composable interface
  return {
    isHovered,
    isHoverDelayed,
    handleMouseEnter,
    handleMouseLeave,
    cleanup,
    forceReset,
  };
}
