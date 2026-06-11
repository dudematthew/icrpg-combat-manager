import { BACKUP_FORMAT, BACKUP_VERSION, type BackupEnvelopeV1, type ParsedBackup } from "./types";

const SLUG_PATTERN = /^[a-z]{3,12}(-[a-z]{3,12}){3}$/;

export function isValidCloudSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug.trim());
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function parseBackupEnvelope(raw: unknown): ParsedBackup {
  if (!isObject(raw)) {
    throw new Error("Backup file is not a valid JSON object.");
  }

  if (raw.format !== BACKUP_FORMAT) {
    throw new Error("Unrecognized backup format.");
  }

  if (raw.version !== BACKUP_VERSION) {
    throw new Error(`Unsupported backup version: ${String(raw.version)}`);
  }

  if (typeof raw.exportedAt !== "string" || !raw.exportedAt) {
    throw new Error("Backup is missing export timestamp.");
  }

  if (!isObject(raw.data)) {
    throw new Error("Backup is missing data.");
  }

  if (!isObject(raw.data.combat) || !isArray(raw.data.combat.monsters) || !isArray(raw.data.combat.timers)) {
    throw new Error("Backup combat data is invalid.");
  }

  if (!isObject(raw.data.boards) || !isArray(raw.data.boards.boards)) {
    throw new Error("Backup boards data is invalid.");
  }

  // PHP json_decode may turn an empty `{}` cards map into `[]`.
  if (isArray(raw.data.boards.cards) && raw.data.boards.cards.length === 0) {
    raw.data.boards.cards = {};
  } else if (!isObject(raw.data.boards.cards)) {
    throw new Error("Backup boards data is invalid.");
  }

  if (!isObject(raw.data.settings) || !isArray(raw.data.settings.appCards)) {
    throw new Error("Backup settings data is invalid.");
  }

  if (raw.cloud !== undefined) {
    if (!isObject(raw.cloud) || typeof raw.cloud.slug !== "string" || typeof raw.cloud.writeToken !== "string") {
      throw new Error("Backup cloud metadata is invalid.");
    }
    if (!isValidCloudSlug(raw.cloud.slug)) {
      throw new Error("Backup cloud slug is invalid.");
    }
    if (raw.cloud.writeToken.length < 16) {
      throw new Error("Backup cloud edit key is invalid.");
    }
  }

  return raw as unknown as BackupEnvelopeV1;
}

export function parseBackupJson(text: string): ParsedBackup {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Could not parse backup file as JSON.");
  }
  return parseBackupEnvelope(parsed);
}

/** Strip cloud block for server storage payloads. */
export function stripCloudMeta(envelope: BackupEnvelopeV1): BackupEnvelopeV1 {
  const { cloud: _cloud, ...rest } = envelope;
  return rest;
}
