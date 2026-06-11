import { nextTick } from "vue";
import { useSettingsStore } from "@/stores/settings";
import { useActiveColumn } from "@/composables/useActiveColumn";
import type { IndexCardKind } from "@/features/boards/types";

const SCROLL_TARGET_BY_KIND: Partial<Record<IndexCardKind, string>> = {
  monster: "battlefield",
  timer: "timers",
  snapshot: "battlefield",
};

export function scrollTargetForKind(kind: IndexCardKind): string | null {
  return SCROLL_TARGET_BY_KIND[kind] ?? null;
}

export function scrollToCombatSection(sectionId: string) {
  const mobile = window.matchMedia("(max-width: 767px)").matches;
  const { activeColumn, goCombat } = useActiveColumn();

  const run = () => {
    const column = document.querySelector(".app-column--combat") as HTMLElement | null;
    const el = document.getElementById(sectionId);
    if (!column || !el) return;

    const columnRect = column.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const offset = elRect.top - columnRect.top + column.scrollTop - 8;
    column.scrollTo({ top: Math.max(0, offset), behavior: "smooth" });
  };

  if (mobile && activeColumn.value !== 0) {
    goCombat();
    setTimeout(() => nextTick(run), 80);
  } else {
    nextTick(run);
  }
}

/** Scroll after deploy when settings allow it. `held` = long-press on deploy control. */
export function afterDeployScroll(sectionId: string | null, held = false) {
  if (!sectionId) return;
  const settings = useSettingsStore();
  const shouldScroll =
    settings.scrollOnDeployMode === "always" ||
    (settings.scrollOnDeployMode === "hold" && held);
  if (shouldScroll) scrollToCombatSection(sectionId);
}
