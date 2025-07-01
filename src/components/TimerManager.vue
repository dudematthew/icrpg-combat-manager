<template>
  <div class="timer-manager">
    <div class="mb-3 rpg-card">
      <div class="flex items-center gap-2 mb-6">
        <svg class="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clip-rule="evenodd" />
        </svg>
        <h2 class="rpg-heading">Timers</h2>
      </div>

      <div class="flex flex-col flex-wrap gap-4 mb-6">
        <div>
          <label class="rpg-label">Timer Name</label>
          <div class="flex gap-2">
            <input v-model="newTimer.name" placeholder="e.g., Building collapses" class="flex-1 rpg-input" />
            <button @click="generateTimerName" class="px-3 rpg-button rpg-button-secondary"
              title="Generate random clock name">
              <svg fill="#000000" width="16px" height="16px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M 16 2.9375 L 4.65625 7.0625 L 4 7.3125 L 4 22.59375 L 4.53125 22.875 L 15.53125 28.875 L 16 29.125 L 16.46875 28.875 L 27.46875 22.875 L 28 22.59375 L 28 7.3125 L 27.34375 7.0625 Z M 16 5.0625 L 24.375 8.09375 L 16 11.90625 L 7.625 8.09375 Z M 16 7 C 14.894531 7 14 7.449219 14 8 C 14 8.550781 14.894531 9 16 9 C 17.105469 9 18 8.550781 18 8 C 18 7.449219 17.105469 7 16 7 Z M 6 9.53125 L 15 13.625 L 15 26.3125 L 6 21.40625 Z M 26 9.53125 L 26 21.40625 L 17 26.3125 L 17 13.625 Z M 12.65625 14 C 12.285156 14 12 14.355469 12 14.875 C 12 15.542969 12.355469 16.234375 12.875 16.53125 C 13.023438 16.605469 13.195313 16.59375 13.34375 16.59375 C 13.566406 16.59375 13.695313 16.523438 13.84375 16.375 C 13.917969 16.226563 14 16.015625 14 15.71875 C 14 15.050781 13.550781 14.359375 13.03125 14.0625 C 12.882813 13.988281 12.804688 14 12.65625 14 Z M 20.03125 15 C 19.957031 15.011719 19.867188 15.050781 19.78125 15.09375 C 19.171875 15.355469 18.65625 16.21875 18.65625 17 C 18.65625 17.261719 18.636719 17.511719 18.8125 17.6875 C 18.988281 17.863281 19.175781 17.96875 19.4375 17.96875 C 19.613281 17.96875 19.792969 17.960938 19.96875 17.875 C 20.578125 17.527344 21 16.726563 21 16.03125 C 21 15.421875 20.742188 15 20.21875 15 C 20.175781 15 20.105469 14.988281 20.03125 15 Z M 10.125 16.28125 C 9.753906 16.28125 9.46875 16.636719 9.46875 17.15625 C 9.46875 17.824219 9.824219 18.484375 10.34375 18.78125 C 10.492188 18.855469 10.632813 18.875 10.78125 18.875 C 11.003906 18.875 11.164063 18.804688 11.3125 18.65625 C 11.386719 18.507813 11.46875 18.265625 11.46875 17.96875 C 11.46875 17.300781 11.019531 16.640625 10.5 16.34375 C 10.351563 16.269531 10.273438 16.28125 10.125 16.28125 Z M 23.53125 17.4375 C 23.457031 17.449219 23.367188 17.457031 23.28125 17.5 C 22.671875 17.761719 22.15625 18.65625 22.15625 19.4375 C 22.15625 19.699219 22.167969 19.949219 22.34375 20.125 C 22.519531 20.300781 22.675781 20.375 22.9375 20.375 C 23.113281 20.375 23.292969 20.398438 23.46875 20.3125 C 24.078125 19.964844 24.5 19.164063 24.5 18.46875 C 24.5 17.859375 24.242188 17.4375 23.71875 17.4375 C 23.675781 17.4375 23.605469 17.425781 23.53125 17.4375 Z M 7.65625 18.40625 C 7.285156 18.40625 7 18.761719 7 19.28125 C 7 19.949219 7.355469 20.640625 7.875 20.9375 C 8.023438 21.011719 8.195313 21 8.34375 21 C 8.566406 21 8.695313 20.929688 8.84375 20.78125 C 8.917969 20.632813 9 20.421875 9 20.125 C 9 19.457031 8.550781 18.765625 8.03125 18.46875 C 7.882813 18.394531 7.804688 18.40625 7.65625 18.40625 Z" />
              </svg>
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
          <input v-model.number="newTimer.duration" type="number" :min="1" :max="20" placeholder="5"
            class="rpg-input" />
        </div>
        <div class="flex items-end">
          <button @click="addTimer" :disabled="!newTimer.name || !newTimer.duration"
            class="disabled:opacity-50 w-full disabled:cursor-not-allowed rpg-button rpg-button-primary">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clip-rule="evenodd" />
            </svg>
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
        <svg class="mx-auto mb-3 w-12 h-12 text-neutral-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clip-rule="evenodd" />
        </svg>
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
</script>