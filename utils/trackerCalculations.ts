import { createContext, useContext } from 'react';
import { range } from 'lodash';
import { calculateHiddenPowerBasePower, calculateHiddenPowerType, calculatePossibleIVRange, calculatePossibleNature, ConfirmedNature, IVRangeSet, NATURES, Stat, StatLine, STATS, TypeName, TYPE_NAMES } from 'relicalc';
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

function evolutionMappingToList<T, U>(tracker: Tracker, evolutionMapping: Record<number, T>, defaultValue: T, mapFunc: (value: T) => U): U[] {
  return range(0, tracker.baseStats.length).map<[number, T]>(index => [index, evolutionMapping[index] ?? defaultValue] ?? [index, defaultValue])
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
  const preliminaryResults = STATS.reduce((acc, stat) => {
    const evSegment = Object.entries(tracker.evSegments[tracker.startingLevel] ?? {})
      .reduce<Record<number, number>>((evAcc, [level, entry]) => entry?.[stat] ? ({
        ...evAcc,
        [level]: entry[stat],
      }) : evAcc, {});
    
    return {
      ...acc,
      [stat]: calculatePossibleIVRange(
        stat,
        tracker.baseStats.map(item => item[stat]),
        evolutionMappingToList(tracker, tracker.recordedStats, {}, statsForEvo => (
          Object.entries(statsForEvo).reduce<Record<number, number>>((statAcc, [level, entry]) => entry?.[stat] ? {
            ...statAcc,
            [level]: entry[stat],
          } : statAcc, {})
        )),
        range(1, tracker.currentLevel + 1).reduce((evAcc, level) => ({
          ...evAcc,
          [level]: (evSegment[level] ?? 0) + tracker.manualEVs[stat],
        }), {}),
        tracker.generation,
        {
          staticIV: [tracker.staticIVs[stat], tracker.directInput ? tracker.directInputIVs[stat] : -1].find(value => value !== -1) ?? undefined,
        },
      ),
    };
  }, {} as Record<Stat, IVRangeSet>);

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
  hiddenPowerBasePower: number | null;
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
  const hiddenPowerBasePower = calculateHiddenPowerBasePower(ivRanges, confirmedNature);

  return {
    ivRanges,
    confirmedNature,
    variables,
    hiddenPowerType,
    hiddenPowerBasePower,
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
