import getStroke from "perfect-freehand";
import type { DrawingDocument, DrawingStroke, NormalizedPoint } from "./types";
import { TOOL_PRESETS } from "./toolPresets";

export function denormalizePoint(
  point: NormalizedPoint,
  width: number,
  height: number,
): [number, number, number?] {
  const [x, y, pressure] = point;
  return [x * width, y * height, pressure];
}

export function normalizePoint(
  x: number,
  y: number,
  width: number,
  height: number,
  pressure?: number,
): NormalizedPoint {
  const nx = Math.min(1, Math.max(0, x / width));
  const ny = Math.min(1, Math.max(0, y / height));
  if (pressure === undefined) return [nx, ny];
  return [nx, ny, pressure];
}

function toStrokePoints(
  points: NormalizedPoint[],
  width: number,
  height: number,
): number[][] {
  return points.map((p) => {
    const [x, y, pressure] = denormalizePoint(p, width, height);
    if (pressure === undefined) return [x, y];
    return [x, y, pressure];
  });
}

function strokeToSvgPath(stroke: DrawingStroke, width: number, height: number): string {
  if (stroke.points.length < 2) return "";

  const preset = TOOL_PRESETS[stroke.tool];
  const points = toStrokePoints(stroke.points, width, height);
  const outline = getStroke(points, {
    size: stroke.size,
    thinning: preset.thinning,
    smoothing: preset.smoothing,
    simulatePressure: preset.simulatePressure,
    last: true,
  });

  if (outline.length < 2) return "";

  const d =
    outline.reduce((acc, [x, y], i) => {
      const prefix = i === 0 ? "M" : "L";
      return `${acc}${prefix}${x.toFixed(2)},${y.toFixed(2)} `;
    }, "") + "Z";

  return d.trim();
}

export function renderDrawingSvg(document: DrawingDocument): string {
  const paths = document.strokes
    .map((stroke) => {
      const d = strokeToSvgPath(stroke, document.width, document.height);
      if (!d) return "";
      return `<path d="${d}" fill="${stroke.color}" fill-opacity="${stroke.opacity}" stroke="none" />`;
    })
    .filter(Boolean)
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${document.width} ${document.height}" preserveAspectRatio="xMidYMid meet">${paths}</svg>`;
}

export function hasRenderableDrawing(document: DrawingDocument | undefined): boolean {
  return Boolean(document?.strokes.some((s) => s.points.length >= 2));
}
