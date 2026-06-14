<template>
  <div class="mb-6">
    <h4 class="mb-3 rpg-label">Backup &amp; Sync</h4>

    <div class="flex flex-col gap-4 bg-neutral-50 p-4 border border-neutral-200 rounded-lg">
      <section class="flex flex-col gap-3">
        <p class="text-neutral-600 text-xs rpg-body">
          Export or restore combat, boards, notes, and settings as a JSON file on this device.
        </p>

        <label class="flex items-center gap-2 cursor-pointer">
          <input v-model="includeOptionsInBackup" type="checkbox" class="rounded border-neutral-300" />
          <span class="text-neutral-700 text-xs rpg-body">Include app options (tier mode, notifications, layout prefs, etc.)</span>
        </label>

        <div class="backup-actions">
          <button type="button" class="flex-1 rpg-button rpg-button-secondary text-sm" @click="exportToFile">
            Export to file
          </button>
          <button type="button" class="flex-1 rpg-button rpg-button-secondary text-sm" @click="triggerLocalRestore">
            Restore from file
          </button>
          <input
            ref="fileInputRef"
            type="file"
            accept=".json,application/json"
            class="hidden"
            @change="onLocalRestoreFileSelected"
          />
        </div>

        <p
          v-if="localStatusMessage"
          class="text-xs rpg-body"
          :class="localStatusIsError ? 'text-red-600' : 'text-green-700'"
        >
          {{ localStatusMessage }}
        </p>
      </section>

      <section v-if="cloudAvailable" class="flex flex-col gap-4 pt-4 border-neutral-200 border-t">
        <div class="flex flex-col gap-1.5">
          <p class="font-bold text-sm rpg-heading">Cloud backup</p>
          <p class="text-neutral-600 text-xs rpg-body">
            Save your current session to the server, or load a backup with a memorable code.
            Backups auto-delete after {{ retentionDays }} days without an update.
          </p>
        </div>

        <div
          v-if="activeCloudSlug"
          class="backup-code-reveal bg-neutral-50 p-3 border border-neutral-200 rounded-lg"
          :class="{ 'backup-code-reveal--highlight': codeHighlight && justCreatedBackup }"
        >
          <p class="mb-1 font-bold text-neutral-800 text-sm rpg-heading">Cloud code</p>
          <p v-if="justCreatedBackup" class="mb-3 text-amber-800 text-xs rpg-body">
            Copy this code now. You need it to load on another device.
          </p>
          <p v-else-if="canUpdateServer" class="mb-3 text-neutral-600 text-xs rpg-body">
            Saving below overwrites the server copy at this code.
          </p>
          <p v-else class="mb-3 text-amber-800 text-xs rpg-body">
            Read-only on this device — export from the device that created this backup to get the edit key, or save as a new code.
          </p>
          <div class="flex flex-col gap-2 bg-white p-2 border border-neutral-200 rounded-md">
            <code class="block w-full font-semibold text-sm rpg-mono break-all leading-snug">{{ activeCloudSlug }}</code>
            <button
              type="button"
              class="w-full rpg-button rpg-button-sm rpg-button-secondary"
              @click="copyActiveSlug"
            >
              {{ copiedSlug ? "Copied!" : "Copy code" }}
            </button>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <button
            type="button"
            class="w-full rpg-button rpg-button-primary text-sm"
            :disabled="busy"
            @click="saveToCloud"
          >
            {{ saveToCloudLabel }}
          </button>
          <p v-if="cloudStatusMessage" class="text-xs rpg-body" :class="cloudStatusIsError ? 'text-red-600' : 'text-green-700'">
            {{ cloudStatusMessage }}
          </p>
        </div>

        <div class="flex flex-col gap-2 pt-4 mt-1 border-neutral-200 border-t">
          <p class="font-bold text-xs rpg-label">Load from cloud</p>
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
              @click="loadFromCloud"
            >
              Load
            </button>
          </div>
          <p
            v-if="loadStatusMessage"
            class="text-xs rpg-body"
            :class="loadStatusIsError ? 'text-red-600' : 'text-green-700'"
          >
            {{ loadStatusMessage }}
          </p>
        </div>

        <details v-if="activeCloudSlug" class="backup-switch-details text-xs rpg-body">
          <summary class="cursor-pointer font-bold text-neutral-700">Advanced</summary>
          <div class="flex flex-col gap-3 mt-3">
            <div v-if="!canUpdateServer" class="flex flex-col gap-2">
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
              Save as new cloud code
            </button>
          </div>
        </details>

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
    </div>

    <div
      v-if="confirmOpen"
      class="z-[60] fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4"
      style="margin-top: 0;"
      @mousedown.self="cancelConfirm"
    >
      <div class="bg-white shadow-xl p-6 rounded-lg w-full max-w-md" @click.stop>
        <h3 class="mb-2 text-lg rpg-heading">Restore to this device?</h3>
        <ul v-if="pendingWarnings.length" class="mb-3 text-amber-800 text-xs rpg-body list-disc pl-5 space-y-1">
          <li v-for="(warning, index) in pendingWarnings" :key="index">{{ warning }}</li>
        </ul>
        <p class="mb-4 text-neutral-700 text-sm rpg-body">
          {{ restoreConfirmMessage }}
        </p>
        <div class="flex justify-end gap-3">
          <button type="button" class="rpg-button rpg-button-secondary" @click="cancelConfirm">Cancel</button>
          <button
            type="button"
            class="bg-danger hover:bg-red-700 border-danger text-white rpg-button"
            @click="confirmRestore"
          >
            Restore
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
        <h3 class="mb-2 text-lg rpg-heading">Save as new cloud code?</h3>
        <p class="mb-4 text-neutral-700 text-sm rpg-body">
          Creates a fresh server backup for your current session. The old code still exists, but this device will update the new one.
        </p>
        <div class="flex justify-end gap-3">
          <button type="button" class="rpg-button rpg-button-secondary" @click="confirmNewBackupOpen = false">Cancel</button>
          <button type="button" class="rpg-button rpg-button-primary" :disabled="busy" @click="createNewCloudBackup">
            Save as new
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
import { parseBackupFile, parseBackupJson, isValidCloudSlug } from "@/features/backup/validate";
import {
  checkCloudAvailable,
  createCloudBackup,
  fetchCloudBackup,
  updateCloudBackup,
} from "@/features/backup/cloudApi";
import { logBackup, warnBackup } from "@/features/backup/backupLog";
import {
  canUpdateActiveCloudBackup,
  getCloudBackupState,
  getCloudCredentials,
  linkCloudWriteToken,
  setActiveCloudSlug,
} from "@/features/backup/cloudCredentials";
import type { ParsedBackup } from "@/features/backup/types";
import { isLegacySettingsBackup } from "@/stores/settings";

const fileInputRef = ref<HTMLInputElement | null>(null);
const cloudAvailable = ref(false);
const retentionDays = ref(180);
const maxBytes = ref(2_000_000);
const busy = ref(false);
const localStatusMessage = ref("");
const localStatusIsError = ref(false);
const cloudStatusMessage = ref("");
const cloudStatusIsError = ref(false);
const loadStatusMessage = ref("");
const loadStatusIsError = ref(false);
const copiedSlug = ref(false);
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
const pendingWarnings = ref<string[]>([]);
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

const saveToCloudLabel = computed(() => {
  if (canUpdateServer.value && activeCloudSlug.value) {
    return "Update cloud backup";
  }
  return "Save new cloud backup";
});

const setLocalStatus = (message: string, isError = false) => {
  localStatusMessage.value = message;
  localStatusIsError.value = isError;
  cloudStatusMessage.value = "";
  loadStatusMessage.value = "";
};

const setCloudStatus = (message: string, isError = false) => {
  cloudStatusMessage.value = message;
  cloudStatusIsError.value = isError;
  localStatusMessage.value = "";
  loadStatusMessage.value = "";
};

const setLoadStatus = (message: string, isError = false) => {
  loadStatusMessage.value = message;
  loadStatusIsError.value = isError;
  localStatusMessage.value = "";
  cloudStatusMessage.value = "";
};
const restoreConfirmMessage = computed(() => {
  const settings = pendingImport.value?.data.settings;
  const hasOptions = settings
    ? isLegacySettingsBackup(settings) || Boolean(settings.options)
    : false;
  const optionsNote = hasOptions
    ? " App options in this backup will replace your current options."
    : " Your current app options will be kept.";
  return `This replaces all monsters, timers, boards, notes, and card layout on this device.${optionsNote} This cannot be undone.`;
});

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

let copiedSlugTimer: ReturnType<typeof setTimeout> | undefined;

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
  setLocalStatus("Backup file downloaded.");
};

const triggerLocalRestore = () => {
  fileInputRef.value?.click();
};

const onLocalRestoreFileSelected = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;

  try {
    const parsed = parseBackupFile(await file.text());
    if (parsed.warnings.length) {
      warnBackup("backup-file-warnings", { warnings: parsed.warnings });
    }
    pendingImport.value = parsed.envelope;
    pendingWarnings.value = parsed.warnings;
    pendingImportSlug.value = "";
    confirmOpen.value = true;
  } catch (error) {
    setLocalStatus(error instanceof Error ? error.message : "Import failed.", true);
  }
};

const loadFromCloud = async () => {
  const slug = importSlug.value.trim();
  if (!isValidCloudSlug(slug)) {
    setLoadStatus("Enter a valid backup code (four words separated by hyphens).", true);
    return;
  }

  busy.value = true;
  try {
    const backup = await fetchCloudBackup(slug);
    pendingImport.value = parseBackupJson(JSON.stringify(backup));
    pendingImportSlug.value = slug;
    pendingWarnings.value = [];
    confirmOpen.value = true;
  } catch (error) {
    setLoadStatus(error instanceof Error ? error.message : "Could not load backup.", true);
  } finally {
    busy.value = false;
  }
};

const saveToCloud = async () => {
  busy.value = true;
  try {
    const creds = getCloudCredentials();
    const envelope = buildBackupEnvelope(creds ?? undefined, includeOptionsInBackup.value);

    if (creds && canUpdateActiveCloudBackup()) {
      await updateCloudBackup(creds.slug, creds.writeToken, envelope, maxBytes.value);
      justCreatedBackup.value = false;
      bumpCloudState();
      setCloudStatus("Cloud backup updated.");
      logBackup("cloud-update-ok", { slug: creds.slug });
      return;
    }

    const { slug, writeToken } = await createCloudBackup(envelope, maxBytes.value);
    linkCloudWriteToken(slug, writeToken);
    importSlug.value = slug;
    justCreatedBackup.value = true;
    flashCodeReveal();
    bumpCloudState();
    setCloudStatus("New cloud backup saved.");
    logBackup("cloud-create-ok", { slug });
  } catch (error) {
    setCloudStatus(error instanceof Error ? error.message : "Cloud save failed.", true);
  } finally {
    busy.value = false;
  }
};

const createNewCloudBackup = async () => {
  confirmNewBackupOpen.value = false;
  busy.value = true;
  try {
    const envelope = buildBackupEnvelope(undefined, includeOptionsInBackup.value);
    const { slug, writeToken } = await createCloudBackup(envelope, maxBytes.value);
    linkCloudWriteToken(slug, writeToken);
    importSlug.value = slug;
    justCreatedBackup.value = true;
    flashCodeReveal();
    bumpCloudState();
    setCloudStatus("Saved as new cloud code.");
    logBackup("cloud-create-new-ok", { slug });
  } catch (error) {
    setCloudStatus(error instanceof Error ? error.message : "Cloud save failed.", true);
  } finally {
    busy.value = false;
  }
};

const linkEditKey = async () => {
  const slug = activeCloudSlug.value;
  const token = linkWriteToken.value.trim();
  if (!slug || token.length < 16) {
    setCloudStatus("Paste a valid edit key from your exported backup file.", true);
    return;
  }

  busy.value = true;
  try {
    const existing = await fetchCloudBackup(slug);
    await updateCloudBackup(slug, token, existing, maxBytes.value);
    linkCloudWriteToken(slug, token);
    linkWriteToken.value = "";
    justCreatedBackup.value = false;
    bumpCloudState();
    setCloudStatus("Edit key linked. You can update this cloud backup from now on.");
    logBackup("cloud-link-ok", { slug });
  } catch (error) {
    setCloudStatus(error instanceof Error ? error.message : "Edit key is incorrect.", true);
  } finally {
    busy.value = false;
  }
};

const copyActiveSlug = async () => {
  if (!activeCloudSlug.value) return;
  try {
    await navigator.clipboard.writeText(activeCloudSlug.value);
    copiedSlug.value = true;
    if (copiedSlugTimer) clearTimeout(copiedSlugTimer);
    copiedSlugTimer = setTimeout(() => {
      copiedSlug.value = false;
    }, 2000);
  } catch {
    setCloudStatus("Could not copy to clipboard.", true);
  }
};

const cancelConfirm = () => {
  confirmOpen.value = false;
  pendingImport.value = null;
  pendingImportSlug.value = "";
  pendingWarnings.value = [];
};

const confirmRestore = () => {
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
    const note = pendingWarnings.value.length ? ` (${pendingWarnings.value[0]})` : "";
    setLocalStatus(`Restored to this device.${note}`);
    logBackup("restore-local-ok", { warnings: pendingWarnings.value });
  } catch (error) {
    setLocalStatus(error instanceof Error ? error.message : "Restore failed.", true);
  } finally {
    cancelConfirm();
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
