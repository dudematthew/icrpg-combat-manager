import type { DrawingStroke, NormalizedPoint } from "./types";
import { denormalizePoint } from "./strokeRender";

function distToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function strokeMinDistance(stroke: DrawingStroke, width: number, height: number, px: number, py: number): number {
  const points = stroke.points.map((p) => denormalizePoint(p, width, height));
  let min = Infinity;
  for (let i = 1; i < points.length; i += 1) {
    const [x1, y1] = points[i - 1];
    const [x2, y2] = points[i];
    min = Math.min(min, distToSegment(px, py, x1, y1, x2, y2));
  }
  return min;
}

export function findStrokeAtPoint(
  strokes: DrawingStroke[],
  width: number,
  height: number,
  nx: number,
  ny: number,
  thresholdPx = 12,
  options?: { excludeTools?: DrawingStroke["tool"][] },
): DrawingStroke | null {
  const px = nx * width;
  const py = ny * height;
  const excluded = options?.excludeTools ?? [];
  let best: DrawingStroke | null = null;
  let bestDist = thresholdPx;

  for (let i = strokes.length - 1; i >= 0; i -= 1) {
    const stroke = strokes[i];
    if (excluded.includes(stroke.tool)) continue;
    if (stroke.points.length < 2) continue;
    const dist = strokeMinDistance(stroke, width, height, px, py);
    if (dist <= bestDist) {
      bestDist = dist;
      best = stroke;
    }
  }

  return best;
}

/** Ink strokes only — pick eraser ignores paper-colored eraser overlays. */
export function findInkStrokeAtPoint(
  strokes: DrawingStroke[],
  width: number,
  height: number,
  nx: number,
  ny: number,
  thresholdPx = 12,
): DrawingStroke | null {
  return findStrokeAtPoint(strokes, width, height, nx, ny, thresholdPx, {
    excludeTools: ["eraser"],
  });
}

export function normalizedCanvasPoint(
  event: PointerEvent,
  el: HTMLElement,
  width: number,
  height: number,
): NormalizedPoint {
  const rect = el.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * width;
  const y = ((event.clientY - rect.top) / rect.height) * height;
  const pressure = event.pressure > 0 ? event.pressure : undefined;
  const nx = Math.min(1, Math.max(0, x / width));
  const ny = Math.min(1, Math.max(0, y / height));
  if (pressure === undefined) return [nx, ny];
  return [nx, ny, pressure];
}
