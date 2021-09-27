# relicalc

[relicalc](https://github.com/corvimae/relicalc) is Ranger's underlying calculation framework. If you want to reuse
some Ranger's features in your own project but don't want all the UI overhead, you can use relicalc so long as you
keep the source of your project open.

## Installation

```bash
npm install relicalc
```

or

```bash
yarn add relicalc
```

## Common Types

`Stat`: one of `hp`, `attack`, `defense`, `spAttack`, `spDefense`, or `speed`.

`Generation`: one of `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, or `lgpe`.

`GrowthRate`: one of `fast`, `medium-fast`, `medium-slow`, `slow`, `erratic`, or `fluctuating`.

`ConfirmedNature`: `[decreasedStat: Stat, increasedStat: Stat]`

## Pokémon Stats

### HP (all generations)
```ts
import { calculateHP } from 'relicalc';

// function calculateHP(level: number, base: number, iv: number, ev: number, generation: Generation): number
console.log(calculateHP(50, 150, 31, 0, 4)); // 225
```

### Non-HP stats (Let's Go, Pikachu/Eevee!)
```ts
import { calculateLGPEStat } from 'relicalc';

// function calculateLGPEStat(level: number, base: number, iv: number, av: number, modifier: number, friendship: number): number;
console.log(calculateLGPEStat(50, 60, 15, 3, 1, 70)); // 76
```

### Non-HP stats (generations 1-2)
```ts
import { calculateGen1Stat } from 'relicalc';

// function calculateGen1Stat(level: number, base: number, dv: number, ev: number): number;
console.log(calculateGen1Stat(50, 60, 15, 24)); // 80
```

### Non-HP stats (generations 3+)
```ts
import { calculateStat } from 'relicalc';

// function calculateStat(level: number, base: number, iv: number, ev: number, modifier: number): number;
console.log(calculateStat(50, 60, 15, 24, 1)); // 75
```

### Applying combat stages
```ts
import { calculateStat, applyCombatStage } from 'relicalc';

// function applyCombatStages(stat: number, combatStages: number): number
const attack = calculateStat(50, 60, 15, 24, 1); // 75
console.log(applyCombatStage(attack, 1)); // 112
console.log(applyCombatStage(attack, -1)); // 50
```

## Move Damage

### Possible damage values for all IVs
```ts
import { calculateDamageRanges } from 'relicalc';

// function calculateDamageRanges(options: CalculateDamageRangesParameters): DamageRangeNatureResult[] 
console.log(calculateDamageRanges({
  generation: 6,
  level: 20,
  baseStat: 80,
  movePower: 60,
  evs: 16,
  stab: true,
  opponentStat: 28
})); // (Output is very large; see type definitions.)
```
#### Options
```ts
interface AllCalculateDamageRangesParameters {
  /** The level of the owned Pokémon. */
  level: number;
  /** The base stat of the owned Pokémon. */
  baseStat: number;
  /** The effort value of the relevant stat of the owned Pokémon. */
  evs: number;
  /** The number of combat stages in the relevant stat for the owned Pokémon. */
  combatStages: number;
  /** Is the attacker benefitting from the same-type attack bonus? */
  stab: boolean;
  /** The type effectiveness multiplier of the move. */
  typeEffectiveness: number;
  /** Is the owned Pokémon attacking? */
  offensiveMode: boolean;
  /** The base power of the move. */
  movePower: number;
  /** Did the move critical hit? */
  criticalHit: boolean;
  /** Is the attacker affected by Torrent, Overgrow, or Blaze? */
  torrent: boolean;
  /** Does the move target more than one Pokémon and is the encounter a double or triple battle? */
  multiTarget: boolean;
  /** Is the move's damage boosted by the weather? */
  weatherBoosted: boolean;
  /** Is the move's damage reduced by the weather? */
  weatherReduced: boolean;
  /** The generation damage formula to use. */
  generation: Generation;
  /** An additional multiplier to apply at the end of the calculation. */
  otherModifier: number;
  /** The level of the opponent Pokémon. */
  opponentLevel: number;
  /** The value of opponent Pokémon's relevant stat  */
  opponentStat: number;
  /** The number of combat stages the opponent Pokémon has in the relevant stat */
  opponentCombatStages: number;
  /** The friendship of the Pokémon (only relevant for LGPE). */
  friendship: number;
  /** Is the defender protected by a screen move? */
  screen: boolean;
  /** An additional multiplier to apply to the base power of the move. */
  otherPowerModifier: number;
}
```

### Combine damage results into IV ranges
```ts
import { calculateDamageRanges, combineIdenticalLines } from 'relicalc';

const results = calculateDamageRanges({
  generation: 6,
  level: 20,
  baseStat: 80,
  movePower: 60,
  evs: 16,
  stab: true,
  opponentStat: 28
})

// function combineIdenticalLines(results: DamageRangeNatureResult[]): CompactRange[]
console.log(combineIdenticalLines(results)); // (Output is very large; see type definitions.)
```

### Combine damage results by chance to one-shot knockout
```ts
import { calculateDamageRanges, calculateKillRanges } from 'relicalc';

const results = calculateDamageRanges({
  generation: 6,
  level: 20,
  baseStat: 80,
  movePower: 60,
  evs: 16,
  stab: true,
  opponentStat: 28
})

// function calculateKillRanges(results: DamageRangeNatureResult[], healthThreshold: number): Record<number, OneShotResult>
console.log(calculateKillRanges(results, 28)); // (Output is very large; see type definitions.)
```

## Experience

### Total experience required to reach a level
```ts
import { calculateExperienceRequiredForLevel } from 'relicalc';

// function calculateExperienceRequiredForLevel(level: number, growthRate: GrowthRate): number 
console.log(calculateExperienceRequiredForLevel(10, 'fluctuating')); // 540
```

### Experience gained from an encounter
```ts
import { calculateExperienceGain } from 'relicalc';


// function calculateExperienceGain(generation: Generation, baseExperience: number, level: number, opponentLevel: number, options: ExperienceGainOptions = {}): number
console.log(calculateExperienceGain(
  5,
  78,
  15,
  24,
  {
    isDomesticTrade: true,
    participated: true,
    isWild: true,
  },
)); // 856
```

#### Options
```ts
export interface ExperienceGainOptions {
  /** Is the Exp. Share enabled? */
  expShareEnabled?: boolean,
  /** Did the Pokémon gaining experience participate in the fight? */
  participated?: boolean,
  /** The number of other un-fainted participants in the fight. */
  otherParticipantCount?: number,
  /** The number of other Pokémon in the party that are holding an Exp. Share. */
  otherPokemonHoldingExperienceShare?: number,
  /** The number of Pokémon in the party. */
  partySize?: number,
  /** Was this Pokémon received in a domestic trade? */
  isDomesticTrade?: boolean,
  /** Was this Pokémon receieved in an international trade? */
  isInternationalTrade?: boolean,
  /** Is this Pokémon holding a Lucky Egg? */
  hasLuckyEgg?: boolean,
  /** Is this Pokémon affected by the high affection experience boost? */
  hasAffectionBoost?: boolean,
  /** Was the defeated Pokémon a wild Pokémon? */
  isWild?: boolean,
  /** Is the Pokémon past the level it would normally evolve? */
  isPastEvolutionPoint?: boolean,
}
```

## IV Tracking

### Calculate the possible IV range set given previous stats.
```ts
import { calculatePossibleIVRange } from 'relicalc';

// baseStatValues and valuesAtPreviousLevels should be arrays in order of relevant data for each step of the species' evolutionary chain.

// valuesAtPreviousLevels is a map from level to stat value.

// function calculatePossibleIVRange(stat: Stat, baseStatValues: number[], valuesAtPreviousLevels: Record<number, number>[], evsByLevel: Record<number, number>, generation: Generation, options: CalculatePossibleIVRangeOptions = {}): IVRangeSet
console.log(calculatePossibleIVRange(
  'attack', 
  [40, 90], 
  [{ 7: 14, 8: 15 }, {}], 
  {},
  6
));
// {
//   negative: [-1, -1],
//   neutral: [9, 17],
//   positive: [0, 4]
//   combined: [0, 17]
// }
```

#### Options
```ts
interface CalculatePossibleIVRangeOptions {
  /** Hard override for the stat that is being boosted by nature. */
  positiveNatureStat?: Stat,
  /** Hard override for the stat that is being reduced by nature. */
  negativeNatureStat?: Stat,
  /** Hard override for the IV value. */
  staticIV?: number;
}
```
### Calculate all possible stat values for an IV set.
```ts
import { calculateAllPossibleStatValues } from 'relicalc';
// function calculateAllPossibleStatValues(stat: Stat, level: number, ivRanges: IVRangeSet, confirmedNature: ConfirmedNature, baseStat: number, evs: number, generation: Generation): StatValuePossibilitySet 

// (See above for details on how to calculate a possible IV range set.)
const attackRanges = {
  negative: [20, 31],
  neutral: [0, 3],
  positive: [-1, -1],
  combined: [0, 31],
};

console.log(calculateAllPossibleStatValues('attack', 20, attackRanges, [null, null], 60, 8, 4));
// {
//   possible: [26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38],
//   valid: [29, 30, 31]
// }
```
## Hidden Power

### Determine the most probable Hidden Power type.

```ts
import { calculateHiddenPowerType } from 'relicalc';

// (See "IV Tracking" for details on how to calculate an IV set.)

// function calculateHiddenPowerType(ivs: Record<Stat, IVRangeSet>, confirmedNature: ConfirmedNature): TypeName | null
console.log(calculateHiddenPowerType(ivSet, ['attack', 'speed'])); // (Reliant on IV set.)
```

## Formatting

### Format a damage range
```ts
import { formatDamageRange } from 'relicalc';

// function formatDamageRange(values: number[]): string
console.log(formatDamageRange([1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2])); // "(1) / 2"

console.log(formatDamageRange([2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3])); // "2 / (3)"

console.log(formatDamageRange([1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3])); // "(1) / 2 / (3)"

console.log(formatDamageRange([2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3])); // "2–3"

console.log(formatDamageRange([1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3])); // "(1) / 2–3"

console.log(formatDamageRange([2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 4])); // "2–3 / (4)"

console.log(formatDamageRange([1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 4])); // "(1) / 2–3 / (4)"
```

### Format an IV range set
```ts
import { formatIVRangeSet } from 'relicalc';

const attackRanges = {
  negative: [20, 31],
  neutral: [0, 3],
  positive: [-1, -1],
  combined: [0, 31],
};

// function formatIVRangeSet(values: IVRangeNatureSet): string 
console.log(formatIVRangeSet(attackRanges)); // "20+ / 3- / x"