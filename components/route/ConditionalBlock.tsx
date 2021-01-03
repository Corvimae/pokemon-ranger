import React, { useMemo } from 'react';
import styled from 'styled-components';
import minBy from 'lodash/minBy';
import levenshtein from 'js-levenshtein';
import { Stat, STATS } from '../../utils/constants';
import { ErrorCard } from './ErrorCard';
import { RouteContext } from '../../reducers/route/reducer';
import { calculateAllPossibleIVRanges, calculatePossibleNature, calculatePossibleStats, filterByPossibleNatureAdjustmentsForStat, IVRangeSet } from '../../utils/trackerCalculations';
import { Tracker } from '../../reducers/route/types';
import { ConfirmedNature } from '../../utils/rangeTypes';
import { Card, CardVariant } from '../Layout';
import { formatStatName } from '../../utils/rangeFormat';
import { range } from '../../utils/utils';

const STAT_CONDITION = /^([1-9][0-9]*)\s*(?:(?:\s*[–\-—]\s*([1-9][0-9]*))|([+-]))?$/;
const COMPACT_IV_CONDITION = /^\(?\s*(?:([#xX]|[0-9]+\s*[+–\-—]?(?:\s*[1-9][0-9]*)?)\s*\/\s*)([#xX]|[0-9]+\s*[+–\-—]?(?:\s*[1-9][0-9]*)?)\s*\/\s*([#xX]|[0-9]+\s*[+–\-—]?(?:\s*[1-9][0-9]*)?)\)?$/;

const RANGE_SYMBOLS = ['x', 'X', '#'] as const;

type RangeSymbol = typeof RANGE_SYMBOLS[number];

type ConditionalStat = Stat | 'startingLevel';

const VALID_STATS: Record<ConditionalStat, string[]> = {
  startingLevel: ['startinglevel', 'caughtlevel'],
  hp: ['hp', 'health'],
  attack: ['atk', 'attack'],
  defense: ['def', 'defense'],
  spAttack: ['spa', 'spatk', 'spattack', 'specialattack'],
  spDefense: ['spd', 'spdef', 'spdefense', 'specialdefense'],
  speed: ['spe', 'speed'],
};

function isIVStat(stat: ConditionalStat): stat is Stat {
  return STATS.indexOf(stat as Stat) !== -1;
}

function getMatchingStat(stat: string): ConditionalStat | undefined {
  const lowerCaseStat = stat.toLowerCase();

  const match = Object.entries(VALID_STATS).find(([, value]) => value.indexOf(lowerCaseStat) !== -1);

  return match ? match[0] as ConditionalStat : undefined;
}

function formatConditionalStatName(stat: ConditionalStat): string {
  if (isIVStat(stat)) return formatStatName(stat);

  if (stat === 'startingLevel') return 'Starting level';

  return '<unknown stat>';
}

interface RangeCondition {
  from: number | RangeSymbol;
  to: number | undefined;
  modifier: '+' | '-' | undefined;
}

function parseRangeCondition(rangeCondition: string): RangeCondition | null {
  const trimmedCondition = rangeCondition.trim();
  const statMatch = STAT_CONDITION.exec(trimmedCondition);

  if (trimmedCondition.toLowerCase() === 'x' || trimmedCondition === '#') {
    return {
      from: trimmedCondition as RangeSymbol,
      to: undefined,
      modifier: undefined,
    };
  }

  if (!statMatch) return null;

  const [, from, to, modifier] = statMatch;

  if (modifier !== undefined && modifier !== '+' && modifier !== '-') return null;

  return {
    from: Number(from),
    to: Number(to),
    modifier,
  };
}

function parseCompactIVs(condition: string): [RangeCondition, RangeCondition, RangeCondition] | null {
  const compactMatch = COMPACT_IV_CONDITION.exec(condition.trim());

  if (!compactMatch) return null;

  const [, negativeCondition, neutralCondition, positiveCondition] = compactMatch;

  return [negativeCondition, neutralCondition, positiveCondition].map(parseRangeCondition) as [RangeCondition, RangeCondition, RangeCondition];
}

function evaluateRangeCondition({ from, to, modifier }: RangeCondition, value: number): boolean {
  if (from === 'x' || from === 'X') return false;
  if (from === '#') return value !== -1;

  if (modifier) {
    if (modifier === '+') {
      return value >= from;
    }

    if (modifier === '-') {
      return value <= from;
    }
  }

  if (to) return value >= from && value <= to;

  return value === from;
}

function parseCondition(
  condition: string,
  stat: ConditionalStat,
  rawLevel: string | unknown,
  ivRanges: Record<Stat, IVRangeSet>,
  confirmedNatures: ConfirmedNature,
  tracker: Tracker,
  rawEvolution: string | unknown = '0',
): { error: false; result: boolean; } | { error: true; message: string; } {
  const level = Number(rawLevel);
  const evolution = Number(rawEvolution);

  const compactMatch = parseCompactIVs(condition);

  if (compactMatch) {
    if (!isIVStat(stat)) {
      return {
        error: true,
        message: `Compact IV range is not valid for comparisons against ${stat}`,
      };
    }

    const [negativeCondition, neutralCondition, positiveCondition] = compactMatch;

    const matchingConditions = filterByPossibleNatureAdjustmentsForStat(ivRanges[stat], stat, confirmedNatures, [
      [negativeCondition, ivRanges[stat].negative],
      [neutralCondition, ivRanges[stat].neutral],
      [positiveCondition, ivRanges[stat].positive],
    ]) as [RangeCondition, [number, number]][];

    return {
      error: false,
      result: matchingConditions.some(([subCondition, [min, max]]) => (
        range(min, max).some(iv => evaluateRangeCondition(subCondition, iv))
      )),
    };
  }
 
  if (isIVStat(stat)) {
    if (!rawLevel) {
      return {
        error: true,
        message: 'Level attribute must be specified when using a stat condition.',
      };
    }

    if (Number.isNaN(level) || level < 1 || level > 100) {
      return {
        error: true,
        message: `${rawLevel} is not a valid level.`,
      };
    }
  }

  const statMatch = parseRangeCondition(condition);

  if (statMatch) {
    if (isIVStat(stat)) {
      const { valid } = calculatePossibleStats(stat, level, ivRanges, confirmedNatures, tracker, evolution);
      
      return {
        error: false,
        result: valid.some(value => evaluateRangeCondition(statMatch, value)),
      };
    }

    if (stat === 'startingLevel') {
      return {
        error: false,
        result: evaluateRangeCondition(statMatch, tracker.startingLevel),
      };
    }
  }

  return {
    error: true,
    message: `${condition} is not a valid condition statement.`,
  };
}

interface ConditionalBlockProps {
  source?: string;
  stat?: string;
  condition?: string;
  level?: string;
  evolution?: string;
  theme?: string;
}

export const ConditionalBlock: React.FC<ConditionalBlockProps> = ({
  source,
  stat,
  condition,
  level,
  evolution,
  theme = 'default',
  children,
}) => {
  const state = RouteContext.useState();

  const ivRanges = useMemo(() => (
    source && state.trackers[source] && calculateAllPossibleIVRanges(state.trackers[source])
  ), [state.trackers, source]);
  const confirmedNatures = useMemo(() => ivRanges && calculatePossibleNature(ivRanges), [ivRanges]);

  if (!stat) return <ErrorCard>The stat attribute must be specified.</ErrorCard>;
  if (!source) return <ErrorCard>The source attribute must be specified.</ErrorCard>;
  if (!condition) return <ErrorCard>The condition attribute must be specified.</ErrorCard>;
  if (!ivRanges || !confirmedNatures) return <ErrorCard>No IV table with the name {source} exists.</ErrorCard>;

  const matchingStat = getMatchingStat(stat);

  if (!matchingStat) {
    const distances = Object.values(VALID_STATS).flatMap(value => value.map(key => [key, levenshtein(stat ?? '', key)])) as [string, number][];
    const [closestMatch] = minBy(distances, ([, distance]) => distance) ?? [0, '<unknown>'];
    
    return <ErrorCard>{stat} is not a valid stat; did you mean {closestMatch}?</ErrorCard>;
  }

  const result = parseCondition(condition, matchingStat, level, ivRanges, confirmedNatures, state.trackers[source], evolution);

  if (result.error) return <ErrorCard>{result.message}</ErrorCard>;

  return result.result ? (
    <ConditionalCard variant={theme as CardVariant}>
      <Condition>
        Condition met:
        <b> {formatConditionalStatName(matchingStat)} is {condition}{level && ` at Lv. ${level}`}</b>
      </Condition>
      {children}
    </ConditionalCard>
  ) : null;
};

const Condition = styled.div`
  width: 100%;
  text-align: right;
  font-size: 0.875rem;
`;

const ConditionalCard = styled(Card)`
  padding-top: 0.25rem;

  & > ${Condition} + p {
    margin-top: 0.5rem;
  }
`;
