<template>
  <div class="mb-6">
    <h4 class="mb-3 rpg-label">Backup &amp; Sync</h4>

    <div class="flex flex-col gap-4 bg-neutral-50 p-4 border border-neutral-200 rounded-lg">
      <section class="flex flex-col gap-3">
        <p class="text-neutral-600 text-xs rpg-body">
          Export or import combat, boards, notes, snapshots, and settings as one JSON file.
        </p>

        <div class="flex flex-col sm:flex-row gap-2.5">
          <button type="button" class="flex-1 rpg-button rpg-button-secondary text-sm" @click="exportToFile">
            Export to file
          </button>
          <button type="button" class="flex-1 rpg-button rpg-button-secondary text-sm" @click="triggerFileImport">
            Import from file
          </button>
          <input
            ref="fileInputRef"
            type="file"
            accept=".json,application/json"
            class="hidden"
            @change="onFileSelected"
          />
        </div>
      </section>

      <section v-if="cloudAvailable" class="flex flex-col gap-4 pt-4 border-neutral-200 border-t">
        <div class="flex flex-col gap-1.5">
          <p class="font-bold text-sm rpg-heading">Cloud backup</p>
          <p class="text-neutral-600 text-xs rpg-body">
            Save on this server and restore on another device with the memorable code.
            Backups auto-delete after {{ retentionDays }} days without an update.
          </p>
        </div>

        <div class="flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            class="flex-1 rpg-button rpg-button-primary text-sm"
            :disabled="busy"
            @click="saveToServer"
          >
            Save to server (new)
          </button>
          <button
            v-if="canUpdateServer"
            type="button"
            class="flex-1 rpg-button rpg-button-secondary text-sm"
            :disabled="busy"
            @click="updateServer"
          >
            Update server backup
          </button>
        </div>

        <div
          v-if="revealedSlug"
          class="backup-code-reveal bg-amber-50 p-3 border-2 border-amber-300 rounded-lg"
          :class="{ 'backup-code-reveal--highlight': codeHighlight }"
        >
          <p class="mb-1 font-bold text-amber-900 text-sm rpg-heading">Important — save your backup code</p>
          <p class="mb-3 text-amber-800 text-xs rpg-body">
            Copy or write this down now. You need it to restore on another device — the server will not show it again.
          </p>
          <div class="flex items-center gap-2 bg-white p-2 border border-amber-200 rounded-md">
            <code class="flex-1 font-semibold text-sm rpg-mono break-all">{{ revealedSlug }}</code>
            <button type="button" class="rpg-button rpg-button-sm rpg-button-primary" @click="copyRevealedSlug">
              Copy
            </button>
          </div>
          <p class="mt-2 text-amber-700 text-xs rpg-body">
            This browser remembers the edit key so you can update this backup later.
          </p>
        </div>

        <div class="flex flex-col gap-2">
          <label class="font-bold text-xs rpg-label">Import from server</label>
          <div class="flex gap-2">
            <input
              v-model="importSlug"
              type="text"
              class="flex-1 rpg-input text-sm"
              placeholder="juggly-apple-terminator-cosmos"
              autocomplete="off"
              spellcheck="false"
            />
            <button
              type="button"
              class="rpg-button rpg-button-secondary text-sm"
              :disabled="busy || !importSlug.trim()"
              @click="importFromServer"
            >
              Load
            </button>
          </div>
        </div>

        <details class="backup-security-details pt-3 border-neutral-200 border-t text-neutral-600 text-xs rpg-body">
          <summary class="backup-security-summary cursor-pointer font-bold text-neutral-700">
            How cloud backups are secured
          </summary>
          <ul class="mt-2 space-y-2 pl-5 leading-relaxed list-disc">
            <li>Backups are stored as JSON on shared PHP hosting and are <strong>not encrypted</strong>.</li>
            <li>Anyone who knows your backup code can <strong>download</strong> your data (like an unlisted link).</li>
            <li>Only someone with the <strong>edit key</strong> (returned when you create a backup, or saved in an exported file) can overwrite it.</li>
            <li>Backup codes are assigned by the server and are hard to guess; you cannot pick your own code or overwrite without the edit key.</li>
            <li>Inactive backups may be removed after {{ retentionDays }} days. Keep your own file copies.</li>
            <li>No accounts or passwords — you are responsible for what you upload.</li>
          </ul>
        </details>
      </section>

      <p
        v-if="statusMessage"
        class="pt-4 border-neutral-200 border-t text-xs rpg-body"
        :class="statusIsError ? 'text-red-600' : 'text-green-700'"
      >
        {{ statusMessage }}
      </p>
    </div>

    <div
      v-if="confirmOpen"
      class="z-[60] fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4"
      style="margin-top: 0;"
      @mousedown.self="cancelConfirm"
    >
      <div class="bg-white shadow-xl p-6 rounded-lg w-full max-w-md" @click.stop>
        <h3 class="mb-2 text-lg rpg-heading">Replace all data?</h3>
        <p class="mb-4 text-neutral-700 text-sm rpg-body">
          This replaces all monsters, timers, boards, notes, and settings with the backup. This cannot be undone.
        </p>
        <div class="flex justify-end gap-3">
          <button type="button" class="rpg-button rpg-button-secondary" @click="cancelConfirm">Cancel</button>
          <button type="button" class="bg-danger hover:bg-red-700 border-danger text-white rpg-button" @click="confirmImport">
            Replace all
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { buildBackupEnvelope, downloadBackupEnvelope } from "@/features/backup/build";
import { applyBackupEnvelope } from "@/features/backup/apply";
import { parseBackupJson, isValidCloudSlug } from "@/features/backup/validate";
import {
  checkCloudAvailable,
  createCloudBackup,
  fetchCloudBackup,
  updateCloudBackup,
} from "@/features/backup/cloudApi";
import { getCloudCredentials, setCloudCredentials } from "@/features/backup/cloudCredentials";
import type { ParsedBackup } from "@/features/backup/types";

const fileInputRef = ref<HTMLInputElement | null>(null);
const cloudAvailable = ref(false);
const retentionDays = ref(180);
const busy = ref(false);
const statusMessage = ref("");
const statusIsError = ref(false);
const importSlug = ref("");
const revealedSlug = ref("");
const codeHighlight = ref(false);
const confirmOpen = ref(false);
let highlightTimer: ReturnType<typeof setTimeout> | undefined;
const pendingImport = ref<ParsedBackup | null>(null);

const canUpdateServer = computed(() => {
  const creds = getCloudCredentials();
  return Boolean(creds?.slug && creds.writeToken);
});

const setStatus = (message: string, isError = false) => {
  statusMessage.value = message;
  statusIsError.value = isError;
};

onMounted(async () => {
  const result = await checkCloudAvailable();
  cloudAvailable.value = result.available;
  if (result.retentionDays) retentionDays.value = result.retentionDays;
  const creds = getCloudCredentials();
  if (creds?.slug) {
    importSlug.value = creds.slug;
  }
});

const flashCodeReveal = () => {
  codeHighlight.value = true;
  if (highlightTimer) clearTimeout(highlightTimer);
  highlightTimer = setTimeout(() => {
    codeHighlight.value = false;
  }, 1400);
};

const exportToFile = () => {
  const cloud = getCloudCredentials();
  const envelope = buildBackupEnvelope(cloud ?? undefined);
  downloadBackupEnvelope(envelope);
  setStatus("Backup file downloaded.");
};

const triggerFileImport = () => {
  fileInputRef.value?.click();
};

const onFileSelected = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;

  try {
    const text = await file.text();
    pendingImport.value = parseBackupJson(text);
    confirmOpen.value = true;
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Import failed.", true);
  }
};

const importFromServer = async () => {
  const slug = importSlug.value.trim();
  if (!isValidCloudSlug(slug)) {
    setStatus("Enter a valid backup code (four words separated by hyphens).", true);
    return;
  }

  busy.value = true;
  try {
    const backup = await fetchCloudBackup(slug);
    pendingImport.value = parseBackupJson(JSON.stringify(backup));
    confirmOpen.value = true;
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Could not load backup.", true);
  } finally {
    busy.value = false;
  }
};

const saveToServer = async () => {
  busy.value = true;
  try {
    const envelope = buildBackupEnvelope();
    const { slug, writeToken } = await createCloudBackup(envelope);
    setCloudCredentials({ slug, writeToken });
    revealedSlug.value = slug;
    flashCodeReveal();
    setStatus("Backup saved to server. Copy your code above before you close settings.");
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Server save failed.", true);
  } finally {
    busy.value = false;
  }
};

const updateServer = async () => {
  const creds = getCloudCredentials();
  if (!creds) {
    setStatus("No edit key in this browser. Create a new server backup or import a file that includes cloud credentials.", true);
    return;
  }

  busy.value = true;
  try {
    const envelope = buildBackupEnvelope(creds);
    await updateCloudBackup(creds.slug, creds.writeToken, envelope);
    setStatus("Server backup updated.");
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Server update failed.", true);
  } finally {
    busy.value = false;
  }
};

const copyRevealedSlug = async () => {
  if (!revealedSlug.value) return;
  try {
    await navigator.clipboard.writeText(revealedSlug.value);
    setStatus("Backup code copied to clipboard.");
  } catch {
    setStatus("Could not copy to clipboard.", true);
  }
};

const cancelConfirm = () => {
  confirmOpen.value = false;
  pendingImport.value = null;
};

const confirmImport = () => {
  if (!pendingImport.value) return;
  try {
    applyBackupEnvelope(pendingImport.value);
    if (pendingImport.value.cloud) {
      importSlug.value = pendingImport.value.cloud.slug;
    }
    setStatus("Backup restored.");
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Restore failed.", true);
  } finally {
    confirmOpen.value = false;
    pendingImport.value = null;
  }
};
</script>

<style scoped>
.backup-security-summary {
  list-style: none;
}

.backup-security-summary::-webkit-details-marker {
  display: none;
}

.backup-security-summary::before {
  content: "▸";
  display: inline-block;
  margin-right: 0.375rem;
  transition: transform 0.15s ease;
}

.backup-security-details[open] .backup-security-summary::before {
  transform: rotate(90deg);
}

@keyframes backup-code-border-pulse {
  0%,
  100% {
    border-color: #fcd34d;
    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0);
  }
  50% {
    border-color: #dc2626;
    box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.2);
  }
}

.backup-code-reveal--highlight {
  animation: backup-code-border-pulse 0.65s ease-in-out 2;
}
</style>
