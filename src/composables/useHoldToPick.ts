import { ref, onUnmounted } from "vue";

const HOLD_DELAY_MS = 400;

export function useHoldToPick(onTap: () => void, onHold: () => void) {
  const holdTimer = ref<ReturnType<typeof setTimeout> | null>(null);
  const didHold = ref(false);

  const clearHoldTimer = () => {
    if (holdTimer.value) {
      clearTimeout(holdTimer.value);
      holdTimer.value = null;
    }
  };

  const onPointerDown = () => {
    didHold.value = false;
    clearHoldTimer();
    holdTimer.value = setTimeout(() => {
      didHold.value = true;
      onHold();
    }, HOLD_DELAY_MS);
  };

  const onPointerUp = () => {
    clearHoldTimer();
    if (!didHold.value) {
      onTap();
    }
  };

  const onPointerLeave = () => {
    clearHoldTimer();
  };

  onUnmounted(clearHoldTimer);

  return {
    onPointerDown,
    onPointerUp,
    onPointerLeave,
  };
}
