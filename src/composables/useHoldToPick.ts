import { ref, onUnmounted } from "vue";

const HOLD_DELAY_MS = 400;

export function useHoldToPick(onTap: () => void, onHold: () => void) {
  const holdTimer = ref<ReturnType<typeof setTimeout> | null>(null);
  const didHold = ref(false);
  let captureEl: HTMLElement | null = null;
  let captureId = -1;

  const clearHoldTimer = () => {
    if (holdTimer.value) {
      clearTimeout(holdTimer.value);
      holdTimer.value = null;
    }
  };

  const releaseCapture = () => {
    if (captureEl && captureId >= 0) {
      try {
        captureEl.releasePointerCapture(captureId);
      } catch {
        /* pointer may already be released */
      }
    }
    captureEl = null;
    captureId = -1;
  };

  const onPointerDown = (e: PointerEvent) => {
    didHold.value = false;
    clearHoldTimer();

    const el = e.currentTarget as HTMLElement | null;
    if (el?.setPointerCapture) {
      try {
        el.setPointerCapture(e.pointerId);
        captureEl = el;
        captureId = e.pointerId;
      } catch {
        /* ignore — desktop / older browsers */
      }
    }

    holdTimer.value = setTimeout(() => {
      didHold.value = true;
      onHold();
    }, HOLD_DELAY_MS);
  };

  const onPointerUp = () => {
    clearHoldTimer();
    releaseCapture();
    if (!didHold.value) {
      onTap();
    }
  };

  const onPointerLeave = () => {
    if (!didHold.value) {
      clearHoldTimer();
    }
  };

  const onPointerCancel = () => {
    clearHoldTimer();
    releaseCapture();
  };

  onUnmounted(() => {
    clearHoldTimer();
    releaseCapture();
  });

  return {
    onPointerDown,
    onPointerUp,
    onPointerLeave,
    onPointerCancel,
  };
}

/** Map hold handlers for `v-bind` — Vue expects `onPointerdown`, not `onPointerDown`. */
export function bindHoldHandlers(h: ReturnType<typeof useHoldToPick>) {
  return {
    onPointerdown: h.onPointerDown,
    onPointerup: h.onPointerUp,
    onPointerleave: h.onPointerLeave,
    onPointercancel: h.onPointerCancel,
  };
}
