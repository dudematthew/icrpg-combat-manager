export type DrawingTool = "pen" | "marker" | "highlighter" | "whiteout";

export type NormalizedPoint = [number, number, number?];

export interface DrawingStroke {
  tool: DrawingTool;
  color: string;
  size: number;
  opacity: number;
  points: NormalizedPoint[];
}

export interface DrawingDocument {
  v: 1;
  width: number;
  height: number;
  strokes: DrawingStroke[];
}

export const DRAWING_CANVAS_WIDTH = 400;
export const DRAWING_CANVAS_HEIGHT = 240;

export function createEmptyDrawing(): DrawingDocument {
  return {
    v: 1,
    width: DRAWING_CANVAS_WIDTH,
    height: DRAWING_CANVAS_HEIGHT,
    strokes: [],
  };
}

export type DrawingId = string;
