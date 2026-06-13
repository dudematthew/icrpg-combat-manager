import type { Monster, MonsterTemplate, Timer } from "@/types";
import type { DrawingDocument } from "./drawing/types";

export type BoardId = string;
export type IndexCardId = string;
export type IndexCardKind = "text" | "monster" | "timer" | "snapshot";
export type AppColumn = "combat" | "boards";

export interface Board {
  id: BoardId;
  name: string;
  createdAt: string;
  cardIds: IndexCardId[];
}

export interface IndexCardBase {
  id: IndexCardId;
  boardId: BoardId;
  kind: IndexCardKind;
  color: string;
  title: string;
  body: string;
  collapsed: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CardPayload =
  | { v: 1; kind: "monster"; data: MonsterTemplate }
  | { v: 1; kind: "timer"; data: Omit<Timer, "id" | "remaining"> }
  | {
      v: 1;
      kind: "snapshot";
      data: { monsters: Monster[]; timers: Timer[]; round: number; turn: number };
    };

export type IndexCard = IndexCardBase & {
  payload?: CardPayload;
  drawings?: Record<string, DrawingDocument>;
};

export interface BoardsState {
  boards: Board[];
  cards: Record<IndexCardId, IndexCard>;
  activeBoardId: BoardId | null;
}
