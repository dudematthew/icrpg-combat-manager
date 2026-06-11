import { stripCloudMeta } from "./validate";
import type { BackupEnvelopeV1 } from "./types";

const API_URL = `${import.meta.env.BASE_URL}backup-api.php`;

type ApiErrorBody = { ok: false; error?: string };

async function parseApiResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error("Server returned an invalid response.");
  }

  if (!response.ok || (body as { ok?: boolean }).ok === false) {
    const message = (body as ApiErrorBody).error ?? `Request failed (${response.status}).`;
    throw new Error(message);
  }

  return body as T;
}

export async function checkCloudAvailable(): Promise<{ available: boolean; retentionDays?: number }> {
  try {
    const response = await fetch(`${API_URL}?available`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    const body = await parseApiResponse<{ ok: true; version: number; retentionDays?: number }>(response);
    return {
      available: body.ok === true && body.version === 1,
      retentionDays: body.retentionDays,
    };
  } catch {
    return { available: false };
  }
}

export async function createCloudBackup(
  envelope: BackupEnvelopeV1,
): Promise<{ slug: string; writeToken: string }> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ backup: stripCloudMeta(envelope) }),
  });

  const body = await parseApiResponse<{ ok: true; slug: string; writeToken: string }>(response);
  return { slug: body.slug, writeToken: body.writeToken };
}

export async function fetchCloudBackup(slug: string): Promise<BackupEnvelopeV1> {
  const response = await fetch(
    `${API_URL}?slug=${encodeURIComponent(slug.trim())}`,
    { method: "GET", headers: { Accept: "application/json" } },
  );
  const body = await parseApiResponse<{ ok: true; backup: BackupEnvelopeV1 }>(response);
  return body.backup;
}

export async function updateCloudBackup(
  slug: string,
  writeToken: string,
  envelope: BackupEnvelopeV1,
): Promise<void> {
  const response = await fetch(API_URL, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      slug,
      writeToken,
      backup: stripCloudMeta(envelope),
    }),
  });

  await parseApiResponse<{ ok: true }>(response);
}
