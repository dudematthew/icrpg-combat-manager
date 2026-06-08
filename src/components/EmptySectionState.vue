<template>
  <div class="empty-section-state">
    <img
      :src="assetUrl(image)"
      class="empty-section-state__image"
      :alt="alt"
    />
    <div class="empty-section-state__message">{{ message }}</div>
    <div class="empty-section-state__hint">
      {{ hint }}
      <span>{{ creatorAbove ? "above" : "below" }}</span>
    </div>
    <button type="button" class="empty-section-state__jump" @click="emit('jump')">
      <ChevronUp v-if="creatorAbove" class="w-3 h-3" />
      <ChevronDown v-else class="w-3 h-3" />
      Jump
    </button>
  </div>
</template>

<script setup lang="ts">
import { ChevronUp, ChevronDown } from "lucide-vue-next";
import { assetUrl } from "@/utils/assetUrl";

defineProps<{
  image: string;
  alt: string;
  message: string;
  hint: string;
  creatorAbove: boolean;
}>();

const emit = defineEmits<{
  jump: [];
}>();
</script>

<style scoped>
.empty-section-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-top: 3rem;
  padding-bottom: 3rem;
  text-align: center;
}

.empty-section-state__image {
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 1rem;
  height: 6rem;
  width: auto;
  max-width: 100%;
  object-fit: contain;
  object-position: center;
  filter: brightness(0) saturate(100%) invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg)
    brightness(100%) contrast(100%);
}

.empty-section-state__message {
  margin-bottom: 0.5rem;
  color: #525252;
  font-family: "Source Serif Pro", "Georgia", serif;
  font-size: 1rem;
  line-height: 1.6;
}

.empty-section-state__hint {
  margin-bottom: 1rem;
  color: #737373;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.empty-section-state__jump {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border: none;
  border-radius: 0.25rem;
  background-color: #f5f5f5;
  color: #525252;
  font-size: 0.75rem;
  line-height: 1rem;
  cursor: pointer;
  transition: background-color 0.15s;
}

.empty-section-state__jump:hover {
  background-color: #e5e5e5;
}
</style>
