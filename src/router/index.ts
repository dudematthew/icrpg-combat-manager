import { createRouter, createWebHistory } from "vue-router";
import CombatManager from "../views/CombatManager.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "combat",
      component: CombatManager,
    },
  ],
});

export default router;
