import React, { useMemo } from 'react';
import styled from 'styled-components';
import { parse, Terms } from '../../directives/calc-grammar';
import { evaluateCalculation } from '../../directives/evaluateCalculation';
import { castRouteVariableAsType } from '../../directives/evaluateCondition';
import { RouteContext } from '../../reducers/route/reducer';
import { calculateAllPossibleIVRanges, calculatePossibleNature } from '../../utils/trackerCalculations';
import { ErrorableResult, evaluateAsThrowableOptional } from '../../utils/utils';
import { ErrorCard } from './ErrorCard';
import { COLORS, InfoColor } from './InlineInfo';

function formatValueSet(values: number[], format: string): number | string {
  if (values.some(Number.isNaN)) return '(Unable to calculate: invalid value)';

  if (values.length === 0) return 'N/A';

  const [allValuesEqual] = values.reduce(([status, previous], value) => [status && previous === value, value], [true, values[0]]);

  switch (format) {
    case 'min':
      return Math.min(...values);

    case 'max':
      return Math.max(...values);

    case 'range':
      if (values.length === 1 || allValuesEqual) return values[0];

      return `${Math.min(...values)} - ${Math.max(...values)}`;

    case 'list':
      return values.reduce((acc, value) => acc.indexOf(value) === -1 ? [...acc, value] : acc, [] as number[]).join(', ');
      
    default:
      return `Invalid formatter ${format}.`;
  }
}

interface CalculationDirectiveProps {
  contents?: string;
  source?: string;
  color?: InfoColor;
  level?: string;
  evolution?: string;
  format?: string;
}

export const CalculationDirective: React.FC<CalculationDirectiveProps> = ({ color = 'black', source, level, evolution, format = 'range', contents }) => {
  const state = RouteContext.useState();
  const tracker = source ? state.trackers[source] : null;

  const ivRanges = useMemo(() => (
    tracker && calculateAllPossibleIVRanges(tracker)
  ), [tracker]);
  
  const confirmedNatures = useMemo(() => tracker && ivRanges && calculatePossibleNature(ivRanges, tracker), [ivRanges, tracker]);
  
  const variableValues = useMemo(() => (
    Object.entries(state.variables).reduce((acc, [key, { type, value }]) => ({
      ...acc,
      [key]: castRouteVariableAsType(type, value),
    }), {})
  ), [state.variables]);

  const parsedExpression: ErrorableResult<Terms.Expression> | null = useMemo(() => {
    if (!contents) return null;

    const expression = (contents ?? '').split('\n').map(line => line.trim()).filter(line => line.length > 0).join('');

    return evaluateAsThrowableOptional<Terms.Expression>(() => parse(expression));
  }, [contents]);

  const calculatedValueSet: ErrorableResult<number[]> | null = useMemo(() => {
    if (!parsedExpression || parsedExpression.error) return null;
    
    return evaluateAsThrowableOptional<number[]>(() => (
      evaluateCalculation(
        parsedExpression.value,
        level,
        ivRanges,
        confirmedNatures,
        tracker,
        source,
        Number(evolution ?? 0),
        variableValues,
      )
    ));
  }, [parsedExpression, ivRanges, level, evolution, variableValues, confirmedNatures, tracker, source]);

  if (!parsedExpression) return <ErrorCard>Calculation directives must have an expression.</ErrorCard>;
  if (parsedExpression.error) return <ErrorCard>{parsedExpression.message}</ErrorCard>;
  
  if (!calculatedValueSet) return <ErrorCard>Calculation directive could not run (the previous error should appear, not this).</ErrorCard>;
  if (calculatedValueSet.error) return <ErrorCard>{calculatedValueSet.message}</ErrorCard>;

  return (
    <Container color={color}>calc: {formatValueSet(calculatedValueSet.value, format)}</Container>
  );
};

const Container = styled.span<{ color: InfoColor }>`
  margin-left: 1rem;
  color: ${props => COLORS[props.color]};

  p > &:only-child {
    margin-left: 0;
  }

  h3 > &,
  h4 > & {
    font-weight: 400;
    font-size: 1rem;
  }
`;
