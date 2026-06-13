import type { BoardsState, IndexCard, IndexCardKind } from "@/features/boards/types";
import { normalizeDrawingDocument } from "@/features/boards/drawing/types";
import {
  isLegacySettingsBackup,
  type SettingsBackupData,
  type SettingsBackupOptions,
  type SettingsPersistedData,
} from "@/stores/settings";
import { sanitizeAppCards, pinNotesToBoardsColumn, ALL_CARD_IDS } from "@/utils/appCardColumns";
import { resolveCreatorSettings } from "@/utils/creatorSettings";
import type { CombatState, Monster, Timer } from "@/types";
import type { BackupEnvelopeV1 } from "./types";
import { parseBackupEnvelope } from "./validate";

const VALID_CARD_KINDS: IndexCardKind[] = ["text", "monster", "timer", "snapshot"];

const DEFAULT_APP_CARD_DEFS: Record<
  string,
  { name: string; description: string; enabled: boolean; column: "combat" | "boards" }
> = {
  timers: { name: "Timers", description: "Manage round and turn-based timers", enabled: true, column: "combat" },
  battlefield: { name: "Battlefield", description: "Combat management and monster tracking", enabled: true, column: "combat" },
  target: { name: "Checks", description: "Player checks and effort rolls against a chosen TN", enabled: true, column: "combat" },
  "monster-creator": { name: "Monster Creator", description: "Quick monster creation and management", enabled: true, column: "combat" },
  inspirations: { name: "Inspirations", description: "NPC and session inspiration rolls", enabled: true, column: "combat" },
  notes: { name: "Boards", description: "ICRPG index-card boards and session stash", enabled: true, column: "boards" },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asBool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeCardsMap(raw: unknown): Record<string, unknown> {
  if (isRecord(raw)) return raw;
  if (Array.isArray(raw) && raw.length === 0) return {};
  return {};
}

function normalizeIndexCard(raw: unknown, fallbackBoardId: string): IndexCard | null {
  if (!isRecord(raw)) return null;

  let kind = asString(raw.kind, "text") as IndexCardKind | "inspiration";
  let title = asString(raw.title, "Untitled");
  let body = asString(raw.body, "");
  let payload = raw.payload;

  if (kind === "inspiration") {
    const inspirationPayload = isRecord(payload) && payload.kind === "inspiration" && isRecord(payload.data)
      ? payload.data
      : null;
    kind = "text";
    title = asString(inspirationPayload?.category, title);
    body = asString(inspirationPayload?.text, body);
    payload = undefined;
  }

  if (!VALID_CARD_KINDS.includes(kind as IndexCardKind)) {
    kind = "text";
  }

  const id = asString(raw.id);
  if (!id) return null;

  const boardId = asString(raw.boardId, fallbackBoardId);
  const now = new Date().toISOString();

  const card: IndexCard = {
    id,
    boardId,
    kind,
    color: asString(raw.color, "Yellow"),
    title,
    body,
    collapsed: asBool(raw.collapsed, true),
    createdAt: asString(raw.createdAt, now),
    updatedAt: asString(raw.updatedAt, now),
  };

  if (payload !== undefined && payload !== null && isRecord(payload)) {
    card.payload = payload as IndexCard["payload"];
  }

  if (isRecord(raw.drawings)) {
    const drawings: NonNullable<IndexCard["drawings"]> = {};
    for (const [drawingId, drawingRaw] of Object.entries(raw.drawings)) {
      drawings[drawingId] = normalizeDrawingDocument(drawingRaw);
    }
    if (Object.keys(drawings).length > 0) {
      card.drawings = drawings;
    }
  }

  return card;
}

export function normalizeBoardsState(raw: unknown): BoardsState {
  const source = isRecord(raw) ? raw : {};
  const boardsRaw = Array.isArray(source.boards) ? source.boards : [];
  const cardsRaw = normalizeCardsMap(source.cards);

  const boards = boardsRaw
    .map((boardRaw) => {
      if (!isRecord(boardRaw)) return null;
      const id = asString(boardRaw.id);
      if (!id) return null;
      return {
        id,
        name: asString(boardRaw.name, "Session"),
        createdAt: asString(boardRaw.createdAt, new Date().toISOString()),
        cardIds: Array.isArray(boardRaw.cardIds)
          ? boardRaw.cardIds.filter((cardId): cardId is string => typeof cardId === "string")
          : [],
      };
    })
    .filter((board): board is BoardsState["boards"][number] => board !== null);

  const defaultBoardId = boards[0]?.id ?? "default-board";
  if (boards.length === 0) {
    boards.push({
      id: defaultBoardId,
      name: "Session",
      createdAt: new Date().toISOString(),
      cardIds: [],
    });
  }

  const cards: BoardsState["cards"] = {};
  for (const [cardId, cardRaw] of Object.entries(cardsRaw)) {
    const parentBoardId =
      boards.find((board) => board.cardIds.includes(cardId))?.id ?? boards[0].id;
    const card = normalizeIndexCard(isRecord(cardRaw) ? { ...cardRaw, id: asString(cardRaw.id, cardId) } : null, parentBoardId);
    if (card) {
      cards[card.id] = card;
    }
  }

  for (const board of boards) {
    board.cardIds = board.cardIds.filter((cardId) => cardId in cards);
  }

  let activeBoardId = typeof source.activeBoardId === "string" ? source.activeBoardId : null;
  if (!activeBoardId || !boards.some((board) => board.id === activeBoardId)) {
    activeBoardId = boards[0]?.id ?? null;
  }

  return { boards, cards, activeBoardId };
}

function normalizeMonster(raw: unknown, index: number): Monster | null {
  if (!isRecord(raw)) return null;
  const id = asString(raw.id);
  if (!id) return null;

  return {
    id,
    color: asString(raw.color, "Grey"),
    letter: asString(raw.letter, String.fromCharCode(65 + (index % 26))),
    heartsMax: asNumber(raw.heartsMax, 1),
    heartsCurrent: asNumber(raw.heartsCurrent, asNumber(raw.heartsMax, 1)),
    tier: raw.tier === "I" || raw.tier === "II" || raw.tier === "III" || raw.tier === "IV" ? raw.tier : "I",
    statsBonus: asNumber(raw.statsBonus, 0),
    effortBonus: asNumber(raw.effortBonus, 0),
    actions: asNumber(raw.actions, 1),
    conditions: Array.isArray(raw.conditions) ? raw.conditions.filter((c): c is string => typeof c === "string") : [],
    notes: asString(raw.notes, ""),
    name: typeof raw.name === "string" ? raw.name : undefined,
    specialAbilities: typeof raw.specialAbilities === "string" ? raw.specialAbilities : undefined,
    doneTurn: asBool(raw.doneTurn, false),
    turnOrder: asNumber(raw.turnOrder, index),
    completionOrder: typeof raw.completionOrder === "number" ? raw.completionOrder : undefined,
    manualStatsBonus: typeof raw.manualStatsBonus === "number" ? raw.manualStatsBonus : undefined,
    manualEffortBonus: typeof raw.manualEffortBonus === "number" ? raw.manualEffortBonus : undefined,
    manualActions: typeof raw.manualActions === "number" ? raw.manualActions : undefined,
    manualHearts: typeof raw.manualHearts === "number" ? raw.manualHearts : undefined,
  };
}

function normalizeTimer(raw: unknown): Timer | null {
  if (!isRecord(raw)) return null;
  const id = asString(raw.id);
  if (!id) return null;

  const duration = asNumber(raw.duration, 1);
  const type = raw.type === "rounds" || raw.type === "turns" || raw.type === "manual" ? raw.type : "rounds";

  return {
    id,
    name: asString(raw.name, "Timer"),
    duration,
    remaining: asNumber(raw.remaining, duration),
    type,
    color: typeof raw.color === "string" ? raw.color : undefined,
  };
}

export function normalizeCombatState(raw: unknown): CombatState {
  const source = isRecord(raw) ? raw : {};
  const monstersRaw = Array.isArray(source.monsters) ? source.monsters : [];
  const timersRaw = Array.isArray(source.timers) ? source.timers : [];

  return {
    sceneTargetNumber: asNumber(source.sceneTargetNumber, 12),
    monsters: monstersRaw
      .map((monster, index) => normalizeMonster(monster, index))
      .filter((monster): monster is Monster => monster !== null),
    timers: timersRaw.map((timer) => normalizeTimer(timer)).filter((timer): timer is Timer => timer !== null),
    currentTurn: asNumber(source.currentTurn, 1),
    currentRound: asNumber(source.currentRound, 1),
  };
}

function normalizeAppCards(raw: unknown): SettingsBackupData["appCards"] {
  const saved = Array.isArray(raw) ? raw : [];
  const cleaned = saved
    .filter((card): card is Record<string, unknown> => isRecord(card))
    .filter((card) => card.id !== "library")
    .map((card) =>
      pinNotesToBoardsColumn({
        id: asString(card.id),
        name: asString(card.name, DEFAULT_APP_CARD_DEFS[asString(card.id)]?.name ?? "Card"),
        description: asString(card.description, DEFAULT_APP_CARD_DEFS[asString(card.id)]?.description ?? ""),
        enabled: asBool(card.enabled, true),
        column: card.column === "boards" ? "boards" : "combat",
      }),
    )
    .filter((card) => card.id.length > 0);

  const knownIds = new Set(cleaned.map((card) => card.id));
  for (const id of ALL_CARD_IDS) {
    if (!knownIds.has(id) && DEFAULT_APP_CARD_DEFS[id]) {
      cleaned.push({ id, ...DEFAULT_APP_CARD_DEFS[id] });
    }
  }

  return sanitizeAppCards(cleaned);
}

function normalizeSettingsOptions(
  raw: Partial<SettingsBackupOptions> & { keepCreatorFieldsOnLibrarySave?: boolean },
): SettingsBackupOptions {
  const creator = resolveCreatorSettings({
    creatorLayout: raw.creatorLayout,
    creatorStatSource: raw.creatorStatSource,
    fastMode: raw.fastMode,
    tierMode: raw.tierMode,
  });

  const notifications = isRecord(raw.notifications)
    ? {
        timerDone: asBool(raw.notifications.timerDone, true),
        turnAutoIncremented: asBool(raw.notifications.turnAutoIncremented, true),
        roundEnded: asBool(raw.notifications.roundEnded, false),
      }
    : { timerDone: true, turnAutoIncremented: true, roundEnded: false };

  return {
    creatorLayout: creator.creatorLayout,
    creatorStatSource: creator.creatorStatSource,
    compactThreshold: asNumber(raw.compactThreshold, 2),
    showTitleCard: asBool(raw.showTitleCard, true),
    showCreditsCard: asBool(raw.showCreditsCard, true),
    showCompactConditions: asBool(raw.showCompactConditions, false),
    autoTurnIncrement: asBool(raw.autoTurnIncrement, true),
    showSectionNav: asBool(raw.showSectionNav, true),
    timerColorModeDefault: asBool(raw.timerColorModeDefault, true),
    timerNamingMode: raw.timerNamingMode === "named" || raw.timerNamingMode === "color" ? raw.timerNamingMode : "both",
    keepCreatorFieldsOnBoardSave: asBool(
      raw.keepCreatorFieldsOnBoardSave ?? raw.keepCreatorFieldsOnLibrarySave,
      true,
    ),
    boardCardExpandPreview: asBool(raw.boardCardExpandPreview, false),
    defaultNewCardColor: asString(raw.defaultNewCardColor, "Yellow"),
    scrollOnDeployMode: raw.scrollOnDeployMode === "hold" ? "hold" : "always",
    notifications,
  };
}

export function normalizeSettingsBackup(
  raw: SettingsBackupData | SettingsPersistedData,
  includeOptions: boolean,
): SettingsBackupData {
  const normalized: SettingsBackupData = {
    appCards: normalizeAppCards(raw.appCards),
  };

  if (!includeOptions) {
    return normalized;
  }

  if (isLegacySettingsBackup(raw)) {
    normalized.options = normalizeSettingsOptions(raw);
    return normalized;
  }

  if (raw.options) {
    normalized.options = normalizeSettingsOptions(raw.options);
  }

  return normalized;
}

export function prepareBackupDataForExport(data: BackupEnvelopeV1["data"], includeOptions: boolean): BackupEnvelopeV1["data"] {
  return {
    combat: normalizeCombatState(data.combat),
    boards: normalizeBoardsState(data.boards),
    settings: normalizeSettingsBackup(data.settings, includeOptions),
  };
}

/** Normalize live store data to the current backup schema (throws if still invalid). */
export function prepareBackupEnvelopeForExport(envelope: BackupEnvelopeV1, includeOptions: boolean): BackupEnvelopeV1 {
  const prepared: BackupEnvelopeV1 = {
    ...envelope,
    data: prepareBackupDataForExport(envelope.data, includeOptions),
  };
  return parseBackupEnvelope(prepared);
}
