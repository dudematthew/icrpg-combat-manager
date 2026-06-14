import { BACKUP_FORMAT, BACKUP_VERSION, type BackupCloudMeta, type BackupEnvelopeV1, type ParsedBackup } from "./types";

const SLUG_PATTERN = /^[a-z]{3,12}(-[a-z]{3,12}){3}$/;

export function isValidCloudSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug.trim());
}

export type CloudParseStatus =
  | { usable: true; slug: string; writeToken: string }
  | { usable: false; reason: string };

export interface BackupParseResult {
  envelope: ParsedBackup;
  cloud: CloudParseStatus;
  warnings: string[];
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/** Parse cloud block without failing the whole backup. */
export function parseCloudBlock(raw: unknown): CloudParseStatus {
  if (raw === undefined || raw === null) {
    return { usable: false, reason: "No cloud code or edit key in this file." };
  }
  if (!isObject(raw)) {
    return { usable: false, reason: "Cloud metadata is malformed and was ignored." };
  }
  const slug = raw.slug;
  const writeToken = raw.writeToken;
  if (typeof slug !== "string" || typeof writeToken !== "string") {
    return { usable: false, reason: "Cloud metadata is missing a code or edit key." };
  }
  const trimmedSlug = slug.trim();
  if (!isValidCloudSlug(trimmedSlug)) {
    return { usable: false, reason: `Cloud code "${slug}" is invalid and was ignored.` };
  }
  if (writeToken.length < 16) {
    return { usable: false, reason: "Edit key in file is too short and was ignored." };
  }
  return { usable: true, slug: trimmedSlug, writeToken };
}

function attachCloudMeta(raw: Record<string, unknown>): BackupCloudMeta | undefined {
  const cloud = parseCloudBlock(raw.cloud);
  if (!cloud.usable) {
    return undefined;
  }
  return { slug: cloud.slug, writeToken: cloud.writeToken };
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

  const cloud = attachCloudMeta(raw);
  const envelope: BackupEnvelopeV1 = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: raw.exportedAt,
    data: raw.data as BackupEnvelopeV1["data"],
    ...(cloud ? { cloud } : {}),
  };

  return envelope;
}

export function parseBackupJson(text: string): ParsedBackup {
  return parseBackupFile(text).envelope;
}

export function parseBackupFile(text: string): BackupParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Could not parse backup file as JSON.");
  }

  const cloudBefore = isObject(parsed) ? parsed.cloud : undefined;
  const cloudStatus = parseCloudBlock(cloudBefore);
  const envelope = parseBackupEnvelope(parsed);
  const warnings: string[] = [];

  if (!cloudStatus.usable) {
    warnings.push(cloudStatus.reason);
  }

  return { envelope, cloud: cloudStatus, warnings };
}

/** Strip cloud block for server storage payloads. */
export function stripCloudMeta(envelope: BackupEnvelopeV1): BackupEnvelopeV1 {
  const { cloud: _cloud, ...rest } = envelope;
  return rest;
}
