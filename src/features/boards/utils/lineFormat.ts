export type LineFormat = "h1" | "h2" | "h3" | "bullet" | "task" | "bold" | "italic" | "quote";

function wrapSelection(
  text: string,
  selectionStart: number,
  selectionEnd: number,
  marker: string,
): { text: string; cursor: number } | null {
  if (selectionStart === selectionEnd) return null;
  const selected = text.slice(selectionStart, selectionEnd);
  const wrapped = `${marker}${selected}${marker}`;
  const newText = text.slice(0, selectionStart) + wrapped + text.slice(selectionEnd);
  return { text: newText, cursor: selectionStart + wrapped.length };
}

/** Apply a line-prefix or wrap selection in a textarea (touch toolbar). */
export function applyLineFormat(
  text: string,
  selectionStart: number,
  selectionEnd: number,
  format: LineFormat,
): { text: string; cursor: number } {
  const lineStart = text.lastIndexOf("\n", selectionStart - 1) + 1;
  const lineEnd = text.indexOf("\n", selectionEnd);
  const end = lineEnd === -1 ? text.length : lineEnd;
  const line = text.slice(lineStart, end);

  let newLine = line;
  let cursor = selectionEnd;

  switch (format) {
    case "h1":
      newLine = line.replace(/^(#{1,3}\s)?/, "# ");
      cursor = lineStart + newLine.length;
      break;
    case "h2":
      newLine = line.replace(/^(#{1,3}\s)?/, "## ");
      cursor = lineStart + newLine.length;
      break;
    case "h3":
      newLine = line.replace(/^(#{1,3}\s)?/, "### ");
      cursor = lineStart + newLine.length;
      break;
    case "bullet":
      newLine = line.match(/^[-*+]\s/) ? line : `- ${line}`;
      cursor = lineStart + newLine.length;
      break;
    case "task": {
      const taskMatch = line.match(/^(\s*)[-*+]\s+\[([ xX])\]\s*(.*)$/);
      if (taskMatch) {
        const [, indent, state, rest] = taskMatch;
        const nextState = state === "x" || state === "X" ? " " : "x";
        newLine = `${indent}- [${nextState}] ${rest}`;
      } else {
        const stripped = line.replace(/^[-*+]\s+/, "");
        newLine = `- [ ] ${stripped}`;
      }
      cursor = lineStart + newLine.length;
      break;
    }
    case "quote":
      newLine = line.match(/^>\s/) ? line : `> ${line}`;
      cursor = lineStart + newLine.length;
      break;
    case "bold": {
      const wrapped = wrapSelection(text, selectionStart, selectionEnd, "**");
      if (wrapped) return wrapped;
      return { text, cursor: selectionStart };
    }
    case "italic": {
      const wrapped = wrapSelection(text, selectionStart, selectionEnd, "*");
      if (wrapped) return wrapped;
      return { text, cursor: selectionStart };
    }
  }

  const newText = text.slice(0, lineStart) + newLine + text.slice(end);
  return { text: newText, cursor };
}
