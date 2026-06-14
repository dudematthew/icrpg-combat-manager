import { prepareBackupEnvelopeForExport } from "./prepareBackupExport";
import { parseBackupEnvelope, stripCloudMeta } from "./validate";
import type { BackupEnvelopeV1 } from "./types";

/** Normalize envelope for server upload (matches PHP backup_api_validate_envelope_detailed). */
export function buildServerBackupPayload(envelope: BackupEnvelopeV1): BackupEnvelopeV1 {
  return stripCloudMeta(prepareBackupEnvelopeForExport(envelope, true));
}

/** Client-side preflight before cloud API calls — throws with the same class of message PHP returns. */
export function assertServerBackupPayload(envelope: BackupEnvelopeV1): void {
  parseBackupEnvelope(envelope);
}
