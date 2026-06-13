<template>
  <div class="markdown-toolbar">
    <button
      v-for="btn in buttons"
      :key="btn.format ?? btn.action"
      type="button"
      class="markdown-toolbar__btn"
      :class="{ 'markdown-toolbar__btn--icon': btn.action === 'image' || btn.action === 'draw' }"
      :title="btn.title"
      @click="onButtonClick(btn)"
    >
      <ImagePlus v-if="btn.action === 'image'" class="markdown-toolbar__icon" aria-hidden="true" />
      <Pencil v-else-if="btn.action === 'draw'" class="markdown-toolbar__icon" aria-hidden="true" />
      <template v-else>{{ btn.label }}</template>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ImagePlus, Pencil } from "lucide-vue-next";
import type { LineFormat } from "../utils/lineFormat";

const emit = defineEmits<{
  format: [format: LineFormat];
  image: [];
  draw: [];
}>();

type ToolbarButton =
  | { format: LineFormat; label: string; title: string; action?: undefined }
  | { action: "image"; label?: undefined; format?: undefined; title: string }
  | { action: "draw"; label?: undefined; format?: undefined; title: string };

const buttons: ToolbarButton[] = [
  { format: "h1", label: "H1", title: "Heading 1" },
  { format: "h2", label: "H2", title: "Heading 2" },
  { format: "bullet", label: "•", title: "Bullet list" },
  { format: "task", label: "☐", title: "Task item (- [ ] / toggle - [x])" },
  { format: "bold", label: "B", title: "Bold selected text" },
  { format: "italic", label: "I", title: "Italic selected text" },
  { format: "quote", label: ">", title: "Quote" },
  { action: "image", title: "Insert image" },
  { action: "draw", title: "Draw sketch" },
];

const onButtonClick = (btn: ToolbarButton) => {
  if (btn.action === "image") {
    emit("image");
    return;
  }
  if (btn.action === "draw") {
    emit("draw");
    return;
  }
  emit("format", btn.format);
};
</script>

<style scoped>
.markdown-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.5rem;
}

.markdown-toolbar__btn {
  min-width: 2.25rem;
  padding: 0.35rem 0.5rem;
  border: 2px solid #e5e5e5;
  border-radius: 0.375rem;
  background: #fafafa;
  font-family: "nusaliver", "Arial Black", sans-serif;
  font-size: 0.75rem;
  font-weight: 900;
  cursor: pointer;
}

.markdown-toolbar__btn:hover {
  background: #fef2f2;
  border-color: #dc2626;
  color: #dc2626;
}

.markdown-toolbar__btn--icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.markdown-toolbar__icon {
  width: 1rem;
  height: 1rem;
}
</style>
