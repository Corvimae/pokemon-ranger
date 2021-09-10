import { Tracker } from '../reducers/route/types';
import { Stat } from '../utils/constants';
import { ConfirmedNature } from '../utils/rangeTypes';
import { IVRangeSet } from '../utils/trackerCalculations';
import { Terms } from './calc-grammar';
import { calculatePossibleStatsAtLevel, getMatchingStat } from './evaluateCondition';

export type EvaluatedCalculationCondition = { error: false, values: Record<number, number> } | { error: true, message: string };

function getLambdaForFunction(functionName: Terms.FunctionName): (a: number) => number {
  switch (functionName) {
    case 'ceil': return Math.ceil;
    case 'floor': return Math.floor;
    case 'round': return Math.round;
    case 'sqrt': return Math.sqrt;
    case 'log': return Math.log;
    case 'log2': return Math.log2;
    case 'log10': return Math.log10;
    case 'trunc': return Math.trunc;
    case 'sign': return Math.sign;
    case 'abs': return Math.abs;

    default:
      throw new Error(`The function ${functionName} is not supported by the calculation directive.`);
  }
}

function getLambdaForOperator(operator: Terms.Operator): (a: number, b: number) => number {
  switch (operator) {
    case '+': return (a, b) => a + b;
    case '-': return (a, b) => a - b;
    case '*': return (a, b) => a * b;
    case '/': return (a, b) => a / b;
    case '%': return (a, b) => a % b;
    case '**': return (a, b) => a ** b;
    default:
      throw new Error(`The operator ${operator} is not supported by the calculation directive.`);
  }
}

export function evaluateCalculation(
  term: Terms.Expression,
  rawLevel: string | undefined,
  ivRanges: Record<Stat, IVRangeSet> | null,
  confirmedNatures: ConfirmedNature | null,
  tracker: Tracker | null,
  source: string | undefined,
  evolution: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variables: Record<string, any>,
): number[] {
  if (typeof term === 'number') return [term];
  if (typeof term === 'string') {
    const matchingStat = getMatchingStat(term);
    const level = Number(rawLevel);

    if (!tracker || !ivRanges || !confirmedNatures) throw new Error(`No IV tracker source matches the name ${source}.`);
    if (!rawLevel && term !== 'startingLevel') {
      throw new Error('The level attribute must be specified when calculating with a stat that is not startingLevel');
    }

    if (Number.isNaN(level)) throw new Error(`${level} is not a valid level.`);

    const possibleValues = calculatePossibleStatsAtLevel(matchingStat, level, ivRanges, confirmedNatures, tracker, evolution);
  
    return possibleValues;
  }

  if (term.type === 'variable') {
    if (Object.keys(variables).indexOf(term.name) === -1) {
      throw new Error(`The variable ${term.name} is not registered.`);
    }

    const matchingVariable = variables[term.name];

    if (matchingVariable === undefined) return [0];
    
    if (typeof matchingVariable !== 'number') {
      throw new Error(`The variable ${term.name} is not a number, and thus cannot be used in calculations.`);
    }

    return [matchingVariable];
  }

  if (term.type === 'function') {
    const expressionEvaluated = evaluateCalculation(term.expression, rawLevel, ivRanges, confirmedNatures, tracker, source, evolution, variables);
    const operationLambda = getLambdaForFunction(term.name);

    return expressionEvaluated.map(operationLambda);
  }

  // Else, this is a binary operation.

  const leftEvaluated = evaluateCalculation(term.left, rawLevel, ivRanges, confirmedNatures, tracker, source, evolution, variables);
  const rightEvaluated = evaluateCalculation(term.right, rawLevel, ivRanges, confirmedNatures, tracker, source, evolution, variables);
  const operationLambda = getLambdaForOperator(term.operator);

  return leftEvaluated.reduce((leftAcc, leftValue) => (
    rightEvaluated.reduce((rightAcc, rightValue) => [...rightAcc, operationLambda(leftValue, rightValue)], leftAcc)
  ), [] as number[]);
}
