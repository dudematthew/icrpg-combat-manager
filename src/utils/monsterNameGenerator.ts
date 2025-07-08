// Monster name generator for ICRPG monsters
// Mix of classic, funny, intimidating, and creative monster names

const MONSTER_NAMES = [
  // Classic Fantasy
  "Grimjaw the Terrible",
  "Shadowclaw Stalker",
  "Ironhide Brute",
  "Flamewing Terror",
  "Frostbite Hunter",
  "Thornspike Crawler",
  "Bloodfang Reaper",
  "Stoneheart Guardian",
  "Voidwhisper Wraith",
  "Stormhowl Beast",

  // Intimidating & Dark
  "Bonecrusher",
  "The Devourer",
  "Nightmire Fiend",
  "Deathbringer",
  "Soulrender",
  "The Impaler",
  "Skullcrusher",
  "Darkbane Horror",
  "Painbringer",
  "The Executioner",

  // Funny & Quirky
  "Toothy McBiteFace",
  "Sir Chomps-a-Lot",
  "Grumpus the Grouchy",
  "Sneezewort",
  "Pickles the Terrible",
  "Captain Stabbykins",
  "Lord Fluffington",
  "Buttercup the Destroyer",
  "Sparkles",
  "Mr. Bitey",

  // Elemental & Nature
  "Emberclaw",
  "Frostmaw",
  "Stonefist",
  "Windripper",
  "Mudskipper",
  "Leafwhisper",
  "Magmacore",
  "Icicle",
  "Thunder Roar",
  "Earthquake",

  // Descriptive & Atmospheric
  "The Hungry One",
  "Broken Chain",
  "Silent Death",
  "Crimson Eye",
  "Golden Fang",
  "Iron Will",
  "Burning Heart",
  "Frozen Soul",
  "Twisted Mind",
  "Shattered Dream",

  // Single Word Power Names
  "Devastator",
  "Annihilator",
  "Obliterator",
  "Destroyer",
  "Conqueror",
  "Dominator",
  "Eradicator",
  "Exterminator",
  "Vanquisher",
  "Terminator",

  // Creative & Unique
  "The Forgotten",
  "Last Breath",
  "Final Hour",
  "Broken Promise",
  "Lost Hope",
  "Fallen Star",
  "Distant Thunder",
  "Hollow Echo",
  "Ancient Fury",
  "Eternal Hunger",

  // Sci-Fi
  "Omega One",
  "Alpha Zero",
  "RT-1000",
  "Star Destroyer",
  "Death Star",
  "TIE Fighter",
  "X-Wing",
  "Y-Wing",
  "TIE Interceptor",
  "TIE Bomber",
];

/**
 * Generates a random monster name from the predefined list
 * @returns A random monster name string
 */
export function generateMonsterName(): string {
  const randomIndex = Math.floor(Math.random() * MONSTER_NAMES.length);
  return MONSTER_NAMES[randomIndex];
}

/**
 * Gets all available monster names (for testing or display)
 * @returns Array of all monster name strings
 */
export function getAllMonsterNames(): string[] {
  return [...MONSTER_NAMES];
}

/**
 * Gets the total number of available monster names
 * @returns Number of monster names available
 */
export function getMonsterNameCount(): number {
  return MONSTER_NAMES.length;
}
