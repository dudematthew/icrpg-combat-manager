<template>
  <Teleport to="body">
    <div v-if="open" class="drawing-board-overlay" @mousedown.self="onCancel">
      <div class="drawing-board-panel" @click.stop>
        <header class="drawing-board-header">
          <h3 class="drawing-board-title">{{ drawingId ? "Edit drawing" : "New drawing" }}</h3>
          <p class="drawing-board-subtitle rpg-body">Index-card sketch · Ctrl+Z undo · Ctrl+Y redo</p>
        </header>

        <div class="drawing-board-canvas-wrap">
          <div
            ref="canvasRef"
            class="drawing-board-canvas"
            :class="{
              'drawing-board-canvas--pick': activeTool === 'strokeEraser' || activeTool === 'label',
              'drawing-board-canvas--label-open': labelEditor.open,
            }"
            :style="{ aspectRatio: `${canvasWidth} / ${canvasHeight}` }"
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
            @pointercancel="onPointerUp"
            @pointerleave="onPointerUp"
          >
            <svg
              class="drawing-board-svg"
              :viewBox="`0 0 ${canvasWidth} ${canvasHeight}`"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="100%" height="100%" :fill="paperColor" />
              <path
                v-for="(path, index) in previewLayers.strokes"
                :key="`stroke-${index}`"
                :d="path.d"
                :fill="path.color"
                :fill-opacity="path.opacity"
              />
              <text
                v-for="(label, index) in previewLayers.labels"
                :key="`label-${index}`"
                :x="label.x"
                :y="label.y"
                :fill="label.color"
                :font-size="label.fontSize"
                font-family="'Source Serif Pro', Georgia, serif"
                dominant-baseline="middle"
                text-anchor="middle"
              >
                {{ label.text }}
              </text>
              <path
                v-if="livePath"
                :d="livePath.d"
                :fill="livePath.color"
                :fill-opacity="livePath.opacity"
              />
            </svg>

            <div
              v-if="labelEditor.open"
              ref="labelEditorRef"
              class="drawing-board-label-editor"
              :style="labelEditorPos"
              @click.stop
              @pointerdown.stop
            >
              <input
                ref="labelInputRef"
                v-model="labelEditor.text"
                type="text"
                class="drawing-board-label-input rpg-input"
                placeholder="Label or emoji"
                @keydown.enter.prevent="commitLabel"
                @keydown.esc.prevent="cancelLabel"
              />
              <div class="drawing-board-label-actions">
                <button type="button" class="rpg-button rpg-button-xs rpg-button-secondary" @click="cancelLabel">
                  Cancel
                </button>
                <button type="button" class="rpg-button rpg-button-xs rpg-button-primary" @click="commitLabel">
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="drawing-board-tools">
          <div class="drawing-board-tool-row">
            <button
              v-for="tool in toolKeys"
              :key="tool"
              type="button"
              class="drawing-board-tool"
              :class="{ 'drawing-board-tool--active': activeTool === tool }"
              :title="TOOL_PRESETS[tool].label"
              @click="activeTool = tool"
            >
              {{ TOOL_PRESETS[tool].label }}
            </button>
          </div>

          <div v-if="showToolOptions" class="drawing-board-options">
            <div v-if="activeTool === 'highlighter'" class="drawing-board-size-row">
              <span class="drawing-board-size-label rpg-body">Highlight</span>
              <button
                v-for="size in brushSizes"
                :key="`hl-${size}`"
                type="button"
                class="drawing-board-size-btn"
                :class="{ 'drawing-board-size-btn--active': activeHighlighterSize === size }"
                @click="activeHighlighterSize = size"
              >
                {{ size.toUpperCase() }}
              </button>
            </div>

            <div v-else-if="activeTool === 'marker'" class="drawing-board-size-row">
              <span class="drawing-board-size-label rpg-body">Marker</span>
              <button
                v-for="size in brushSizes"
                :key="`mk-${size}`"
                type="button"
                class="drawing-board-size-btn"
                :class="{ 'drawing-board-size-btn--active': activeMarkerSize === size }"
                @click="activeMarkerSize = size"
              >
                {{ size.toUpperCase() }}
              </button>
            </div>

            <div v-else-if="activeTool === 'label'" class="drawing-board-size-row">
              <span class="drawing-board-size-label rpg-body">Text</span>
              <button
                v-for="size in brushSizes"
                :key="size"
                type="button"
                class="drawing-board-size-btn"
                :class="{ 'drawing-board-size-btn--active': activeLabelSize === size }"
                @click="activeLabelSize = size"
              >
                {{ size.toUpperCase() }}
              </button>
            </div>

            <div v-if="colorSwatches.length" class="drawing-board-colors">
              <button
                v-for="swatch in colorSwatches"
                :key="swatch.id"
                type="button"
                class="drawing-board-color"
                :class="{ 'drawing-board-color--active': activeSwatchHex === swatch.hex }"
                :style="{ backgroundColor: swatch.hex }"
                :title="swatch.label"
                @click="selectSwatch(swatch.hex)"
              />
            </div>
          </div>
        </div>

        <footer class="drawing-board-footer">
          <div class="drawing-board-footer-left">
            <button
              type="button"
              class="rpg-button rpg-button-xs rpg-button-secondary"
              :disabled="!canUndo"
              @click="undo"
            >
              Undo
            </button>
            <button
              type="button"
              class="rpg-button rpg-button-xs rpg-button-secondary"
              :disabled="!canRedo"
              @click="redo"
            >
              Redo
            </button>
            <ConfirmTapButton
              label="Clear"
              confirm-label="Confirm"
              variant="danger"
              size="sm"
              class="drawing-board-clear-btn"
              :timeout-ms="2500"
              @confirm="clearAll"
            />
          </div>
          <div class="drawing-board-footer-actions">
            <button type="button" class="rpg-button rpg-button-xs rpg-button-secondary" @click="onCancel">
              Cancel
            </button>
            <button type="button" class="rpg-button rpg-button-xs rpg-button-primary" @click="onSave">
              Save
            </button>
          </div>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onUnmounted } from "vue";
import ConfirmTapButton from "@/components/ConfirmTapButton.vue";
import { useScrollLock } from "@/composables/useScrollLock";
import { useModalShortcuts } from "@/composables/useModalShortcuts";
import { DrawingHistory } from "../drawing/history";
import { findInkStrokeAtPoint, normalizedCanvasPoint } from "../drawing/hitTest";
import { documentToPreviewLayers, strokeToPreviewPath } from "../drawing/drawingCanvas";
import { simplifyNormalizedPoints } from "../drawing/simplifyPoints";
import { appendNormalizedPoint, densifyNormalizedPoints } from "../drawing/strokePoints";
import {
  DRAWING_CANVAS_HEIGHT,
  DRAWING_CANVAS_WIDTH,
  createEmptyDrawing,
  normalizeDrawingDocument,
  type DrawingDocument,
  type DrawingLabel,
  type DrawingStroke,
  type DrawingTool,
  type BrushSize,
  type LabelSize,
  type NormalizedPoint,
} from "../drawing/types";
import {
  DEFAULT_DRAWING_COLOR,
  DEFAULT_HIGHLIGHTER_COLOR,
  DRAWING_INK_COLORS,
  DRAWING_PAPER_COLOR,
  HIGHLIGHTER_COLORS,
  TOOL_PRESETS,
  resolveStrokeColor,
  resolveStrokeSize,
  usesStrokeSmoothing,
} from "../drawing/toolPresets";
import type { DrawingId } from "../drawing/types";

const open = defineModel<boolean>({ default: false });

const props = defineProps<{
  drawingId: DrawingId | null;
  initialDocument?: DrawingDocument;
}>();

const emit = defineEmits<{
  save: [payload: { id: DrawingId; document: DrawingDocument }];
  cancel: [];
}>();

useScrollLock(open);

const canvasRef = ref<HTMLElement | null>(null);
const labelInputRef = ref<HTMLInputElement | null>(null);
const labelEditorRef = ref<HTMLElement | null>(null);
const canvasWidth = DRAWING_CANVAS_WIDTH;
const canvasHeight = DRAWING_CANVAS_HEIGHT;
const paperColor = DRAWING_PAPER_COLOR;

const history = ref<DrawingHistory | null>(null);
/** Bumped whenever history mutates so doc/canUndo/canRedo recompute. */
const historyRevision = ref(0);

function touchHistory() {
  historyRevision.value++;
}
const activeTool = ref<DrawingTool>("pen");
const activeColor = ref<string>(DEFAULT_DRAWING_COLOR);
const activeHighlighterColor = ref<string>(DEFAULT_HIGHLIGHTER_COLOR);
const activeMarkerSize = ref<BrushSize>("m");
const activeHighlighterSize = ref<BrushSize>("m");
const activeLabelSize = ref<LabelSize>("m");
const activePointerId = ref<number | null>(null);
const currentPoints = ref<NormalizedPoint[]>([]);
const labelEditor = ref({
  open: false,
  clientX: 0,
  clientY: 0,
  nx: 0,
  ny: 0,
  text: "",
  editingId: null as string | null,
});
const labelEditorPos = ref<{ left: string; top: string }>({ left: "0px", top: "0px" });

const toolKeys = Object.keys(TOOL_PRESETS) as DrawingTool[];
const brushSizes: BrushSize[] = ["s", "m", "l"];

function strokeSizeForTool(tool: DrawingStroke["tool"]): number {
  if (tool === "marker") return resolveStrokeSize(tool, activeMarkerSize.value);
  if (tool === "highlighter") return resolveStrokeSize(tool, activeHighlighterSize.value);
  return resolveStrokeSize(tool, "m");
}

const doc = computed(() => {
  historyRevision.value;
  return history.value?.document ?? createEmptyDrawing();
});
const canUndo = computed(() => {
  historyRevision.value;
  return history.value?.canUndo() ?? false;
});
const canRedo = computed(() => {
  historyRevision.value;
  return history.value?.canRedo() ?? false;
});

const colorSwatches = computed(() => {
  const mode = TOOL_PRESETS[activeTool.value].colorMode;
  if (mode === "ink") return DRAWING_INK_COLORS;
  if (mode === "highlighter") return HIGHLIGHTER_COLORS;
  return [];
});

const showToolOptions = computed(
  () => activeTool.value !== "eraser" && activeTool.value !== "strokeEraser",
);

const activeSwatchHex = computed(() =>
  activeTool.value === "highlighter" ? activeHighlighterColor.value : activeColor.value,
);

const previewLayers = computed(() => documentToPreviewLayers(doc.value, canvasWidth, canvasHeight));

const livePath = computed(() => {
  if (currentPoints.value.length < 2) return null;
  const preset = TOOL_PRESETS[activeTool.value];
  if (preset.pointerMode !== "draw") return null;
  const strokeTool = activeTool.value === "eraser" ? "eraser" : activeTool.value;
  if (strokeTool !== "pen" && strokeTool !== "marker" && strokeTool !== "highlighter" && strokeTool !== "eraser") {
    return null;
  }
  const stroke: DrawingStroke = {
    id: "live",
    tool: strokeTool,
    color: resolveStrokeColor(strokeTool, activeColor.value, activeHighlighterColor.value),
    size: strokeSizeForTool(strokeTool),
    opacity: preset.opacity,
    points: currentPoints.value,
  };
  return strokeToPreviewPath(stroke, canvasWidth, canvasHeight, false);
});

function clampLabelEditorPosition(clientX: number, clientY: number) {
  const canvas = canvasRef.value;
  const editor = labelEditorRef.value;
  if (!canvas || !editor) return;

  const canvasRect = canvas.getBoundingClientRect();
  const editorW = editor.offsetWidth;
  const editorH = editor.offsetHeight;
  const pad = 8;
  const gap = 8;

  let left = clientX - canvasRect.left - editorW / 2;
  let top = clientY - canvasRect.top - editorH - gap;

  if (top < pad) {
    top = clientY - canvasRect.top + gap;
  }

  left = Math.max(pad, Math.min(left, canvasRect.width - editorW - pad));
  top = Math.max(pad, Math.min(top, canvasRect.height - editorH - pad));

  labelEditorPos.value = {
    left: `${left}px`,
    top: `${top}px`,
  };
}

async function repositionLabelEditor() {
  await nextTick();
  clampLabelEditorPosition(labelEditor.value.clientX, labelEditor.value.clientY);
  requestAnimationFrame(() => {
    clampLabelEditorPosition(labelEditor.value.clientX, labelEditor.value.clientY);
  });
}

watch(
  () => [open.value, props.initialDocument] as const,
  ([isOpen, initial]) => {
    if (!isOpen) return;
    const normalized = normalizeDrawingDocument(initial ?? createEmptyDrawing());
    normalized.fills = [];
    history.value = new DrawingHistory(normalized);
    touchHistory();
    activeTool.value = "pen";
    activeColor.value = DEFAULT_DRAWING_COLOR;
    activeHighlighterColor.value = DEFAULT_HIGHLIGHTER_COLOR;
    activeMarkerSize.value = "m";
    activeHighlighterSize.value = "m";
    currentPoints.value = [];
    activePointerId.value = null;
    labelEditor.value = { open: false, clientX: 0, clientY: 0, nx: 0, ny: 0, text: "", editingId: null };
  },
  { immediate: true },
);

function selectSwatch(hex: string) {
  if (activeTool.value === "highlighter") {
    activeHighlighterColor.value = hex;
  } else {
    activeColor.value = hex;
  }
}

function pushDocument(next: DrawingDocument) {
  history.value?.push(next);
  touchHistory();
}

function undo() {
  if (!history.value?.undo()) return;
  touchHistory();
}

function redo() {
  if (!history.value?.redo()) return;
  touchHistory();
}

function clearAll() {
  history.value?.push(createEmptyDrawing());
  touchHistory();
  currentPoints.value = [];
}

function getCanvasPoint(event: PointerEvent): NormalizedPoint {
  const el = canvasRef.value;
  if (!el) return [0, 0];
  return normalizedCanvasPoint(event, el, canvasWidth, canvasHeight);
}

function onPointerDown(event: PointerEvent) {
  if (labelEditor.value.open) return;
  if (activePointerId.value !== null) return;

  const point = getCanvasPoint(event);
  const mode = TOOL_PRESETS[activeTool.value].pointerMode;

  if (mode === "tap" && activeTool.value === "strokeEraser") {
    const hit = findInkStrokeAtPoint(doc.value.strokes, canvasWidth, canvasHeight, point[0], point[1]);
    if (hit) {
      pushDocument({
        ...doc.value,
        strokes: doc.value.strokes.filter((s) => s.id !== hit.id),
      });
    }
    return;
  }

  if (mode === "label") {
    openLabelEditor(event, point);
    return;
  }

  activePointerId.value = event.pointerId;
  canvasRef.value?.setPointerCapture(event.pointerId);
  currentPoints.value = [point];
}

function openLabelEditor(event: PointerEvent, point: NormalizedPoint) {
  labelEditor.value = {
    open: true,
    clientX: event.clientX,
    clientY: event.clientY,
    nx: point[0],
    ny: point[1],
    text: "",
    editingId: null,
  };
  repositionLabelEditor();
  nextTick(() => labelInputRef.value?.focus());
}

function commitLabel() {
  const text = labelEditor.value.text.trim();
  if (!text) {
    cancelLabel();
    return;
  }

  const label: DrawingLabel = {
    id: labelEditor.value.editingId ?? crypto.randomUUID(),
    x: labelEditor.value.nx,
    y: labelEditor.value.ny,
    text,
    color: activeColor.value,
    size: activeLabelSize.value,
  };

  const labels = labelEditor.value.editingId
    ? doc.value.labels.map((l) => (l.id === label.id ? label : l))
    : [...doc.value.labels, label];

  pushDocument({ ...doc.value, labels });
  cancelLabel();
}

function cancelLabel() {
  labelEditor.value = { open: false, clientX: 0, clientY: 0, nx: 0, ny: 0, text: "", editingId: null };
}

function onPointerMove(event: PointerEvent) {
  if (activePointerId.value !== event.pointerId) return;
  const point = getCanvasPoint(event);
  const tool = activeTool.value;
  if (tool === "pen" || tool === "marker") {
    currentPoints.value = appendNormalizedPoint(currentPoints.value, point);
  } else {
    currentPoints.value = [...currentPoints.value, point];
  }
}

function commitCurrentStroke() {
  if (currentPoints.value.length < 2) {
    currentPoints.value = [];
    return;
  }

  const tool = activeTool.value;
  if (tool !== "pen" && tool !== "marker" && tool !== "highlighter" && tool !== "eraser") {
    currentPoints.value = [];
    return;
  }

  const preset = TOOL_PRESETS[tool];
  let points = currentPoints.value;
  if (usesStrokeSmoothing(tool)) {
    points = simplifyNormalizedPoints(densifyNormalizedPoints(points));
  }
  const stroke: DrawingStroke = {
    id: crypto.randomUUID(),
    tool,
    color: resolveStrokeColor(tool, activeColor.value, activeHighlighterColor.value),
    size: strokeSizeForTool(tool),
    opacity: preset.opacity,
    points: points.length >= 2 ? points : currentPoints.value,
  };

  pushDocument({
    ...doc.value,
    strokes: [...doc.value.strokes, stroke],
  });
  currentPoints.value = [];
}

function onPointerUp(event: PointerEvent) {
  if (activePointerId.value !== event.pointerId) return;
  canvasRef.value?.releasePointerCapture(event.pointerId);
  activePointerId.value = null;
  commitCurrentStroke();
}

function onSave() {
  if (currentPoints.value.length >= 2) {
    commitCurrentStroke();
  }

  emit("save", {
    id: props.drawingId ?? crypto.randomUUID(),
    document: normalizeDrawingDocument({ ...doc.value, fills: [] }),
  });
  open.value = false;
}

function onCancel() {
  emit("cancel");
  open.value = false;
}

function isLabelInputFocused(target: EventTarget | null): boolean {
  return target instanceof HTMLInputElement && target === labelInputRef.value;
}

function onDrawingKeydown(e: KeyboardEvent) {
  if (!open.value) return;
  if (!(e.ctrlKey || e.metaKey)) return;
  if (isLabelInputFocused(e.target)) return;

  const key = e.key.toLowerCase();
  if (key === "z" && !e.shiftKey) {
    e.preventDefault();
    undo();
  } else if (key === "y" || (key === "z" && e.shiftKey)) {
    e.preventDefault();
    redo();
  }
}

const drawingKeydownOpts: AddEventListenerOptions = { capture: true };

watch(
  open,
  (isOpen) => {
    if (isOpen) {
      window.addEventListener("keydown", onDrawingKeydown, drawingKeydownOpts);
    } else {
      window.removeEventListener("keydown", onDrawingKeydown, drawingKeydownOpts);
    }
  },
  { immediate: true },
);

onUnmounted(() => {
  window.removeEventListener("keydown", onDrawingKeydown, drawingKeydownOpts);
});

useModalShortcuts(open, { onClose: onCancel });
</script>

<style scoped>
.drawing-board-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.55);
}

.drawing-board-panel {
  display: flex;
  flex-direction: column;
  width: min(100%, 36rem);
  max-height: 95vh;
  min-width: 0;
  padding: 1rem;
  border-radius: 0.5rem;
  background: white;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
  overflow-x: hidden;
  overflow-y: auto;
}

.drawing-board-header {
  margin-bottom: 0.75rem;
}

.drawing-board-title {
  margin: 0;
  font-family: "nusaliver", "Arial Black", sans-serif;
  font-size: 1rem;
  text-transform: uppercase;
}

.drawing-board-subtitle {
  margin: 0.25rem 0 0;
  color: #737373;
  font-size: 0.75rem;
}

.drawing-board-canvas-wrap {
  margin-bottom: 0.75rem;
  overflow: visible;
}

.drawing-board-canvas {
  position: relative;
  width: 100%;
  touch-action: none;
  cursor: crosshair;
  border: 2px solid #e5e5e5;
  border-radius: 0.375rem;
  overflow: hidden;
  user-select: none;
}

.drawing-board-canvas--label-open {
  overflow: visible;
}

.drawing-board-canvas--pick {
  cursor: pointer;
}

.drawing-board-svg {
  display: block;
  width: 100%;
  height: 100%;
}

.drawing-board-label-editor {
  position: absolute;
  z-index: 2;
  width: min(14rem, calc(100% - 1rem));
  max-width: calc(100% - 1rem);
  padding: 0.35rem;
  border: 1px solid #e5e5e5;
  border-radius: 0.375rem;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.drawing-board-label-input {
  width: 100%;
  margin-bottom: 0.35rem;
  font-size: 0.875rem;
}

.drawing-board-label-actions {
  display: flex;
  gap: 0.35rem;
  justify-content: flex-end;
}

.drawing-board-tools {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.drawing-board-tool-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.25rem;
}

.drawing-board-tool {
  min-width: 0;
  padding: 0.25rem 0.25rem;
  border: 2px solid #e5e5e5;
  border-radius: 0.375rem;
  background: #fafafa;
  font-family: "nusaliver", "Arial Black", sans-serif;
  font-size: 0.55rem;
  font-weight: 900;
  line-height: 1.2;
  text-transform: uppercase;
  cursor: pointer;
}

.drawing-board-tool--active {
  border-color: #dc2626;
  background: #fef2f2;
  color: #dc2626;
}

.drawing-board-options {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem 0.75rem;
}

.drawing-board-size-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
  flex: 0 0 auto;
}

@media (min-width: 420px) {
  .drawing-board-options {
    flex-wrap: nowrap;
  }

  .drawing-board-colors {
    margin-left: auto;
    justify-content: flex-end;
  }
}

.drawing-board-size-label {
  font-size: 0.7rem;
  color: #737373;
}

.drawing-board-size-btn {
  min-width: 1.75rem;
  padding: 0.2rem 0.4rem;
  border: 2px solid #e5e5e5;
  border-radius: 0.375rem;
  background: #fafafa;
  font-size: 0.6rem;
  font-weight: 700;
  cursor: pointer;
}

.drawing-board-size-btn--active {
  border-color: #dc2626;
  color: #dc2626;
}

.drawing-board-colors {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.drawing-board-color {
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid #e5e5e5;
  border-radius: 9999px;
  cursor: pointer;
}

.drawing-board-color--active {
  outline: 2px solid #dc2626;
  outline-offset: 2px;
}

.drawing-board-footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e5e5;
}

.drawing-board-footer-left {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  align-items: center;
  min-width: 0;
}

.drawing-board-footer-left :deep(.drawing-board-clear-btn) {
  min-width: unset !important;
  font-size: 0.75rem;
  padding: 0.3rem 0.65rem;
}

.drawing-board-footer-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-left: auto;
}

@media (max-width: 767px) {
  .drawing-board-overlay {
    padding: 0;
    align-items: stretch;
  }

  .drawing-board-panel {
    width: 100%;
    max-height: none;
    min-height: 100vh;
    border-radius: 0;
    padding: 0.75rem;
  }

  .drawing-board-tool-row {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .drawing-board-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .drawing-board-footer-left,
  .drawing-board-footer-actions {
    width: 100%;
    margin-left: 0;
  }

  .drawing-board-footer-left :deep(.drawing-board-clear-btn),
  .drawing-board-footer-actions .rpg-button {
    flex: 1;
    min-width: 0;
  }
}
</style>
