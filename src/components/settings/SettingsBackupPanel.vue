<template>
  <div class="mb-6">
    <h4 class="mb-3 rpg-label">Backup &amp; Sync</h4>

    <div class="flex flex-col gap-4 bg-neutral-50 p-4 border border-neutral-200 rounded-lg">
      <section class="flex flex-col gap-3">
        <p class="text-neutral-600 text-xs rpg-body">
          Export or import combat, boards, notes, snapshots, and settings as one JSON file.
        </p>

        <label class="flex items-center gap-2 cursor-pointer">
          <input v-model="includeOptionsInBackup" type="checkbox" class="rounded border-neutral-300" />
          <span class="text-neutral-700 text-xs rpg-body">Include app options (tier mode, notifications, layout prefs, etc.)</span>
        </label>

        <div class="backup-actions">
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

        <div
          v-if="activeCloudSlug"
          class="backup-code-reveal bg-neutral-50 p-3 border border-neutral-200 rounded-lg"
          :class="{ 'backup-code-reveal--highlight': codeHighlight && justCreatedBackup }"
        >
          <p class="mb-1 font-bold text-neutral-800 text-sm rpg-heading">Active backup code</p>
          <p v-if="justCreatedBackup" class="mb-3 text-amber-800 text-xs rpg-body">
            Copy or write this down now. You need it to restore on another device.
          </p>
          <p v-else-if="canUpdateServer" class="mb-3 text-neutral-600 text-xs rpg-body">
            This device can update this code. Use the button below to save your latest session.
          </p>
          <p v-else class="mb-3 text-amber-800 text-xs rpg-body">
            Read-only on this device — link your edit key to update this code instead of creating a new one.
          </p>
          <div class="flex items-center gap-2 bg-white p-2 border border-neutral-200 rounded-md">
            <code class="flex-1 font-semibold text-sm rpg-mono break-all">{{ activeCloudSlug }}</code>
            <button type="button" class="rpg-button rpg-button-sm rpg-button-primary" @click="copyActiveSlug">
              Copy
            </button>
          </div>
        </div>

        <div class="backup-actions">
          <button
            v-if="canUpdateServer"
            type="button"
            class="flex-1 rpg-button rpg-button-primary text-sm"
            :disabled="busy"
            @click="updateServer"
          >
            Update {{ activeCloudSlug }}
          </button>
          <button
            v-else
            type="button"
            class="flex-1 rpg-button rpg-button-primary text-sm"
            :disabled="busy"
            @click="saveToServer"
          >
            {{ activeCloudSlug ? "Save copy as new code" : "Create server backup" }}
          </button>
        </div>

        <details v-if="activeCloudSlug" class="backup-switch-details text-xs rpg-body">
          <summary class="cursor-pointer font-bold text-neutral-700">Switch or link backup code</summary>
          <div class="flex flex-col gap-3 mt-3">
            <div class="flex flex-col gap-2">
              <label class="font-bold text-xs rpg-label">Use a different code</label>
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
                  :disabled="!importSlug.trim()"
                  @click="setActiveSlug"
                >
                  Set active
                </button>
              </div>
            </div>

            <div v-if="activeCloudSlug && !canUpdateServer" class="flex flex-col gap-2">
              <label class="font-bold text-xs rpg-label">Link edit key (from exported JSON)</label>
              <div class="flex gap-2">
                <input
                  v-model="linkWriteToken"
                  type="password"
                  class="flex-1 rpg-input text-sm"
                  placeholder="Paste edit key"
                  autocomplete="off"
                  spellcheck="false"
                />
                <button
                  type="button"
                  class="rpg-button rpg-button-secondary text-sm"
                  :disabled="busy || !linkWriteToken.trim()"
                  @click="linkEditKey"
                >
                  Link
                </button>
              </div>
            </div>

            <button
              v-if="canUpdateServer"
              type="button"
              class="rpg-button rpg-button-secondary text-sm"
              :disabled="busy"
              @click="confirmNewBackupOpen = true"
            >
              Create new backup code
            </button>
          </div>
        </details>

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
              Load &amp; replace
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
          {{ importConfirmMessage }}
        </p>
        <div class="flex justify-end gap-3">
          <button type="button" class="rpg-button rpg-button-secondary" @click="cancelConfirm">Cancel</button>
          <button type="button" class="bg-danger hover:bg-red-700 border-danger text-white rpg-button" @click="confirmImport">
            Replace all
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="confirmNewBackupOpen"
      class="z-[60] fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4"
      style="margin-top: 0;"
      @mousedown.self="confirmNewBackupOpen = false"
    >
      <div class="bg-white shadow-xl p-6 rounded-lg w-full max-w-md" @click.stop>
        <h3 class="mb-2 text-lg rpg-heading">Create new backup code?</h3>
        <p class="mb-4 text-neutral-700 text-sm rpg-body">
          This generates a fresh server backup and replaces the code this browser updates.
          Your old code still exists on the server, but you will need that code to load it again.
        </p>
        <div class="flex justify-end gap-3">
          <button type="button" class="rpg-button rpg-button-secondary" @click="confirmNewBackupOpen = false">Cancel</button>
          <button type="button" class="rpg-button rpg-button-primary" :disabled="busy" @click="createNewBackup">
            Create new
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
import {
  canUpdateActiveCloudBackup,
  getCloudBackupState,
  getCloudCredentials,
  linkCloudWriteToken,
  setActiveCloudSlug,
  setCloudCredentials,
} from "@/features/backup/cloudCredentials";
import type { ParsedBackup } from "@/features/backup/types";
import { isLegacySettingsBackup } from "@/stores/settings";

const fileInputRef = ref<HTMLInputElement | null>(null);
const cloudAvailable = ref(false);
const retentionDays = ref(180);
const maxBytes = ref(2_000_000);
const busy = ref(false);
const statusMessage = ref("");
const statusIsError = ref(false);
const importSlug = ref("");
const linkWriteToken = ref("");
const codeHighlight = ref(false);
const justCreatedBackup = ref(false);
const confirmNewBackupOpen = ref(false);
const confirmOpen = ref(false);
const cloudStateTick = ref(0);
let highlightTimer: ReturnType<typeof setTimeout> | undefined;
const pendingImport = ref<ParsedBackup | null>(null);
const pendingImportSlug = ref("");
const includeOptionsInBackup = ref(false);

const bumpCloudState = () => {
  cloudStateTick.value += 1;
};

const canUpdateServer = computed(() => {
  void cloudStateTick.value;
  return canUpdateActiveCloudBackup();
});

const activeCloudSlug = computed(() => {
  void cloudStateTick.value;
  return getCloudBackupState()?.activeSlug ?? "";
});

const importConfirmMessage = computed(() => {
  const settings = pendingImport.value?.data.settings;
  const hasOptions = settings
    ? isLegacySettingsBackup(settings) || Boolean(settings.options)
    : false;
  const optionsNote = hasOptions
    ? " App options in this backup will replace your current options."
    : " Your current app options will be kept.";
  return `This replaces all monsters, timers, boards, notes, and card layout with the backup.${optionsNote} This cannot be undone.`;
});

const setStatus = (message: string, isError = false) => {
  statusMessage.value = message;
  statusIsError.value = isError;
};

onMounted(async () => {
  const result = await checkCloudAvailable();
  cloudAvailable.value = result.available;
  if (result.retentionDays) retentionDays.value = result.retentionDays;
  if (result.maxBytes) maxBytes.value = result.maxBytes;
  const state = getCloudBackupState();
  if (state?.activeSlug) {
    importSlug.value = state.activeSlug;
  }
  bumpCloudState();
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
  const envelope = buildBackupEnvelope(cloud ?? undefined, includeOptionsInBackup.value);
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
    pendingImportSlug.value = "";
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
    pendingImportSlug.value = slug;
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
    const envelope = buildBackupEnvelope(undefined, includeOptionsInBackup.value);
    const { slug, writeToken } = await createCloudBackup(envelope, maxBytes.value);
    setCloudCredentials({ slug, writeToken });
    importSlug.value = slug;
    justCreatedBackup.value = true;
    flashCodeReveal();
    bumpCloudState();
    setStatus("Backup saved to server. Copy your code above before you close settings.");
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Server save failed.", true);
  } finally {
    busy.value = false;
  }
};

const createNewBackup = async () => {
  confirmNewBackupOpen.value = false;
  await saveToServer();
};

const updateServer = async () => {
  const creds = getCloudCredentials();
  if (!creds) {
    setStatus("No edit key on this device. Link your edit key or create a new backup.", true);
    return;
  }

  busy.value = true;
  try {
    const envelope = buildBackupEnvelope(creds, includeOptionsInBackup.value);
    await updateCloudBackup(creds.slug, creds.writeToken, envelope, maxBytes.value);
    justCreatedBackup.value = false;
    bumpCloudState();
    setStatus(`Server backup updated (${creds.slug}).`);
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Server update failed.", true);
  } finally {
    busy.value = false;
  }
};

const setActiveSlug = () => {
  const slug = importSlug.value.trim();
  if (!isValidCloudSlug(slug)) {
    setStatus("Enter a valid backup code (four words separated by hyphens).", true);
    return;
  }
  setActiveCloudSlug(slug);
  justCreatedBackup.value = false;
  bumpCloudState();
  setStatus(`Active backup code set to ${slug}.`);
};

const linkEditKey = async () => {
  const slug = activeCloudSlug.value;
  const token = linkWriteToken.value.trim();
  if (!slug || token.length < 16) {
    setStatus("Paste a valid edit key from your exported backup file.", true);
    return;
  }

  busy.value = true;
  try {
    const envelope = buildBackupEnvelope({ slug, writeToken: token }, includeOptionsInBackup.value);
    await updateCloudBackup(slug, token, envelope, maxBytes.value);
    linkCloudWriteToken(slug, token);
    linkWriteToken.value = "";
    justCreatedBackup.value = false;
    bumpCloudState();
    setStatus("Edit key linked. You can update this backup from now on.");
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Edit key is incorrect.", true);
  } finally {
    busy.value = false;
  }
};

const copyActiveSlug = async () => {
  if (!activeCloudSlug.value) return;
  try {
    await navigator.clipboard.writeText(activeCloudSlug.value);
    setStatus("Backup code copied to clipboard.");
  } catch {
    setStatus("Could not copy to clipboard.", true);
  }
};

const cancelConfirm = () => {
  confirmOpen.value = false;
  pendingImport.value = null;
  pendingImportSlug.value = "";
};

const confirmImport = () => {
  if (!pendingImport.value) return;
  try {
    applyBackupEnvelope(pendingImport.value);
    if (pendingImport.value.cloud) {
      importSlug.value = pendingImport.value.cloud.slug;
      justCreatedBackup.value = false;
    } else if (pendingImportSlug.value) {
      setActiveCloudSlug(pendingImportSlug.value);
      importSlug.value = pendingImportSlug.value;
      justCreatedBackup.value = false;
    }
    bumpCloudState();
    setStatus("Backup restored.");
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Restore failed.", true);
  } finally {
    confirmOpen.value = false;
    pendingImport.value = null;
    pendingImportSlug.value = "";
  }
};
</script>

<style scoped>
.backup-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

@media (min-width: 640px) {
  .backup-actions {
    flex-direction: row;
  }
}

.backup-switch-details summary {
  list-style: none;
}

.backup-switch-details summary::-webkit-details-marker {
  display: none;
}

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
