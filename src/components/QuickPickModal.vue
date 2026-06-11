<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="quick-pick-overlay"
      @mousedown.self="close"
    >
      <div class="quick-pick-panel" @click.stop>
        <h3 class="quick-pick-title">{{ title }}</h3>

        <div v-if="searchable" class="quick-pick-search">
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Filter..."
            class="rpg-input w-full text-sm"
          />
        </div>

        <div class="quick-pick-list">
          <div
            v-if="!searchable && filteredOptions.length <= 20"
            class="quick-pick-grid quick-pick-grid--two"
          >
            <button
              v-for="(option, index) in filteredOptions"
              :key="index"
              type="button"
              class="text-left text-xs rpg-button rpg-button-secondary quick-pick-option"
              @click="select(option)"
            >
              {{ option }}
            </button>
          </div>
          <div v-else class="quick-pick-grid">
            <button
              v-for="(option, index) in filteredOptions"
              :key="index"
              type="button"
              class="text-left text-xs rpg-button rpg-button-secondary quick-pick-option"
              @click="select(option)"
            >
              {{ option }}
            </button>
          </div>
        </div>

        <div class="quick-pick-footer">
          <button type="button" class="rpg-button rpg-button-secondary" @click="close">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useScrollLock } from "@/composables/useScrollLock";
import { useModalShortcuts } from "@/composables/useModalShortcuts";

const props = withDefaults(
  defineProps<{
    title: string;
    options: string[];
    searchable?: boolean;
  }>(),
  { searchable: false },
);

const emit = defineEmits<{
  pick: [value: string];
  close: [];
}>();

const isOpen = defineModel<boolean>({ default: false });
const searchQuery = ref("");

useScrollLock(isOpen);

const filteredOptions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return props.options;
  return props.options.filter((o) => o.toLowerCase().includes(q));
});

const select = (value: string) => {
  emit("pick", value);
  close();
};

function close() {
  isOpen.value = false;
  searchQuery.value = "";
  emit("close");
}

useModalShortcuts(isOpen, { onClose: close });
</script>

<style scoped>
.quick-pick-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 0;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.5);
}

.quick-pick-panel {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 28rem;
  max-height: 90vh;
  padding: 1.5rem;
  border-radius: 0.5rem;
  background: white;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.quick-pick-title {
  margin: 0 0 1rem;
  font-family: "nusaliver", "Arial Black", sans-serif;
  font-size: 1.125rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #171717;
}

.quick-pick-search {
  margin-bottom: 1rem;
}

.quick-pick-list {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 1rem;
  padding-right: 0.125rem;
}

.quick-pick-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
}

.quick-pick-grid--two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.quick-pick-option {
  justify-content: flex-start !important;
  padding-top: 0.5rem !important;
  padding-bottom: 0.5rem !important;
  white-space: normal;
}

.quick-pick-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e5e5;
}
</style>
