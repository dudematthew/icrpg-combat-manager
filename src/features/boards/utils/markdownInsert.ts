export function buildImageMarkdown(url: string, alt = "image"): string {
  const safeAlt = alt.replace(/[\[\]]/g, "").trim() || "image";
  return `![${safeAlt}](${url})`;
}

export {
  DRAWING_REF_PREFIX,
  buildDrawingMarkdown,
} from "../drawing/drawingRefs";

export function insertTextAtSelection(
  text: string,
  selectionStart: number,
  selectionEnd: number,
  insert: string,
): { text: string; cursor: number } {
  const before = text.slice(0, selectionStart);
  const after = text.slice(selectionEnd);
  const needsLeadingBreak = before.length > 0 && !before.endsWith("\n\n");
  const needsTrailingBreak = after.length > 0 && !after.startsWith("\n");
  const prefix = before.length === 0 ? "" : needsLeadingBreak ? "\n\n" : "";
  const suffix = after.length === 0 ? "" : needsTrailingBreak ? "\n\n" : "";
  const block = `${prefix}${insert}${suffix}`;
  const nextText = before + block + after;
  const cursor = before.length + block.length;
  return { text: nextText, cursor };
}

export function normalizeImageUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("/")) return trimmed;
  return `https://${trimmed}`;
}

export function isAllowedImageUrl(url: string): boolean {
  if (url.startsWith("/")) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}
