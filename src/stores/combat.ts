import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Monster, Timer, CombatState } from "@/types";
import { useNotificationStore } from "./notifications";
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
      monsters.value = state.monsters;
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
  const activeMonsters = computed(() => monsters.value); // Show all monsters, including dead ones

  const activeTimers = computed(() => timers.value.filter((t) => t.remaining > 0));

  // Actions
  const addMonster = (monster: Omit<Monster, "id">) => {
    const newMonster: Monster = {
      ...monster,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    monsters.value.push(newMonster);
    saveState();
  };

  const updateMonster = (id: string, updates: Partial<Monster>) => {
    const index = monsters.value.findIndex((m) => m.id === id);
    if (index !== -1) {
      monsters.value[index] = { ...monsters.value[index], ...updates };
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

  const clearAll = () => {
    monsters.value = [];
    timers.value = [];
    currentTurn.value = 1;
    currentRound.value = 1;
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
    clearAll,
    saveState,
  };
});
