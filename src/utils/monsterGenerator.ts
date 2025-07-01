import { rollD20, rollDie } from "./combat";

export interface MonsterGeneratorResult {
  state: string;
  motivation: string;
  abilities: string;
  upgrade: string;
}

// D20 MONSTER STATE
export const MONSTER_STATES = [
  "Tormented: Being experimented on or tortured for some awful purpose",
  "Imprisoned: Chained or caged by its masters to control its fury",
  "Raging: The thing is already going wild with anger. You make it worse",
  "Augmented: They've implanted THINGS in this beast...deadly things",
  "Dying: It's barely alive but still refuses to relent",
  "Swarming: They are many, and something has them convulsing in a frenzy",
  "Feeding: This is a very bad time to interrupt it",
  "Dormant: It slumbers. We should be able to creep by undetected",
  "Cybernetic: Are those HYDRAULICS?",
  "Rune-Etched: Some magic has hewn glowing symbols into the beast's flesh",
  "Mutated: I thought the last one was ugly!",
  "Confused: This monster is baffled, frantically searching for answers or relief from its vertigo",
  "Hungry: Default state of all living things",
  "Hiding: It springs from its hidey hole, pouncing on prey, usually targeting the small or weak",
  "Camouflaged: They're coming out of the damn walls!",
  "On Fire: Either by its own power or some freak malfunction, this creature is on fire, igniting all it touches",
  "Dividing: Some kind of cellular metagenesis...but HOW?",
  "Crashing In: Boom! The thing breaks through a gate, wall, or door",
  "Changing: One creature is turning into another and for a time has both sets of abilities",
  "Undead: Someone already killed it, and some damned fool brought it back",
];

// D20 MONSTER MOTIVATION
export const MONSTER_MOTIVATIONS = [
  "Feed: It will seek any edible material at any location",
  "Search for Intruders: It patrols a fixed area",
  "Lie in Wait: It will not move until triggered by passers-by",
  "Escape: It just wants out! It will bash, gnaw, or claw its way to freedom",
  "Find an Object: No matter where the object goes, it is drawn there",
  "Torture: Sadistic instincts are not confined to the 'higher life forms' of our world",
  "Baffle: It toys with its prey, confusing and frightening",
  "Imitate: This creature can take the form of others and uses its form to separate the foolish",
  "Cripple: It craves not death but only disables its prey and moves on",
  "Recon: Far-roaming beasts sent to watch or listen for their masters",
  "Guard: It will stand its ground in one spot and never waiver",
  "Kill: One target is on its mind, and it will hunt until slain",
  "Hoard: It steals things, finds things, and piles them in a dark lair somewhere",
  "Reproduce: It ignores all concerns besides making more of itself, as fast as possible",
  "Survive: This creature can be very hard to kill, as it only wants to live another day",
  "Grow: Driven to spend moments straining and swelling to immense size, even when in peril",
  "Attach: A parasitic beast whose only concern is latching on to a victim and doing whatever it does next",
  "Play Dead: A primordial tactic, yet still effective",
  "Hibernate: This tired creature seeks a private, quiet, safe place. Things in its way be warned",
  "Nest: The beast is creating a home and has the upper hand there in all regards",
];

// D20 MONSTER ABILITIES
export const MONSTER_ABILITIES = [
  "Grappler: Tentacles, hooks, and grubby fingers. Victims use STR checks to avoid or break free",
  "Tactical: How can it cut the power? It's an animal! Create and/or destroy terrain to move",
  "Metal Eater: My blast rifle is toast! Any damage done beyond 7 destroys one piece of GEAR",
  "Tough: Thud. Cannot be harmed with blunt weapons",
  "Toxic: Venomous. Injured heroes continue taking 1D4 each round until making a CON check",
  "Smart: It's looking right at me! Creature makes EASY WIS checks to spot party weakness",
  "Terrifying: What in blazes? Any hero at CLOSE range must check with CHA or flee for their turn",
  "Wild: Run! Monster darts about at random, using rolls to choose what to do, and where",
  "Fast: Look out! Move FAR as if NEAR. If you roll this ability twice, add phasic speed",
  "One Weakness: Roll 1D6: 1: Silver, 2: Magic, 3: Fire, 4: Ice, 5: Missiles, 6: Melee",
  "Volatile: Don't stab it! When killed, explodes, doing ULTIMATE to all within NEAR range",
  "Confusing: Where'd it go? Attackers must roll WIS checks to spot its actual location",
  "Devour: It ate Carl! If a hero takes 10+ damage, they are engulfed by the thing",
  "Spawner: Oh God, they're hatching. Spawn 1D4 parasitic 'mooks' per round",
  "Firestarter: Don't stand in the fire! Monster leaves areas of flame behind wherever it attacks",
  "Hellion: Back to the pit! Monster always targets the holy or innocent but subject to holy rites",
  "Fort: Shoot at that wall of junk! It will gather local materials to hide itself/deflect missiles",
  "Pursuit: Flee! If heroes flee, it will pursue to the death",
  "Stalker: They're in the damn ceiling! It will wait patiently for an opportune moment to strike",
  "Two Abilities: Roll Another Ability",
];

// D20 MONSTER UPGRADE
export const MONSTER_UPGRADES = [
  "Hearts: This thing is beefy! Add 1D4 HEARTS, or add 1 HEART per PC party member",
  "Stat Rolls: Adapting! Add 1D8 to ALL ROLLS, or add 1D12 to one STAT and 1D6 to all other rolls",
  "Weapon Damage: Razor sharp, barbed, and toothy. Add 1D6, throwing out a 1",
  "Magic Effect: Glowing with some arcane hex. Add 1D6, throwing out a 1",
  "Ultimate: When it locks on, it crushes bones and steel alike. Add 1D6, throwing out a 1",
  "Add Ability: What will it do next? Roll twice on the ABILITIES table",
  "Devious Intelligence: We're being watched. It will retreat, use line of sight, or utilize ROOM TREATS to win",
  "Legion: Gods! There are more! There are 1D6 of them, throw out a 1",
  "Alpha: The leader of the pack. Its WEAPON attacks are MAGICAL",
  "Gigantic: It's destroying the city! Monster cannot be damaged by human-sized creatures or conventional WEAPONS",
  "Charging: When it moves, anything in its path makes a DEX check or takes ULTIMATE damage",
  "Rider: Something is controlling it! Can only be defeated by killing the rider",
  "Armored: It's tough as iron! Ignore any damage below 5",
  "Illusory: Where the blazes is the real one! All attacks against it are HARD",
  "Part-Human: Faces! Faces in the skin! +5 CHA when persuading or beseeching enemies",
  "Metagen: It just keeps healing. Recover 5 HP per round",
  "Nova: Take cover! Every 1D4 ROUNDS, it damages all within FAR range, DEX or CON to avoid",
  "Infinite: There's too many! When one is killed, another appears",
  "Ancient: What have we done? Roll twice on this table, ignoring a 19 or 20",
  "Nightmare: A demigod of death. Roll Three times on this table, ignoring a 19 or 20",
];

// Utility functions to roll on tables
export const rollMonsterState = (): string => {
  const roll = rollD20();
  return MONSTER_STATES[roll - 1];
};

export const rollMonsterMotivation = (): string => {
  const roll = rollD20();
  return MONSTER_MOTIVATIONS[roll - 1];
};

export const rollMonsterAbility = (): string => {
  const roll = rollD20();
  let ability = MONSTER_ABILITIES[roll - 1];

  // Handle special cases
  if (roll === 10) {
    // One Weakness
    const weaknessRoll = rollDie(6);
    const weaknesses = ["Silver", "Magic", "Fire", "Ice", "Missiles", "Melee"];
    ability = ability.replace(
      "Roll 1D6: 1: Silver, 2: Magic, 3: Fire, 4: Ice, 5: Missiles, 6: Melee",
      `Weakness: ${weaknesses[weaknessRoll - 1]}`
    );
  } else if (roll === 20) {
    // Two Abilities
    const secondAbility = rollMonsterAbility();
    ability = ability + " | " + secondAbility;
  }

  return ability;
};

export const rollMonsterUpgrade = (): string => {
  const roll = rollD20();
  let upgrade = MONSTER_UPGRADES[roll - 1];

  // Handle special cases
  if (roll === 1) {
    // Hearts
    const heartsRoll = rollDie(4);
    upgrade = upgrade.replace("Add 1D4 HEARTS", `Add ${heartsRoll} HEARTS`);
  } else if (roll === 8) {
    // Legion
    const legionRoll = rollDie(6);
    const count = legionRoll === 1 ? rollDie(6) : legionRoll; // throw out a 1
    upgrade = upgrade.replace("There are 1D6 of them, throw out a 1", `There are ${count} of them`);
  } else if (roll === 17) {
    // Nova
    const novaRoll = rollDie(4);
    upgrade = upgrade.replace("Every 1D4 ROUNDS", `Every ${novaRoll} ROUNDS`);
  } else if (roll === 19) {
    // Ancient
    const firstRoll = rollMonsterUpgrade();
    const secondRoll = rollMonsterUpgrade();
    upgrade = `Ancient: ${firstRoll} | ${secondRoll}`;
  } else if (roll === 20) {
    // Nightmare
    const firstRoll = rollMonsterUpgrade();
    const secondRoll = rollMonsterUpgrade();
    const thirdRoll = rollMonsterUpgrade();
    upgrade = `Nightmare: ${firstRoll} | ${secondRoll} | ${thirdRoll}`;
  }

  return upgrade;
};

// Generate a complete monster profile
export const generateMonsterProfile = (): MonsterGeneratorResult => {
  return {
    state: rollMonsterState(),
    motivation: rollMonsterMotivation(),
    abilities: rollMonsterAbility(),
    upgrade: rollMonsterUpgrade(),
  };
};

// Generate just abilities (most commonly used)
export const generateMonsterAbilities = (): string => {
  return rollMonsterAbility();
};

// Generate just upgrades
export const generateMonsterUpgrades = (): string => {
  return rollMonsterUpgrade();
};
