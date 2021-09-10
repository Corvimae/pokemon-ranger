import React, { useMemo } from 'react';
import styled from 'styled-components';
import { calculateKillRanges } from '../utils/calculations';
import { formatIVRange, formatStatRange } from '../utils/rangeFormat';
import { useGridCopy } from '../utils/hooks';
import { InputRow, ResultsGrid, ResultsGridHeader, ResultsRow } from './Layout';
import { ResultsDamageRow } from './ResultsDamageRow';
import { CopyGridButton } from './CopyGridButton';
import { NatureResult } from '../utils/rangeTypes';

interface OneShotDisplayProps {
  results: NatureResult[];
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
                <React.Fragment key={`${rollFrom} - ${rollTo}`}>
                  <DamageRollRange data-range-excluded>{formatStatRange(rollFrom, rollTo)}</DamageRollRange>
                  <OneShotDamageRow values={damageValues} />
                </React.Fragment>
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
  grid-template-columns: max-content 1fr;
  grid-column: 1 / -1;
  margin-top: 0.25rem;
`;

const DamageRollRange = styled.div`
  color: ${({ theme }) => theme.label};
  font-size: 0.825rem;
  font-weight: 700;
  text-align: right;
  padding: 0.25rem 0.5rem;
`;

const OneShotDamageRow = styled(ResultsDamageRow)`
  grid-column: span 1;
`;
