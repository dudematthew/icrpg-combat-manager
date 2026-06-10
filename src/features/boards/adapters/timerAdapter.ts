import type { Timer } from "@/types";
import { useCombatStore } from "@/stores/combat";
import type { CardPayload } from "../types";

export function deployTimerPayload(data: Omit<Timer, "id" | "remaining">): void {
  const combatStore = useCombatStore();
  combatStore.addTimer({
    ...data,
    remaining: data.duration,
  });
}

export function captureTimerPayload(data: Omit<Timer, "id" | "remaining">): CardPayload {
  return { v: 1, kind: "timer", data };
}
