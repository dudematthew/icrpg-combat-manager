import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parseBackupFile } from "../validate";
import { createCloudBackup, updateCloudBackup } from "../cloudApi";
import { BACKUP_FORMAT, BACKUP_VERSION } from "../types";

const fixturePath = join(dirname(fileURLToPath(import.meta.url)), "../../../../tests/fixtures/icrpg-backup-2026-06-13.json");

describe("cloudApi", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("POST create sends backup payload without cloud metadata", async () => {
    const parsed = parseBackupFile(readFileSync(fixturePath, "utf-8"));
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true, slug: "juggly-apple-terminator-cosmos", writeToken: "c".repeat(32) }), {
        status: 201,
      }),
    );

    await createCloudBackup(parsed.envelope);

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, init] = mockFetch.mock.calls[0]!;
    expect(String(url)).toContain("backup-api.php");
    expect(init?.method).toBe("POST");
    const body = JSON.parse(String(init?.body));
    expect(body.backup.format).toBe(BACKUP_FORMAT);
    expect(body.backup.version).toBe(BACKUP_VERSION);
    expect(body.backup.cloud).toBeUndefined();
    expect(body.action).toBeUndefined();
    expect(Array.isArray(body.backup.data.combat.monsters)).toBe(true);
  });

  it("POST update sends action update with slug and writeToken", async () => {
    const parsed = parseBackupFile(readFileSync(fixturePath, "utf-8"));
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    await updateCloudBackup("juggly-apple-terminator-cosmos", "d".repeat(32), parsed.envelope);

    const body = JSON.parse(String(mockFetch.mock.calls[0]![1]?.body));
    expect(body.action).toBe("update");
    expect(body.slug).toBe("juggly-apple-terminator-cosmos");
    expect(body.writeToken).toHaveLength(32);
    expect(body.backup.cloud).toBeUndefined();
  });
});
