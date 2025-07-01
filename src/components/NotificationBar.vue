<template>
    <Teleport to="body">
        <div class="top-4 left-1/2 z-50 fixed space-y-2 -translate-x-1/2 transform">
            <TransitionGroup name="notification" tag="div">
                <div v-for="notification in notifications" :key="notification.id" class="notification-popup"
                    :class="getNotificationClass(notification.type)" @click="removeNotification(notification.id)">
                    <div class="flex items-center gap-3">
                        <svg v-if="notification.type === 'timer'" class="w-5 h-5" fill="currentColor"
                            viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                clip-rule="evenodd" />
                        </svg>
                        <span class="font-semibold text-sm">{{ notification.message }}</span>
                        <button @click.stop="removeNotification(notification.id)"
                            class="text-white hover:text-gray-200">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clip-rule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            </TransitionGroup>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNotificationStore } from '@/stores/notifications'

const notificationStore = useNotificationStore()

const notifications = computed(() => notificationStore.notifications)

const getNotificationClass = (type: string) => {
  switch (type) {
    case 'timer':
      return 'notification-timer'
    case 'warning':
      return 'notification-warning'
    case 'error':
      return 'notification-error'
    default:
      return 'notification-info'
  }
}

const removeNotification = (id: string) => {
  notificationStore.removeNotification(id)
}
</script>

<style scoped>
.notification-popup {
    @apply shadow-lg px-4 py-3 rounded-lg transition-all duration-300 ease-in-out cursor-pointer transform;
    min-width: 300px;
    max-width: 400px;
}

.notification-timer {
    @apply bg-red-600 border-red-800 border-l-4 text-white;
}

.notification-info {
    @apply bg-blue-600 border-blue-800 border-l-4 text-white;
}

.notification-warning {
    @apply bg-yellow-600 border-yellow-800 border-l-4 text-white;
}

.notification-error {
    @apply bg-red-700 border-red-900 border-l-4 text-white;
}

/* Transition animations */
.notification-enter-active,
.notification-leave-active {
    transition: all 0.3s ease;
}

.notification-enter-from {
    opacity: 0;
    transform: translateY(-20px) scale(0.9);
}

.notification-leave-to {
    opacity: 0;
    transform: translateY(-20px) scale(0.9);
}

.notification-move {
    transition: transform 0.3s ease;
}
</style>