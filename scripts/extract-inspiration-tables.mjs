import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const sourcePath = path.join(root, "sources", "Fantasy Inspiration Tables.md");
const outDir = path.join(root, "src", "data", "inspiration");

const text = fs.readFileSync(sourcePath, "utf8");
const lines = text.split(/\r?\n/);

function parseNumberedLines(startMarker, endMarker) {
  const start = lines.findIndex((l) => l.includes(startMarker));
  const end = lines.findIndex((l, i) => i > start && l.includes(endMarker));
  const slice = lines.slice(start + 1, end === -1 ? undefined : end);
  const items = [];
  for (const line of slice) {
    const m = line.match(/^(\d+)\s+(.+)$/);
    if (m) items.push(m[2].trim());
  }
  return items;
}

function parseTheIdea() {
  const start = lines.findIndex((l) => l === "THE IDEA");
  const end = lines.findIndex((l, i) => i > start && l.startsWith("PLAYER CHARACTER"));
  const rows = [];
  for (const line of lines.slice(start + 2, end)) {
    const m = line.match(/^(\d+)\s+(\S+)\s+(.+?)\s+(\S+)\s+(.+)$/);
    if (m) {
      rows.push({
        adjective: m[2],
        background: m[3],
        type: m[4],
        motivatedBy: m[5],
      });
    }
  }
  return rows;
}

function parseD100TwoCol(startMarker, endMarker) {
  const start = lines.findIndex((l) => l.includes(startMarker));
  const end = lines.findIndex((l, i) => i > start && endMarker && l.includes(endMarker));
  const slice = lines.slice(start + 1, end === -1 ? undefined : end);
  const items = [];
  for (const line of slice) {
    const m = line.match(/^(\d+)\s+(.+?)\s{2,}(.+)$/);
    if (m) {
      items.push(`${m[2].trim()} / ${m[3].trim()}`);
    } else {
      const m2 = line.match(/^(\d+)\s+(.+)$/);
      if (m2) items.push(m2[2].trim());
    }
  }
  return items;
}

function parseAdventureHooks() {
  const start = lines.findIndex((l) => l.includes("1 Seek safety"));
  const end = lines.findIndex((l, i) => i > start && l.includes("ADVENTURE INSPIRATION"));
  const items = [];
  for (const line of lines.slice(start, end)) {
    const m = line.match(/^(\d+)\s+(.+)$/);
    if (m) items.push(m[2].replace(/```/g, "").trim());
  }
  return items;
}

function parseNameParts() {
  const start = lines.findIndex((l) => l.includes("D100 PREFIX SUFFIX"));
  const end = lines.findIndex((l, i) => i > start && l.includes("FANTASY SURNAMES"));
  const prefixes = [];
  const suffixes = [];
  for (const line of lines.slice(start + 1, end)) {
    const m = line.match(/^(\d+)\s+(\S+)\s+(.+)$/);
    if (m) {
      prefixes.push(m[2]);
      suffixes.push(m[3].trim());
    }
  }
  return { prefixes, suffixes };
}

fs.mkdirSync(outDir, { recursive: true });

const data = {
  theIdea: parseTheIdea(),
  jobs: parseD100TwoCol("D100 JOB 1-2 JOB 3-4", "CHARACTER JOBS"),
  quirkPersonality: parseNumberedLines("D100 QUIRKS", "CHARACTER QUIRKS"),
  quirkAppearance: parseNumberedLines("Roll a D100 to find a QUIRK for an NPC or PC", "MORE CHARACTER QUIRKS"),
  relationships: parseNumberedLines("D100 RELATIONSHIPS 1-2", "CHARACTER RELATIONSHIPS"),
  locations: parseNumberedLines("D100 DESCRIPTOR LOCATION", "LOCATION INSPIRATION"),
  obstacles: parseNumberedLines("D100 OBSTACLE 1-2", "OBSTACLE INSPIRATION"),
  adventureHooks: parseAdventureHooks(),
  nameParts: parseNameParts(),
};

for (const [key, value] of Object.entries(data)) {
  fs.writeFileSync(path.join(outDir, `${key}.json`), JSON.stringify(value, null, 2));
  const count = Array.isArray(value) ? value.length : Object.keys(value).length;
  console.log(`Wrote ${key}.json (${count} entries)`);
}
