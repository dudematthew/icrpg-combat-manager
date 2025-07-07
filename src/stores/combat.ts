import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Monster, Timer, CombatState } from "@/types";
import { useInfoMonitorStore } from "./infoMonitor";

export const useCombatStore = defineStore("combat", () => {
  // State
  const sceneTargetNumber = ref(12);
  const monsters = ref<Monster[]>([]);
  const timers = ref<Timer[]>([]);
  const currentTurn = ref(1);
  const currentRound = ref(1);

  // Load from localStorage on init
  const loadState = () => {
    const saved = localStorage.getItem("icrpg-combat-state");
    if (saved) {
      const state: CombatState = JSON.parse(saved);
      sceneTargetNumber.value = state.sceneTargetNumber;

      // Migrate monsters for backward compatibility
      monsters.value = state.monsters.map((monster, index) => ({
        ...monster,
        doneTurn: monster.doneTurn || false,
        turnOrder: monster.turnOrder !== undefined ? monster.turnOrder : index,
        completionOrder: monster.completionOrder, // Keep existing or undefined
      }));

      // Migrate timers without type property to "rounds" for backward compatibility
      timers.value = state.timers.map((timer) => ({
        ...timer,
        type: timer.type || "rounds",
      }));
      currentTurn.value = state.currentTurn;
      currentRound.value = state.currentRound;
    }
  };

  // Save to localStorage
  const saveState = () => {
    const state: CombatState = {
      sceneTargetNumber: sceneTargetNumber.value,
      monsters: monsters.value,
      timers: timers.value,
      currentTurn: currentTurn.value,
      currentRound: currentRound.value,
    };
    localStorage.setItem("icrpg-combat-state", JSON.stringify(state));
  };

  // Initialize
  loadState();

  // Computed
  const activeMonsters = computed(() => {
    // Sort monsters: alive & not done, alive & done, dead
    return monsters.value.slice().sort((a, b) => {
      const aIsDead = a.heartsCurrent <= 0;
      const bIsDead = b.heartsCurrent <= 0;
      const aDoneTurn = a.doneTurn || false;
      const bDoneTurn = b.doneTurn || false;

      // Determine priority: 1 = active (alive, not done), 2 = done (alive, done), 3 = dead
      const aPriority = aIsDead ? 3 : aDoneTurn ? 2 : 1;
      const bPriority = bIsDead ? 3 : bDoneTurn ? 2 : 1;

      // Different priorities - sort by priority
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      // Same priority - maintain turn order
      return (a.turnOrder || 0) - (b.turnOrder || 0);
    });
  });

  const activeTimers = computed(() => timers.value.filter((t) => t.remaining > 0));

  // Actions
  const addMonster = (monster: Omit<Monster, "id">) => {
    // Find the highest turnOrder and add 1, or start at 0 if no monsters exist
    const maxTurnOrder =
      monsters.value.length > 0 ? Math.max(...monsters.value.map((m) => m.turnOrder || 0)) : -1;

    const newMonster: Monster = {
      ...monster,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      doneTurn: false,
      turnOrder: maxTurnOrder + 1,
      completionOrder: undefined,
    };
    monsters.value.push(newMonster);
    saveState();
  };

  const updateMonster = (id: string, updates: Partial<Monster>) => {
    const index = monsters.value.findIndex((m) => m.id === id);
    if (index !== -1) {
      const currentMonster = monsters.value[index];
      const updatedMonster = { ...currentMonster, ...updates };

      // If monster dies, reset doneTurn flag
      if (updatedMonster.heartsCurrent <= 0 && currentMonster.heartsCurrent > 0) {
        updatedMonster.doneTurn = false;
      }

      monsters.value[index] = updatedMonster;
      saveState();
    }
  };

  const removeMonster = (id: string) => {
    monsters.value = monsters.value.filter((m) => m.id !== id);
    saveState();
  };

  const applyDamage = (monsterId: string, damage: number) => {
    const monster = monsters.value.find((m) => m.id === monsterId);
    if (monster) {
      const newHearts = Math.max(0, monster.heartsCurrent - damage / 10);
      updateMonster(monsterId, { heartsCurrent: newHearts });
    }
  };

  const addTimer = (timer: Omit<Timer, "id">) => {
    const newTimer: Timer = {
      ...timer,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    timers.value.push(newTimer);
    saveState();
  };

  const updateTimer = (id: string, updates: Partial<Timer>) => {
    const index = timers.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      timers.value[index] = { ...timers.value[index], ...updates };
      saveState();
    }
  };

  const removeTimer = (id: string) => {
    timers.value = timers.value.filter((t) => t.id !== id);
    saveState();
  };

  const decrementTimer = (id: string) => {
    const timer = timers.value.find((t) => t.id === id);
    if (timer && timer.remaining > 0) {
      const newRemaining = timer.remaining - 1;
      updateTimer(id, { remaining: newRemaining });

      // Trigger info monitor when timer reaches 0
      if (newRemaining === 0) {
        const infoMonitorStore = useInfoMonitorStore();
        infoMonitorStore.showMonitor({
          message: timer.name,
          duration: 5000,
        });
      }
    }
  };

  const nextTurn = () => {
    currentTurn.value++;
    // Decrement turn-based timers
    timers.value.forEach((timer) => {
      if (timer.remaining > 0 && timer.type === "turns") {
        decrementTimer(timer.id);
      }
    });
    saveState();
  };

  const nextRound = () => {
    currentRound.value++;
    currentTurn.value = 1;

    // Update turn order based on completion order from this round
    const completedMonsters = monsters.value
      .filter((m) => m.completionOrder !== undefined)
      .sort((a, b) => (a.completionOrder || 0) - (b.completionOrder || 0));

    const uncompletedMonsters = monsters.value.filter((m) => m.completionOrder === undefined);

    // Reassign turn orders: completed monsters first (in completion order), then uncompleted
    let newTurnOrder = 0;
    completedMonsters.forEach((monster) => {
      updateMonster(monster.id, { turnOrder: newTurnOrder++ });
    });
    uncompletedMonsters.forEach((monster) => {
      updateMonster(monster.id, { turnOrder: newTurnOrder++ });
    });

    // Reset all done turn flags and completion orders for new round
    monsters.value.forEach((monster) => {
      const updates: Partial<Monster> = {};
      if (monster.doneTurn) {
        updates.doneTurn = false;
      }
      if (monster.completionOrder !== undefined) {
        updates.completionOrder = undefined;
      }
      if (Object.keys(updates).length > 0) {
        updateMonster(monster.id, updates);
      }
    });

    // Decrement round-based timers by 1
    timers.value.forEach((timer) => {
      if (timer.remaining > 0 && timer.type === "rounds") {
        decrementTimer(timer.id);
      }
    });
    // Apply auto-damage from conditions
    monsters.value.forEach((monster) => {
      if (monster.conditions.includes("Burning") || monster.conditions.includes("Bleeding")) {
        applyDamage(monster.id, 10); // 1 heart = 10 HP
      }
    });
    saveState();
  };

  const toggleCondition = (monsterId: string, condition: string) => {
    const monster = monsters.value.find((m) => m.id === monsterId);
    if (monster) {
      const conditions = monster.conditions.includes(condition)
        ? monster.conditions.filter((c) => c !== condition)
        : [...monster.conditions, condition];
      updateMonster(monsterId, { conditions });
    }
  };

  const toggleDoneTurn = (monsterId: string) => {
    const monster = monsters.value.find((m) => m.id === monsterId);
    if (monster) {
      const wasDone = monster.doneTurn;
      const newDoneTurnState = !monster.doneTurn;

      const updates: Partial<Monster> = { doneTurn: newDoneTurnState };

      // If marking as done (false -> true), assign completion order
      if (!wasDone && newDoneTurnState) {
        // Find the highest completion order and add 1, or start at 1
        const maxCompletionOrder = monsters.value
          .filter((m) => m.completionOrder !== undefined)
          .reduce((max, m) => Math.max(max, m.completionOrder || 0), 0);

        updates.completionOrder = maxCompletionOrder + 1;
        nextTurn();
      }
      // If unmarking (true -> false), clear completion order
      else if (wasDone && !newDoneTurnState) {
        updates.completionOrder = undefined;
      }

      // Update monster state
      updateMonster(monsterId, updates);
    }
  };

  const clearAll = () => {
    monsters.value = [];
    timers.value = [];
    currentTurn.value = 1;
    currentRound.value = 1;
    saveState();
  };

  const resetRoundsAndTurns = () => {
    currentTurn.value = 1;
    currentRound.value = 1;

    // Reset all done turn flags and completion orders
    monsters.value.forEach((monster) => {
      const updates: Partial<Monster> = {};
      if (monster.doneTurn) {
        updates.doneTurn = false;
      }
      if (monster.completionOrder !== undefined) {
        updates.completionOrder = undefined;
      }
      if (Object.keys(updates).length > 0) {
        updateMonster(monster.id, updates);
      }
    });

    saveState();
  };

  return {
    // State
    sceneTargetNumber,
    monsters,
    timers,
    currentTurn,
    currentRound,

    // Computed
    activeMonsters,
    activeTimers,

    // Actions
    addMonster,
    updateMonster,
    removeMonster,
    applyDamage,
    addTimer,
    updateTimer,
    removeTimer,
    decrementTimer,
    nextTurn,
    nextRound,
    toggleCondition,
    toggleDoneTurn,
    clearAll,
    resetRoundsAndTurns,
    saveState,
  };
});
