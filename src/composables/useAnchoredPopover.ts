import { ref, watch, onUnmounted, nextTick, type Ref } from "vue";

const waitForLayout = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });

export function useAnchoredPopover(
  open: Ref<boolean>,
  anchorEl: Ref<HTMLElement | null>,
  panelRef: Ref<HTMLElement | null>,
) {
  const panelStyle = ref<Record<string, string>>({});
  let resizeObserver: ResizeObserver | null = null;

  const positionPanel = async () => {
    await nextTick();
    await waitForLayout();

    const anchor = anchorEl.value;
    const panel = panelRef.value;
    if (!anchor || !panel) return;

    const rect = anchor.getBoundingClientRect();
    const panelHeight = panel.offsetHeight;
    const panelWidth = panel.offsetWidth;
    const margin = 8;
    const viewportH = window.innerHeight;
    const viewportW = window.innerWidth;

    const spaceBelow = viewportH - rect.bottom - margin;
    const spaceAbove = rect.top - margin;

    let top: number;
    if (panelHeight <= spaceBelow) {
      top = rect.bottom + margin;
    } else if (panelHeight <= spaceAbove) {
      top = rect.top - panelHeight - margin;
    } else if (spaceAbove >= spaceBelow) {
      top = margin;
    } else {
      top = Math.max(margin, viewportH - panelHeight - margin);
    }

    let left = rect.left;
    if (left + panelWidth > viewportW - margin) {
      left = viewportW - panelWidth - margin;
    }
    left = Math.max(margin, left);

    panelStyle.value = {
      position: "fixed",
      top: `${top}px`,
      left: `${left}px`,
      zIndex: "60",
    };
  };

  const startObserving = () => {
    resizeObserver?.disconnect();
    const panel = panelRef.value;
    if (!panel) return;
    resizeObserver = new ResizeObserver(() => {
      void positionPanel();
    });
    resizeObserver.observe(panel);
  };

  watch(open, (isOpen) => {
    if (isOpen) {
      void positionPanel().then(startObserving);
    } else {
      resizeObserver?.disconnect();
      resizeObserver = null;
    }
  });

  onUnmounted(() => {
    resizeObserver?.disconnect();
  });

  return { panelStyle, positionPanel };
}
