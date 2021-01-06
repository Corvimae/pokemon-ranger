# Pokemon Ranger

Any likeness in naming to any DS series of videogames is purely coincidental. Ranger calculates ranges, nothing more.

## Writing Routefiles

Routefiles use [generic directives](https://talk.commonmark.org/t/generic-directives-plugins-syntax/444) to provide an superset of [Markdown](https://www.markdownguide.org/cheat-sheet/) with additional features for writing routes for manipless Pokémon speedruns. All standard Markdown syntax is supported, in addition to the additional directives explained below.

Routefiles must end in `.md` or `.mdr` (markdown route) for Ranger to process them.

### IV Trackers

IV trackers determine the possible IVs and nature of a Pokémon based on the information available to the runner. As a Pokémon levels up, the runner can input its stats into the IV tracker, which will then calculate the possible IV ranges that result in the stats entered at each level.

A route file can contain any number of IV trackers, but in order to take advantage of the features provided by routefiles, at least one must be defined. Each IV tracker is displayed in a sidebar on the right-hand side, and the IV ranges and nature are displayed at the bottom of that sidebar.

#### Syntax
```
:::tracker{species="Bulbasaur" baseStats="[[45, 49, 49, 65, 65, 45], [60, 62, 63, 80, 80, 60], [80, 100, 123, 122, 120, 80]]}
5: 
  6 -> 0, 0, 0, 1, 0, 0
  7 -> 0, 0, 0, 1, 1, 0 # Burmy (1 SPDEF)
6:
  7 -> 0, 0, 0, 0, 0, 1
:::
```

**Attributes**

`species` - The name of the Pokemon. This is used as a unique identifier for the tracker and is displayed in the sidebar.

`baseStats` - A JSON-formatted array of base stats for each of the Pokémon's evolutions. If the Pokémon has no evolutions, you should still provide an array-of-arrays (e.g. `[[50, 50, 50, 50, 50, 50]]`).

**Content**

The block content is used to determine the EVs of the Pokémon at each level. EVs at not calculated cumulatively - you must provide the total EVs that the Pokémon has when the level up occurs, not just the EVs gained since the last level up.

The block must start with `[level]:`, where `[level]` is the level at which the Pokémon is obtained.

EV rows have the format:

```
[level] -> [hp], [atk], [def], [spa], [spd], [spe]
```

Anything after a `#` in a line is considered a comment and ignored.

**Multiple Starting Levels**

If the level Pokémon is obtained at in the route differs, different EV routes can be provided for each starting level. If more than one starting level is specified, the tracker will display toggles for each starting level.

### Damage Tables

Damage tables display the possible damage that an attack can deal or the chance that it kills its target. The rows displayed in the table are dependent on the IV ranges determined by an associated IV tracker; rows that are not possible are hidden.

If there is only one possible damage value, no table is displayed and instead the damage is displayed as a humanized sentence.

Damage tables use the same formula as Ranger's damage tool.

#### Syntax
```
::damage[+0 Tackle at Lvl 9 against 12 Def (0 EVs)]{source="Lillipup" level=9 healthThreshold=12 special=false evs=0 movePower=50 stab=true opponentStat=12}
```

The content within the square brackets is displayed as a header above the table, and is best used to describe what attack the table represents.

**Attributes**

`source` (string, required) - The unique identifier for the IV tracker associated with this damage table. The value must match the `species` value of an IV tracker.

`offensive` (boolean, default: `true`) - Whether to calculate offensive ranges (damage dealt by the runner's Pokémon) or defensive ranges (damage dealt to the runner's Pokémon).

`special` (boolean, default: `false`) - Whether this move deals special damage or physical damage.

`movePower` (number, required) - The base power of the attack.

`opponentStat` (number, required) - The relevant stat of the opponent's Pokémon at the time of the attack.

`level` (number) - The level of the runner's Pokémon at the time of the attack. Required if in offensive mode.

`healthThreshold` (number) - If specified, the table will display the number of damage rolls (out of 16) that are at least the specified value rather than the damage range.

`evolution` (number, default: `0`) - The evolution of the runner's Pokémon at the time of the attack, zero-indexed.

`evs` (number, default: `0`) - The EVs in the relevant stat of the runner's Pokémon at the time of the attack.

`combatStages` (number, default: `0`) - The number of combat stages in the relevant stat of the runner's Pokémon at the time of the attack.

`effectiveness` (number, default: `1`) - The type effectiveness multiplier of the move (0.25, 0.5, 1, 2, 4).

`stab` (boolean, default: `false`) - Whether this move is boosted by the Same Type Attack Bonus.

`opponentCombatStages` (number, default: `0`) - The number of combat stages in the opponent Pokémon's relevant stat at the time of the attack.

`torrent` (boolean, defualt: `false`) - Whether the attacker is in Torrent, Blaze, or Overgrowth.

`weatherBoosted` (boolean, default: `false`) - Whether the attack is boosted by the weather (e.g. is a Water-type attack in rain).

`weatherReduced` (boolean, default: `false`) - Whether the attack is reduced by the weather (e.g. is a Fire-type attack in rain).

`multiTarget` (boolean, default: `false`) - Whether the attack hits multiple targets. Only relevant for double and triple battles.

`otherModifier` (number, default: `1`) - An additional modifier to apply to the roll.

`generation` (number, default: `4`) - The generation of the game in which the attack takes place.

### Trainer Blocks

Trainer blocks are useful for organizing content by fight and ensure child Pokémon blocks (see below) are rendered correctly.
The value in square brackets (`[]`) should be the trainer's name and will be rendered as a subheader. All attributes are optional; if you don't need to specify any attributes, you can omit the curly braces (`{}`).

#### Syntax

```
:::trainer[Youngster Joey]{info="His Ratata is top percentage!" infoColor=blue}

:::
```

**Attributes**

`info` (string) - Text to display next to the trainer's name.
`infoColor` (string) - The color of the info text. Any color accepted by `:info` is accepted here (see below).

### Pokémon Blocks

Pokémon blocks group the instructions for defeating a specific opponent Pokémon and ensure the list of moves is rendered correctly. The value in square brackets (`[]`) should be the Pokémon's name. All attributes are optional; if you don't need to specify any attributes, you can omit the curly braces (`{}`).

It's recommended you format the fight instructions as an unordered list. Bullets will not be rendered, but the instructions will be spaced properly; see the example below.

#### Syntax

```
:::pokemon[Drifloon]{info="Faster at 23+ Speed (x/8+/0+)" infoColor=blue}
  - Work Up
  - Crunch
  - (Crunch)
:::
```

**Note:** Block directives can only be nested if the parent block is prefixed by more colons than the child. Since you should next Pokémon blocks within Trainer blocks, you should define the Trainer blocks with _at least_ four colons (`::::trainer`); five is recommended for better spacing. Furthermore, if you are using `:if` conditions, you need to use even more colons. A trainer with an conditional fight might look like this:

```
:::::::trainer[Ace Trainer Dennis]
  :::::pokemon[Drifblim]
    :::if{source="Starly" condition="atk=(# / 12- / 2-)"}
      - X Attack
      - Wing Attack x2
    :::
    :::if{source="Starly" condition="atk=(x / 13+ / 3+)"}
      - Wing Attack x2
    :::
  :::::
:::::::
```

**Attributes**

`info` (string) - Text to display next to the Pokémon's name.
`infoColor` (string) - The color of the info text. Any color accepted by `:info` is accepted here (see below).

### Conditional Cards

Conditional cards are displayed only if the stats of the runner's Pokémon meet a criteria. Conditional cards are useful for displaying variant strategies in the route; for example, a Pokémon with low Attack may need to get an additional Rare Candy. With a conditional card, those instructions are only shown if the Pokémon's Attack is low enough to justify the detour.

#### Syntax
```
:::if{source="Lillipup" stat="atk" condition="15-16" level=6}
Hurray, you don't need to reset!
:::
```

The content of the conditional card can be any valid Markdown, including Ranger directives.

**Attributes**

`source` (string, required) - The unique identifier for the IV tracker associated with this conditional card. The value must match the `species` value of an IV tracker.

`condition` (string, required) - The condition that determines when the card is shown. See the following section details on formatting conditions.

`level` (number) - The level of the Pokémon at the time the conditional card is relevant. Only necessary for stat ranges, not IV ranges.

`evolution` (number) - The evolution of the runner's Pokémon at the time the conditional card is relevant, zero-indexed. If not specified, the current evolutionary stage of the associated IV tracker is used.

`theme` (string) - The color theme to apply to the card. Valid themes are `info`, `error`, `warning`, `success`, `borderless`, `faint`, and `neutral`. If no theme is specified, or the specified theme is invalid, `borderless` (blue) is used. The `borderless` and `faint` themes appear "inline", with no special styling around the card.

**Conditions**

Conditions must be written in the format `[stat]=[range]`. More than one condition can be specified by separating
them by `&&` ("and"; both condition must be true) or `||` ("or"; one or both conditions must be true). Groups of
conditions can be surrounded by parentheses to help ensure proper evaluation (e.g. `(atk=12+ && def=10-) || atk=22+`).

Valid stats are: `hp`, `health`, `atk`, `attack`, `def`, `defense`, `spa`, `spatk`, `spattack`, `specialattack`, `spd`, `spdef`, `spdefense`, `specialdefense`, `spe`, `speed`, `startingLevel`.

Ranges must be in stat range format or IV range format:

| Stat Range | IV Range       |
| ---------- | -------------  | 
| 12         | x / x / 10+    |
| 14+        | 0-9 / # / #    |
| 115-       | # / 22+ / 0-4  |
| 18-22      | (14+ / 3+ / #) |

Stat ranges are compared against the calculated statistic at the specified level; e.g. "What is the Pokémon's Attack at level 12?". Stat ranges can be
a single value (12), a minimum value (12+), a maximum value (12-), or a range (12-14). If the range of possible stats that the Pokémon can have given its calculated IVs overlap the stat range, the conditional card is displayed.

IV ranges are compared against the Pokémon's IVs, and are level agnostic. IV ranges have the format `negative / neutral / positive`, where `negative` is the range of possible IVs with a nature that reduces the stat, `neutral` is the range of possible IVs with a nature that does not affect the stat, and `positive` is the range of possible IVs with a nature that boosts the stat. IV ranges can optionally be surrounded by parentheses. If an IV range is prefixed by a tilde (`~`), the
inverse of the range is used instead. Inverses may only be used if each section of the IV range is an unbounded value, 0,
or 31. (i.e. one of `x`, `X`, `#`, `0`, `31`, `[number]+`, or `[number]-`).

IV ranges are evaluated in the same manner as stat ranges, except that they are compared against the range of possible IVs calculated by the IV tracker rather than against the range of possible stats. Additionally, IV ranges accept some special tokens:

`#` - Matches any value (e.g. `x/x/#` matches any positive nature IV)

`x` or `X` - Matches no values (e.g. `x/x/#` matches no negative or neutral nature IVs)

**Warning: Defining Conditional Fights**

When defining conditional fights ("do this strategy if your stats are lower than X"), it's tempting to define the "better" fight, and then insert a condition that adds a turn for low stats, like such:

```
- Work Up
:::if{source="Lillipup" condition="atk=(# / 22- / 6-)"}
- Work Up
:::
- Strength
```

**This is not recommended.** Until the IVs are narrowed to the point where the condition is _impossible_, the conditional block will appear. This makes the fight confusing if your IVs _are_ likely high, but can _potentially_ be low enough to trigger the alternate fight. A more clear way to define the above fight is:

```
:::if{source="Lillipup" condition="atk=(# / 22- / 6-)"}
  - Work Up x2
  - Strength
:::
:::if{source="Lillipup" condition="atk=(x / 23+ / 7+)"}
  - Work Up
  - Strength
:::
```

This will render both fights with a divider, allowing the runner to better decide which strategy they want to use.

### Cards

Cards can also be used without a condition to separate content and draw prominence to certain sections of the route.

#### Syntax
```
:::card{theme="neutral"}
Welcome to my rouse1
:::
```

**Attributes**

`theme` (string) - The color theme to apply to the card. Valid themes are `info`, `error`, `warning`, `success`, `borderless`, `faint`, and `neutral`. If no theme is specified or the specified theme is invalid, `default` (blue) is used. The `borderless` and `faint` themes appear "inline", with no special styling around the card.

### Inline Info

Inline info provides additional context to a line, such as a speed range, a kill threshold, or an alternate strategy.

#### Syntax
```
:info[Message here!]{color=red}
```

**Attributes**

`color` (string) - The color of the text. Valid colors are `black`, `red`, `blue`, `green`, `gray`, and `pink`. If no color is specified or the specified color is invalid, `black` is used.

## Publishing Routefiles

Routefiles can be retrieved from a repo, ensuring runners always have the latest version of the route when they load it.

Routefiles must be published on GitHub in a branch named `main`, and the file must be named `route.mdr`. Once pushed, runners can load the routefile by entering `<username>/<repository>` (e.g. `corvimae/test-ranger-route`).

For an example, see [corvimae/test-ranger-route](https://github.com/Corvimae/test-ranger-route).