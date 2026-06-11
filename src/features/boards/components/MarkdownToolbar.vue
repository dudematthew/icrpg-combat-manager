<template>
  <div class="markdown-toolbar">
    <button
      v-for="btn in buttons"
      :key="btn.format"
      type="button"
      class="markdown-toolbar__btn"
      :title="btn.title"
      @click="emit('format', btn.format)"
    >
      {{ btn.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { LineFormat } from "../utils/lineFormat";

const emit = defineEmits<{
  format: [format: LineFormat];
}>();

const buttons: { format: LineFormat; label: string; title: string }[] = [
  { format: "h1", label: "H1", title: "Heading 1" },
  { format: "h2", label: "H2", title: "Heading 2" },
  { format: "h3", label: "H3", title: "Heading 3" },
  { format: "bullet", label: "•", title: "Bullet list" },
  { format: "task", label: "☐", title: "Task item (- [ ] / toggle - [x])" },
  { format: "bold", label: "B", title: "Bold selected text" },
  { format: "italic", label: "I", title: "Italic selected text" },
  { format: "quote", label: ">", title: "Quote" },
];
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
</style>
