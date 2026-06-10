import type { Monster, Timer } from "@/types";
import { useCombatStore } from "@/stores/combat";
import type { CardPayload } from "../types";

export function deploySnapshotPayload(data: {
  monsters: Monster[];
  timers: Timer[];
  round: number;
  turn: number;
}): void {
  const combatStore = useCombatStore();
  combatStore.monsters = data.monsters.map((m) => ({ ...m }));
  combatStore.timers = data.timers.map((t) => ({ ...t }));
  combatStore.currentRound = data.round;
  combatStore.currentTurn = data.turn;
  combatStore.saveState();
}

export function captureSnapshotPayload(): CardPayload {
  const combatStore = useCombatStore();
  return {
    v: 1,
    kind: "snapshot",
    data: {
      monsters: combatStore.monsters.map((m) => ({ ...m })),
      timers: combatStore.timers.map((t) => ({ ...t })),
      round: combatStore.currentRound,
      turn: combatStore.currentTurn,
    },
  };
}
