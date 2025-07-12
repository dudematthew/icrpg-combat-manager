<template>
  <div v-if="show" class="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4"
    @click="closeModal">
    <div class="bg-white shadow-xl rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto" @click.stop>
      <div class="p-6">
        <div class="mb-6">
          <h3 class="mb-4 text-lg rpg-heading">Give Feedback</h3>
          <p class="mb-4 text-neutral-600 text-sm rpg-body">
            Hey, I'm Matthew, the creator of ICRPG Combat Manager. I made this app for my own use, and I'm always
            looking for ways to improve it. If you have any suggestions, please let me know.
          </p>

          <div class="mb-4">
            <label class="rpg-label">Email (Optional)</label>
            <input v-model="email" type="email" class="rpg-input" placeholder="your@email.com" />
            <div class="mt-1 text-neutral-500 text-xs">
              I'll only use this to follow up on your feedback if needed. I do not gather any data from you, and I
              will not share your email with anyone.
            </div>
          </div>

          <div class="mb-4">
            <label class="rpg-label">Feedback</label>
            <textarea v-model="feedback" rows="8" class="rpg-input"
              placeholder="Tell me what you think! You can use markdown formatting..." :maxlength="1500"
              @input="updateCharacterCount"></textarea>
            <div class="flex justify-between mt-1 text-neutral-500 text-xs">
              <span>Full markdown supported (headers, bold, italic, links, code, lists, etc.)</span>
              <span :class="characterCount > 1400 ? 'text-warning' : ''">
                {{ characterCount }}/1500
              </span>
            </div>
          </div>

          <!-- Markdown Preview -->
          <div v-if="feedback.trim()" class="mb-4">
            <details class="group">
              <summary class="cursor-pointer list-none">
                <div
                  class="flex justify-between items-center bg-neutral-50 hover:bg-neutral-100 p-3 rounded-lg transition-colors">
                  <span class="text-sm rpg-heading">Preview</span>
                  <svg class="w-4 h-4 group-open:rotate-180 transition-transform" fill="currentColor"
                    viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clip-rule="evenodd" />
                  </svg>
                </div>
              </summary>
              <div class="bg-neutral-50 mt-3 p-4 border border-neutral-200 rounded-lg">
                <div class="max-w-none prose prose-sm" v-html="renderedMarkdown"></div>
              </div>
            </details>
          </div>
        </div>

        <div class="flex sm:flex-row flex-col justify-between gap-3">
          <button @click="closeModal" class="px-3 sm:px-4 py-2 text-sm sm:text-base rpg-button rpg-button-secondary">
            Cancel
          </button>
          <button @click="submitFeedback" :disabled="!feedback.trim() || isSubmitting || characterCount > 1500"
            class="disabled:opacity-50 px-3 sm:px-4 py-2 text-sm sm:text-base disabled:cursor-not-allowed rpg-button rpg-button-primary">
            <div v-if="isSubmitting" class="flex items-center gap-2">
              <div class="border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin">
              </div>
              Sending...
            </div>
            <span v-else>Send Feedback</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { marked } from 'marked'

interface Props {
  show: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const email = ref('')
const feedback = ref('')
const isSubmitting = ref(false)
const characterCount = ref(0)

// Markdown renderer using marked library
const renderedMarkdown = computed(() => {
  if (!feedback.value) return ''

  try {
    return marked(feedback.value, {
      breaks: true, // Convert \n to <br>
      gfm: true, // GitHub Flavored Markdown
    })
  } catch (error) {
    console.error('Markdown parsing error:', error)
    return feedback.value.replace(/\n/g, '<br>')
  }
})

const updateCharacterCount = () => {
  characterCount.value = feedback.value.length
}

const closeModal = () => {
  emit('close')
}

const submitFeedback = async () => {
  if (!feedback.value.trim() || isSubmitting.value) return

  isSubmitting.value = true

  try {
    // Use HTTPS now that SSL is properly configured
    const apiUrl = 'https://feedback.dudematthew.smallhost.pl/index.php'

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        project_key: 'icrpg_combat_manager',
        feedback: feedback.value.trim(),
        ...(email.value.trim() && { email: email.value.trim() })
      })
    })

    const result = await response.json()

    if (result.status === 'success') {
      // Success - close modal and show success message
      alert('Thank you for your feedback!')
      feedback.value = ''
      email.value = ''
      closeModal()
    } else {
      // Error from API
      alert(`Error: ${result.message || 'Failed to send feedback'}`)
    }
  } catch (error) {
    console.error('Feedback submission error:', error)

    // Check if it's a mixed content error
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      alert('Unable to send feedback due to security restrictions. Please contact support directly or try from a non-HTTPS environment.')
    } else {
      alert('Failed to send feedback. Please try again later.')
    }
  } finally {
    isSubmitting.value = false
  }
}

// Reset form when modal opens
watch(() => props.show, (newShow) => {
  if (newShow) {
    feedback.value = ''
    email.value = ''
    characterCount.value = 0
  }
})
</script>

<style scoped>
.prose {
  color: #374151;
  line-height: 1.6;
}

.prose :deep(h1),
.prose :deep(h2),
.prose :deep(h3),
.prose :deep(h4),
.prose :deep(h5),
.prose :deep(h6) {
  font-weight: 600;
  color: #111827;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.prose :deep(h1) {
  font-size: 1.5rem;
}

.prose :deep(h2) {
  font-size: 1.25rem;
}

.prose :deep(h3) {
  font-size: 1.125rem;
}

.prose :deep(strong) {
  font-weight: 600;
  color: #111827;
}

.prose :deep(em) {
  font-style: italic;
}

.prose :deep(code) {
  font-family: 'Courier New', monospace;
  font-size: 0.875em;
  background-color: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
}

.prose :deep(pre) {
  background-color: #f3f4f6;
  padding: 1rem;
  border-radius: 0.375rem;
  overflow-x: auto;
  margin: 0.5rem 0;
}

.prose :deep(pre code) {
  background-color: transparent;
  padding: 0;
}

.prose :deep(blockquote) {
  border-left: 4px solid #d1d5db;
  padding-left: 1rem;
  margin: 1rem 0;
  font-style: italic;
  color: #6b7280;
}

.prose :deep(ul),
.prose :deep(ol) {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.prose :deep(li) {
  margin: 0.25rem 0;
}

.prose :deep(a) {
  color: #dc2626;
  text-decoration: underline;
}

.prose :deep(a:hover) {
  text-decoration: none;
}

.prose :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.prose :deep(th),
.prose :deep(td) {
  border: 1px solid #d1d5db;
  padding: 0.5rem;
  text-align: left;
}

.prose :deep(th) {
  background-color: #f9fafb;
  font-weight: 600;
}

.prose :deep(del) {
  text-decoration: line-through;
}

.prose :deep(p) {
  margin: 0.5rem 0;
}
</style>
