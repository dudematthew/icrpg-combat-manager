import { watch, onUnmounted } from "vue";
import type { Ref } from "vue";

export function useScrollLock(isLocked: Ref<boolean>) {
  const lockScroll = () => {
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = getScrollbarWidth() + "px";
  };

  const unlockScroll = () => {
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  };

  const getScrollbarWidth = () => {
    // Create a temporary div to measure scrollbar width
    const scrollDiv = document.createElement("div");
    scrollDiv.style.cssText =
      "width: 100px; height: 100px; overflow: scroll; position: absolute; top: -9999px;";
    document.body.appendChild(scrollDiv);
    const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    document.body.removeChild(scrollDiv);
    return scrollbarWidth;
  };

  // Watch for changes in the lock state
  const stopWatcher = watch(
    isLocked,
    (locked) => {
      if (locked) {
        lockScroll();
      } else {
        unlockScroll();
      }
    },
    { immediate: true }
  );

  // Cleanup on unmount
  onUnmounted(() => {
    unlockScroll();
    stopWatcher();
  });

  return {
    lockScroll,
    unlockScroll,
  };
}
