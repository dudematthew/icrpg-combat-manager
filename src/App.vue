<script setup lang="ts">
import { RouterView } from 'vue-router'
import InfoMonitor from './components/InfoMonitor.vue'
</script>

<template>
  <main class="app-main">
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

html,
body,
#app,
.app-main {
  height: 100%;
  overflow: hidden;
}

@media (max-width: 767px) {
  html,
  body,
  #app,
  .app-main {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
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
