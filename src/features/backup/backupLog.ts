export function logBackup(event: string, detail?: Record<string, unknown>): void {
  if (detail) {
    console.info("[icrpg-backup]", event, detail);
  } else {
    console.info("[icrpg-backup]", event);
  }
}

export function warnBackup(event: string, detail?: Record<string, unknown>): void {
  if (detail) {
    console.warn("[icrpg-backup]", event, detail);
  } else {
    console.warn("[icrpg-backup]", event);
  }
}
