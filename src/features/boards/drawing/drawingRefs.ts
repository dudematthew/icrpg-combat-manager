import type { DrawingDocument, DrawingId } from "./types";

export const DRAWING_REF_PREFIX = "icrpg-draw:";

const DRAWING_REF_PATTERN =
  /!\[([^\]]*)\]\(icrpg-draw:([a-zA-Z0-9_-]+)\)/g;

export function buildDrawingMarkdown(id: DrawingId, alt = "Sketch"): string {
  const safeAlt = alt.replace(/[\[\]]/g, "").trim() || "Sketch";
  return `![${safeAlt}](${DRAWING_REF_PREFIX}${id})`;
}

export function extractDrawingIds(markdown: string): DrawingId[] {
  const ids = new Set<DrawingId>();
  for (const match of markdown.matchAll(DRAWING_REF_PATTERN)) {
    ids.add(match[2]);
  }
  return [...ids];
}

export function cleanupOrphanDrawings(
  body: string,
  drawings: Record<DrawingId, DrawingDocument> | undefined,
): Record<DrawingId, DrawingDocument> | undefined {
  if (!drawings || Object.keys(drawings).length === 0) return drawings;

  const referenced = new Set(extractDrawingIds(body));
  const next: Record<DrawingId, DrawingDocument> = {};
  for (const [id, doc] of Object.entries(drawings)) {
    if (referenced.has(id)) {
      next[id] = doc;
    }
  }
  return Object.keys(next).length > 0 ? next : undefined;
}

export function findDrawingRefAtLine(body: string, lineIndex: number): DrawingId | null {
  const lines = body.split("\n");
  const line = lines[lineIndex];
  if (!line) return null;
  const match = line.match(/!\[[^\]]*\]\(icrpg-draw:([a-zA-Z0-9_-]+)\)/);
  return match?.[1] ?? null;
}

export function findDrawingRefNearCursor(body: string, cursor: number): DrawingId | null {
  const lineIndex = body.slice(0, cursor).split("\n").length - 1;
  return findDrawingRefAtLine(body, lineIndex);
}
