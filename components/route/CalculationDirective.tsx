import React, { useMemo } from 'react';
import styled from 'styled-components';
import { parse, Terms } from '../../directives/calc-grammar';
import { evaluateCalculation } from '../../directives/evaluateCalculation';
import { useCalculationSet } from '../../utils/trackerCalculations';
import { ErrorableResult, evaluateAsThrowableOptional } from '../../utils/utils';
import { DebugText } from './DebugText';
import { ErrorCard } from './ErrorCard';

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
  color?: string;
  level?: string;
  evolution?: string;
  format?: string;
}

export const CalculationDirective: React.FC<CalculationDirectiveProps> = ({ color = 'black', source, level, evolution, format = 'range', contents }) => {
  const calculationSet = useCalculationSet(source);

  const parsedExpression: ErrorableResult<Terms.Expression> | null = useMemo(() => {
    if (!contents) return null;

    const expression = (contents ?? '').split('\n').map(line => line.trim()).filter(line => line.length > 0).join('');

    return evaluateAsThrowableOptional<Terms.Expression>(() => parse(expression));
  }, [contents]);

  const calculatedValueSet: ErrorableResult<number[]> | null = useMemo(() => {
    if (!parsedExpression || parsedExpression.error || !calculationSet) return null;
    
    return evaluateAsThrowableOptional<number[]>(() => (
      evaluateCalculation(
        parsedExpression.value,
        level,
        calculationSet.ivRanges,
        calculationSet.confirmedNature,
        calculationSet.tracker,
        source,
        Number(evolution ?? 0),
        calculationSet.variables,
      )
    ));
  }, [parsedExpression, level, evolution, calculationSet, source]);

  if (!parsedExpression) return <ErrorCard>Calculation directives must have an expression.</ErrorCard>;
  if (parsedExpression.error) return <ErrorCard>{parsedExpression.message}</ErrorCard>;
  
  if (!calculatedValueSet) return <ErrorCard>Calculation directive could not run (the previous error should appear, not this).</ErrorCard>;
  if (calculatedValueSet.error) return <ErrorCard>{calculatedValueSet.message}</ErrorCard>;

  return (
    <Container color={color}>
      <DebugText title="IV Ranges" content={calculationSet?.ivRanges} />
      <DebugText title="Natures" content={calculationSet?.confirmedNature} />
      <DebugText title="Variables" content={calculationSet?.variables} />
      <DebugText title="Valueset" content={calculatedValueSet} />
      {formatValueSet(calculatedValueSet.value, format)}
    </Container>
  );
};

const Container = styled.span<{ color: string }>`
  margin-left: 1rem;
  color: ${props => props.theme.info[props.color ?? 'black']};

  p > &:only-child {
    margin-left: 0;
  }

  h3 > &,
  h4 > & {
    font-weight: 400;
    font-size: 1rem;
  }
`;
