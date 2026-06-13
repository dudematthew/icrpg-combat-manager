import type { DrawingTool } from "./types";

export const DRAWING_PAPER_COLOR = "#fffef8";

export const DRAWING_INK_COLORS = [
  { id: "red", label: "Red", hex: "#dc2626" },
  { id: "black", label: "Black", hex: "#171717" },
  { id: "green", label: "Green", hex: "#059669" },
  { id: "violet", label: "Violet", hex: "#7c3aed" },
  { id: "orange", label: "Orange", hex: "#d97706" },
  { id: "grey", label: "Grey", hex: "#525252" },
] as const;

export const DEFAULT_DRAWING_COLOR = DRAWING_INK_COLORS[1].hex;

export interface ToolPreset {
  label: string;
  size: number;
  thinning: number;
  smoothing: number;
  opacity: number;
  simulatePressure: boolean;
  colorLocked?: boolean;
  fixedColor?: string;
}

export const TOOL_PRESETS: Record<DrawingTool, ToolPreset> = {
  pen: {
    label: "Pen",
    size: 2,
    thinning: 0.6,
    smoothing: 0.5,
    opacity: 1,
    simulatePressure: true,
  },
  marker: {
    label: "Marker",
    size: 6,
    thinning: 0.4,
    smoothing: 0.5,
    opacity: 1,
    simulatePressure: true,
  },
  highlighter: {
    label: "Highlight",
    size: 14,
    thinning: 0.15,
    smoothing: 0.65,
    opacity: 0.25,
    simulatePressure: true,
    colorLocked: true,
    fixedColor: "#eab308",
  },
  whiteout: {
    label: "Whiteout",
    size: 10,
    thinning: 0.35,
    smoothing: 0.5,
    opacity: 1,
    simulatePressure: true,
    colorLocked: true,
    fixedColor: DRAWING_PAPER_COLOR,
  },
};

export function resolveStrokeColor(tool: DrawingTool, selectedColor: string): string {
  const preset = TOOL_PRESETS[tool];
  if (preset.colorLocked && preset.fixedColor) {
    return preset.fixedColor;
  }
  return selectedColor;
}
