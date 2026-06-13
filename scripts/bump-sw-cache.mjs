import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const SW_PATH = "public/sw.js";
const CACHE_PATTERN = /const CACHE = "icrpgcm-shell-v(\d+)"/;

export function bumpSwCache() {
  const content = readFileSync(SW_PATH, "utf8");
  const match = content.match(CACHE_PATTERN);
  const next = match ? Number.parseInt(match[1], 10) + 1 : 1;
  const cacheName = `icrpgcm-shell-v${next}`;

  const updated = match
    ? content.replace(CACHE_PATTERN, `const CACHE = "${cacheName}"`)
    : content.replace(/const CACHE = "[^"]+"/, `const CACHE = "${cacheName}"`);

  writeFileSync(SW_PATH, updated);
  console.log(`Service worker cache bumped to ${cacheName}`);
  return cacheName;
}

const isMain = import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  bumpSwCache();
}
