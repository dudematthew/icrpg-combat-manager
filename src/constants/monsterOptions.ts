export const MONSTER_COLORS = [
  { label: "Red", value: "Red" },
  { label: "Blue", value: "Blue" },
  { label: "Green", value: "Green" },
  { label: "Yellow", value: "Yellow" },
  { label: "Purple", value: "Purple" },
  { label: "Orange", value: "Orange" },
  { label: "Black", value: "Black" },
  { label: "Grey", value: "Grey" },
  { label: "Brown", value: "Brown" },
] as const;

export const MONSTER_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => ({
  label: letter,
  value: letter,
}));

export const TIMER_COLOR_OPTIONS = MONSTER_COLORS.filter((c) =>
  ["Red", "Blue", "Green", "Yellow", "Purple", "Orange", "Black", "Grey"].includes(c.value),
);

export const TIER_OPTIONS = [
  { label: "Tier I (+2, 1 action, 1 heart)", value: "I" as const },
  { label: "Tier II (+4, 1 action, 2 hearts)", value: "II" as const },
  { label: "Tier III (+6, +2 effort, 2 actions, 4 hearts)", value: "III" as const },
  { label: "Tier IV (+8, +4 effort, 3 actions, 4+ hearts)", value: "IV" as const },
];
