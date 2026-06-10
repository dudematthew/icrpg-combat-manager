<template>
  <nav v-if="settingsStore.showSectionNav && navItems.length > 0" class="section-nav" aria-label="Jump to section">
    <button
      v-for="item in navItems"
      :key="item.id"
      type="button"
      class="section-nav-item"
      :title="item.name"
      @click="scrollToSection(item.id)"
    >
      <component :is="item.icon" class="w-4 h-4" />
      <span class="section-nav-label">{{ item.shortName }}</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  Clock,
  Swords,
  Target,
  Skull,
  Sparkles,
  type LucideIcon,
} from "lucide-vue-next";
import { useSettingsStore } from "@/stores/settings";

const settingsStore = useSettingsStore();

const SECTION_ICONS: Record<string, LucideIcon> = {
  timers: Clock,
  battlefield: Swords,
  target: Target,
  "monster-creator": Skull,
  inspirations: Sparkles,
};

const SHORT_NAMES: Record<string, string> = {
  timers: "Timers",
  battlefield: "Fight",
  target: "Target",
  "monster-creator": "Create",
  inspirations: "Inspire",
};

const navItems = computed(() =>
  settingsStore.getVisibleCards("combat").map((card) => ({
    id: card.id,
    name: card.name,
    shortName: SHORT_NAMES[card.id] ?? card.name,
    icon: SECTION_ICONS[card.id] ?? Target,
  })),
);

const scrollToSection = (id: string) => {
  const column = document.querySelector(".app-column--combat");
  const el = document.getElementById(id);
  if (!column || !el) return;

  const columnRect = column.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  const offset = elRect.top - columnRect.top + column.scrollTop - 8;
  column.scrollTo({ top: offset, behavior: "smooth" });
};
</script>

<style scoped>
.section-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 40;
  display: flex;
  gap: 0.25rem;
  width: 100%;
  max-width: 480px;
  padding: 0.35rem 0.5rem calc(0.35rem + env(safe-area-inset-bottom, 0px));
  background: rgba(255, 255, 255, 0.95);
  border-top: 2px solid #e5e5e5;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(4px);
}

.section-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
  padding: 0.25rem 0.125rem;
  border: none;
  background: transparent;
  color: #525252;
  cursor: pointer;
  border-radius: 0.375rem;
  transition: color 0.15s, background 0.15s;
}

.section-nav-item:hover {
  color: #dc2626;
  background: #fef2f2;
}

.section-nav-label {
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  line-height: 1;
}
</style>
