import type { IndexCard } from "../types";
import { getCardDisplayNotes, getCardDisplayTitle } from "./cardDisplay";

const DRAWING_LINE = /^\s*!\[[^\]]*\]\(icrpg-draw:[^)]+\)\s*$/;
const IMAGE_LINE = /^\s*!\[[^\]]*\]\([^)]+\)\s*$/;

function stripNonProseLines(text: string): string {
  return text
    .split("\n")
    .filter((line) => !DRAWING_LINE.test(line) && !IMAGE_LINE.test(line))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function buildBoardNotesPlainText(cards: IndexCard[]): string {
  const sections = cards
    .map((card) => {
      const title = getCardDisplayTitle(card);
      const notes = stripNonProseLines(getCardDisplayNotes(card));
      if (!notes) return `## ${title}`;
      return `## ${title}\n\n${notes}`;
    })
    .filter(Boolean);

  return sections.join("\n\n---\n\n");
}
