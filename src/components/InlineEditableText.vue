<template>
    <div class="inline-editable-text">
        <!-- Text Display Mode -->
        <div v-if="!isEditing" @click="startEditing"
            class="p-2 border hover:border-neutral-300 border-transparent rounded min-h-[2rem] transition-colors cursor-pointer"
            :class="{ 'text-neutral-500 italic': !modelValue || modelValue.trim() === '' }">
            <div v-if="modelValue && modelValue.trim() !== ''"
                class="overflow-wrap-anywhere break-words whitespace-pre-wrap rpg-body">{{ modelValue }}</div>
            <div v-else class="text-neutral-500 italic rpg-body">{{ placeholder || 'Click to edit...' }}</div>
        </div>

        <!-- Textarea Edit Mode -->
        <textarea v-if="isEditing" ref="textareaRef" v-model="localValue" @blur="finishEditing"
            @keydown.escape="cancelEditing" @keydown.ctrl.enter="finishEditing" :placeholder="placeholder" :rows="rows"
            class="p-2 border-2 border-accent rounded w-full resize-none rpg-input"></textarea>
    </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'

interface Props {
  modelValue: string
  placeholder?: string
  rows?: number
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Click to edit...',
  rows: 3
})

const emit = defineEmits<Emits>()

const isEditing = ref(false)
const localValue = ref(props.modelValue)
const textareaRef = ref<HTMLTextAreaElement>()

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  localValue.value = newValue
})

const startEditing = async () => {
  localValue.value = props.modelValue
  isEditing.value = true
  
  await nextTick()
  if (textareaRef.value) {
    textareaRef.value.focus()
    // Auto-resize textarea to fit content
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = Math.max(textareaRef.value.scrollHeight, 60) + 'px'
  }
}

const finishEditing = () => {
  isEditing.value = false
  emit('update:modelValue', localValue.value)
}

const cancelEditing = () => {
  isEditing.value = false
  localValue.value = props.modelValue // Reset to original value
}
</script>

<style scoped>
.inline-editable-text {
    width: 100%;
    max-width: 100%;
    overflow: hidden;
}

/* Ensure consistent styling */
.inline-editable-text .rpg-body {
    margin: 0;
    word-wrap: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
}
</style>