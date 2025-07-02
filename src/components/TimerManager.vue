<template>
  <div class="timer-manager">
    <div class="mb-3 rpg-card">
      <div class="flex items-center gap-2 mb-6">
        <img src="/images/clock_icon.png" class="flex-shrink-0 mb-3 w-5 h-5 text-accent icon-filter" alt="Timers" />
        <h2 class="rpg-heading">Timers</h2>
      </div>

      <div class="flex flex-col flex-wrap gap-4 mb-6">
        <div>
          <label class="rpg-label">Timer Name</label>
          <div class="flex gap-2">
            <input v-model="newTimer.name" placeholder="e.g., Building collapses" class="flex-1 rpg-input" />
            <button @click="generateTimerName" class="p-0 rpg-button rpg-button-secondary"
              title="Generate random clock name">
              <img src="/images/d6_dice_icon.png" class="h-5 icon-filter" alt="Generate name" />
            </button>
          </div>
        </div>
        <div>
          <label class="rpg-label">Timer Type</label>
          <select v-model="newTimer.type" class="rpg-input">
            <option value="rounds">Rounds</option>
            <option value="turns">Turns</option>
          </select>
        </div>
        <div>
          <label class="rpg-label">Duration ({{ newTimer.type }})</label>
          <div class="flex gap-2">
            <input v-model.number="newTimer.duration" type="number" :min="1" :max="20" placeholder="5"
              class="flex-1 rpg-input" />
            <button @click="generateDuration" class="p-0 rpg-button rpg-button-secondary"
              title="Roll d4 for random duration">
              <img src="/images/d4_dice_icon.png" class="h-5 icon-filter" alt="Roll d4" />
            </button>
          </div>
        </div>
        <div class="flex items-end">
          <button @click="addTimer" :disabled="!newTimer.name || !newTimer.duration"
            class="disabled:opacity-50 disabled:cursor-not-allowed rpg-button rpg-button-primary">
            <img src="/images/clock_icon.png" class="mb-1 h-5 icon-filter" alt="Add timer" />
            Add Timer
          </button>
        </div>
      </div>

      <!-- Active Timers -->
      <div v-if="activeTimers.length > 0" class="space-y-3">
        <h3 class="text-base rpg-heading">Active Timers</h3>
        <div v-for="timer in activeTimers" :key="timer.id" class="bg-neutral-50 rpg-card"
          :class="{ 'border-l-4 border-l-danger bg-red-50': timer.remaining <= 0 }">
          <div class="flex justify-between items-center">
            <div class="flex-1">
              <div class="text-sm rpg-heading">{{ timer.name }}</div>
              <div class="text-neutral-600 text-sm rpg-body">
                Duration: {{ timer.duration }} {{ timer.type }} |
                Remaining: <span :class="timer.remaining <= 0 ? 'text-danger font-bold' : 'text-accent font-bold'">{{
                  timer.remaining }}</span> {{ timer.type }}
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button @click="timer.remaining = Math.max(0, timer.remaining - 1)"
                class="rpg-icon-button rpg-icon-button-neutral">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
              <button @click="removeTimer(timer.id)" class="rpg-icon-button rpg-icon-button-danger">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="py-8 text-center">
        <img src="/images/hourglass.png" class="mx-auto mb-3 h-12 text-neutral-400 icon-filter" alt="No timers" />
        <div class="text-neutral-500 rpg-body">No active timers</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCombatStore } from '@/stores/combat'
import { generateClockName } from '@/utils/clockNameGenerator'

const combatStore = useCombatStore()

const newTimer = ref({
  name: '',
  duration: null as number | null,
  type: 'rounds' as 'rounds' | 'turns'
})

const activeTimers = computed(() => combatStore.timers)

const addTimer = () => {
  if (newTimer.value.name && newTimer.value.duration) {
    combatStore.addTimer({
      name: newTimer.value.name,
      duration: newTimer.value.duration,
      remaining: newTimer.value.duration,
      type: newTimer.value.type
    })
    
    // Reset form
    newTimer.value = {
      name: '',
      duration: null,
      type: 'rounds'
    }
  }
}

const removeTimer = (id: string) => {
  combatStore.removeTimer(id)
}

const generateTimerName = () => {
  newTimer.value.name = generateClockName()
}

const generateDuration = () => {
  // Roll a d4 (1-4) for random duration
  newTimer.value.duration = Math.floor(Math.random() * 4) + 1
}
</script>