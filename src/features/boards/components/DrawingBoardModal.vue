<template>
  <Teleport to="body">
    <div v-if="open" class="drawing-board-overlay" @mousedown.self="onCancel">
      <div class="drawing-board-panel" @click.stop>
        <header class="drawing-board-header">
          <h3 class="drawing-board-title">{{ drawingId ? "Edit drawing" : "New drawing" }}</h3>
          <p class="drawing-board-subtitle rpg-body">Index-card sketch</p>
        </header>

        <div class="drawing-board-canvas-wrap">
          <div ref="canvasRef" class="drawing-board-canvas" :style="{ aspectRatio: `${canvasWidth} / ${canvasHeight}` }"
            @pointerdown="onPointerDown" @pointermove="onPointerMove" @pointerup="onPointerUp"
            @pointercancel="onPointerUp" @pointerleave="onPointerUp">
            <svg class="drawing-board-svg" :viewBox="`0 0 ${canvasWidth} ${canvasHeight}`"
              xmlns="http://www.w3.org/2000/svg">
              <rect width="100%" height="100%" :fill="paperColor" />
              <path v-for="(path, index) in renderedPaths" :key="index" :d="path.d" :fill="path.color"
                :fill-opacity="path.opacity" />
              <path v-if="livePath" :d="livePath.d" :fill="livePath.color" :fill-opacity="livePath.opacity" />
            </svg>
          </div>
        </div>

        <div class="drawing-board-tools">
          <div class="drawing-board-tool-row">
            <button v-for="tool in toolKeys" :key="tool" type="button" class="drawing-board-tool"
              :class="{ 'drawing-board-tool--active': activeTool === tool }" @click="activeTool = tool">
              {{ TOOL_PRESETS[tool].label }}
            </button>
          </div>

          <div v-if="!TOOL_PRESETS[activeTool].colorLocked" class="drawing-board-colors">
            <button v-for="swatch in DRAWING_INK_COLORS" :key="swatch.id" type="button" class="drawing-board-color"
              :class="{ 'drawing-board-color--active': activeColor === swatch.hex }"
              :style="{ backgroundColor: swatch.hex }" :title="swatch.label" @click="activeColor = swatch.hex" />
          </div>
        </div>

        <footer class="drawing-board-footer">
          <div class="drawing-board-footer-left">
            <button type="button" class="rpg-button rpg-button-sm rpg-button-secondary" :disabled="strokes.length === 0"
              @click="undoStroke">
              Undo
            </button>
            <ConfirmTapButton label="Clear" confirm-label="Confirm" variant="danger" size="sm" :timeout-ms="2500"
              @confirm="clearStrokes" />
          </div>
          <div class="drawing-board-footer-actions">
            <button type="button" class="rpg-button rpg-button-sm rpg-button-secondary" @click="onCancel">
              Cancel
            </button>
            <button type="button" class="rpg-button rpg-button-sm rpg-button-primary" @click="onSave">
              Save drawing
            </button>
          </div>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import ConfirmTapButton from "@/components/ConfirmTapButton.vue";
import { useScrollLock } from "@/composables/useScrollLock";
import { useModalShortcuts } from "@/composables/useModalShortcuts";
import {
  DRAWING_CANVAS_HEIGHT,
  DRAWING_CANVAS_WIDTH,
  createEmptyDrawing,
  type DrawingDocument,
  type DrawingStroke,
  type DrawingTool,
  type NormalizedPoint,
} from "../drawing/types";
import {
  DEFAULT_DRAWING_COLOR,
  DRAWING_INK_COLORS,
  DRAWING_PAPER_COLOR,
  TOOL_PRESETS,
  resolveStrokeColor,
} from "../drawing/toolPresets";
import { normalizePoint, strokeToPreviewPath } from "../drawing/drawingCanvas";
import { simplifyNormalizedPoints } from "../drawing/simplifyPoints";
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
const canvasWidth = DRAWING_CANVAS_WIDTH;
const canvasHeight = DRAWING_CANVAS_HEIGHT;
const paperColor = DRAWING_PAPER_COLOR;

const strokes = ref<DrawingStroke[]>([]);
const activeTool = ref<DrawingTool>("pen");
const activeColor = ref<string>(DEFAULT_DRAWING_COLOR);
const activePointerId = ref<number | null>(null);
const currentPoints = ref<NormalizedPoint[]>([]);

const toolKeys = Object.keys(TOOL_PRESETS) as DrawingTool[];

watch(
  () => [open.value, props.initialDocument] as const,
  ([isOpen, doc]) => {
    if (!isOpen) return;
    strokes.value = doc?.strokes.map((s) => ({
      ...s,
      points: s.points.map((p) => [...p] as NormalizedPoint),
    })) ?? [];
    activeTool.value = "pen";
    activeColor.value = DEFAULT_DRAWING_COLOR;
    currentPoints.value = [];
    activePointerId.value = null;
  },
  { immediate: true },
);

const renderedPaths = computed(() =>
  strokes.value
    .map((stroke) => strokeToPreviewPath(stroke, canvasWidth, canvasHeight))
    .filter((p): p is NonNullable<typeof p> => Boolean(p)),
);

const livePath = computed(() => {
  if (currentPoints.value.length < 2) return null;
  const preset = TOOL_PRESETS[activeTool.value];
  const stroke: DrawingStroke = {
    tool: activeTool.value,
    color: resolveStrokeColor(activeTool.value, activeColor.value),
    size: preset.size,
    opacity: preset.opacity,
    points: currentPoints.value,
  };
  return strokeToPreviewPath(stroke, canvasWidth, canvasHeight);
});

function getCanvasPoint(event: PointerEvent): NormalizedPoint {
  const el = canvasRef.value;
  if (!el) return [0, 0];
  const rect = el.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * canvasWidth;
  const y = ((event.clientY - rect.top) / rect.height) * canvasHeight;
  const pressure = event.pressure > 0 ? event.pressure : undefined;
  return normalizePoint(x, y, canvasWidth, canvasHeight, pressure);
}

function onPointerDown(event: PointerEvent) {
  if (activePointerId.value !== null) return;
  activePointerId.value = event.pointerId;
  canvasRef.value?.setPointerCapture(event.pointerId);
  currentPoints.value = [getCanvasPoint(event)];
}

function onPointerMove(event: PointerEvent) {
  if (activePointerId.value !== event.pointerId) return;
  currentPoints.value = [...currentPoints.value, getCanvasPoint(event)];
}

function commitCurrentStroke() {
  if (currentPoints.value.length < 2) {
    currentPoints.value = [];
    return;
  }

  const preset = TOOL_PRESETS[activeTool.value];
  const simplified = simplifyNormalizedPoints(currentPoints.value);
  strokes.value.push({
    tool: activeTool.value,
    color: resolveStrokeColor(activeTool.value, activeColor.value),
    size: preset.size,
    opacity: preset.opacity,
    points: simplified.length >= 2 ? simplified : currentPoints.value,
  });
  currentPoints.value = [];
}

function onPointerUp(event: PointerEvent) {
  if (activePointerId.value !== event.pointerId) return;
  canvasRef.value?.releasePointerCapture(event.pointerId);
  activePointerId.value = null;
  commitCurrentStroke();
}

function undoStroke() {
  strokes.value = strokes.value.slice(0, -1);
}

function clearStrokes() {
  strokes.value = [];
  currentPoints.value = [];
}

function onSave() {
  if (currentPoints.value.length >= 2) {
    commitCurrentStroke();
  }

  const document: DrawingDocument = {
    ...createEmptyDrawing(),
    strokes: strokes.value.map((s) => ({
      ...s,
      points: s.points.map((p) => [...p] as NormalizedPoint),
    })),
  };

  emit("save", {
    id: props.drawingId ?? crypto.randomUUID(),
    document,
  });
  open.value = false;
}

function onCancel() {
  emit("cancel");
  open.value = false;
}

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
  padding: 1rem;
  border-radius: 0.5rem;
  background: white;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
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
}

.drawing-board-canvas {
  width: 100%;
  touch-action: none;
  cursor: crosshair;
  border: 2px solid #e5e5e5;
  border-radius: 0.375rem;
  overflow: hidden;
  user-select: none;
}

.drawing-board-svg {
  display: block;
  width: 100%;
  height: 100%;
}

.drawing-board-tools {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.drawing-board-tool-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.drawing-board-tool {
  padding: 0.35rem 0.65rem;
  border: 2px solid #e5e5e5;
  border-radius: 0.375rem;
  background: #fafafa;
  font-family: "nusaliver", "Arial Black", sans-serif;
  font-size: 0.65rem;
  font-weight: 900;
  text-transform: uppercase;
  cursor: pointer;
}

.drawing-board-tool--active {
  border-color: #dc2626;
  background: #fef2f2;
  color: #dc2626;
}

.drawing-board-colors {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.drawing-board-color {
  width: 1.75rem;
  height: 1.75rem;
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
  gap: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e5e5;
}

.drawing-board-footer-left {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.drawing-board-footer-actions {
  display: flex;
  gap: 0.5rem;
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
  }

  .drawing-board-footer-actions {
    margin-left: 0;
    width: 100%;
  }

  .drawing-board-footer-actions .rpg-button {
    flex: 1;
  }
}
</style>
