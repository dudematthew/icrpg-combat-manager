import type { NormalizedPoint } from "./types";

function perpendicularDistance(
  point: NormalizedPoint,
  lineStart: NormalizedPoint,
  lineEnd: NormalizedPoint,
): number {
  const [x, y] = point;
  const [x1, y1] = lineStart;
  const [x2, y2] = lineEnd;
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0) {
    return Math.hypot(x - x1, y - y1);
  }
  const t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy);
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.hypot(x - projX, y - projY);
}

function rdp(points: NormalizedPoint[], epsilon: number): NormalizedPoint[] {
  if (points.length <= 2) return points;

  const start = points[0];
  const end = points[points.length - 1];
  let maxDist = 0;
  let index = 0;

  for (let i = 1; i < points.length - 1; i += 1) {
    const dist = perpendicularDistance(points[i], start, end);
    if (dist > maxDist) {
      maxDist = dist;
      index = i;
    }
  }

  if (maxDist > epsilon) {
    const left = rdp(points.slice(0, index + 1), epsilon);
    const right = rdp(points.slice(index), epsilon);
    return [...left.slice(0, -1), ...right];
  }

  return [start, end];
}

export function simplifyNormalizedPoints(
  points: NormalizedPoint[],
  epsilon = 0.002,
): NormalizedPoint[] {
  if (points.length <= 2) return points;
  return rdp(points, epsilon);
}
