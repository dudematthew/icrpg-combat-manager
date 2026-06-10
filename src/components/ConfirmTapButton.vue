<template>
  <button
    type="button"
    :class="buttonClasses"
    :style="sizeStyle"
    @click="onClick"
    @blur="reset"
  >
    {{ armed ? confirmLabel : label }}
  </button>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from "vue";

const props = withDefaults(
  defineProps<{
    label: string;
    confirmLabel?: string;
    variant?: "default" | "danger";
    size?: "default" | "sm";
    timeoutMs?: number;
  }>(),
  {
    confirmLabel: "Confirm",
    variant: "default",
    size: "default",
    timeoutMs: 3000,
  },
);

const emit = defineEmits<{
  confirm: [];
}>();

const armed = ref(false);
let timer: ReturnType<typeof setTimeout> | null = null;

const buttonClasses = computed(() => [
  "confirm-tap-btn",
  "rpg-button",
  props.size === "sm" ? "rpg-button-sm" : "",
  props.variant === "danger" ? "confirm-tap-btn--danger" : "rpg-button-secondary",
  { "confirm-tap-btn--armed": armed.value },
]);

const sizeStyle = computed(() => ({
  minWidth: props.size === "sm" ? "5.5rem" : "6.75rem",
}));

const reset = () => {
  armed.value = false;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
};

const onClick = () => {
  if (!armed.value) {
    armed.value = true;
    timer = setTimeout(reset, props.timeoutMs);
    return;
  }
  reset();
  emit("confirm");
};

onUnmounted(reset);
</script>

<style scoped>
.confirm-tap-btn {
  justify-content: center;
}

.confirm-tap-btn--danger {
  color: #dc2626;
  border-color: #fecaca;
}

.confirm-tap-btn--danger.confirm-tap-btn--armed {
  background: #dc2626;
  border-color: #dc2626;
  color: white;
}

.confirm-tap-btn--armed:not(.confirm-tap-btn--danger) {
  background: #fef2f2;
  border-color: #dc2626;
  color: #dc2626;
}
</style>
