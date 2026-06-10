import type { AppCard, AppColumn } from "@/stores/settings";

export const BOARDS_CARD_ID = "notes";

export const COMBAT_CARD_IDS = [
  "timers",
  "battlefield",
  "target",
  "monster-creator",
  "inspirations",
] as const;

export type CombatCardId = (typeof COMBAT_CARD_IDS)[number];

export const ALL_CARD_IDS = [...COMBAT_CARD_IDS, BOARDS_CARD_ID] as const;

const COMBAT_ID_SET = new Set<string>(COMBAT_CARD_IDS);

export function isBoardsCard(id: string): boolean {
  return id === BOARDS_CARD_ID;
}

export function isCombatCard(id: string): boolean {
  return COMBAT_ID_SET.has(id);
}

/** Notes always lives on the board column. */
export function pinNotesToBoardsColumn(card: AppCard): AppCard {
  if (card.id !== BOARDS_CARD_ID) return card;
  return { ...card, column: "boards" };
}

export function sanitizeAppCards(cards: AppCard[]): AppCard[] {
  return cards.map(pinNotesToBoardsColumn);
}

export function orderAppCards(cards: AppCard[]): AppCard[] {
  const orderIndex = Object.fromEntries(
    [...COMBAT_CARD_IDS, BOARDS_CARD_ID].map((id, i) => [id, i]),
  );
  return [...cards].sort((a, b) => (orderIndex[a.id] ?? 99) - (orderIndex[b.id] ?? 99));
}

export function splitAppCardsBySection(cards: AppCard[]): {
  combat: AppCard[];
  boards: AppCard[];
} {
  const sanitized = sanitizeAppCards(cards);
  return {
    combat: sanitized.filter((c) => c.column === "combat"),
    boards: sanitized.filter((c) => c.column === "boards"),
  };
}

/** Settings UI: boards card is fixed between above/below drag lists. */
export function splitAppCardsForSettings(cards: AppCard[]): {
  combat: AppCard[];
  boardsAbovePinned: AppCard[];
  boardsBelowPinned: AppCard[];
  boardsPinned: AppCard | null;
} {
  const sanitized = sanitizeAppCards(cards);
  const boardsPinned = sanitized.find((c) => isBoardsCard(c.id)) ?? null;
  const combat = sanitized.filter((c) => c.column === "combat" && !isBoardsCard(c.id));

  if (!boardsPinned) {
    const orphanBoards = sanitized.filter((c) => c.column === "boards" && !isBoardsCard(c.id));
    return {
      combat,
      boardsAbovePinned: orphanBoards,
      boardsBelowPinned: [],
      boardsPinned: null,
    };
  }

  const boardsAbovePinned: AppCard[] = [];
  const boardsBelowPinned: AppCard[] = [];
  let pastPinned = false;

  for (const card of sanitized) {
    if (isBoardsCard(card.id)) {
      pastPinned = true;
      continue;
    }
    if (card.column !== "boards") continue;
    if (pastPinned) boardsBelowPinned.push(card);
    else boardsAbovePinned.push(card);
  }

  return { combat, boardsAbovePinned, boardsBelowPinned, boardsPinned };
}

export function mergeSettingsSections(
  combat: AppCard[],
  boardsAbovePinned: AppCard[],
  boardsBelowPinned: AppCard[],
  boardsPinned: AppCard | null,
): AppCard[] {
  const boards = boardsPinned
    ? [...boardsAbovePinned, boardsPinned, ...boardsBelowPinned]
    : [...boardsAbovePinned, ...boardsBelowPinned];
  return mergeAppCardSections(
    combat.filter((c) => !isBoardsCard(c.id)),
    boards,
  );
}

export type SectionMergeResult =
  | { ok: true; combat: AppCard[]; boards: AppCard[] }
  | { ok: false; reason: "combat-empty" | "notes-on-combat" };

/** Apply list membership as column assignment with layout rules. */
export function validateSectionMerge(
  combat: AppCard[],
  boards: AppCard[],
): SectionMergeResult {
  const notesInCombat = combat.some((c) => c.id === BOARDS_CARD_ID);
  if (notesInCombat) {
    return { ok: false, reason: "notes-on-combat" };
  }

  const combatCards = combat.map((c) => ({ ...c, column: "combat" as const }));
  const boardCards = boards.map((c) => ({ ...c, column: "boards" as const }));

  if (combatCards.length === 0) {
    return { ok: false, reason: "combat-empty" };
  }

  return { ok: true, combat: combatCards, boards: boardCards };
}

export function mergeAppCardSections(combat: AppCard[], boards: AppCard[]): AppCard[] {
  const result = validateSectionMerge(combat, boards);
  if (!result.ok) {
    throw new Error(result.reason);
  }
  return [
    ...result.combat,
    ...result.boards.map(pinNotesToBoardsColumn),
  ];
}

export function boardsColumnVisible(cards: AppCard[]): boolean {
  const notes = sanitizeAppCards(cards).find((c) => isBoardsCard(c.id));
  return Boolean(notes?.enabled);
}

/** @deprecated Use boardsColumnVisible — same logic. */
export const boardsPanelVisible = boardsColumnVisible;

export function assignColumn(card: AppCard, column: AppColumn): AppCard {
  if (card.id === BOARDS_CARD_ID) {
    return { ...card, column: "boards" };
  }
  return { ...card, column };
}

/** Whether the settings modal should show a drag handle for this card. */
export function canDragAppCardInSettings(
  cardId: string,
  section: AppColumn,
  combatSectionCount: number,
): boolean {
  if (isBoardsCard(cardId)) return false;
  if (section === "combat" && combatSectionCount <= 1) return false;
  return true;
}
