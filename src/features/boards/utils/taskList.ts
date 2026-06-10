/** GFM task list line: optional indent, bullet, [ ] or [x]. */
export const TASK_LINE_RE = /^(\s*[-*+]\s+)\[([ xX])\](.*)$/;

export function isTaskListLine(line: string): boolean {
  return TASK_LINE_RE.test(line);
}

/** Source line indices for each task item, in render order (top-to-bottom). */
export function getTaskLineIndices(body: string): number[] {
  const lines = body.split("\n");
  const indices: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (isTaskListLine(lines[i])) indices.push(i);
  }
  return indices;
}

export function isTaskChecked(state: string): boolean {
  return state === "x" || state === "X";
}

/** Toggle [ ] <-> [x] on a specific source line. Returns null if not a task line. */
export function toggleTaskListLine(body: string, lineIndex: number): string | null {
  const lines = body.split("\n");
  if (lineIndex < 0 || lineIndex >= lines.length) return null;

  const match = lines[lineIndex].match(TASK_LINE_RE);
  if (!match) return null;

  const [, prefix, state, rest] = match;
  const nextState = isTaskChecked(state) ? " " : "x";
  lines[lineIndex] = `${prefix}[${nextState}]${rest}`;
  return lines.join("\n");
}

const TASK_LIST_ITEM_RE =
  /<li([^>]*class="[^"]*task-list-item[^"]*"[^>]*)>/g;

/** Attach source line numbers to rendered task list items for click-to-toggle. */
export function injectTaskLineAttributes(html: string, lineIndices: number[]): string {
  let taskIndex = 0;
  return html.replace(TASK_LIST_ITEM_RE, (match, attrs: string) => {
    if (/data-task-line=/.test(attrs)) return match;
    const line = lineIndices[taskIndex++];
    if (line === undefined) return match;
    return `<li data-task-line="${line}"${attrs}>`;
  });
}

export function countRenderedTaskItems(html: string): number {
  return [...html.matchAll(TASK_LIST_ITEM_RE)].length;
}
