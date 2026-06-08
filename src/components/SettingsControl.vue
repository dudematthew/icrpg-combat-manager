<template>
  <button
    type="button"
    class="settings-control"
    :aria-pressed="active"
    :title="title"
    @click="emit('click')"
  >
    <span class="settings-control__knob">
      <template v-if="variant === 'visibility'">
        <Eye v-if="active" class="w-5 h-5 text-accent" />
        <EyeOff v-else class="w-5 h-5 text-neutral-400" />
      </template>
      <template v-else-if="variant === 'enabled'">
        <ToggleRight v-if="active" class="w-5 h-5 text-accent" />
        <ToggleLeft v-else class="w-5 h-5 text-neutral-400" />
      </template>
      <template v-else>
        <CircleDot v-if="active" class="w-5 h-5 text-accent" />
        <Circle v-else class="w-5 h-5 text-neutral-400" />
      </template>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  Eye,
  EyeOff,
  ToggleLeft,
  ToggleRight,
  Circle,
  CircleDot,
} from "lucide-vue-next";

export type SettingsControlVariant = "visibility" | "enabled" | "choice";

const props = defineProps<{
  variant: SettingsControlVariant;
  active: boolean;
}>();

const emit = defineEmits<{
  click: [];
}>();

const title = computed(() => {
  if (props.variant === "visibility") {
    return props.active ? "Visible" : "Hidden";
  }
  if (props.variant === "enabled") {
    return props.active ? "On" : "Off";
  }
  return props.active ? "Selected" : "Not selected";
});
</script>

<style scoped>
.settings-control {
  display: inline-flex;
  position: relative;
  align-items: center;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border: none;
  border-radius: 9999px;
  background: transparent;
  cursor: pointer;
  transition: color 0.15s;
}

.settings-control__knob {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  margin-top: 0.25rem;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 9999px;
  background: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}
</style>
