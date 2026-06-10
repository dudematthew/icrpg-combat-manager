<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4"
      @click="cancel"
    >
      <div class="bg-white shadow-xl p-6 rounded-lg w-full max-w-md" @click.stop>
        <h3 class="mb-3 text-lg rpg-heading">{{ title }}</h3>
        <label v-if="label" class="mb-2 block rpg-label">{{ label }}</label>
        <input
          ref="inputRef"
          v-model="localValue"
          type="text"
          class="rpg-input w-full"
          :placeholder="placeholder"
          @keyup.enter="submit"
        />
        <div class="flex justify-end gap-3 mt-4">
          <button type="button" class="rpg-button rpg-button-primary" @click="submit">
            {{ submitLabel }}
          </button>
          <button type="button" class="rpg-button rpg-button-secondary" @click="cancel">
            {{ cancelLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import { useScrollLock } from "@/composables/useScrollLock";
import { useModalShortcuts } from "@/composables/useModalShortcuts";

const open = defineModel<boolean>({ default: false });

const props = withDefaults(
  defineProps<{
    title: string;
    label?: string;
    placeholder?: string;
    initialValue?: string;
    submitLabel?: string;
    cancelLabel?: string;
  }>(),
  {
    placeholder: "",
    initialValue: "",
    submitLabel: "OK",
    cancelLabel: "Cancel",
  },
);

const emit = defineEmits<{
  submit: [value: string];
  cancel: [];
}>();

const localValue = ref("");
const inputRef = ref<HTMLInputElement | null>(null);

useScrollLock(open);

watch(open, (isOpen) => {
  if (isOpen) {
    localValue.value = props.initialValue;
    nextTick(() => inputRef.value?.focus());
  }
});

function submit() {
  const value = localValue.value.trim();
  if (!value) return;
  emit("submit", value);
  open.value = false;
}

function cancel() {
  emit("cancel");
  open.value = false;
}

useModalShortcuts(open, { onSave: submit, onClose: cancel });
</script>
