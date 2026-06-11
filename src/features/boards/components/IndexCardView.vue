<template>
  <article
    class="index-card"
    :style="{ borderTopColor: getMonsterColor(card.color) }"
  >
    <div class="index-card__row">
      <div class="index-card__content" @click="onCardClick">
        <div class="index-card__header">
          <div
            class="index-card__drag-handle"
            title="Drag to reorder"
            @pointerdown.stop="onGripPointerDown"
            @click.stop.prevent
          >
            <GripVertical class="index-card__grip" />
          </div>
          <component :is="adapter.icon" class="index-card__icon" :style="{ color: getMonsterColor(card.color) }" />
          <h3 class="index-card__title">{{ card.title }}</h3>
        </div>

        <div
          v-if="payloadHtml"
          class="index-card__payload board-markdown"
          v-html="payloadHtml"
        />

        <div
          v-if="notesHtml"
          class="index-card__body board-markdown"
          :class="{ 'index-card__body--collapsed': showCollapsed }"
          v-html="notesHtml"
          @click="onNotesClick"
          @change="onTaskCheckboxChange"
        />

        <button
          v-if="showCollapsed && hasMoreNotes"
          type="button"
          class="index-card__link"
          @click.stop="emit('toggle-expand', card.id)"
        >
          {{ card.collapsed ? "More" : "Less" }}
        </button>
      </div>

      <button
        v-if="canDeployCard"
        type="button"
        class="index-card__deploy rpg-button rpg-button-xs rpg-button-secondary"
        v-bind="deployPointerHandlers"
        @click.stop="onDeployClick"
      >
        Deploy
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { GripVertical } from "lucide-vue-next";
import { getMonsterColor } from "@/utils/combat";
import { useSettingsStore } from "@/stores/settings";
import { renderMarkdown } from "../utils/markdown";
import { getAdapter, canDeploy as isDeployable } from "../adapters";
import { formatCardFacePayloadPreview } from "../utils/payloadPreview";
import { toggleTaskListLine } from "../utils/taskList";
import { useDragClickGuard } from "@/composables/useDragClickGuard";
import { useHoldToPick, bindHoldHandlers } from "@/composables/useHoldToPick";
import type { IndexCard } from "../types";

const { onGripPointerDown, shouldBlockClick } = useDragClickGuard();

const props = defineProps<{
  card: IndexCard;
}>();

const emit = defineEmits<{
  deploy: [id: string, held?: boolean];
  edit: [id: string];
  "toggle-expand": [id: string];
  "update-body": [body: string];
}>();

const settingsStore = useSettingsStore();

const holdDeploy = useHoldToPick(
  () => emit("deploy", props.card.id, false),
  () => emit("deploy", props.card.id, true),
);

const deployPointerHandlers = computed(() =>
  settingsStore.scrollOnDeployMode === "hold" ? bindHoldHandlers(holdDeploy) : {},
);

const onDeployClick = () => {
  if (settingsStore.scrollOnDeployMode !== "always") return;
  emit("deploy", props.card.id, false);
};
const adapter = computed(() => getAdapter(props.card.kind));

const payloadHtml = computed(() => {
  if (props.card.kind === "text") return "";
  const source = formatCardFacePayloadPreview(props.card);
  return source ? renderMarkdown(source) : "";
});

const notesSource = computed(() =>
  props.card.kind === "text" ? props.card.body : props.card.body.trim(),
);

const notesHtml = computed(() =>
  notesSource.value ? renderMarkdown(notesSource.value) : "",
);

const hasMoreNotes = computed(
  () => notesSource.value.length > 200 || notesSource.value.split("\n").length > 4,
);

const showCollapsed = computed(
  () => !settingsStore.boardCardExpandPreview && hasMoreNotes.value && props.card.collapsed,
);

const canDeployCard = computed(() => isDeployable(props.card.kind));

const isTaskCheckboxTarget = (target: EventTarget | null): target is HTMLInputElement =>
  target instanceof HTMLInputElement &&
  target.type === "checkbox" &&
  target.classList.contains("task-list-item-checkbox");

const onNotesClick = (event: MouseEvent) => {
  if (isTaskCheckboxTarget(event.target)) {
    event.stopPropagation();
  }
};

const onTaskCheckboxChange = (event: Event) => {
  const input = event.target;
  if (!isTaskCheckboxTarget(input)) return;

  event.stopPropagation();

  const lineRaw = input.closest("li.task-list-item")?.getAttribute("data-task-line");
  if (lineRaw === null) {
    input.checked = !input.checked;
    return;
  }

  const lineIndex = Number(lineRaw);
  if (!Number.isFinite(lineIndex)) {
    input.checked = !input.checked;
    return;
  }

  const nextBody = toggleTaskListLine(props.card.body, lineIndex);
  if (nextBody === null) {
    input.checked = !input.checked;
    return;
  }

  emit("update-body", nextBody);
};

const onCardClick = () => {
  if (shouldBlockClick()) return;
  emit("edit", props.card.id);
};
</script>

<style scoped>
.index-card {
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.75rem;
  border: 2px solid #e5e5e5;
  border-top-width: 4px;
  border-radius: 0.5rem;
  background: #fffef8;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.index-card__row {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.index-card__content {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.index-card__header {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 0.25rem;
}

.index-card__drag-handle {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin: -0.25rem 0;
  padding: 0.25rem 0;
  color: #a3a3a3;
  cursor: grab;
  touch-action: none;
}

.index-card__drag-handle:active {
  cursor: grabbing;
}

.index-card__grip {
  width: 0.875rem;
  height: 0.875rem;
}

.index-card__icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.index-card__title {
  margin: 0;
  font-family: "nusaliver", "Arial Black", sans-serif;
  font-size: 0.875rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  line-height: 1.2;
  flex: 1;
  min-width: 0;
}

.index-card__payload {
  font-family: "Source Serif Pro", Georgia, serif;
  font-size: 0.75rem;
  line-height: 1.35;
  color: #525252;
  margin-bottom: 0.2rem;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.index-card__body {
  font-family: "Source Serif Pro", Georgia, serif;
  font-size: 0.8125rem;
  line-height: 1.45;
  color: #404040;
}

.index-card__body--collapsed {
  max-height: 5.5rem;
  overflow: hidden;
  mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
}

.index-card__deploy {
  flex-shrink: 0;
  align-self: flex-start;
  margin-top: 0.125rem;
}

.index-card__link {
  font-size: 0.625rem;
  color: #737373;
  background: none;
  border: none;
  padding: 0.25rem 0 0;
  text-decoration: underline;
  cursor: pointer;
}
</style>

<style>
.board-markdown p {
  margin: 0 0 0.35rem;
}

.board-markdown h1,
.board-markdown h2,
.board-markdown h3 {
  font-family: "nusaliver", "Arial Black", sans-serif;
  font-size: 0.875rem;
  margin: 0.25rem 0;
}

.board-markdown ul {
  margin: 0.25rem 0;
  padding-left: 1.25rem;
}

.board-markdown blockquote {
  margin: 0.35rem 0;
  padding: 0.35rem 0.75rem;
  border-left: 3px solid #d4d4d4;
  color: #525252;
  font-style: italic;
  background: #fafafa;
}

.board-markdown em {
  font-style: italic;
}

.board-markdown strong {
  font-weight: 600;
}

.board-markdown ul.contains-task-list {
  list-style: none;
  padding-left: 0.25rem;
}

.board-markdown li.task-list-item {
  display: block;
  margin: 0.15rem 0;
}

.board-markdown .task-list-item-checkbox {
  margin-top: 0.2rem;
  margin-right: 0.35rem;
  flex-shrink: 0;
  cursor: pointer;
  vertical-align: top;
}

/* Keep vue-fluid-dnd drag ghost visible (fixed positioning needs no ancestor transform) */
.index-card.dragging {
  opacity: 1 !important;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}
</style>
