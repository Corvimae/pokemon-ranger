import { CartesianProduct } from 'js-combinatorics/umd/combinatorics';
import { Tracker } from '../reducers/route/types';
import { calculateGen1Stat, calculateHP, calculateStat, NATURE_MODIFIERS } from './calculations';
import { Stat, STATS } from './constants';
import { CombinedIVResult, ConfirmedNature, Generation, NatureType, StatRange } from './rangeTypes';
import { range, rangesOverlap } from './utils';

export const HIDDEN_POWER_TYPES = [
  'Fighting',
  'Flying',
  'Poison',
  'Ground',
  'Rock',
  'Bug',
  'Ghost',
  'Steel',
  'Fire',
  'Water',
  'Grass',
  'Electric',
  'Psychic',
  'Ice',
  'Dragon',
  'Dark',
] as const;

export type HiddenPowerType = typeof HIDDEN_POWER_TYPES[number];

export interface IVRangeSet {
  negative: [number, number],
  neutral: [number, number],
  positive: [number, number],
  combined: [number, number],
}

export interface StatValuePossibilitySet {
  possible: number[];
  valid: number[];
}

function calculateStatOrHP(stat: Stat, level: number, baseStat: number, iv: number, ev: number, modifier: number, generation: Generation): number {
  if (stat === 'hp') return calculateHP(level, baseStat, iv, ev, generation);
  if (generation <= 2) return calculateGen1Stat(level, baseStat, iv, ev);

  return calculateStat(level, baseStat, iv, ev, modifier);
}

export function calculatePossibleStatValues(
  stat: Stat,
  level: number,
  baseStat: number,
  minIV: number,
  maxIV: number,
  ev: number,
  possibleModifiers: number[],
  generation: Generation,
): StatValuePossibilitySet {
  const possibleValues = range(0, 31).flatMap(iv => (
    possibleModifiers.map(modifier => calculateStatOrHP(stat, level, baseStat, iv, ev, modifier, generation))
  ));

  const validValues = range(minIV, maxIV).flatMap(iv => (
    possibleModifiers.map(modifier => calculateStatOrHP(stat, level, baseStat, iv, ev, modifier, generation))
  ));

  return {
    possible: [...new Set(possibleValues)],
    valid: [...new Set(validValues)],
  };
}

export function calculatePossibleStats(
  stat: Stat,
  level: number,
  ivRanges: Record<Stat, IVRangeSet>,
  [confirmedNegative, confirmedPositive]: ConfirmedNature,
  tracker: Tracker,
  evolution: number | undefined = undefined,
): StatValuePossibilitySet {
  let relevantModifiers = stat === 'hp' ? [NATURE_MODIFIERS[1]] : NATURE_MODIFIERS;

  if (confirmedNegative !== null && confirmedNegative !== stat) {
    relevantModifiers = relevantModifiers.filter(({ key }) => key !== 'negative');
  }

  if (confirmedPositive !== null && confirmedPositive !== stat) {
    relevantModifiers = relevantModifiers.filter(({ key }) => key !== 'positive');
  }

  return relevantModifiers.reduce<StatValuePossibilitySet>((combinedSet, { key, modifier }) => {
    const values = ivRanges[stat][key];

    if (values[0] === -1) return combinedSet;

    const calculatedValues = calculatePossibleStatValues(
      stat,
      level,
      tracker.baseStats[evolution ?? tracker.evolution][stat],
      values[0],
      values[1],
      tracker.evSegments[tracker.startingLevel]?.[level]?.[stat] ?? 0,
      [modifier],
      tracker.generation,
    );

    return {
      possible: [...combinedSet.possible, ...calculatedValues.possible],
      valid: [...combinedSet.valid, ...calculatedValues.valid],
    };
  }, { possible: [], valid: [] } as StatValuePossibilitySet);
}

export function calculatePossibleIVRange(stat: Stat, tracker: Tracker): IVRangeSet {
  const { negative, neutral, positive } = NATURE_MODIFIERS.reduce((modifierSet, { modifier, key }) => ({
    ...modifierSet,
    [key]: Object.entries(tracker.recordedStats).reduce((acc, [rawEvo, statSegments]) => {
      const evo = Number(rawEvo);
      
      const baseStat = tracker.baseStats[evo][stat];
      
      return Object.entries(statSegments).reduce(([min, max], [rawLevel, statLine]) => {
        const level = Number(rawLevel);
        
        if (!Number.isFinite(min) || !Number.isFinite(max) || min === -1) return [-1, -1];
        if (!statLine?.[stat]) return [min, max];

        const matchingStats = range(min, max).filter(possibleIV => calculateStatOrHP(
          stat,
          level,
          baseStat,
          possibleIV,
          tracker.evSegments[tracker.startingLevel]?.[level]?.[stat] ?? 0,
          modifier,
          tracker.generation,
        ) === statLine[stat]);

        if (matchingStats.length === 0) return [-1, -1];

        const minMatchingStat = Math.min(...matchingStats);
        const maxMatchingStat = Math.max(...matchingStats);

        return [Math.max(min, minMatchingStat), Math.min(max, maxMatchingStat)];
      }, acc);
    }, [0, 31]),
  }), {} as { negative: [number, number], neutral: [number, number], positive: [number, number]});

  return {
    positive,
    negative,
    neutral,
    combined: [
      Math.min(...[positive[0], negative[0], neutral[0]].filter(value => value !== -1)),
      Math.max(...[positive[1], negative[1], neutral[1]].filter(value => value !== -1)),
    ],
  };
}

export function calculateAllPossibleIVRanges(tracker: Tracker): Record<Stat, IVRangeSet> {
  const preliminaryResults = STATS.reduce((acc, stat) => ({
    ...acc,
    [stat]: calculatePossibleIVRange(stat, tracker),
  }), {} as Record<Stat, IVRangeSet>);

  const [confirmedNegative, confirmedPositive] = tracker.generation <= 2 ? ['attack', 'attack'] : calculatePossibleNature(preliminaryResults);
  
  return Object.entries(preliminaryResults).reduce((acc, [stat, ivRanges]) => {
    const relevantRanges = [
      confirmedPositive !== null && (confirmedPositive !== stat || confirmedNegative === stat) ? undefined : ivRanges.positive,
      (confirmedPositive === stat || confirmedNegative === stat) && !(confirmedPositive === stat && confirmedNegative === stat) ? undefined : ivRanges.neutral,
      confirmedNegative !== null && (confirmedNegative !== stat || confirmedPositive === stat) ? undefined : ivRanges.negative,
    ].filter(value => value !== undefined) as [number, number][];

    return {
      ...acc,
      [stat]: {
        ...ivRanges,
        combined: [
          Math.min(...relevantRanges.map(value => value[0]).filter(value => value !== -1)),
          Math.max(...relevantRanges.map(value => value[1]).filter(value => value !== -1)),
        ],
      },
    };
  }, {} as Record<Stat, IVRangeSet>);
}

export function calculatePossibleNature(ivRanges: Record<Stat, IVRangeSet>): ConfirmedNature {
  const confirmedNegative = Object.entries(ivRanges).find(([stat, value]) => stat !== 'hp' && value.positive[0] === -1 && value.neutral[0] === -1);
  const confirmedPositive = Object.entries(ivRanges).find(([stat, value]) => stat !== 'hp' && value.negative[0] === -1 && value.neutral[0] === -1);

  const possibleNegatives = Object.entries(ivRanges).filter(([stat, value]) => stat !== 'hp' && value.negative[0] !== -1);
  const possiblePositives = Object.entries(ivRanges).filter(([stat, value]) => stat !== 'hp' && value.positive[0] !== -1);

  const negativeByExclusion = confirmedPositive && possibleNegatives.length === 1 ? (possibleNegatives[0][0] as Stat) : null;
  const positiveByExclusion = confirmedNegative && possiblePositives.length === 1 ? (possiblePositives[0][0] as Stat) : null;

  return [
    confirmedNegative ? confirmedNegative[0] as Stat : negativeByExclusion,
    confirmedPositive ? confirmedPositive[0] as Stat : positiveByExclusion,
  ];
}

export function filterByPossibleNatureAdjustmentsForStat<T>(
  rangeSet: IVRangeSet,
  stat: Stat,
  confirmedNature: ConfirmedNature,
  values: [T, T, T],
): T[] {
  const [negative, neutral, positive] = getPossibleNatureAdjustmentsForStat(rangeSet, stat, confirmedNature);
  
  return [
    negative ? values[0] : undefined,
    neutral ? values[1] : undefined,
    positive ? values[2] : undefined,
  ].filter(value => value !== undefined) as T[];
}

export function getPossibleNatureAdjustmentsForStat(
  rangeSet: IVRangeSet,
  stat: Stat,
  [confirmedNegative, confirmedPositive]: ConfirmedNature,
): [boolean, boolean, boolean] {
  if (confirmedPositive === stat) return [false, false, true];
  if (confirmedNegative === stat) return [true, false, false];
  if (confirmedPositive === null && rangeSet.negative[0] === -1 && (confirmedNegative !== null || rangeSet.positive[0] !== -1)) return [false, true, true];
  if (confirmedNegative === null && rangeSet.negative[0] !== -1 && (confirmedPositive !== null || rangeSet.positive[0] === -1)) return [true, true, false];
  if (confirmedNegative === null && confirmedPositive === null && rangeSet.negative[0] !== -1 && rangeSet.positive[0] !== -1) return [true, true, true];

  return [false, true, false];
}

export function isIVWithinValues(calculatedValue: StatRange, ivRange: [number, number]): boolean {
  if (!calculatedValue) return false;

  return rangesOverlap([calculatedValue.from, calculatedValue.to], ivRange);
}

export function isIVWithinRange(
  damageResult: CombinedIVResult,
  [confirmedNegative, confirmedPositive]: ConfirmedNature,
  stat: Stat,
  ivRanges: IVRangeSet,
): boolean {
  if (confirmedNegative === stat) {
    return isIVWithinValues(damageResult.negative, ivRanges.negative);
  }
  
  if (confirmedPositive === stat) {
    return isIVWithinValues(damageResult.positive, ivRanges.positive);
  }

  const [negative, neutral, positive] = getPossibleNatureAdjustmentsForStat(ivRanges, stat, [confirmedNegative, confirmedPositive]);

  return Object.entries({
    negative,
    neutral,
    positive,
  }).filter(([, value]) => value).some(([key]) => isIVWithinValues(damageResult[key as NatureType], ivRanges[key as NatureType]));
}

function getIVValuesInSection([start, end]: [number, number]): number[] {
  if (start === -1 || end === -1) return [];

  return range(start, end);
}

function getUniqueIVValuesInRangeSet(ivRange: IVRangeSet, stat: Stat, [negativeNature, positiveNature]: ConfirmedNature): number[] {
  if (negativeNature === stat) return getIVValuesInSection(ivRange.negative);
  if (positiveNature === stat) return getIVValuesInSection(ivRange.positive);

  return [...new Set([
    ...(negativeNature === null ? getIVValuesInSection(ivRange.negative) : []),
    ...getIVValuesInSection(ivRange.neutral),
    ...(positiveNature === null ? getIVValuesInSection(ivRange.positive) : []),
  ])];
}

function calculateOddnessProbababilityOfStat(ivRange: IVRangeSet, stat: Stat, confirmedNature: ConfirmedNature, odd: boolean): number {
  const values = getUniqueIVValuesInRangeSet(ivRange, stat, confirmedNature);
  
  if (values.length === 0) return 0;

  return values.filter(x => x % 2 === (odd ? 1 : 0)).length / values.length;
}

type StatLSBSet = [boolean, boolean, boolean, boolean, boolean, boolean];

function calculateHiddenPowerProbability(
  ivs: Record<Stat, IVRangeSet>,
  confirmedNature: ConfirmedNature,
  hpOdd: boolean,
  attackOdd: boolean,
  defenseOdd: boolean,
  spAttackOdd: boolean,
  spDefenseOdd: boolean,
  speedOdd: boolean,
): number {
  return calculateOddnessProbababilityOfStat(ivs.hp, 'hp', confirmedNature, hpOdd)
    * calculateOddnessProbababilityOfStat(ivs.attack, 'attack', confirmedNature, attackOdd)
    * calculateOddnessProbababilityOfStat(ivs.defense, 'defense', confirmedNature, defenseOdd)
    * calculateOddnessProbababilityOfStat(ivs.spAttack, 'spAttack', confirmedNature, spAttackOdd)
    * calculateOddnessProbababilityOfStat(ivs.spDefense, 'spDefense', confirmedNature, spDefenseOdd)
    * calculateOddnessProbababilityOfStat(ivs.speed, 'speed', confirmedNature, speedOdd);
}

export function calculateHiddenPowerType(
  ivs: Record<Stat, IVRangeSet>,
  confirmedNature: ConfirmedNature,
): HiddenPowerType | null {
  const probabilities = ([...new CartesianProduct(
    [false, true],
    [false, true],
    [false, true],
    [false, true],
    [false, true],
    [false, true],
  )] as StatLSBSet[]).map(combination => ({
    combination,
    probability: calculateHiddenPowerProbability(ivs, confirmedNature, ...combination),
  }));

  const mostProbableCombination = probabilities.reduce<{ probability: number; combination: StatLSBSet | null }>((acc, value) => (
    value.probability > acc.probability ? value : acc
  ), { probability: 0, combination: null });

  if (mostProbableCombination.combination === null) return null;

  const [hp, atk, def, spAtk, spDef, speed] = mostProbableCombination.combination.map(value => value ? 1 : 0);

  return HIDDEN_POWER_TYPES[Math.floor(((hp + atk * 2 + def * 4 + speed * 8 + spAtk * 16 + spDef * 32) * 15) / 63)];
}
