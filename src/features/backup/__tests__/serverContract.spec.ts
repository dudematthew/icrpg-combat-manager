import { describe, it, expect } from "vitest";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { execSync } from "node:child_process";
import { parseBackupFile } from "../validate";
import { buildServerBackupPayload, assertServerBackupPayload } from "../serverPayload";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const fixturePath = join(root, "tests/fixtures/icrpg-backup-2026-06-13.json");
const validateScript = join(root, "tests/backup-api/validate-payload.php");

describe("server contract", () => {
  it("parses the real-world fixture without throwing", () => {
    const raw = readFileSync(fixturePath, "utf-8");
    const parsed = parseBackupFile(raw);
    expect(parsed.envelope.data.boards.boards.length).toBeGreaterThan(0);
  });

  it("buildServerBackupPayload passes TS validation", () => {
    const parsed = parseBackupFile(readFileSync(fixturePath, "utf-8"));
    const payload = buildServerBackupPayload(parsed.envelope);
    expect(() => assertServerBackupPayload(payload)).not.toThrow();
    expect(payload.cloud).toBeUndefined();
  });

  it("PHP accepts the normalized payload bytes", () => {
    const parsed = parseBackupFile(readFileSync(fixturePath, "utf-8"));
    const payload = buildServerBackupPayload(parsed.envelope);
    const cacheDir = join(root, "node_modules/.cache");
    mkdirSync(cacheDir, { recursive: true });
    const tmpPayload = join(cacheDir, "server-contract-payload.json");
    writeFileSync(tmpPayload, JSON.stringify(payload));
    const result = execSync(`php "${validateScript}" "${tmpPayload}"`, { encoding: "utf-8" });
    expect(result.trim()).toBe("OK");
  });
});
