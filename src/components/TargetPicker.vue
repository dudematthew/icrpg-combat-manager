<template>
  <div class="target-picker">
    <div class="flex flex-wrap gap-2 items-center">
      <button
        v-for="tn in PRESET_TARGET_NUMBERS"
        :key="tn"
        type="button"
        class="target-picker__chip"
        :class="{ 'target-picker__chip--active': !useCustom && modelValue === tn }"
        @click="selectPreset(tn)"
      >
        {{ tn }}
      </button>
      <label class="target-picker__custom">
        <span class="sr-only">Custom target</span>
        <input
          :value="useCustom ? modelValue : ''"
          type="number"
          :min="1"
          :max="25"
          placeholder="Custom"
          class="target-picker__input rpg-input"
          @focus="useCustom = true"
          @input="onCustomInput"
        />
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { PRESET_TARGET_NUMBERS } from "@/utils/combat";

const modelValue = defineModel<number>({ default: 12 });

const useCustom = ref(!PRESET_TARGET_NUMBERS.includes(modelValue.value as (typeof PRESET_TARGET_NUMBERS)[number]));

watch(modelValue, (tn) => {
  useCustom.value = !PRESET_TARGET_NUMBERS.includes(tn as (typeof PRESET_TARGET_NUMBERS)[number]);
});

const selectPreset = (tn: number) => {
  useCustom.value = false;
  modelValue.value = tn;
};

const onCustomInput = (event: Event) => {
  useCustom.value = true;
  const raw = (event.target as HTMLInputElement).value;
  const parsed = parseInt(raw, 10);
  if (!Number.isNaN(parsed)) {
    modelValue.value = Math.max(1, Math.min(25, parsed));
  }
};
</script>

<style scoped>
.target-picker__chip {
  min-width: 2.5rem;
  padding: 0.35rem 0.65rem;
  border: 2px solid #d4d4d4;
  border-radius: 0.375rem;
  background: #fafafa;
  font-family: "nusaliver", "Arial Black", sans-serif;
  font-size: 0.75rem;
  font-weight: 900;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.target-picker__chip:hover {
  border-color: #dc2626;
  background: #fef2f2;
}

.target-picker__chip--active {
  border-color: #dc2626;
  background: #dc2626;
  color: white;
}

.target-picker__custom {
  flex: 1;
  min-width: 5rem;
}

.target-picker__input {
  max-width: none;
  padding: 0.35rem 0.5rem;
  font-size: 0.875rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
