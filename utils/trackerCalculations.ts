import { Tracker } from '../reducers/route/types';
import { calculateHP, calculateStat, NATURE_MODIFIERS } from './calculations';
import { Stat, STATS } from './constants';
import { CombinedIVResult, ConfirmedNature, NatureModifier, NatureType, StatRange } from './rangeTypes';
import { range } from './utils';

export interface IVRangeSet {
  negative: [number, number],
  neutral: [number, number],
  positive: [number, number],
  combined: [number, number],
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

        const matchingStats = range(min, max).filter(possibleIV => (
          (stat === 'hp' ? calculateHP : calculateStat)(
            level,
            baseStat,
            possibleIV,
            tracker.evSegments[tracker.startingLevel]?.[level]?.[stat] ?? 0,
            modifier,
          ) === statLine[stat]
        ));

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

  const [confirmedNegative, confirmedPositive] = calculatePossibleNature(preliminaryResults);
  
  return Object.entries(preliminaryResults).reduce((acc, [stat, ivRanges]) => {
    const relevantRanges = [
      confirmedPositive !== null && (confirmedPositive !== stat || confirmedNegative === stat) ? undefined : ivRanges.positive,
      confirmedPositive === stat || confirmedNegative === stat ? undefined : ivRanges.neutral,
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
  const negative = Object.entries(ivRanges).find(([, value]) => value.positive[0] === -1 && value.neutral[0] === -1);
  const positive = Object.entries(ivRanges).find(([, value]) => value.negative[0] === -1 && value.neutral[0] === -1);

  return [
    negative ? negative[0] as Stat : null,
    positive ? positive[0] as Stat : null,
  ];
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

  return Math.max(calculatedValue.from, ivRange[0]) <= Math.min(calculatedValue.to, ivRange[1]);
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
