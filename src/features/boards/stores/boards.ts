import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { MonsterTemplate } from "@/types";
import { generateId } from "@/utils/generateId";
import { templateLabel } from "@/utils/monsterForm";
import type { Board, BoardId, BoardsState, CardPayload, IndexCard, IndexCardId, IndexCardKind } from "../types";
import { captureSnapshotPayload } from "../adapters/snapshotAdapter";
import { captureMonsterPayload } from "../adapters/monsterAdapter";

const STORAGE_KEY = "icrpg-boards";
const LIBRARY_KEY = "icrpg-monster-library";

export const useBoardsStore = defineStore("boards", () => {
  const boards = ref<Board[]>([]);
  const cards = ref<Record<IndexCardId, IndexCard>>({});
  const activeBoardId = ref<BoardId | null>(null);

  const migrateFromLibrary = () => {
    const libRaw = localStorage.getItem(LIBRARY_KEY);
    if (!libRaw || boards.value.length > 0) return;

    const templates = JSON.parse(libRaw) as MonsterTemplate[];
    if (!templates.length) {
      localStorage.removeItem(LIBRARY_KEY);
      return;
    }

    const boardId = generateId();
    const board: Board = {
      id: boardId,
      name: "Stash",
      createdAt: new Date().toISOString(),
      cardIds: [],
    };

    for (const template of templates) {
      const cardId = generateId();
      const card: IndexCard = {
        id: cardId,
        boardId,
        kind: "monster",
        color: template.color || "Grey",
        title: template.label || templateLabel(template),
        body: template.notes || "",
        collapsed: true,
        createdAt: template.savedAt || new Date().toISOString(),
        updatedAt: template.savedAt || new Date().toISOString(),
        payload: { v: 1, kind: "monster", data: template },
      };
      cards.value[cardId] = card;
      board.cardIds.push(cardId);
    }

    boards.value = [board];
    activeBoardId.value = boardId;
    localStorage.removeItem(LIBRARY_KEY);
    persist();
  };

  const migrateInspirationCards = () => {
    let changed = false;
    for (const id of Object.keys(cards.value)) {
      const card = cards.value[id];
      if ((card.kind as string) !== "inspiration") continue;

      const payload = card.payload as
        | { v: 1; kind: "inspiration"; data: { category: string; text: string } }
        | undefined;
      const title = payload?.kind === "inspiration" ? payload.data.category : card.title;
      const body = payload?.kind === "inspiration" ? payload.data.text : card.body;

      cards.value[id] = {
        ...card,
        kind: "text",
        title: title || card.title,
        body: body || card.body,
        payload: undefined,
        updatedAt: new Date().toISOString(),
      };
      changed = true;
    }
    if (changed) persist();
  };

  const ensureDefaultBoard = () => {
    if (boards.value.length === 0) {
      const boardId = generateId();
      boards.value = [
        {
          id: boardId,
          name: "Session",
          createdAt: new Date().toISOString(),
          cardIds: [],
        },
      ];
      activeBoardId.value = boardId;
      persist();
    } else if (!activeBoardId.value || !boards.value.find((b) => b.id === activeBoardId.value)) {
      activeBoardId.value = boards.value[0].id;
      persist();
    }
  };

  const load = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const state = JSON.parse(saved) as {
        boards: Board[];
        cards: Record<IndexCardId, IndexCard>;
        activeBoardId: BoardId | null;
      };
      boards.value = state.boards || [];
      cards.value = state.cards || {};
      activeBoardId.value = state.activeBoardId;
      migrateInspirationCards();
    }
    migrateFromLibrary();
    ensureDefaultBoard();
  };

  const exportState = (): BoardsState => ({
    boards: boards.value,
    cards: cards.value,
    activeBoardId: activeBoardId.value,
  });

  const importState = (state: BoardsState) => {
    boards.value = state.boards || [];
    cards.value = state.cards || {};
    activeBoardId.value = state.activeBoardId;
    migrateInspirationCards();
    ensureDefaultBoard();
    persist();
  };

  const persist = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(exportState()));
  };

  load();

  const activeBoard = computed(() =>
    boards.value.find((b) => b.id === activeBoardId.value) ?? null,
  );

  const cardsForActiveBoard = computed((): IndexCard[] => {
    const board = activeBoard.value;
    if (!board) return [];
    return board.cardIds.map((id) => cards.value[id]).filter(Boolean);
  });

  const createBoard = (name: string) => {
    const board: Board = {
      id: generateId(),
      name,
      createdAt: new Date().toISOString(),
      cardIds: [],
    };
    boards.value.push(board);
    activeBoardId.value = board.id;
    persist();
    return board;
  };

  const setActiveBoard = (id: BoardId) => {
    activeBoardId.value = id;
    persist();
  };

  const removeBoard = (id: BoardId) => {
    if (boards.value.length <= 1) return;
    const board = boards.value.find((b) => b.id === id);
    if (!board) return;
    for (const cardId of board.cardIds) {
      delete cards.value[cardId];
    }
    boards.value = boards.value.filter((b) => b.id !== id);
    if (activeBoardId.value === id) {
      activeBoardId.value = boards.value[0]?.id ?? null;
    }
    persist();
  };

  const addCard = (
    partial: Pick<IndexCard, "kind" | "color" | "title" | "body"> & {
      payload?: CardPayload;
    },
    boardId?: BoardId,
  ): IndexCard => {
    const targetBoardId = boardId ?? activeBoardId.value;
    const board = boards.value.find((b) => b.id === targetBoardId);
    if (!board) throw new Error("No active board");

    const now = new Date().toISOString();
    const card: IndexCard = {
      id: generateId(),
      boardId: board.id,
      kind: partial.kind,
      color: partial.color,
      title: partial.title,
      body: partial.body,
      collapsed: true,
      createdAt: now,
      updatedAt: now,
      payload: partial.payload,
    };
    cards.value[card.id] = card;
    board.cardIds.push(card.id);
    persist();
    return card;
  };

  const updateCard = (id: IndexCardId, updates: Partial<IndexCard>) => {
    const card = cards.value[id];
    if (!card) return;
    cards.value[id] = { ...card, ...updates, updatedAt: new Date().toISOString() };
    persist();
  };

  const removeCard = (id: IndexCardId) => {
    const card = cards.value[id];
    if (!card) return;
    const board = boards.value.find((b) => b.id === card.boardId);
    if (board) {
      board.cardIds = board.cardIds.filter((cid) => cid !== id);
    }
    delete cards.value[id];
    persist();
  };

  const toggleCardCollapsed = (id: IndexCardId) => {
    const card = cards.value[id];
    if (card) updateCard(id, { collapsed: !card.collapsed });
  };

  const reorderBoardCards = (cardIds: IndexCardId[], boardId?: BoardId) => {
    const targetBoardId = boardId ?? activeBoardId.value;
    const board = boards.value.find((b) => b.id === targetBoardId);
    if (!board) return;

    const validIds = new Set(board.cardIds);
    const nextIds = cardIds.filter((id) => validIds.has(id));
    if (nextIds.length !== board.cardIds.length) return;
    if (nextIds.join(",") === board.cardIds.join(",")) return;

    board.cardIds = nextIds;
    persist();
  };

  const pushPayloadCard = (
    kind: Exclude<IndexCardKind, "text">,
    title: string,
    color: string,
    payload: CardPayload,
    body = "",
  ) => {
    return addCard({ kind, color, title, body, payload });
  };

  const addMonsterCard = (data: Omit<MonsterTemplate, "label" | "savedAt">) => {
    const payload = captureMonsterPayload(data as MonsterTemplate);
    const title = data.name?.trim() || templateLabel(data as MonsterTemplate);
    const body = data.notes?.trim() || "";
    return pushPayloadCard("monster", title, data.color, payload, body);
  };

  const addTextCard = (title = "New note", color = "Yellow") => {
    return addCard({ kind: "text", color, title, body: "" });
  };

  const captureSnapshot = () => {
    const payload = captureSnapshotPayload();
    if (payload.kind !== "snapshot") return null;
    const { round, turn, monsters, timers } = payload.data;
    return pushPayloadCard(
      "snapshot",
      `Snapshot R${round} T${turn}`,
      "Blue",
      payload,
      `${monsters.length} monsters, ${timers.length} timers`,
    );
  };

  return {
    boards,
    cards,
    activeBoardId,
    activeBoard,
    cardsForActiveBoard,
    createBoard,
    setActiveBoard,
    removeBoard,
    addCard,
    updateCard,
    removeCard,
    toggleCardCollapsed,
    reorderBoardCards,
    pushPayloadCard,
    addMonsterCard,
    addTextCard,
    captureSnapshot,
    exportState,
    importState,
  };
});
