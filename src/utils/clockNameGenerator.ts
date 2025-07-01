// Clock name generator for ICRPG timers/clocks
// Mix of funny, sad, quirky, mad, and dramatic clock names

const CLOCK_NAMES = [
  // Environmental/Building threats
  "Building collapses",
  "Ceiling caves in",
  "Floor gives way",
  "Walls close in",
  "Foundation crumbles",
  "Bridge snaps",
  "Tower topples",
  "Dam bursts",

  // Monster/Combat threats
  "Big monster goes bam",
  "Dragon gets hangry",
  "Orc reinforcements arrive",
  "Beast goes bonkers",
  "Kraken gets cranky",
  "Troll throws tantrum",
  "Demon demands dinner",
  "Zombies crash the party",

  // Weather/Natural disasters
  "Sky falls on the ground",
  "Storm hits hard",
  "Volcano erupts violently",
  "Earthquake shakes everything",
  "Tornado touches down",
  "Flood waters rise",
  "Avalanche approaches",
  "Lightning strikes twice",

  // Quirky/Funny
  "Tea time interrupted",
  "Sandwich gets soggy",
  "Cat knocks over potion",
  "Wizard loses his hat",
  "Bard runs out of songs",
  "Chef burns the stew",
  "Library books explode",
  "Chickens revolt",

  // Dark/Sad
  "Hope fades away",
  "Memories turn bitter",
  "Light dims forever",
  "Sanity slips slowly",
  "Trust crumbles completely",
  "Dreams die quietly",
  "Courage abandons heart",
  "Love turns to ash",

  // Mad/Angry
  "Rage consumes reason",
  "Fury unleashes chaos",
  "Temper explodes violently",
  "Madness takes hold",
  "Wrath seeks vengeance",
  "Anger boils over",
  "Hatred spreads like fire",
  "Violence escalates rapidly",

  // Mission/Objective failures
  "Guards discover intrusion",
  "Alarm bells ring",
  "Escape route closes",
  "Backup arrives",
  "Cover gets blown",
  "Trail goes cold",
  "Evidence disappears",
  "Witness remembers",

  // Weird/Surreal
  "Reality starts glitching",
  "Time moves backwards",
  "Gravity reverses politely",
  "Colors taste funny",
  "Numbers refuse to count",
  "Words lose their meaning",
  "Physics takes vacation",
  "Logic goes on strike",
];

/**
 * Generates a random clock name from the predefined list
 * @returns A random clock name string
 */
export function generateClockName(): string {
  const randomIndex = Math.floor(Math.random() * CLOCK_NAMES.length);
  return CLOCK_NAMES[randomIndex];
}

/**
 * Gets all available clock names (for testing or display)
 * @returns Array of all clock name strings
 */
export function getAllClockNames(): string[] {
  return [...CLOCK_NAMES];
}

/**
 * Gets the total number of available clock names
 * @returns Number of clock names available
 */
export function getClockNameCount(): number {
  return CLOCK_NAMES.length;
}
