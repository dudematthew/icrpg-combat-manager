<template>
  <div class="mb-6">
    <h4 class="mb-3 rpg-label">Backup &amp; Sync</h4>

    <div class="space-y-3 bg-neutral-50 p-3 border border-neutral-200 rounded-lg">
      <p class="text-neutral-600 text-xs rpg-body">
        Export or import combat, boards, notes, snapshots, and settings as one JSON file.
      </p>

      <div class="flex flex-col sm:flex-row gap-2">
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

      <p v-if="statusMessage" class="text-xs rpg-body" :class="statusIsError ? 'text-red-600' : 'text-green-700'">
        {{ statusMessage }}
      </p>

      <template v-if="cloudAvailable">
        <div class="pt-3 border-neutral-200 border-t space-y-3">
          <p class="font-bold text-sm rpg-heading">Cloud backup</p>
          <p class="text-neutral-600 text-xs rpg-body">
            Save on this server and restore on another device with the memorable code.
            Backups auto-delete after {{ retentionDays }} days without an update.
          </p>

          <div class="flex flex-col sm:flex-row gap-2">
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

          <div v-if="lastCloudSlug" class="bg-white p-2 border border-neutral-200 rounded-lg">
            <p class="mb-1 text-neutral-600 text-xs rpg-body">Your backup code</p>
            <div class="flex items-center gap-2">
              <code class="flex-1 text-sm rpg-mono break-all">{{ lastCloudSlug }}</code>
              <button type="button" class="rpg-button rpg-button-sm rpg-button-secondary" @click="copySlug">
                Copy
              </button>
            </div>
            <p v-if="lastCloudSlugCreated" class="mt-2 text-neutral-500 text-xs rpg-body">
              Save this code to import on another device. This browser remembers the edit key for updates.
            </p>
          </div>

          <div class="space-y-2">
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
        </div>
      </template>

      <details class="pt-2 text-neutral-600 text-xs rpg-body">
        <summary class="cursor-pointer font-bold text-neutral-700">How cloud backups are secured</summary>
        <ul class="mt-2 space-y-1 list-disc pl-4">
          <li>Backups are stored as JSON on shared PHP hosting and are <strong>not encrypted</strong>.</li>
          <li>Anyone who knows your backup code can <strong>download</strong> your data (like an unlisted link).</li>
          <li>Only someone with the <strong>edit key</strong> (returned when you create a backup, or saved in an exported file) can overwrite it.</li>
          <li>Backup codes are assigned by the server and are hard to guess; you cannot pick your own code or overwrite without the edit key.</li>
          <li>Inactive backups may be removed after {{ retentionDays }} days. Keep your own file copies.</li>
          <li>No accounts or passwords — you are responsible for what you upload.</li>
        </ul>
      </details>
    </div>

    <div
      v-if="confirmOpen"
      class="z-[60] fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4"
      style="margin-top: 0;"
      @click="cancelConfirm"
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
const lastCloudSlug = ref("");
const lastCloudSlugCreated = ref(false);
const confirmOpen = ref(false);
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
    lastCloudSlug.value = creds.slug;
    importSlug.value = creds.slug;
  }
});

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
    lastCloudSlug.value = slug;
    lastCloudSlugCreated.value = true;
    importSlug.value = slug;
    setStatus(`Saved to server. Code: ${slug}`);
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
    lastCloudSlug.value = creds.slug;
    setStatus(`Updated server backup: ${creds.slug}`);
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Server update failed.", true);
  } finally {
    busy.value = false;
  }
};

const copySlug = async () => {
  if (!lastCloudSlug.value) return;
  try {
    await navigator.clipboard.writeText(lastCloudSlug.value);
    setStatus("Backup code copied.");
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
      lastCloudSlug.value = pendingImport.value.cloud.slug;
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
