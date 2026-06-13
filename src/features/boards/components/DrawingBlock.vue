<template>
  <figure class="drawing-block" :class="{ 'drawing-block--editable': editable }">
    <div
      class="drawing-block__frame"
      :style="frameStyle"
    >
      <div class="drawing-block__svg" v-html="svg" />
      <p v-if="!hasContent" class="drawing-block__missing rpg-body">Drawing not found</p>
    </div>
    <figcaption v-if="alt && alt !== 'Sketch'" class="drawing-block__caption rpg-body">
      {{ alt }}
    </figcaption>
    <button
      v-if="editable"
      type="button"
      class="drawing-block__edit"
      @click.stop="emit('edit', id)"
    >
      Edit drawing
    </button>
  </figure>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { hasRenderableDrawing, renderDrawingSvg } from "../drawing/strokeRender";
import type { DrawingDocument, DrawingId } from "../drawing/types";

const props = defineProps<{
  id: DrawingId;
  alt: string;
  document: DrawingDocument | undefined;
  editable?: boolean;
}>();

const emit = defineEmits<{
  edit: [id: DrawingId];
}>();

const hasContent = computed(() => hasRenderableDrawing(props.document));

const frameStyle = computed(() => {
  const doc = props.document;
  if (!doc) return { aspectRatio: "400 / 240" };
  return { aspectRatio: `${doc.width} / ${doc.height}` };
});

const svg = computed(() =>
  props.document && hasContent.value ? renderDrawingSvg(props.document) : "",
);
</script>

<style scoped>
.drawing-block {
  margin: 0.5rem 0;
}

.drawing-block__frame {
  position: relative;
  width: 100%;
  border: 1px solid #e5e5e5;
  border-radius: 0.375rem;
  background: #fffef8;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.drawing-block__svg {
  width: 100%;
  height: 100%;
}

.drawing-block__svg :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

.drawing-block__missing {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  color: #737373;
  font-size: 0.75rem;
  background: #fafafa;
}

.drawing-block__caption {
  margin: 0.25rem 0 0;
  color: #737373;
  font-size: 0.7rem;
  font-style: italic;
}

.drawing-block__edit {
  margin-top: 0.25rem;
  padding: 0;
  border: none;
  background: none;
  color: #737373;
  font-size: 0.7rem;
  text-decoration: underline;
  cursor: pointer;
}

.drawing-block__edit:hover {
  color: #dc2626;
}
</style>
