<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4"
      @click="onCancel"
    >
      <div class="bg-white shadow-xl p-6 rounded-lg w-full max-w-md" @click.stop>
        <h3 class="mb-2 text-lg rpg-heading">{{ title }}</h3>
        <p class="mb-2 text-neutral-700 rpg-body">{{ message }}</p>
        <p v-if="detail" class="text-neutral-500 text-sm">{{ detail }}</p>
        <div class="flex justify-end gap-3 mt-4">
          <button type="button" class="rpg-button rpg-button-primary" @click="onConfirm">
            {{ props.confirmLabel }}
          </button>
          <button type="button" class="rpg-button rpg-button-secondary" @click="onCancel">
            {{ props.cancelLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useScrollLock } from "@/composables/useScrollLock";
import { useModalShortcuts } from "@/composables/useModalShortcuts";

const open = defineModel<boolean>({ default: false });

const props = withDefaults(
  defineProps<{
    title: string;
    message: string;
    detail?: string;
    confirmLabel?: string;
    cancelLabel?: string;
  }>(),
  {
    confirmLabel: "Confirm",
    cancelLabel: "Cancel",
  },
);

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

useScrollLock(open);

function onConfirm() {
  emit("confirm");
  open.value = false;
}

function onCancel() {
  emit("cancel");
  open.value = false;
}

useModalShortcuts(open, { onSave: onConfirm, onClose: onCancel });
</script>
