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

          <div class="index-editor-tabs">
            <button
              type="button"
              class="index-editor-tab"
              :class="{ 'index-editor-tab--active': editorTab === 'write' }"
              @click="editorTab = 'write'"
            >
              Write
            </button>
            <button
              type="button"
              class="index-editor-tab"
              :class="{ 'index-editor-tab--active': editorTab === 'preview' }"
              @click="editorTab = 'preview'"
            >
              Preview
            </button>
          </div>

          <div class="index-editor-textarea-wrap">
            <textarea
              v-show="editorTab === 'write'"
              ref="textareaRef"
              v-model="localBody"
              class="rpg-input index-editor-textarea"
              rows="12"
              @keydown="onTextareaKeydown"
              @click="bumpCursor"
              @keyup="bumpCursor"
              @select="bumpCursor"
            />
            <MarkdownPreview
              v-show="editorTab === 'preview'"
              :source="localBody"
              :drawings="draftDrawings"
              editable
              @edit-drawing="openDrawingEditor"
            />
          </div>

          <MarkdownToolbar @format="applyFormat" @image="toggleImageForm" @draw="openNewDrawing" />

          <p v-if="cursorDrawingId" class="index-editor-drawing-link rpg-body">
            <button type="button" class="index-editor-drawing-link__btn" @click="openDrawingEditor(cursorDrawingId)">
              Edit drawing on this line
            </button>
          </p>

          <div v-if="showImageForm" class="index-editor-image-form">
            <label class="rpg-label" for="index-editor-image-url">Image URL</label>
            <input
              id="index-editor-image-url"
              ref="imageUrlRef"
              v-model="imageUrl"
              type="url"
              class="rpg-input"
              placeholder="https://example.com/map.png"
              @keydown.enter.prevent="insertImageUrl"
            />
            <label class="rpg-label" for="index-editor-image-alt">Alt text (optional)</label>
            <input
              id="index-editor-image-alt"
              v-model="imageAlt"
              type="text"
              class="rpg-input"
              placeholder="Map sketch"
              @keydown.enter.prevent="insertImageUrl"
            />
            <div class="index-editor-image-form__actions">
              <button type="button" class="rpg-button rpg-button-sm rpg-button-primary" @click="insertImageUrl">
                Insert image
              </button>
              <button type="button" class="rpg-button rpg-button-sm rpg-button-secondary" @click="closeImageForm">
                Cancel
              </button>
            </div>
            <p class="index-editor-image-form__hint rpg-body">
              Paste a direct link to an image file (png, jpg, webp, gif).
            </p>
          </div>

          <p class="index-editor-hint rpg-body">
            Image URL or Draw for sketches · Ctrl+B/I · Ctrl+Enter save · Esc close
          </p>
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

  <DrawingBoardModal
    v-model="drawingModalOpen"
    :drawing-id="editingDrawingId"
    :initial-document="editingDrawingDocument"
    @save="onDrawingSave"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import ColorSwatchPicker from "@/components/ColorSwatchPicker.vue";
import ConfirmTapButton from "@/components/ConfirmTapButton.vue";
import MarkdownToolbar from "./MarkdownToolbar.vue";
import MarkdownPreview from "./MarkdownPreview.vue";
import DrawingBoardModal from "./DrawingBoardModal.vue";
import { useScrollLock } from "@/composables/useScrollLock";
import { useModalShortcuts } from "@/composables/useModalShortcuts";
import { useInfoMonitorStore } from "@/stores/infoMonitor";
import { applyLineFormat, type LineFormat } from "../utils/lineFormat";
import { formatPayloadPreview } from "../utils/payloadPreview";
import { getPayloadIdentityName } from "../utils/cardDisplay";
import {
  buildImageMarkdown,
  buildDrawingMarkdown,
  insertTextAtSelection,
  isAllowedImageUrl,
  normalizeImageUrl,
} from "../utils/markdownInsert";
import { cleanupOrphanDrawings, findDrawingRefNearCursor } from "../drawing/drawingRefs";
import type { DrawingDocument, DrawingId } from "../drawing/types";
import type { IndexCard } from "../types";

const props = defineProps<{
  card: IndexCard | null;
}>();

const open = defineModel<boolean>({ default: false });

const emit = defineEmits<{
  save: [data: { title: string; color: string; body: string; drawings?: Record<DrawingId, DrawingDocument> }];
  delete: [];
}>();

const infoMonitor = useInfoMonitorStore();

const localTitle = ref("");
const localColor = ref("Yellow");
const localBody = ref("");
const editorTab = ref<"write" | "preview">("write");
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const imageUrlRef = ref<HTMLInputElement | null>(null);
const showImageForm = ref(false);
const imageUrl = ref("");
const imageAlt = ref("");
const draftDrawings = ref<Record<DrawingId, DrawingDocument>>({});
const drawingModalOpen = ref(false);
const editingDrawingId = ref<DrawingId | null>(null);
const pendingNewDrawing = ref(false);
const cursorTick = ref(0);

const bumpCursor = () => {
  cursorTick.value += 1;
};

const editingDrawingDocument = computed(() =>
  editingDrawingId.value ? draftDrawings.value[editingDrawingId.value] : undefined,
);

const cursorDrawingId = computed(() => {
  void cursorTick.value;
  if (editorTab.value !== "write") return null;
  const el = textareaRef.value;
  const cursor = el?.selectionStart ?? localBody.value.length;
  return findDrawingRefNearCursor(localBody.value, cursor);
});

useScrollLock(open);

watch(
  () => [open.value, props.card] as const,
  ([isOpen, card]) => {
    if (!isOpen) return;
    localTitle.value = card?.title ?? "New note";
    localColor.value = card?.color ?? "Yellow";
    localBody.value = card?.body ?? "";
    draftDrawings.value = card?.drawings ? { ...card.drawings } : {};
    editorTab.value = "write";
    closeImageForm();
    drawingModalOpen.value = false;
    editingDrawingId.value = null;
    pendingNewDrawing.value = false;
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

const closeImageForm = () => {
  showImageForm.value = false;
  imageUrl.value = "";
  imageAlt.value = "";
};

const toggleImageForm = async () => {
  showImageForm.value = !showImageForm.value;
  if (!showImageForm.value) {
    imageUrl.value = "";
    imageAlt.value = "";
    return;
  }
  editorTab.value = "write";
  await nextTick();
  imageUrlRef.value?.focus();
};

const insertImageUrl = () => {
  const normalized = normalizeImageUrl(imageUrl.value);
  if (!normalized || !isAllowedImageUrl(normalized)) {
    infoMonitor.showMonitor({
      type: "error",
      title: "Invalid image URL",
      message: "Use an http(s) link to an image, or a site-relative path starting with /.",
    });
    return;
  }

  const markdown = buildImageMarkdown(normalized, imageAlt.value);
  const el = textareaRef.value;
  const start = el?.selectionStart ?? localBody.value.length;
  const end = el?.selectionEnd ?? start;
  const { text, cursor } = insertTextAtSelection(localBody.value, start, end, markdown);
  localBody.value = text;
  closeImageForm();
  editorTab.value = "preview";

  requestAnimationFrame(() => {
    if (!el) return;
    el.focus();
    el.setSelectionRange(cursor, cursor);
  });
};

const openNewDrawing = () => {
  closeImageForm();
  editorTab.value = "write";
  editingDrawingId.value = null;
  pendingNewDrawing.value = true;
  drawingModalOpen.value = true;
};

const openDrawingEditor = (id: DrawingId) => {
  closeImageForm();
  editingDrawingId.value = id;
  pendingNewDrawing.value = false;
  drawingModalOpen.value = true;
};

const onDrawingSave = (payload: { id: DrawingId; document: DrawingDocument }) => {
  draftDrawings.value = {
    ...draftDrawings.value,
    [payload.id]: payload.document,
  };

  if (pendingNewDrawing.value) {
    const markdown = buildDrawingMarkdown(payload.id);
    const el = textareaRef.value;
    const start = el?.selectionStart ?? localBody.value.length;
    const end = el?.selectionEnd ?? start;
    const { text, cursor } = insertTextAtSelection(localBody.value, start, end, markdown);
    localBody.value = text;
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  }

  pendingNewDrawing.value = false;
  editingDrawingId.value = null;
  editorTab.value = "preview";
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
  const body = localBody.value;
  const drawings = cleanupOrphanDrawings(body, draftDrawings.value);
  emit("save", {
    title: localTitle.value.trim() || "Untitled",
    color: localColor.value,
    body,
    drawings,
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

.index-editor-tabs {
  display: flex;
  gap: 0.35rem;
  margin-bottom: 0.5rem;
}

.index-editor-tab {
  padding: 0.35rem 0.75rem;
  border: 2px solid #e5e5e5;
  border-radius: 0.375rem;
  background: #fafafa;
  font-family: "nusaliver", "Arial Black", sans-serif;
  font-size: 0.7rem;
  font-weight: 900;
  text-transform: uppercase;
  cursor: pointer;
}

.index-editor-tab--active {
  border-color: #dc2626;
  background: #fef2f2;
  color: #dc2626;
}

.index-editor-textarea {
  min-height: 10rem;
  font-family: "Source Serif Pro", Georgia, serif;
  font-size: 0.9375rem;
  line-height: 1.5;
}

.index-editor-image-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.75rem;
  border: 1px solid #e5e5e5;
  border-radius: 0.5rem;
  background: #fafafa;
}

.index-editor-image-form__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.index-editor-image-form__hint {
  margin: 0;
  color: #737373;
  font-size: 0.75rem;
}

.index-editor-drawing-link {
  margin: 0.35rem 0 0;
}

.index-editor-drawing-link__btn {
  padding: 0;
  border: none;
  background: none;
  color: #737373;
  font-size: 0.75rem;
  text-decoration: underline;
  cursor: pointer;
}

.index-editor-drawing-link__btn:hover {
  color: #dc2626;
}

.index-editor-hint {
  margin: 0.5rem 0 0;
  color: #737373;
  font-size: 0.75rem;
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
