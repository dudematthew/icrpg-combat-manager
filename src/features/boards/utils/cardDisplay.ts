import type { IndexCard } from "../types";
import { templateLabel } from "@/utils/monsterForm";

const FULL_NPC_TITLE = "Full NPC";

/** First line of multiline text when present. */
function firstLine(text: string): string {
  const line = text.split("\n")[0]?.trim();
  return line ?? "";
}

/** Body after the first line. */
function bodyAfterFirstLine(text: string): string {
  const idx = text.indexOf("\n");
  if (idx === -1) return "";
  return text.slice(idx + 1).trim();
}

export function getCardDisplayTitle(card: IndexCard): string {
  const payload = card.payload;

  if (payload?.kind === "monster") {
    const m = payload.data;
    return m.name?.trim() || templateLabel(m) || card.title;
  }

  if (payload?.kind === "timer") {
    return payload.data.name?.trim() || card.title;
  }

  if (card.kind === "text") {
    if (card.title === FULL_NPC_TITLE) {
      const name = firstLine(card.body);
      if (name) return name;
    }
    return card.title;
  }

  return card.title;
}

export function getCardDisplayNotes(card: IndexCard): string {
  if (card.kind === "text") {
    if (card.title === FULL_NPC_TITLE) {
      const rest = bodyAfterFirstLine(card.body);
      return rest || card.body.trim();
    }
    return card.body.trim();
  }

  if (card.payload?.kind === "monster") {
    return card.body.trim() || card.payload.data.notes?.trim() || "";
  }

  return card.body.trim();
}
