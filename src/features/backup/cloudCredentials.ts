import type { BackupCloudMeta } from "./types";

const STORAGE_KEY = "icrpg-cloud-backup";
const LEGACY_SESSION_KEY = "icrpg-cloud-backup";

export interface CloudBackupState {
  activeSlug: string;
  writeToken?: string;
  importedAt?: string;
}

function readRaw(): CloudBackupState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return migrateFromSessionStorage();
    const parsed = JSON.parse(raw) as CloudBackupState;
    if (typeof parsed.activeSlug !== "string" || !parsed.activeSlug) return null;
    if (parsed.writeToken !== undefined && typeof parsed.writeToken !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

function migrateFromSessionStorage(): CloudBackupState | null {
  try {
    const raw = sessionStorage.getItem(LEGACY_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BackupCloudMeta;
    if (typeof parsed.slug !== "string" || typeof parsed.writeToken !== "string") return null;
    const state: CloudBackupState = {
      activeSlug: parsed.slug,
      writeToken: parsed.writeToken,
    };
    writeRaw(state);
    sessionStorage.removeItem(LEGACY_SESSION_KEY);
    return state;
  } catch {
    return null;
  }
}

function writeRaw(state: CloudBackupState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getCloudBackupState(): CloudBackupState | null {
  return readRaw();
}

/** @deprecated use getCloudBackupState */
export function getCloudCredentials(): BackupCloudMeta | null {
  const state = getCloudBackupState();
  if (!state?.writeToken) return null;
  return { slug: state.activeSlug, writeToken: state.writeToken };
}

export function setCloudCredentials(credentials: BackupCloudMeta): void {
  writeRaw({
    activeSlug: credentials.slug,
    writeToken: credentials.writeToken,
  });
}

export function setActiveCloudSlug(slug: string): void {
  const existing = readRaw();
  writeRaw({
    activeSlug: slug,
    writeToken: existing?.activeSlug === slug ? existing.writeToken : undefined,
    importedAt: new Date().toISOString(),
  });
}

export function linkCloudWriteToken(slug: string, writeToken: string): void {
  writeRaw({
    activeSlug: slug,
    writeToken,
  });
}

export function clearCloudWriteToken(): void {
  const state = readRaw();
  if (!state) return;
  writeRaw({ activeSlug: state.activeSlug, importedAt: state.importedAt });
}

export function clearCloudCredentials(): void {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(LEGACY_SESSION_KEY);
}

export function hasCloudCredentialsForSlug(slug: string): boolean {
  const state = getCloudBackupState();
  return state?.activeSlug === slug && Boolean(state.writeToken);
}

export function canUpdateActiveCloudBackup(): boolean {
  const state = getCloudBackupState();
  return Boolean(state?.activeSlug && state.writeToken);
}
