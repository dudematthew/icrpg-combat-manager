import { watch, onUnmounted, type Ref } from "vue";

interface ModalShortcutHandlers {
  onSave?: () => void;
  onClose?: () => void;
}

export function useModalShortcuts(open: Ref<boolean>, handlers: ModalShortcutHandlers) {
  const onKeydown = (e: KeyboardEvent) => {
    if (!open.value) return;

    if (e.key === "Escape") {
      handlers.onClose?.();
      e.preventDefault();
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handlers.onSave?.();
      e.preventDefault();
    }
  };

  watch(open, (isOpen) => {
    if (isOpen) {
      window.addEventListener("keydown", onKeydown);
    } else {
      window.removeEventListener("keydown", onKeydown);
    }
  });

  onUnmounted(() => window.removeEventListener("keydown", onKeydown));
}
