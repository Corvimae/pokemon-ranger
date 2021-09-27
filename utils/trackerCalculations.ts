import { createContext, useContext } from 'react';
import { calculateHiddenPowerType, calculatePossibleIVRange, calculatePossibleNature, ConfirmedNature, IVRangeSet, NATURES, Stat, StatLine, STATS, TypeName, TYPE_NAMES } from 'relicalc';
import { RouteState, RouteVariableType, Tracker } from '../reducers/route/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function castRouteVariableAsType(type: RouteVariableType, value: string | undefined): any {
  if (value === undefined) return undefined;

  switch (type) {
    case 'number':
      return parseInt(value, 10);
    
    case 'boolean':
      return value === 'true';
    
    default:
      return value;
  }
}

function evolutionMappingToList<T, U>(evolutionMapping: Record<number, T>, mapFunc: (value: T) => U): U[] {
  return Object.entries(evolutionMapping)
    .sort(([evoA], [evoB]) => Number(evoA) - Number(evoB))
    .map(([_evo, list]) => mapFunc(list));
}

function calculateNatureWithOverrides(ivRanges: Record<Stat, IVRangeSet>, tracker: Tracker): ConfirmedNature {
  const staticNatureData = tracker.staticNature && NATURES[tracker.staticNature];

  return tracker.generation <= 2 ? ['attack', 'attack'] : calculatePossibleNature(ivRanges, {
    positiveNatureStat: staticNatureData?.plus ?? tracker.manualPositiveNature,
    negativeNatureStat: staticNatureData?.minus ?? tracker.manualNegativeNature,
  });
}

export function calculateAllPossibleIVRanges(tracker: Tracker): Record<Stat, IVRangeSet> {
  const preliminaryResults = STATS.reduce((acc, stat) => ({
    ...acc,
    [stat]: calculatePossibleIVRange(
      stat,
      tracker.baseStats.map(item => item[stat]),
      evolutionMappingToList(tracker.recordedStats, statsForEvo => (
        Object.entries(statsForEvo).reduce<Record<number, number>>((statAcc, [level, entry]) => entry?.[stat] ? {
          ...statAcc,
          [level]: entry[stat],
        } : statAcc, {})
      )),
      Object.entries(tracker.evSegments[tracker.startingLevel]).reduce<Record<number, number>>((evAcc, [level, entry]) => entry?.[stat] ? ({
        ...evAcc,
        [level]: entry[stat],
      }) : evAcc, {}),
      tracker.generation,
    ),
  }), {} as Record<Stat, IVRangeSet>);

  const [confirmedNegative, confirmedPositive] = calculateNatureWithOverrides(preliminaryResults, tracker);
    
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

interface TrackerCalculations {
  ivRanges: Record<Stat, IVRangeSet>;
  confirmedNature: ConfirmedNature;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variables: Record<string, any>;
  hiddenPowerType: string | null;
  tracker: Tracker;
}

export const RouteCalculationsContext = createContext<Record<string, TrackerCalculations | null>>({});

function buildTrackerCalculationSet(state: RouteState, tracker: Tracker): TrackerCalculations {
  const ivRanges = calculateAllPossibleIVRanges(tracker);
  const confirmedNature = calculateNatureWithOverrides(ivRanges, tracker);
  const variables = Object.entries(state.variables).reduce((acc, [key, { type, value }]) => ({
    ...acc,
    [key]: castRouteVariableAsType(type, value),
  }), {});
  const hiddenPowerType = calculateHiddenPowerType(ivRanges, confirmedNature);

  return {
    ivRanges,
    confirmedNature,
    variables,
    hiddenPowerType,
    tracker,
  };
}

export function buildAllTrackerCalculationSets(state: RouteState): Record<string, TrackerCalculations> {
  return Object.values(state.trackers).reduce((acc, tracker) => ({
    ...acc,
    [tracker.name]: buildTrackerCalculationSet(state, tracker),
  }), {});
}

export function useCalculationSet(source: string | undefined): TrackerCalculations | null {
  const calculationSets = useContext(RouteCalculationsContext);

  if (!source) return null;

  return calculationSets[source] ?? null;
}

export function arrayToStatLine([hp, attack, defense, spAttack, spDefense, speed]: number[]): StatLine {
  return { hp, attack, defense, spAttack, spDefense, speed };
}

export function parseStatLine(rawStats: string, onError: (invalidSegment: string) => void = console.error): StatLine {
  try {
    return arrayToStatLine(JSON.parse(rawStats));
  } catch (e) {
    onError(`Unable to parse stat line: ${rawStats}`);
    
    return arrayToStatLine([0, 0, 0, 0, 0, 0]);
  }
}

export function parseTypeDefinition(rawTypes: string, onError: (invalidSegment: string) => void = console.error): TypeName[] {
  const typeSegments = rawTypes.split('/').map(x => x.trim().toLowerCase());

  const invalidSegment = typeSegments.find(segment => TYPE_NAMES.indexOf(segment as TypeName) === -1);

  if (invalidSegment) {
    onError(invalidSegment);

    return [] as TypeName[];
  }

  return typeSegments as TypeName[];
}
