export type DrawingTool =
  | "pen"
  | "marker"
  | "highlighter"
  | "eraser"
  | "strokeEraser"
  | "label";

export type FillSize = "s" | "m" | "l";
export type BrushSize = FillSize;
export type HighlightSize = BrushSize;
export type MarkerSize = BrushSize;
export type LabelSize = "s" | "m" | "l";

export type NormalizedPoint = [number, number, number?];

export interface DrawingStroke {
  id: string;
  tool: "pen" | "marker" | "highlighter" | "eraser";
  color: string;
  size: number;
  opacity: number;
  points: NormalizedPoint[];
}

export interface DrawingFill {
  id: string;
  color: string;
  size: FillSize;
  x: number;
  y: number;
  opacity: number;
}

export interface DrawingLabel {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  size: LabelSize;
}

export interface DrawingDocument {
  v: 2;
  width: number;
  height: number;
  fills: DrawingFill[];
  strokes: DrawingStroke[];
  labels: DrawingLabel[];
}

export const DRAWING_CANVAS_WIDTH = 400;
export const DRAWING_CANVAS_HEIGHT = 240;

export function createEmptyDrawing(): DrawingDocument {
  return {
    v: 2,
    width: DRAWING_CANVAS_WIDTH,
    height: DRAWING_CANVAS_HEIGHT,
    fills: [],
    strokes: [],
    labels: [],
  };
}

export type DrawingId = string;

function mapLegacyStrokeTool(tool: string): DrawingStroke["tool"] {
  if (tool === "whiteout") return "eraser";
  if (tool === "pen" || tool === "marker" || tool === "highlighter" || tool === "eraser") return tool;
  return "pen";
}

export function cloneDrawingDocument(doc: DrawingDocument): DrawingDocument {
  return {
    ...doc,
    fills: doc.fills.map((f) => ({ ...f })),
    strokes: doc.strokes.map((s) => ({
      ...s,
      points: s.points.map((p) => [...p] as NormalizedPoint),
    })),
    labels: doc.labels.map((l) => ({ ...l })),
  };
}

/** @deprecated v1 shape for migration */
interface DrawingDocumentV1 {
  v: 1;
  width: number;
  height: number;
  strokes: Array<{
    tool: string;
    color: string;
    size: number;
    opacity: number;
    points: NormalizedPoint[];
    id?: string;
  }>;
}

export function normalizeDrawingDocument(raw: unknown): DrawingDocument {
  if (!raw || typeof raw !== "object") return createEmptyDrawing();

  const doc = raw as Partial<DrawingDocument> & Partial<DrawingDocumentV1>;

  if (doc.v === 2 && Array.isArray(doc.strokes)) {
    return cloneDrawingDocument({
      v: 2,
      width: doc.width ?? DRAWING_CANVAS_WIDTH,
      height: doc.height ?? DRAWING_CANVAS_HEIGHT,
      fills: Array.isArray(doc.fills) ? doc.fills : [],
      strokes: doc.strokes.map((s) => ({
        id: s.id ?? crypto.randomUUID(),
        tool: mapLegacyStrokeTool(s.tool),
        color: s.color,
        size: s.size,
        opacity: s.opacity,
        points: s.points.map((p) => [...p] as NormalizedPoint),
      })),
      labels: Array.isArray(doc.labels) ? doc.labels : [],
    });
  }

  if (doc.v === 1 && Array.isArray(doc.strokes)) {
    return normalizeDrawingDocument({
      v: 2,
      width: doc.width ?? DRAWING_CANVAS_WIDTH,
      height: doc.height ?? DRAWING_CANVAS_HEIGHT,
      fills: [],
      strokes: doc.strokes.map((s) => ({
        id: s.id ?? crypto.randomUUID(),
        tool: mapLegacyStrokeTool(s.tool),
        color: s.color,
        size: s.size,
        opacity: s.opacity,
        points: s.points,
      })),
      labels: [],
    });
  }

  return createEmptyDrawing();
}
