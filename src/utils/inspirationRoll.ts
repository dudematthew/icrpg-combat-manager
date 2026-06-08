import theIdea from "@/data/inspiration/theIdea.json";
import jobs from "@/data/inspiration/jobs.json";
import quirkPersonality from "@/data/inspiration/quirkPersonality.json";
import quirkAppearance from "@/data/inspiration/quirkAppearance.json";
import relationships from "@/data/inspiration/relationships.json";
import locations from "@/data/inspiration/locations.json";
import obstacles from "@/data/inspiration/obstacles.json";
import adventureHooks from "@/data/inspiration/adventureHooks.json";
import nameParts from "@/data/inspiration/nameParts.json";

export type InspirationCategory =
  | "theIdea"
  | "name"
  | "job"
  | "quirkPersonality"
  | "quirkAppearance"
  | "relationship"
  | "location"
  | "obstacle"
  | "hook";

export interface TheIdeaRow {
  adjective: string;
  background: string;
  type: string;
  motivatedBy: string;
}

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const rollD20Index = () => Math.floor(Math.random() * 20);
const rollD100Index = (length: number) => Math.floor(Math.random() * length);

export function rollTheIdea(): TheIdeaRow {
  return theIdea[rollD20Index()] as TheIdeaRow;
}

export function formatTheIdea(row: TheIdeaRow): string {
  return `${row.adjective} ${row.background} ${row.type}, motivated by ${row.motivatedBy}`;
}

export function rollName(): string {
  const parts = nameParts as { prefixes: string[]; suffixes: string[] };
  const prefix = pick(parts.prefixes);
  const suffix = pick(parts.suffixes);
  return `${prefix}${suffix}`;
}

export function rollJob(): string {
  return jobs[rollD100Index(jobs.length)] as string;
}

export function rollQuirkPersonality(): string {
  return quirkPersonality[rollD100Index(quirkPersonality.length)] as string;
}

export function rollQuirkAppearance(): string {
  return quirkAppearance[rollD100Index(quirkAppearance.length)] as string;
}

export function rollRelationship(): string {
  return relationships[rollD100Index(relationships.length)] as string;
}

export function rollLocation(): string {
  return locations[rollD100Index(locations.length)] as string;
}

export function rollObstacle(): string {
  return obstacles[rollD100Index(obstacles.length)] as string;
}

export function rollHook(): string {
  return adventureHooks[rollD20Index()] as string;
}

export function rollFullNpc(): string {
  const idea = rollTheIdea();
  const name = rollName();
  const quirk = rollQuirkPersonality();
  return `${name}\n${formatTheIdea(idea)}\nQuirk: ${quirk}`;
}

export function rollCategory(category: InspirationCategory): string {
  switch (category) {
    case "theIdea":
      return formatTheIdea(rollTheIdea());
    case "name":
      return rollName();
    case "job":
      return rollJob();
    case "quirkPersonality":
      return rollQuirkPersonality();
    case "quirkAppearance":
      return rollQuirkAppearance();
    case "relationship":
      return rollRelationship();
    case "location":
      return rollLocation();
    case "obstacle":
      return rollObstacle();
    case "hook":
      return rollHook();
  }
}

export function getCategoryOptions(category: InspirationCategory): string[] {
  switch (category) {
    case "theIdea":
      return (theIdea as TheIdeaRow[]).map(formatTheIdea);
    case "name":
      return [];
    case "job":
      return jobs as string[];
    case "quirkPersonality":
      return quirkPersonality as string[];
    case "quirkAppearance":
      return quirkAppearance as string[];
    case "relationship":
      return relationships as string[];
    case "location":
      return locations as string[];
    case "obstacle":
      return obstacles as string[];
    case "hook":
      return adventureHooks as string[];
  }
}

export const INSPIRATION_CHIPS: { key: InspirationCategory; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "job", label: "Job" },
  { key: "quirkPersonality", label: "Quirk" },
  { key: "relationship", label: "Relation" },
  { key: "location", label: "Location" },
  { key: "obstacle", label: "Obstacle" },
  { key: "hook", label: "Hook" },
];
