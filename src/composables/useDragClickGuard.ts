import { ref } from "vue";

const suppressUntil = ref(0);
let captureClickHandler: ((e: Event) => void) | null = null;

function removeCaptureHandler() {
  if (captureClickHandler) {
    document.removeEventListener("click", captureClickHandler, true);
    captureClickHandler = null;
  }
}

/** Swallow the next click (capture phase) — needed when mouseup lands on card body after a drag. */
export function blockNextClick() {
  removeCaptureHandler();
  captureClickHandler = (e: Event) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    removeCaptureHandler();
  };
  document.addEventListener("click", captureClickHandler, true);
  window.setTimeout(removeCaptureHandler, 800);
}

export function useDragClickGuard() {
  const arm = (ms = 800) => {
    suppressUntil.value = Date.now() + ms;
  };

  const shouldBlockClick = () => Date.now() < suppressUntil.value;

  const onGripPointerDown = () => {
    arm();
    blockNextClick();
  };

  const onDragInteraction = () => {
    arm();
    blockNextClick();
  };

  return { arm, shouldBlockClick, onGripPointerDown, onDragInteraction, blockNextClick };
}
