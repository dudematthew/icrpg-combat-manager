<template>
  <div class="markdown-preview">
    <CardMarkdownContent
      :source="source"
      :drawings="drawings"
      :editable="editable"
      @edit-drawing="emit('edit-drawing', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import CardMarkdownContent from "./CardMarkdownContent.vue";
import type { DrawingDocument, DrawingId } from "../drawing/types";

defineProps<{
  source: string;
  drawings?: Record<DrawingId, DrawingDocument>;
  editable?: boolean;
}>();

const emit = defineEmits<{
  "edit-drawing": [id: DrawingId];
}>();
</script>

<style scoped>
.markdown-preview {
  min-height: 10rem;
  max-height: 16rem;
  overflow-y: auto;
  padding: 0.75rem;
  border: 2px solid #e5e5e5;
  border-radius: 0.375rem;
  background: #fffef8;
  font-family: "Source Serif Pro", Georgia, serif;
  font-size: 0.9375rem;
  line-height: 1.5;
}
</style>
