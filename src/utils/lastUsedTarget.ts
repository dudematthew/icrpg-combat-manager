const STORAGE_KEY = "icrpg-last-target-tn";

export function loadLastUsedTarget(fallback = 12): number {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return fallback;
  const parsed = parseInt(raw, 10);
  return Number.isNaN(parsed) ? fallback : Math.max(1, Math.min(25, parsed));
}

export function saveLastUsedTarget(tn: number): void {
  sessionStorage.setItem(STORAGE_KEY, String(Math.max(1, Math.min(25, tn))));
}
