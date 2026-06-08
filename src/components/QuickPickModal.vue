<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="z-50 fixed inset-0 flex justify-center items-end sm:items-center bg-black/50 p-4"
      @click.self="close"
    >
      <div class="bg-white shadow-xl rounded-lg w-full max-w-md max-h-[70vh] flex flex-col">
        <div class="flex justify-between items-center p-4 border-neutral-200 border-b">
          <h3 class="text-base rpg-heading">{{ title }}</h3>
          <button type="button" class="text-neutral-500 hover:text-neutral-800" @click="close">✕</button>
        </div>
        <div v-if="searchable" class="px-4 pt-3">
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Filter..."
            class="rpg-input w-full text-sm"
          />
        </div>
        <div class="overflow-y-auto p-4 flex-1">
          <div v-if="!searchable || filteredOptions.length <= 24" class="gap-2 grid grid-cols-1">
            <button
              v-for="(option, index) in filteredOptions"
              :key="index"
              type="button"
              class="text-left text-sm rpg-button rpg-button-secondary !justify-start !py-2"
              @click="select(option)"
            >
              {{ option }}
            </button>
          </div>
          <div v-else class="gap-2 grid grid-cols-1">
            <button
              v-for="(option, index) in filteredOptions"
              :key="index"
              type="button"
              class="text-left text-xs rpg-button rpg-button-secondary !justify-start !py-1.5"
              @click="select(option)"
            >
              {{ option }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

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

const filteredOptions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return props.options;
  return props.options.filter((o) => o.toLowerCase().includes(q));
});

const select = (value: string) => {
  emit("pick", value);
  close();
};

const close = () => {
  isOpen.value = false;
  searchQuery.value = "";
  emit("close");
};
</script>
