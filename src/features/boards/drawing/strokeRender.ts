import getStroke from "perfect-freehand";
import type {
  DrawingDocument,
  DrawingFill,
  DrawingLabel,
  DrawingStroke,
  LabelSize,
  NormalizedPoint,
} from "./types";
import { FILL_SIZE_PRESETS, LABEL_FONT_SIZES, getStrokeRenderOptions } from "./toolPresets";
import { normalizeDrawingDocument } from "./types";

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

  const points = toStrokePoints(stroke.points, width, height);
  const outline = getStroke(points, getStrokeRenderOptions(stroke.tool, stroke.size));

  if (outline.length < 2) return "";

  const d =
    outline.reduce((acc, [x, y], i) => {
      const prefix = i === 0 ? "M" : "L";
      return `${acc}${prefix}${x.toFixed(2)},${y.toFixed(2)} `;
    }, "") + "Z";

  return d.trim();
}

function fillToSvgRect(fill: DrawingFill, width: number, height: number): string {
  const preset = FILL_SIZE_PRESETS[fill.size];
  const w = preset.w * width;
  const h = preset.h * height;
  const x = fill.x * width - w / 2;
  const y = fill.y * height - h / 2;
  const rx = Math.min(w, h) * 0.08;
  return `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" rx="${rx.toFixed(2)}" fill="${fill.color}" fill-opacity="${fill.opacity}" />`;
}

function labelToSvgText(label: DrawingLabel, width: number, height: number): string {
  const fontSize = LABEL_FONT_SIZES[label.size];
  const x = label.x * width;
  const y = label.y * height;
  const escaped = label.text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<text x="${x.toFixed(2)}" y="${y.toFixed(2)}" fill="${label.color}" font-size="${fontSize}" font-family="'Source Serif Pro', Georgia, serif" dominant-baseline="middle" text-anchor="middle">${escaped}</text>`;
}

export function renderDrawingSvg(rawDocument: DrawingDocument | unknown): string {
  const document = normalizeDrawingDocument(rawDocument);
  const { width, height } = document;

  const fillPaths = document.fills.map((f) => fillToSvgRect(f, width, height)).join("");
  const strokePaths = document.strokes
    .map((stroke) => {
      const d = strokeToSvgPath(stroke, width, height);
      if (!d) return "";
      return `<path d="${d}" fill="${stroke.color}" fill-opacity="${stroke.opacity}" stroke="none" />`;
    })
    .filter(Boolean)
    .join("");
  const labelPaths = document.labels.map((l) => labelToSvgText(l, width, height)).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">${fillPaths}${strokePaths}${labelPaths}</svg>`;
}

export function hasRenderableDrawing(rawDocument: DrawingDocument | unknown | undefined): boolean {
  if (!rawDocument) return false;
  const document = normalizeDrawingDocument(rawDocument);
  return (
    document.strokes.some((s) => s.points.length >= 2) ||
    document.fills.length > 0 ||
    document.labels.some((l) => l.text.trim().length > 0)
  );
}
