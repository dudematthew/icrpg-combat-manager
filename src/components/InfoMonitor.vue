<template>
  <Teleport to="body">
    <Transition name="monitor-slide" appear>
      <div v-if="isVisible && currentNotification" class="info-monitor" @click="hide">
        <div class="rpg-card monitor-card" :style="{
               borderBottomColor: currentNotification.borderColor || '#dc2626',
               borderBottomWidth: progressWidth + '%'
             }">
          <div class="monitor-content">
            <div class="monitor-icon" :style="{ color: currentNotification.color || '#dc2626' }">
              <!-- Image icon -->
              <img v-if="currentNotification.icon && currentNotification.iconType === 'image'"
                :src="currentNotification.icon" class="w-6 h-6 icon-filter" :alt="currentNotification.title" />

              <!-- Lucide icon -->
              <component v-else-if="currentNotification.icon && currentNotification.iconType === 'lucide'"
                :is="getLucideIcon(currentNotification.icon)" class="w-6 h-6 icon-filter" />

              <!-- Default icon if no icon specified -->
              <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clip-rule="evenodd" />
              </svg>
            </div>
            <div class="monitor-text">
              <div class="monitor-title" :style="{ color: currentNotification.color || '#dc2626' }">
                {{ currentNotification.title }}
              </div>
              <div class="monitor-message">{{ currentNotification.message }}</div>
            </div>
            <div class="monitor-close">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useInfoMonitorStore } from '@/stores/infoMonitor'
import { ChevronRight, Plus, Info, AlertTriangle, AlertCircle, RotateCcw } from 'lucide-vue-next'

const infoMonitorStore = useInfoMonitorStore()

const isVisible = computed(() => infoMonitorStore.isVisible)
const currentNotification = computed(() => infoMonitorStore.currentNotification)

const progressWidth = ref(100)
let progressInterval: number | null = null
let hideTimeout: number | null = null

// Map of lucide icon names to components
const lucideIcons = {
  ChevronRight,
  Plus,
  Info,
  AlertTriangle,
  AlertCircle,
  RotateCcw
}

const getLucideIcon = (iconName: string) => {
  return lucideIcons[iconName as keyof typeof lucideIcons] || Info
}

const hide = () => {
  infoMonitorStore.hideMonitor()
  cleanup()
}

const cleanup = () => {
  if (progressInterval) {
    window.clearInterval(progressInterval)
    progressInterval = null
  }
  if (hideTimeout) {
    window.clearTimeout(hideTimeout)
    hideTimeout = null
  }
}

const startProgress = () => {
  if (!currentNotification.value) return

  progressWidth.value = 100
  const duration = currentNotification.value.duration || 4000
  const stepTime = 50 // Update every 50ms
  const steps = duration / stepTime
  const decrement = 100 / steps

  progressInterval = window.setInterval(() => {
    progressWidth.value -= decrement
    if (progressWidth.value <= 0) {
      progressWidth.value = 0
      cleanup()
    }
  }, stepTime)

  // Auto-hide after duration
  hideTimeout = window.setTimeout(() => {
    hide()
  }, duration)
}

// Watch for visibility changes
watch(isVisible, (newVal) => {
  if (newVal && currentNotification.value) {
    startProgress()
  } else {
    cleanup()
  }
})

// Watch for notification changes (for queue processing)
watch(currentNotification, (newNotification) => {
  if (newNotification && isVisible.value) {
    cleanup()
    startProgress()
  }
})
</script>

<style scoped>
.info-monitor {
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  width: 90%;
  max-width: 480px;
  cursor: pointer;
}

.monitor-card {
  border-bottom: 4px solid #dc2626;
  transition: border-bottom-width 0.075s ease-linear;
}

.monitor-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.monitor-icon {
  flex-shrink: 0;
  color: #dc2626;
}

.monitor-text {
  flex: 1;
  text-align: center;
}

.monitor-title {
  font-family: 'FlatBread', 'Chalkduster', cursive;
  font-weight: 900;
  font-size: 1.125rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #dc2626;
  margin-bottom: 0.25rem;
}

.monitor-message {
  font-family: 'nusaliver', 'Arial', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  color: #374151;
}

.monitor-close {
  flex-shrink: 0;
  color: #6b7280;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.monitor-close:hover {
  background: #f3f4f6;
  color: #374151;
}

/* Slide animations */
.monitor-slide-enter-active {
  transition: all 0.5s ease-out;
}

.monitor-slide-leave-active {
  transition: all 0.3s ease-in;
}

.monitor-slide-enter-from {
  transform: translateX(-50%) translateY(-100%);
  opacity: 0;
}

.monitor-slide-leave-to {
  transform: translateX(-50%) translateY(-100%);
  opacity: 0;
}

/* Mobile responsiveness */
@media (max-width: 480px) {
  .info-monitor {
    width: 95%;
  }

  .monitor-title {
    font-size: 1rem;
  }

  .monitor-message {
    font-size: 0.875rem;
  }
}
</style>
