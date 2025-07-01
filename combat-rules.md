ICRPG Master Edition – Combat Rules Summary

This concise guide outlines the key combat mechanics from Index Card RPG (Master Edition) for building a fast, mobile-first encounter manager.
🌀 Initiative & Turn Order

    Clockwise Turns: Play proceeds clockwise, including the GM.

    First Turn: At combat start, everyone rolls 1d20. Highest goes first, then clockwise. If GM wins, enemies act first.

    Turn vs Round:

        Turn: One player’s action (~10–20 seconds of game time).

        Round: One full cycle where each participant has taken a turn.

    Combat Timers: Events can be tied to turns or rounds.

        E.g. “Explosion in 3 turns” = 3 individual turns.

        E.g. “Reinforcements in 2 rounds” = after all players + GM act twice.

🧭 Turn Actions & Movement

Each character takes one action per turn. Movement types:

    Action Only: Perform an action without moving.

    Move + Action (NEAR): Move a short distance and act.

    Move FAR: Use entire turn to move far (no action).

Distance is abstracted:

    CLOSE: Touch range

    NEAR: A few steps away (within turn)

    FAR: Requires full turn to reach

    OUT OF RANGE: Cannot interact this turn

🎲 Action Types & Rolls

Three types of actions:

    Simple Actions: No roll required. Trivial tasks (e.g. light torch).

    Checks: Roll 1d20 + STAT vs TARGET. Succeed/fail instantly.

    Attempts: Roll 1d20 + STAT vs TARGET. On success, roll Effort.

Target Numbers (TN):

    Each scene has one global TARGET (usually 10–18).

    Rolls must meet or beat TARGET.

    Easy rolls: TARGET − 3

    Hard rolls: TARGET + 3

💥 Effort Dice

Successful attempts roll Effort based on the action/tool used:
Effort Type	Die	Use Case
Bare-handed / Wits	d4	Punching, decoding, lifting
Weapon or Tool	d6	Swords, bows, bandages, crowbars
Gun / Advanced Ranged	d8	Pistols, ballista, deadly firearms
Magic / Energy	d10	Spells, lasers, healing magic
Critical (Nat 20) Bonus	+d12	Add to any Effort type on Nat 20 attempt
❤️ HP & Hearts

    1 Heart = 10 HP

    Damage and task progress are tracked using hearts.

    Subtract Effort (points) from heart pools.

    Characters usually start with 1–3 hearts.

    At 0 HP, a character becomes unconscious/dying.

👹 Monster Creation (Tiers)

Monsters use tiers to abstract stats:
Tier	Bonus	Actions	Hearts	Notes
Tier I	+2	1	1	Mooks/minions
Tier II	+4	1	2	Normal enemies
Tier III	+6	2	4	Sub-bosses, bonus Effort +2
Tier IV	+8	3	4+	Bosses, Effort +4, may revive

    Optional special abilities: poison, blast, regeneration, etc.

    Minimal UI entry: Color + Tier + Letter + Hearts
    Example: Red Goblin (I) – 1H, +2, 1 action

☠️ Damage, Death & Recovery

    Damage: Subtract from HP. At 0 HP, character is unconscious.

    Blown to Bits: Drop to –20 HP instantly = death.

    Dying Timer:

        On next turn after dropping to 0 HP: roll 1d4 → you die in that many rounds unless stabilized.

    Miracle Roll:

        While dying, roll d20 each turn. Natural 20 = regain 1 HP, stand up.

    Stabilize Ally:

        Roll INT or WIS vs TARGET. On success, dying counter stops.

    Recover (Self-Heal):

        Spend turn. Roll d20 + CON vs TARGET. On success, regain CON + 1 HP.

    Magical / Tool Healing:

        Magic = d10 effort. First aid (bandages) = d6 effort.

⏳ Auxiliary Timers & Conditions

    Timers: Countdowns by turn or round.

        UI should display "e.g. Fire Detonates: 2 Turns"

    Conditions: Paralyzed, Burning, Poisoned, etc.

        Should be togglable in UI.

        May apply effect like Roll HARD, Take 1 damage per round, etc.

🧠 UI Suggestions

    Quick Monster Entries

        Minimal: Color + Tier + Hearts

        Editable fields: name, notes, abilities

    Expandable Monster Cards

        Compact view with HP, tier, actions

        Expand for notes, special abilities

    Condition Toggles

        Tappable condition icons (burning, stunned, etc.)

        Toggle applies modifiers or auto-damage

    Combat Timers

        Round-based or turn-based counters

        UI countdown and visual alert when expired

✅ Summary

This structure enables fast ICRPG combat handling:

    Unified target number per scene

    Simple action types + clean dice logic

    Heart-based HP

    Tier-based monster logic

    Fast monster creation and condition tracking

Perfect foundation for a mobile-first GM companion.