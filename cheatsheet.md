# Routefile Cheat Sheet

**Full docs**: https://github.com/Corvimae/pokemon-ranger/blob/main/README.md
**Publishing docs**: https://github.com/Corvimae/ranger-routes/blob/main/README.md

## IV Tracker

```
:::tracker{species="Bulbasaur" baseStats="[[45, 49, 49, 65, 65, 45], [60, 62, 63, 80, 80, 60], [80, 100, 123, 122, 120, 80]]}
5: 
  6 -> 0, 0, 0, 1, 0, 0
  7 -> 0, 0, 0, 1, 1, 0 # Burmy (1 SPDEF)
6:
  7 -> 0, 0, 0, 0, 0, 1
:::
```

## Damage Table

```
::damage[+0 Tackle at Lvl 9 against 12 Def (0 EVs)]{source="Lillipup" level=9 healthThreshold=12 special=false evs=0 movePower=50 stab=true opponentStat=12}
```

#### Required attributes

`source`, `movePower`, `opponentStat`, `level` (if `offensive` = true).

#### Optional attributes

Formatted as `attribute (default)`.

`offensive (true)`, `special (false)`, `level` (if `offensive` = false), `healthThreshold`, `evolution (0)`, `combatStages (0)`, `effectiveness (1)`, `stab (false)`, `opponentCombatStages (0)`, `torrent (false)`, `weatherBoosted (false)`, `weatherReduced (false)`, `multiTarget (false)`, `otherModifier (1)`, `generation (4)`.

## Trainer Block

### Without info
```
:::trainer[Youngster Joey]

:::
```

### With info
```
:::trainer[Youngster Joey]{info="His Ratata is top percentage!" infoColor=blue}

:::
```

## Pokémon Block

### Without info
```
:::pokemon[Drifloon]
  - Work Up
  - Crunch
  - (Crunch)
:::
```

### With info
```
:::pokemon[Drifloon]{info="Faster at 23+ Speed (x/8+/0+)" infoColor=blue}
  - Work Up
  - Crunch
  - (Crunch)
:::
```

### As trainer block descendent

```
:::::trainer[Ace Trainer Dennis]
  :::pokemon[Drifblim]
    - X Attack
    - Wing Attack x2
  :::
:::::
```

## Conditional Card

```
:::if{source="Lillipup" stat="atk" condition="15-16" level=6}
Hurray, you don't need to reset!
:::
```

#### Required attributes

`source`, `condition`.

#### Optional attributes

`level` (not necessary for IV ranges), `evolution` (default: 0), `theme` (default: `borderless`).

Valid themes are `info`, `error`, `warning`, `success`, `borderless`, `faint`, and `neutral`.

### Conditions

#### Stat condition
```
atk=23+
def=14
spatk=18-
```

#### IV range condition
```
atk=(12-14 / 3- / x)
def=(x / 22+ / #)
spatk=~(12+ / 4- / x)
```

### Logical operators
```
atk=(14- / 3- / x) && startingLevel=6+
def=~(x / 28- / 14-) && spatk=(18+ / # / #)
```

Valid stats: `hp`, `health`, `atk`, `attack`, `def`, `defense`, `spa`, `spatk`, `spattack`, `specialattack`, `spd`, `spdef`, `spdefense`, `specialdefense`, `spe`, `speed`, `startingLevel`.

## Cards
```
:::card{theme="neutral"}
Welcome to my route!
:::
```

## Inline Info
```
:info[Message here!]{color=red}
```

Valid colors: `black`, `red`, `blue`, `green`, `gray`, `pink`.


