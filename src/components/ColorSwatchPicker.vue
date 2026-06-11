<template>
  <div class="color-swatch-picker" :class="{ 'color-swatch-picker--compact': compact }">
    <button
      v-for="color in colors"
      :key="color.value"
      type="button"
      class="swatch"
      :class="{ 'swatch-selected': modelValue === color.value }"
      :style="{ backgroundColor: getMonsterColor(color.value) }"
      :title="color.label"
      @click="$emit('update:modelValue', color.value)"
    />
  </div>
</template>

<script setup lang="ts">
import { TIMER_COLOR_OPTIONS } from "@/constants/monsterOptions";
import { getMonsterColor } from "@/utils/combat";

defineProps<{
  modelValue: string;
  compact?: boolean;
}>();

defineEmits<{
  "update:modelValue": [value: string];
}>();

const colors = TIMER_COLOR_OPTIONS;
</script>

<style scoped>
.color-swatch-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  width: 100%;
  min-width: 0;
}

.color-swatch-picker--compact .swatch {
  width: 1.65rem;
  height: 1.65rem;
}

.swatch {
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  border: 2px solid #d4d4d4;
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.1s;
}

.swatch-selected {
  transform: scale(1.1);
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px #dc2626;
}
</style>
