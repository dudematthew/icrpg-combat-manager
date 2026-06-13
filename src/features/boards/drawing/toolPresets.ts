import type { DrawingTool, BrushSize, DrawingStroke } from "./types";

export const DRAWING_PAPER_COLOR = "#fffef8";

export const DRAWING_INK_COLORS = [
  { id: "red", label: "Red", hex: "#dc2626" },
  { id: "black", label: "Black", hex: "#171717" },
  { id: "green", label: "Green", hex: "#059669" },
  { id: "violet", label: "Violet", hex: "#7c3aed" },
  { id: "orange", label: "Orange", hex: "#d97706" },
  { id: "grey", label: "Grey", hex: "#525252" },
] as const;

export const HIGHLIGHTER_COLORS = [
  { id: "yellow", label: "Yellow", hex: "#eab308" },
  { id: "green", label: "Green", hex: "#86efac" },
  { id: "pink", label: "Pink", hex: "#f9a8d4" },
] as const;

export const DEFAULT_DRAWING_COLOR = DRAWING_INK_COLORS[1].hex;
export const DEFAULT_HIGHLIGHTER_COLOR = HIGHLIGHTER_COLORS[0].hex;

export interface ToolPreset {
  label: string;
  size: number;
  thinning: number;
  smoothing: number;
  streamline: number;
  opacity: number;
  simulatePressure: boolean;
  colorMode?: "ink" | "highlighter" | "none";
  pointerMode?: "draw" | "tap" | "label";
}

export const TOOL_PRESETS: Record<DrawingTool, ToolPreset> = {
  pen: {
    label: "Pen",
    size: 2,
    thinning: 0.6,
    smoothing: 0.5,
    streamline: 0.68,
    opacity: 1,
    simulatePressure: true,
    colorMode: "ink",
    pointerMode: "draw",
  },
  marker: {
    label: "Marker",
    size: 6,
    thinning: 0.4,
    smoothing: 0.5,
    streamline: 0.55,
    opacity: 1,
    simulatePressure: true,
    colorMode: "ink",
    pointerMode: "draw",
  },
  highlighter: {
    label: "Highlight",
    size: 17,
    thinning: 0.15,
    smoothing: 0,
    streamline: 0,
    opacity: 0.25,
    simulatePressure: false,
    colorMode: "highlighter",
    pointerMode: "draw",
  },
  eraser: {
    label: "Eraser",
    size: 10,
    thinning: 0.35,
    smoothing: 0,
    streamline: 0,
    opacity: 1,
    simulatePressure: false,
    colorMode: "none",
    pointerMode: "draw",
  },
  strokeEraser: {
    label: "Pick eraser",
    size: 0,
    thinning: 0,
    smoothing: 0,
    streamline: 0,
    opacity: 1,
    simulatePressure: false,
    colorMode: "none",
    pointerMode: "tap",
  },
  label: {
    label: "Label",
    size: 0,
    thinning: 0,
    smoothing: 0,
    streamline: 0,
    opacity: 1,
    simulatePressure: false,
    colorMode: "ink",
    pointerMode: "label",
  },
};

/** @deprecated Legacy rectangle highlights — no longer created; kept for old saved SVG render only. */
export const FILL_SIZE_PRESETS = {
  s: { w: 0.15, h: 0.09 },
  m: { w: 0.25, h: 0.15 },
  l: { w: 0.4, h: 0.24 },
} as const;

export const MARKER_STROKE_SIZES: Record<BrushSize, number> = {
  s: 4,
  m: 6,
  l: 10,
};

export const HIGHLIGHTER_STROKE_SIZES: Record<BrushSize, number> = {
  s: 12,
  m: 17,
  l: 24,
};

export const LABEL_FONT_SIZES = { s: 12, m: 16, l: 22 } as const;

export function resolveStrokeColor(tool: DrawingTool, selectedColor: string, highlighterColor: string): string {
  if (tool === "eraser") return DRAWING_PAPER_COLOR;
  if (tool === "highlighter") return highlighterColor;
  return selectedColor;
}

export function resolveStrokeSize(tool: DrawingTool, brushSize: BrushSize): number {
  if (tool === "marker") return MARKER_STROKE_SIZES[brushSize];
  if (tool === "highlighter") return HIGHLIGHTER_STROKE_SIZES[brushSize];
  return TOOL_PRESETS[tool].size;
}

export function getStrokeRenderOptions(
  tool: DrawingStroke["tool"],
  size: number,
  last = true,
) {
  const toolKey = tool === "eraser" ? "eraser" : tool;
  const preset = TOOL_PRESETS[toolKey as DrawingTool] ?? TOOL_PRESETS.pen;
  return {
    size,
    thinning: preset.thinning,
    smoothing: preset.smoothing,
    streamline: preset.streamline,
    simulatePressure: preset.simulatePressure,
    last,
  };
}

export function usesStrokeSmoothing(tool: DrawingStroke["tool"]): boolean {
  return tool === "pen" || tool === "marker";
}
