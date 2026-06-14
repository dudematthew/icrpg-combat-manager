<template>
  <section class="flex flex-col gap-2 pt-4 mt-2 border-neutral-200 border-t">
    <p class="font-bold text-xs rpg-label">Session</p>
    <p class="text-neutral-600 text-xs rpg-body">
      Start fresh on this device. Clears combat, boards, app options, and any linked cloud backup code.
    </p>
    <button
      type="button"
      class="w-full bg-danger hover:bg-red-700 border-danger text-white rpg-button text-sm"
      @click="confirmOpen = true"
    >
      Reset app session
    </button>
  </section>

  <div
    v-if="confirmOpen"
    class="z-[60] fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4"
    style="margin-top: 0;"
    @mousedown.self="confirmOpen = false"
  >
    <div class="bg-white shadow-xl p-6 rounded-lg w-full max-w-md" @click.stop>
      <h3 class="mb-2 text-lg rpg-heading">Reset app session?</h3>
      <p class="mb-2 text-neutral-700 text-sm rpg-body">
        This removes all monsters, timers, boards, notes, and settings on this device. Any cloud backup
        association is cleared too — your server backup is not deleted, but this app will no longer
        remember its code.
      </p>
      <p class="mb-4 text-neutral-500 text-xs rpg-body">This cannot be undone. Export a backup first if you might need this data later.</p>
      <div class="flex justify-end gap-3">
        <button type="button" class="rpg-button rpg-button-secondary" @click="confirmOpen = false">
          Cancel
        </button>
        <button
          type="button"
          class="bg-danger hover:bg-red-700 border-danger text-white rpg-button"
          @click="confirmReset"
        >
          Reset session
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { resetAppSession } from "@/features/session/resetAppSession";

const emit = defineEmits<{
  reset: [];
}>();

const confirmOpen = ref(false);

const confirmReset = () => {
  confirmOpen.value = false;
  resetAppSession();
  emit("reset");
};
</script>
