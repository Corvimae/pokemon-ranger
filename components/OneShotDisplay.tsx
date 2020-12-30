import React, { useMemo, useRef } from 'react';
import styled from 'styled-components';
import { combineIdenticalLines, CompactRange, formatIVRange, formatStatRange, mergeStatRanges, NatureResult, StatRange } from '../utils/calculations';
import { useGridCopy } from '../utils/hooks';
import { InputRow, ResultsGrid, ResultsGridHeader, ResultsRow } from './Layout';
import { ResultsDamageRow } from './ResultsDamageRow';

interface OneShotResult {
  successes: number;
  statFrom: number;
  statTo: number;
  negative: StatRange;
  neutral: StatRange;
  positive: StatRange;
  componentResults: CompactRange[];
}

interface OneShotDisplayProps {
  results: NatureResult[];
  displayRolls: boolean;
  healthThreshold: number;
  setHealthThreshold: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const OneShotDisplay: React.FC<OneShotDisplayProps> = ({ results, displayRolls, healthThreshold, setHealthThreshold }) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const compactedResults = useMemo(() => (
    Object.values(combineIdenticalLines(results))
      .reduce<Record<number, OneShotResult>>((acc, result) => {
        const successes = result.damageValues.filter(value => value >= healthThreshold).length;
        const currentValue = acc[successes];

        return {
          ...acc,
          [successes]: {
            successes: successes,
            statFrom: Math.min(currentValue?.statFrom || Number.MAX_VALUE, result.statFrom),
            statTo: Math.max(currentValue?.statTo || Number.MIN_VALUE, result.statTo),
            negative: mergeStatRanges(currentValue?.negative, result.negative),
            neutral: mergeStatRanges(currentValue?.neutral, result.neutral),
            positive: mergeStatRanges(currentValue?.positive, result.positive),
            componentResults: [
              ...(currentValue?.componentResults || []),
              result,
            ]
          },
        };
      }, {})
  ), [results]);

  useGridCopy(gridRef);

  return (
    <OneShotResultsGrid ref={gridRef}>
      <HealthThresholdInputRow>
        <label>Target Health</label>
        <input type="number" value={healthThreshold} onChange={setHealthThreshold}/>
      </HealthThresholdInputRow>
      <ResultsGridHeader>
        <div>IVs</div>
        <div>Stat</div>
        <ChanceToKillHeader>Chance to Kill</ChanceToKillHeader>
      </ResultsGridHeader>
      {Object.values(compactedResults).map(({ successes, statFrom, statTo, negative, neutral, positive, componentResults }) => (
        <React.Fragment key={`${statFrom} - ${statTo}`}>
          <ResultsRow>
            <div>
              {formatIVRange(negative)}&nbsp;/&nbsp;
              {formatIVRange(neutral)}&nbsp;/&nbsp;
              {formatIVRange(positive)}
            </div>
            <div>
              {formatStatRange(statFrom, statTo)}
            </div>
            <SuccessesCell>{successes}&nbsp;</SuccessesCell>
            <DenominatorCell data-range-merge={true}>/ 16</DenominatorCell>
          </ResultsRow>
          <DamageRolls data-range-excluded={true}>
            {displayRolls && componentResults.map(({ statFrom: rollFrom, statTo: rollTo, damageValues }) => (
              <React.Fragment key={`${rollFrom} - ${rollTo}`}>
                <DamageRollRange data-range-excluded={true}>{formatStatRange(rollFrom, rollTo)}</DamageRollRange>
                <OneShotDamageRow values={damageValues} />
              </React.Fragment>
            ))}
          </DamageRolls>
        </React.Fragment>
      ))}
    </OneShotResultsGrid>
  );
}

const OneShotResultsGrid = styled(ResultsGrid)`
  grid-template-columns: 1fr 1fr min-content 1fr;
`;

const HealthThresholdInputRow = styled(InputRow)`
  display: grid;
  grid-template-columns: max-content 1fr;
  grid-column: 1 / -1;
`;

const ChanceToKillHeader = styled.div`
  grid-column: span 2;
`;

const SuccessesCell = styled.div`
  text-align: right;

  && {
    padding-right: 0;
  }
`;

const DenominatorCell = styled.div`
 && {
   padding-left: 0;
 }
`;

const DamageRolls = styled.div`
  display: grid;
  grid-template-columns: max-content 1fr;
  grid-column: 1 / -1;
  margin-top: 0.25rem;
`;

const DamageRollRange = styled.div`
  color: #666;
  font-size: 0.825rem;
  font-weight: 700;
  text-align: right;
  padding: 0.25rem 0.5rem;
`;

const OneShotDamageRow = styled(ResultsDamageRow)`
  grid-column: span 1;
`;