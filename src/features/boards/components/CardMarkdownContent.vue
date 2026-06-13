<template>
  <div class="card-markdown board-markdown">
    <template v-if="segments.length === 0">
      <p class="card-markdown__empty rpg-body">Nothing to preview yet.</p>
    </template>
    <template v-else>
      <template v-for="(segment, index) in segments" :key="`${segment.type}-${index}`">
        <div v-if="segment.type === 'html'" v-html="segment.content" />
        <DrawingBlock
          v-else
          :id="segment.id"
          :alt="segment.alt"
          :document="resolveDrawingSegment(segment.id, drawings)"
          :editable="editable"
          @edit="emit('edit-drawing', $event)"
        />
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import DrawingBlock from "./DrawingBlock.vue";
import { resolveDrawingSegment, splitCardMarkdown } from "../utils/renderCardMarkdown";
import type { DrawingDocument, DrawingId } from "../drawing/types";

const props = defineProps<{
  source: string;
  drawings?: Record<DrawingId, DrawingDocument>;
  editable?: boolean;
}>();

const emit = defineEmits<{
  "edit-drawing": [id: DrawingId];
}>();

const segments = computed(() => splitCardMarkdown(props.source));
</script>

<style scoped>
.card-markdown__empty {
  margin: 0;
  color: #737373;
  font-size: 0.875rem;
}
</style>

<style>
.card-markdown.board-markdown img {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 0.5rem 0;
  border-radius: 0.375rem;
  border: 1px solid #e5e5e5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
</style>
