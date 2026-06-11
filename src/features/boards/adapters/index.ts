import type { Component } from "vue";
import {
  FileText,
  Skull,
  Clock,
  Sparkles,
  Camera,
} from "lucide-vue-next";
import type { IndexCard, IndexCardKind, CardPayload } from "../types";
import { deployMonsterPayload } from "./monsterAdapter";
import { deployTimerPayload } from "./timerAdapter";
import { deployInspirationPayload } from "./inspirationAdapter";
import { deploySnapshotPayload } from "./snapshotAdapter";
import { formatPayloadPreview } from "../utils/payloadPreview";
import { afterDeployScroll, scrollTargetForKind } from "@/composables/useDeployScroll";

export interface PayloadAdapter {
  kind: IndexCardKind;
  icon: Component;
  label: string;
  deploySummary(card: IndexCard): string;
  deploy(card: IndexCard, held?: boolean): void;
}

const adapters: Record<IndexCardKind, PayloadAdapter> = {
  text: {
    kind: "text",
    icon: FileText,
    label: "Note",
    deploySummary: () => "Read-only note",
    deploy: () => {},
  },
  monster: {
    kind: "monster",
    icon: Skull,
    label: "Monster",
    deploySummary: (card) => formatPayloadPreview(card) || card.title,
    deploy: (card, held = false) => {
      if (card.payload?.kind === "monster") deployMonsterPayload(card.payload.data);
      afterDeployScroll(scrollTargetForKind("monster"), held);
    },
  },
  timer: {
    kind: "timer",
    icon: Clock,
    label: "Timer",
    deploySummary: (card) => formatPayloadPreview(card) || card.title,
    deploy: (card, held = false) => {
      if (card.payload?.kind === "timer") deployTimerPayload(card.payload.data);
      afterDeployScroll(scrollTargetForKind("timer"), held);
    },
  },
  inspiration: {
    kind: "inspiration",
    icon: Sparkles,
    label: "Inspiration",
    deploySummary: (card) => formatPayloadPreview(card) || card.title,
    deploy: (card) => {
      if (card.payload?.kind === "inspiration") deployInspirationPayload(card.payload.data);
    },
  },
  snapshot: {
    kind: "snapshot",
    icon: Camera,
    label: "Snapshot",
    deploySummary: (card) => formatPayloadPreview(card) || card.title,
    deploy: (card, held = false) => {
      if (card.payload?.kind === "snapshot") deploySnapshotPayload(card.payload.data);
      afterDeployScroll(scrollTargetForKind("snapshot"), held);
    },
  },
};

export function getAdapter(kind: IndexCardKind): PayloadAdapter {
  return adapters[kind];
}

export function canDeploy(kind: IndexCardKind): boolean {
  return kind !== "text";
}

export type { CardPayload };
