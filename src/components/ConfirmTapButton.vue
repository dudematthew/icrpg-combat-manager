<template>
  <button
    type="button"
    :class="buttonClasses"
    :style="sizeStyle"
    :aria-label="armed ? confirmLabel : label"
    :title="titleText"
    @click="onClick"
    @blur="reset"
  >
    <Check v-if="armed && iconOnly" class="w-4 h-4" aria-hidden="true" />
    <template v-else-if="armed">{{ confirmLabel }}</template>
    <slot v-else-if="$slots.default" />
    <template v-else>{{ label }}</template>
  </button>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, useAttrs } from "vue";
import { Check } from "lucide-vue-next";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    label: string;
    confirmLabel?: string;
    variant?: "default" | "danger";
    size?: "default" | "sm";
    iconOnly?: boolean;
    timeoutMs?: number;
  }>(),
  {
    confirmLabel: "Confirm",
    variant: "default",
    size: "default",
    iconOnly: false,
    timeoutMs: 3000,
  },
);

const emit = defineEmits<{
  confirm: [];
}>();

const attrs = useAttrs();
const armed = ref(false);
let timer: ReturnType<typeof setTimeout> | null = null;

const buttonClasses = computed(() => [
  "confirm-tap-btn",
  props.iconOnly ? null : "rpg-button",
  props.size === "sm" ? "rpg-button-sm" : "",
  props.variant === "danger" ? "confirm-tap-btn--danger" : "rpg-button-secondary",
  { "confirm-tap-btn--armed": armed.value },
  attrs.class,
]);

const sizeStyle = computed(() => {
  if (props.iconOnly) return undefined;
  return { minWidth: props.size === "sm" ? "5.5rem" : "6.75rem" };
});

const titleText = computed(() => {
  const explicit = attrs.title as string | undefined;
  if (armed.value) {
    return props.iconOnly ? `${props.confirmLabel} remove` : `${props.confirmLabel}?`;
  }
  return explicit ?? props.label;
});

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
