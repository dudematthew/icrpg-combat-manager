<script setup lang="ts">
import { RouterView } from 'vue-router'
import InfoMonitor from './components/InfoMonitor.vue'
</script>

<template>
  <main>
    <router-view />
    <InfoMonitor />
  </main>
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
  background-color: #e5e5e5;
}

::-webkit-scrollbar-thumb {
  background-color: #a3a3a3;
  border-radius: 0.25rem;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #737373;
}
</style>
