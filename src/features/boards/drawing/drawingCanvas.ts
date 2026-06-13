import getStroke from "perfect-freehand";
import type { DrawingDocument, DrawingStroke } from "./types";
import { getStrokeRenderOptions } from "./toolPresets";
import { denormalizePoint } from "./strokeRender";
import { FILL_SIZE_PRESETS, LABEL_FONT_SIZES } from "./toolPresets";

export { normalizePoint } from "./strokeRender";

export interface StrokePreviewPath {
  d: string;
  color: string;
  opacity: number;
}

export interface FillPreviewRect {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  opacity: number;
}

export interface LabelPreview {
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
}

export function strokeToPreviewPath(
  stroke: DrawingStroke,
  width: number,
  height: number,
  last = true,
): StrokePreviewPath | null {
  if (stroke.points.length < 2) return null;

  const points = stroke.points.map((p) => {
    const [x, y, pressure] = denormalizePoint(p, width, height);
    if (pressure === undefined) return [x, y];
    return [x, y, pressure];
  }) as number[][];
  const outline = getStroke(points, getStrokeRenderOptions(stroke.tool, stroke.size, last));

  if (outline.length < 2) return null;

  const d =
    outline.reduce((acc, [x, y], i) => {
      const prefix = i === 0 ? "M" : "L";
      return `${acc}${prefix}${x.toFixed(2)},${y.toFixed(2)} `;
    }, "") + "Z";

  return {
    d: d.trim(),
    color: stroke.color,
    opacity: stroke.opacity,
  };
}

export function documentToPreviewLayers(document: DrawingDocument, width: number, height: number) {
  return {
    fills: document.fills.map((fill) => {
      const preset = FILL_SIZE_PRESETS[fill.size];
      const w = preset.w * width;
      const h = preset.h * height;
      return {
        x: fill.x * width - w / 2,
        y: fill.y * height - h / 2,
        w,
        h,
        color: fill.color,
        opacity: fill.opacity,
      } satisfies FillPreviewRect;
    }),
    strokes: document.strokes
      .map((s) => strokeToPreviewPath(s, width, height))
      .filter((p): p is StrokePreviewPath => Boolean(p)),
    labels: document.labels.map((label) => ({
      x: label.x * width,
      y: label.y * height,
      text: label.text,
      color: label.color,
      fontSize: LABEL_FONT_SIZES[label.size],
    })) satisfies LabelPreview[],
  };
}
