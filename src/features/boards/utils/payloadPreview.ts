import type { IndexCard } from "../types";
import { templateLabel } from "@/utils/monsterForm";

const CARD_FACE_MAX_LINES = 2;
const CARD_FACE_LINE_CHARS = 72;

function truncateLine(text: string, max = CARD_FACE_LINE_CHARS): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

function capLines(lines: string[], maxLines = CARD_FACE_MAX_LINES): string[] {
  return lines.slice(0, maxLines).map((line) => truncateLine(line));
}

export function getPayloadPreviewLines(card: IndexCard): string[] {
  const payload = card.payload;
  if (!payload) return [];

  switch (payload.kind) {
    case "monster": {
      const m = payload.data;
      const lines = [
        m.name?.trim() || templateLabel(m),
        `Tier ${m.tier} · +${m.statsBonus} · ${m.actions} action${m.actions === 1 ? "" : "s"} · ${m.heartsMax} heart${m.heartsMax === 1 ? "" : "s"}`,
      ];
      if (m.effortBonus > 0) lines.push(`+${m.effortBonus} effort`);
      if (m.specialAbilities?.trim()) {
        const s = m.specialAbilities.trim();
        lines.push(s.length > 100 ? `${s.slice(0, 100)}…` : s);
      }
      return lines;
    }
    case "timer": {
      const t = payload.data;
      return [t.name, `${t.duration} ${t.type}`];
    }
    case "snapshot": {
      const d = payload.data;
      return [
        `Round ${d.round}, Turn ${d.turn}`,
        `${d.monsters.length} monster${d.monsters.length === 1 ? "" : "s"}, ${d.timers.length} timer${d.timers.length === 1 ? "" : "s"}`,
      ];
    }
    default:
      return [];
  }
}

/** Compact payload for index card front-face (max two short lines). */
export function getCardFacePayloadLines(card: IndexCard): string[] {
  const payload = card.payload;
  if (!payload) return [];

  switch (payload.kind) {
    case "monster": {
      const m = payload.data;
      const stats = [
        `T${m.tier}`,
        `+${m.statsBonus}`,
        `${m.actions} act`,
        `${m.heartsMax} hr`,
      ];
      if (m.effortBonus > 0) stats.push(`+${m.effortBonus} eff`);
      const lines = [stats.join(" · ")];
      if (m.specialAbilities?.trim()) {
        lines.push(m.specialAbilities.trim());
      }
      return capLines(lines);
    }
    case "timer": {
      const t = payload.data;
      return capLines([`${t.duration} ${t.type} · ${t.name}`]);
    }
    case "snapshot": {
      const d = payload.data;
      return capLines([
        `R${d.round} T${d.turn} · ${d.monsters.length} monster${d.monsters.length === 1 ? "" : "s"}, ${d.timers.length} timer${d.timers.length === 1 ? "" : "s"}`,
      ]);
    }
    default:
      return [];
  }
}

export function formatPayloadPreview(card: IndexCard): string {
  return getPayloadPreviewLines(card).join("\n");
}

export function formatCardFacePayloadPreview(card: IndexCard): string {
  return getCardFacePayloadLines(card).join("\n");
}
