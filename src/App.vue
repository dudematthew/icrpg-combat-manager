<script setup lang="ts">
import { RouterView } from 'vue-router'
import NotificationBar from './components/NotificationBar.vue'
</script>

<template>
  <RouterView />
  <NotificationBar />
</template>

<style>
/* Minimal global styles - everything else handled by Tailwind */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Custom scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-neutral-200;
}

::-webkit-scrollbar-thumb {
  @apply bg-neutral-400 rounded;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-neutral-500;
}
</style>
