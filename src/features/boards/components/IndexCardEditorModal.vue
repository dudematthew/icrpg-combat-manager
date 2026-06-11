<template>
  <Teleport to="body">
    <div v-if="open" class="index-editor-overlay" @mousedown.self="close">
      <div class="index-editor-panel" @click.stop>
        <h3 class="index-editor-title">{{ card ? "Edit card" : "New card" }}</h3>

        <div class="index-editor-field">
          <label class="rpg-label">Title</label>
          <input v-model="localTitle" class="rpg-input" type="text" />
        </div>

        <div class="index-editor-field">
          <label class="rpg-label">Color</label>
          <ColorSwatchPicker v-model="localColor" />
        </div>

        <div v-if="card?.payload" class="index-editor-payload">
          <span class="rpg-label">Payload</span>
          <p v-if="payloadIdentity" class="index-editor-payload__identity rpg-body">
            {{ payloadKindLabel }}: <strong>{{ payloadIdentity }}</strong>
          </p>
          <div class="text-neutral-600 text-sm whitespace-pre-wrap rpg-body">{{ payloadSummary }}</div>
        </div>

        <div class="index-editor-field">
          <label class="rpg-label">
            Notes (
            <a
              href="https://www.markdownguide.org/basic-syntax/"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary hover:text-red-600 underline normal-case tracking-normal"
              @click.stop
            >markdown</a>
            )
          </label>
          <textarea
            ref="textareaRef"
            v-model="localBody"
            class="rpg-input index-editor-textarea"
            rows="12"
            @keydown="onTextareaKeydown"
          />
          <MarkdownToolbar @format="applyFormat" />
          <p class="mt-1 text-neutral-500 text-xs rpg-body">Ctrl+B/I bold/italic · Ctrl+Enter save · Esc close</p>
        </div>

        <div class="index-editor-footer">
          <ConfirmTapButton
            v-if="card"
            label="Delete"
            confirm-label="Confirm"
            variant="danger"
            size="sm"
            @confirm="onDelete"
          />
          <div class="index-editor-footer-actions">
            <button type="button" class="rpg-button rpg-button-sm rpg-button-secondary" @click="close">Cancel</button>
            <button type="button" class="rpg-button rpg-button-sm rpg-button-primary" @click="save">Save</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import ColorSwatchPicker from "@/components/ColorSwatchPicker.vue";
import ConfirmTapButton from "@/components/ConfirmTapButton.vue";
import MarkdownToolbar from "./MarkdownToolbar.vue";
import { useScrollLock } from "@/composables/useScrollLock";
import { useModalShortcuts } from "@/composables/useModalShortcuts";
import { applyLineFormat, type LineFormat } from "../utils/lineFormat";
import { formatPayloadPreview } from "../utils/payloadPreview";
import { getPayloadIdentityName } from "../utils/cardDisplay";
import type { IndexCard } from "../types";

const props = defineProps<{
  card: IndexCard | null;
}>();

const open = defineModel<boolean>({ default: false });

const emit = defineEmits<{
  save: [data: { title: string; color: string; body: string }];
  delete: [];
}>();

const localTitle = ref("");
const localColor = ref("Yellow");
const localBody = ref("");
const textareaRef = ref<HTMLTextAreaElement | null>(null);

useScrollLock(open);

watch(
  () => [open.value, props.card] as const,
  ([isOpen, card]) => {
    if (!isOpen) return;
    localTitle.value = card?.title ?? "New note";
    localColor.value = card?.color ?? "Yellow";
    localBody.value = card?.body ?? "";
  },
);

const payloadIdentity = computed(() =>
  props.card ? getPayloadIdentityName(props.card) : null,
);

const payloadKindLabel = computed(() => {
  const kind = props.card?.payload?.kind;
  if (kind === "monster") return "Monster";
  if (kind === "timer") return "Timer";
  if (kind === "snapshot") return "Snapshot";
  return "Payload";
});

const payloadSummary = computed(() => {
  if (!props.card?.payload) return "";
  const full = formatPayloadPreview(props.card);
  const identity = payloadIdentity.value;
  if (!identity || !full.startsWith(identity)) return full;
  const rest = full.slice(identity.length).replace(/^\n/, "");
  return rest || full;
});

const applyFormat = (format: LineFormat) => {
  const el = textareaRef.value;
  if (!el) return;
  const { text, cursor } = applyLineFormat(
    localBody.value,
    el.selectionStart,
    el.selectionEnd,
    format,
  );
  localBody.value = text;
  requestAnimationFrame(() => {
    el.focus();
    el.setSelectionRange(cursor, cursor);
  });
};

const onTextareaKeydown = (e: KeyboardEvent) => {
  if (!(e.ctrlKey || e.metaKey)) return;
  const key = e.key.toLowerCase();
  if (key === "b") {
    e.preventDefault();
    applyFormat("bold");
  } else if (key === "i") {
    e.preventDefault();
    applyFormat("italic");
  }
};

function save() {
  emit("save", {
    title: localTitle.value.trim() || "Untitled",
    color: localColor.value,
    body: localBody.value,
  });
  open.value = false;
}

function close() {
  open.value = false;
}

const onDelete = () => {
  emit("delete");
  open.value = false;
};

useModalShortcuts(open, { onSave: save, onClose: close });
</script>

<style scoped>
.index-editor-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.5);
}

.index-editor-panel {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 28rem;
  max-height: 90vh;
  padding: 1.5rem;
  border-radius: 0.5rem;
  background: white;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  overflow-x: hidden;
  overflow-y: auto;
}

.index-editor-title {
  margin: 0 0 1rem;
  font-family: "nusaliver", "Arial Black", sans-serif;
  font-size: 1.125rem;
  text-transform: uppercase;
}

.index-editor-field {
  margin-bottom: 1rem;
}

.index-editor-payload {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #fafafa;
  border: 1px solid #e5e5e5;
  border-radius: 0.5rem;
}

.index-editor-payload__identity {
  margin: 0 0 0.5rem;
  font-size: 0.875rem;
  color: #404040;
}

.index-editor-textarea {
  min-height: 10rem;
  font-family: "Source Serif Pro", Georgia, serif;
  font-size: 0.9375rem;
  line-height: 1.5;
}

.index-editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e5e5;
}

.index-editor-footer-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}

@media (max-width: 767px) {
  .index-editor-panel {
    padding: 1rem;
  }

  .index-editor-footer {
    flex-wrap: wrap;
  }

  .index-editor-footer :deep(.confirm-tap-btn) {
    min-width: 4.5rem !important;
    padding-left: 0.65rem;
    padding-right: 0.65rem;
  }

  .index-editor-footer-actions {
    margin-left: 0;
  }

  .index-editor-footer-actions .rpg-button {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
}
</style>
