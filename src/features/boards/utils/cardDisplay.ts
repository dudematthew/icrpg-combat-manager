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

export function getPayloadIdentityName(card: IndexCard): string | null {
  const payload = card.payload;
  if (payload?.kind === "monster") {
    const m = payload.data;
    return m.name?.trim() || templateLabel(m) || null;
  }
  if (payload?.kind === "timer") {
    return payload.data.name?.trim() || null;
  }
  return null;
}

export function getCardDisplayTitle(card: IndexCard): string {
  const payload = card.payload;

  if (payload?.kind === "monster" || payload?.kind === "timer") {
    const title = card.title.trim();
    if (title) return title;
    return getPayloadIdentityName(card) || card.title;
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

/** Apply card field updates and keep payload name/color in sync when present. */
export function mergeIndexCardUpdates(card: IndexCard, updates: Partial<IndexCard>): IndexCard {
  const next: IndexCard = {
    ...card,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  if (updates.color !== undefined && next.payload) {
    if (next.payload.kind === "monster") {
      next.payload = {
        ...next.payload,
        data: { ...next.payload.data, color: updates.color },
      };
    } else if (next.payload.kind === "timer") {
      next.payload = {
        ...next.payload,
        data: { ...next.payload.data, color: updates.color },
      };
    }
  }

  return next;
}
