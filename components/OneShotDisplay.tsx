import React, { useMemo } from 'react';
import styled from 'styled-components';
import { calculateKillRanges, DamageRangeNatureResult, formatIVRange, formatStatRange } from 'relicalc';
import { useGridCopy } from '../utils/hooks';
import { InputRow, ResultsGrid, ResultsGridHeader, ResultsRow } from './Layout';
import { ResultsDamageRow } from './ResultsDamageRow';
import { CopyGridButton } from './CopyGridButton';

interface OneShotDisplayProps {
  results: DamageRangeNatureResult[];
  displayRolls: boolean;
  healthThreshold: number;
  setHealthThreshold: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const OneShotDisplay: React.FC<OneShotDisplayProps> = ({ results, displayRolls, healthThreshold, setHealthThreshold }) => {
  const compactedResults = useMemo(() => calculateKillRanges(results, healthThreshold), [results, healthThreshold]);

  const gridRef = useGridCopy();

  return (
    <>
      <HealthThresholdInputRow>
        <label htmlFor="targetHealthInput">Target Health</label>
        <input id="targetHealthInput" type="number" value={healthThreshold} onChange={setHealthThreshold} />
      </HealthThresholdInputRow>
      <OneShotResultsGrid ref={gridRef}>
        <CopyGridButton results={Object.values(compactedResults)} />

        <ResultsGridHeader>
          <div>IVs</div>
          <div>Stat</div>
          <ChanceToKillHeader>Chance to Kill</ChanceToKillHeader>
        </ResultsGridHeader>
        {Object.values(compactedResults).map(({ successes, statFrom, statTo, negative, neutral, positive, componentResults }) => (
          <React.Fragment key={`${statFrom} - ${statTo}`}>
            <ResultsRow>
              <div>
                {formatIVRange(negative)}
                &nbsp;/&nbsp;
                {formatIVRange(neutral)}
                &nbsp;/&nbsp;
                {formatIVRange(positive)}
              </div>
              <div>
                {formatStatRange(statFrom, statTo)}
              </div>
              <SuccessesCell>
                {successes}&nbsp;
              </SuccessesCell>
              <DenominatorCell data-range-merge>/ 16</DenominatorCell>
            </ResultsRow>
            <DamageRolls data-range-excluded>
              {displayRolls && componentResults.map(({ statFrom: rollFrom, statTo: rollTo, damageValues }) => (
                <OneShotDamageRowContainer key={`${rollFrom} - ${rollTo}`}>
                  <DamageRollRange data-range-excluded>{formatStatRange(rollFrom, rollTo)}</DamageRollRange>
                  <OneShotDamageRow values={damageValues} />
                </OneShotDamageRowContainer>
              ))}
            </DamageRolls>
          </React.Fragment>
        ))}
      </OneShotResultsGrid>
    </>
  );
};

const OneShotResultsGrid = styled(ResultsGrid)`
  && {
    grid-template-columns: 1fr 1fr min-content 1fr;
  }
`;

const HealthThresholdInputRow = styled(InputRow)`
  && {
    display: grid;
    grid-template-columns: max-content 1fr;
  }
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
  grid-template-columns: 5rem 1fr;
  grid-column: 1 / -1;
  margin-top: 0.25rem;
`;

const DamageRollRange = styled.div`
  display: flex;
  color: ${({ theme }) => theme.label};
  font-size: 0.825rem;
  font-weight: 700;
  justify-content: flex-end;
  align-items: center;
  margin: 0.25rem 0 0 0;
  padding: 0.25rem 0.5rem;
`;

const OneShotDamageRowContainer = styled.div`
  display: contents;
  
  &:hover > div {
    background-color: ${({ theme }) => theme.backgroundSelected};
    color: ${({ theme }) => theme.foreground};
  }
`;

const OneShotDamageRow = styled(ResultsDamageRow)`
  grid-column: span 1;
  font-variant-numeric: tabular-nums;
`;
