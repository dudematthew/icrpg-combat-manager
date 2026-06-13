import type { NormalizedPoint } from "./types";

/** Max gap between stored points (~1.2px on a 400px-wide canvas). */
export const STROKE_MIN_SEGMENT = 0.003;

function interpolatePoint(a: NormalizedPoint, b: NormalizedPoint, t: number): NormalizedPoint {
  const x = a[0] + (b[0] - a[0]) * t;
  const y = a[1] + (b[1] - a[1]) * t;
  if (a.length === 3 && b.length === 3) {
    return [x, y, a[2]! + (b[2]! - a[2]!) * t];
  }
  return [x, y];
}

function segmentPoints(
  from: NormalizedPoint,
  to: NormalizedPoint,
  minSegmentLength: number,
): NormalizedPoint[] {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const dist = Math.hypot(dx, dy);
  const steps = Math.max(1, Math.ceil(dist / minSegmentLength));
  if (steps === 1) return [to];

  const points: NormalizedPoint[] = [];
  for (let s = 1; s <= steps; s += 1) {
    points.push(interpolatePoint(from, to, s / steps));
  }
  return points;
}

/** Append a captured point, filling large pointer-move gaps with interpolated samples. */
export function appendNormalizedPoint(
  points: NormalizedPoint[],
  next: NormalizedPoint,
  minSegmentLength = STROKE_MIN_SEGMENT,
): NormalizedPoint[] {
  if (points.length === 0) return [next];

  const last = points[points.length - 1];
  const dx = next[0] - last[0];
  const dy = next[1] - last[1];
  if (Math.hypot(dx, dy) < minSegmentLength * 0.2) return points;

  return [...points, ...segmentPoints(last, next, minSegmentLength)];
}

/** Densify an entire stroke before commit (covers any missed move events). */
export function densifyNormalizedPoints(
  points: NormalizedPoint[],
  minSegmentLength = STROKE_MIN_SEGMENT,
): NormalizedPoint[] {
  if (points.length <= 1) return points;

  const result: NormalizedPoint[] = [points[0]];
  for (let i = 1; i < points.length; i += 1) {
    result.push(...segmentPoints(result[result.length - 1], points[i], minSegmentLength));
  }
  return result;
}
