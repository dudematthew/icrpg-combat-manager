import getStroke from "perfect-freehand";
import type { DrawingStroke, NormalizedPoint } from "./types";
import { TOOL_PRESETS } from "./toolPresets";
import { denormalizePoint } from "./strokeRender";

export { normalizePoint } from "./strokeRender";

export interface StrokePreviewPath {
  d: string;
  color: string;
  opacity: number;
}

export function strokeToPreviewPath(
  stroke: DrawingStroke,
  width: number,
  height: number,
): StrokePreviewPath | null {
  if (stroke.points.length < 2) return null;

  const preset = TOOL_PRESETS[stroke.tool];
  const points = stroke.points.map((p) => {
    const [x, y, pressure] = denormalizePoint(p, width, height);
    if (pressure === undefined) return [x, y];
    return [x, y, pressure];
  }) as number[][];
  const outline = getStroke(points, {
    size: stroke.size,
    thinning: preset.thinning,
    smoothing: preset.smoothing,
    simulatePressure: preset.simulatePressure,
    last: true,
  });

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
