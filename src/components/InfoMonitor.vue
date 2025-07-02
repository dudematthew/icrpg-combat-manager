<template>
  <Teleport to="body">
    <Transition name="monitor-slide" appear>
      <div v-if="isVisible" class="info-monitor" @click="hide">
        <div class="rpg-card monitor-card"
          :style="{ borderBottomColor: '#dc2626', borderBottomWidth: progressWidth + '%' }">
          <div class="monitor-content">
            <div class="monitor-icon">
              <img src="/images/clock_icon.png" class="w-6 h-6 icon-filter" alt="Timer complete" />
            </div>
            <div class="monitor-text">
              <div class="monitor-title">Timer Complete!</div>
              <div class="monitor-message">{{ message }}</div>
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
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  message: string
  duration?: number
  isVisible: boolean
}

const props = withDefaults(defineProps<Props>(), {
  duration: 4000
})

const emit = defineEmits<{
  hide: []
}>()

const progressWidth = ref(100)
let progressInterval: number | null = null
let hideTimeout: number | null = null

const hide = () => {
  emit('hide')
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
  progressWidth.value = 100
  const stepTime = 50 // Update every 50ms
  const steps = props.duration / stepTime
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
  }, props.duration)
}

onMounted(() => {
  if (props.isVisible) {
    startProgress()
  }
})

onUnmounted(() => {
  cleanup()
})

// Watch for visibility changes
import { watch } from 'vue'
watch(() => props.isVisible, (newVal) => {
  if (newVal) {
    startProgress()
  } else {
    cleanup()
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