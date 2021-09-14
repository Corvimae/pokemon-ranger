import React, { useContext, useMemo } from 'react';
import styled, { ThemeContext } from 'styled-components';
import { ErrorCard } from './ErrorCard';
import { RouteContext } from '../../reducers/route/reducer';
import { useCalculationSet } from '../../utils/trackerCalculations';
import { BorderlessCard, Card, ContainerLabel, variantIsBorderless } from '../Layout';
import { parse, Terms } from '../../directives/conditional-grammar';
import { evaluateCondition, formatCondition } from '../../directives/evaluateCondition';
import { ErrorableResult, evaluateAsThrowableOptional } from '../../utils/utils';

interface ConditionalBlockProps {
  source?: string;
  condition?: string;
  level?: string;
  evolution?: string;
  theme?: string;
}

export const ConditionalBlock: React.FC<ConditionalBlockProps> = ({
  source,
  condition,
  level: rawLevel,
  evolution: rawEvolution = '0',
  theme: variant = 'borderless',
  children,
}) => {
  const themeContext = useContext(ThemeContext);
  const state = RouteContext.useState();
  const calculationSet = useCalculationSet(source);

  const parsedCondition: ErrorableResult<Terms.Expression> | null = useMemo(() => {
    if (!condition) return null;

    return evaluateAsThrowableOptional<Terms.Expression>(() => parse(condition));
  }, [condition]);

  const result = useMemo(() => {
    if (!calculationSet || !condition || !source || !parsedCondition) return null;
  
    const level = Number(rawLevel);
    const evolution = Number(rawEvolution);

    try {
      if (parsedCondition.error) {
        return {
          error: true,
          message: `${condition} is not a valid conditional statement: ${parsedCondition.message}`,
        };
      }

      return {
        error: false,
        result: evaluateCondition(
          parsedCondition.value,
          level,
          calculationSet.ivRanges,
          calculationSet.confirmedNature,
          calculationSet.tracker,
          evolution,
          calculationSet.variables,
        ),
      };
    } catch (e) {
      return {
        error: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        message: `${condition} is not a valid conditional statement: ${(e as any).message}`,
      };
    }
  }, [condition, parsedCondition, rawLevel, rawEvolution, calculationSet, source]);

  if (!source) return <ErrorCard>The source attribute must be specified.</ErrorCard>;
  if (!condition || !parsedCondition) return <ErrorCard>The condition attribute must be specified.</ErrorCard>;
  if (!calculationSet) return <ErrorCard>No IV table with the name {source} exists.</ErrorCard>;

  if (result?.error) return <ErrorCard>{result.message}</ErrorCard>;
  if (parsedCondition?.error) return <ErrorCard>{parsedCondition.error}</ErrorCard>;

  const CardComponent = variantIsBorderless(themeContext, variant) ? BorderlessConditionalCard : ConditionalCard;

  return result?.result ? (
    <CardComponent variant={variant} expandConditions={state.options.expandConditions}>
      <Condition>
        Condition met:
        <b>&nbsp;{formatCondition(parsedCondition.value)}{rawLevel && ` at Lv. ${rawLevel}`}</b>
      </Condition>
      {children}
    </CardComponent>
  ) : null;
};

const Condition = styled.div`
  display: block;
  width: 100%;
  text-align: right;
  font-size: 0.875rem;
`;

const ConditionalCard = styled(Card)<{ expandConditions: boolean }>`
  padding-top: 0.25rem;

  & > ${Condition} + p {
    margin-top: 0.5rem;
  }
`;

const BorderlessConditionalCard = styled(BorderlessCard)<{ expandConditions: boolean }>`
  position: relative;

  h4 + & ${Condition},
  ul + & ${Condition} {
    top: -0.5rem;
  }

  ${ContainerLabel} + & {
    padding-top: 1rem;

    & ${Condition} {
      margin-top: -0.5rem;
    }
  }

  & ${Condition} {
    position: ${({ expandConditions }) => !expandConditions && 'absolute'};
    width: max-content;
    top: 0;
    right: 0;
    max-width: ${({ expandConditions }) => !expandConditions && '40%'};
    overflow-x: auto;
    white-space: nowrap;
    padding: ${({ expandConditions }) => expandConditions ? '0.25rem' : '0.5rem'};
    border-radius: 0.25rem;
    background-color: ${({ theme }) => theme.gridHeader.cardFade};

    & + ul {
      margin-top: ${({ expandConditions }) => expandConditions ? '0rem' : '-1rem'};
    }
  }

  & + & {
    margin-top: 0.5rem;
    border-top: 1px solid #ccc;
    padding-top: 1.5rem;
  }

  & > ul:last-child {
    margin-bottom: 0;
  }

  h4 + & + ul,
  ul + & + ul,
  ul + & + & + ul,
  ul + & + & + & + ul {
    margin-top: 0;
  }
`;
