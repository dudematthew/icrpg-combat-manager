import type { BackupCloudMeta } from "./types";

const STORAGE_KEY = "icrpg-cloud-backup";

export function getCloudCredentials(): BackupCloudMeta | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BackupCloudMeta;
    if (typeof parsed.slug !== "string" || typeof parsed.writeToken !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setCloudCredentials(credentials: BackupCloudMeta): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
}

export function clearCloudCredentials(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function hasCloudCredentialsForSlug(slug: string): boolean {
  const creds = getCloudCredentials();
  return creds?.slug === slug && Boolean(creds.writeToken);
}
