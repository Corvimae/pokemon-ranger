import minBy from 'lodash/minBy';
import levenshtein from 'js-levenshtein';
import { Stat, STATS } from '../utils/constants';
import { formatStatName } from '../utils/rangeFormat';
import { range } from '../utils/utils';
import { Terms } from './conditional-grammar';
import { calculatePossibleStats, filterByPossibleNatureAdjustmentsForStat, IVRangeSet } from '../utils/trackerCalculations';
import { ConfirmedNature } from '../utils/rangeTypes';
import { Tracker } from '../reducers/route/types';

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

function isIVRange(possibleIVRange: Terms.Range): possibleIVRange is Terms.IVRange {
  return typeof possibleIVRange === 'object' && 'negative' in possibleIVRange;
}

function isIVStat(stat: ConditionalStat): stat is Stat {
  return STATS.indexOf(stat as Stat) !== -1;
}

function calculateInverseRangeSegment(segment: Terms.IVRangeSegment): Terms.IVRangeSegment {
  if (segment === '#') return 'x';
  if (segment === 'x' || segment === 'X') return '#';
  if (typeof segment === 'number') {
    if (segment === 0) {
      return {
        type: 'unboundedRange',
        value: 1,
        operator: '+',
      };
    }

    if (segment === 31) {
      return {
        type: 'unboundedRange',
        value: 30,
        operator: '-',
      };
    }

    throw new Error('Cannot invert a single IV value unless it is 0 or 31.');
  }
  
  switch (segment.type) {
    case 'boundedRange':
      throw new Error('Cannot invert a bounded range.');

    case 'unboundedRange':
      if (segment.operator === '+' && segment.value === 0) return 'x';
      if (segment.operator === '-' && segment.value === 31) return 'x';
      
      return {
        type: 'unboundedRange',
        value: segment.operator === '+' ? segment.value - 1 : segment.value + 1,
        operator: segment.operator === '+' ? '-' : '+',
      };

    default:
      throw new Error('Unexpected range type.');
  }
}

function calculatePossiblyInvertedIVRangeSegments(rangeTerm: Terms.IVRange): [Terms.IVRangeSegment, Terms.IVRangeSegment, Terms.IVRangeSegment] {
  if (rangeTerm.inverse) {
    return [
      calculateInverseRangeSegment(rangeTerm.negative),
      calculateInverseRangeSegment(rangeTerm.neutral),
      calculateInverseRangeSegment(rangeTerm.positive),
    ];
  }

  return [rangeTerm.negative, rangeTerm.neutral, rangeTerm.positive];
}

function getMatchingStat(stat: string): ConditionalStat {
  const lowerCaseStat = stat.toLowerCase();

  const match = Object.entries(VALID_STATS).find(([, value]) => value.indexOf(lowerCaseStat) !== -1);

  if (!match) {
    const distances = Object.values(VALID_STATS).flatMap(value => value.map(key => [key, levenshtein(stat ?? '', key)])) as [string, number][];
    const [closestMatch] = minBy(distances, ([, distance]) => distance) ?? [0, '<unknown>'];
    
    throw new Error(`${stat} is not a valid stat; did you mean ${closestMatch}?`);
  }

  return match[0] as ConditionalStat;
}

function formatConditionalStatName(stat: ConditionalStat): string {
  if (isIVStat(stat)) return formatStatName(stat);

  if (stat === 'startingLevel') return 'Starting level';

  return '<unknown stat>';
}

function calculatePossibleStatsAtLevel(
  stat: ConditionalStat,
  level: number,
  ivRanges: Record<Stat, IVRangeSet>,
  confirmedNatures: ConfirmedNature,
  tracker: Tracker,
  evolution: number,
): number[] {
  if (isIVStat(stat)) {
    const { valid } = calculatePossibleStats(stat, level, ivRanges, confirmedNatures, tracker, evolution);
    
    return valid;
  }

  if (stat === 'startingLevel') {
    return [tracker.startingLevel];
  }

  throw new Error(`Stat is not handled by calculatePossibleStatAtLevel: ${stat}`);
}

function evaluateIVExpression(
  stat: string,
  expression: Terms.IVRange,
  ivRanges: Record<Stat, IVRangeSet>,
  confirmedNatures: ConfirmedNature,
): boolean {
  const matchingStat = getMatchingStat(stat);

  if (!isIVStat(matchingStat)) {
    throw new Error(`Compact IV range is not valid for comparisons against ${stat}`);
  }

  const [negative, neutral, positive] = calculatePossiblyInvertedIVRangeSegments(expression);

  const matchingConditions = filterByPossibleNatureAdjustmentsForStat(ivRanges[matchingStat], matchingStat, confirmedNatures, [
    [negative, ivRanges[matchingStat].negative],
    [neutral, ivRanges[matchingStat].neutral],
    [positive, ivRanges[matchingStat].positive],
  ]) as [Terms.IVRangeSegment, [number, number]][];

  return matchingConditions.some(([subCondition, [min, max]]) => {
    if (subCondition === 'x' || subCondition === 'X') return false;
    if (subCondition === '#') return min !== -1;
  
    return evaluateRange(range(min, max), subCondition);
  });
}

function evaluateRange(possibleValues: number[], expression: Terms.RangeSegment) {
  if (typeof expression === 'number') {
    return possibleValues.indexOf(expression) !== -1;
  }

  switch (expression.type) {
    case 'boundedRange':
      return range(expression.from, expression.to).some(value => possibleValues.indexOf(value) !== -1);

    case 'unboundedRange':
      if (expression.operator === '-') {
        return range(0, expression.value).some(value => possibleValues.indexOf(value) !== -1);
      }
      
      return range(expression.value, 31).some(value => possibleValues.indexOf(value) !== -1);

    default:
      throw new Error('Unknown expression type is not handled by evaluateStatExpression.');
  }
}

function evaluateStatExpression(
  stat: string,
  expression: Terms.RangeSegment,
  level: number,
  ivRanges: Record<Stat, IVRangeSet>,
  confirmedNatures: ConfirmedNature,
  tracker: Tracker,
  evolution: number,
): boolean {
  const matchingStat = getMatchingStat(stat);
  const possibleValues = calculatePossibleStatsAtLevel(matchingStat, level, ivRanges, confirmedNatures, tracker, evolution);

  return evaluateRange(possibleValues, expression);
}

export function evaluateCondition(
  term: Terms.Expression,
  level: number,
  ivRanges: Record<Stat, IVRangeSet>,
  confirmedNatures: ConfirmedNature,
  tracker: Tracker,
  evolution: number,
): boolean {
  switch (term.type) {
    case 'statExpression': {
      const { stat, expression } = term;
      if (isIVRange(expression)) {
        return evaluateIVExpression(stat, expression, ivRanges, confirmedNatures);
      }

      return evaluateStatExpression(stat, expression, level, ivRanges, confirmedNatures, tracker, evolution);
    }
    
    case 'logicalExpression': {
      const left = evaluateCondition(term.left, level, ivRanges, confirmedNatures, tracker, evolution);
      const right = evaluateCondition(term.right, level, ivRanges, confirmedNatures, tracker, evolution);

      if (term.operator === '&&') {
        return left && right;
      }

      return left || right;
    }

    default:
      return false;
  }
}

export function formatRangeSegment(rangeSegment: Terms.IVRangeSegment): string {
  if (typeof rangeSegment === 'string') return rangeSegment;
  if (typeof rangeSegment === 'number') return `${rangeSegment}`;

  switch (rangeSegment.type) {
    case 'boundedRange':
      return `${rangeSegment.from}–${rangeSegment.to}`;

    case 'unboundedRange':
      return `${rangeSegment.value}${rangeSegment.operator}`;

    default:
      return '???';
  }
}

export function formatCondition(expression: Terms.Expression): string {
  switch (expression.type) {
    case 'statExpression': {
      const statName = formatConditionalStatName(getMatchingStat(expression.stat));
      
      if (isIVRange(expression.expression)) {
        const formattedSegments = calculatePossiblyInvertedIVRangeSegments(expression.expression)
          .map(formatRangeSegment)
          .join(' / ');

        return `${statName} is (${formattedSegments})`;
      }

      return `${statName} is ${formatRangeSegment(expression.expression)}`;
    }

    case 'logicalExpression': {
      const conjunction = expression.operator === '&&' ? 'AND' : 'OR';

      return `(${formatCondition(expression.left)} ${conjunction} ${formatCondition(expression.right)})`;
    }

    default:
      return '<invalid condition>';
  }
}
