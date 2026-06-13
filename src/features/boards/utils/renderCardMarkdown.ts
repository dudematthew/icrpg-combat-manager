import { renderMarkdown } from "./markdown";
import { DRAWING_REF_PREFIX } from "../drawing/drawingRefs";
import type { DrawingDocument, DrawingId } from "../drawing/types";

export type MarkdownSegment =
  | { type: "html"; content: string }
  | { type: "drawing"; id: DrawingId; alt: string };

const DRAWING_TOKEN =
  /!\[([^\]]*)\]\(icrpg-draw:([a-zA-Z0-9_-]+)\)/g;

export function splitCardMarkdown(body: string): MarkdownSegment[] {
  if (!body.trim()) return [];

  const segments: MarkdownSegment[] = [];
  let lastIndex = 0;

  for (const match of body.matchAll(DRAWING_TOKEN)) {
    const index = match.index ?? 0;
    const before = body.slice(lastIndex, index);
    if (before.trim()) {
      segments.push({ type: "html", content: renderMarkdown(before) });
    }
    segments.push({
      type: "drawing",
      id: match[2],
      alt: match[1] || "Sketch",
    });
    lastIndex = index + match[0].length;
  }

  const tail = body.slice(lastIndex);
  if (tail.trim()) {
    segments.push({ type: "html", content: renderMarkdown(tail) });
  }

  return segments;
}

export function resolveDrawingSegment(
  id: DrawingId,
  drawings: Record<DrawingId, DrawingDocument> | undefined,
): DrawingDocument | undefined {
  return drawings?.[id];
}

export function isDrawingRefUrl(url: string): boolean {
  return url.startsWith(DRAWING_REF_PREFIX);
}
