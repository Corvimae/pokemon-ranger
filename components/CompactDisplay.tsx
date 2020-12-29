import React, { useMemo } from 'react';
import { combineIdenticalLines, formatIVRange, formatStatRange, NatureResult } from '../utils/calculations';
import { ResultsGrid, ResultsGridHeader, ResultsRow } from './Layout';
import { ResultsDamageRow } from './ResultsDamageRow';

interface CompactDisplayProps {
  results: NatureResult[];
  displayRolls: boolean;
}

export const CompactDisplay: React.FC<CompactDisplayProps> = ({ results, displayRolls }) => {
  const compactedResults = useMemo(() => combineIdenticalLines(results), [results]);

  return (
    <ResultsGrid>
      <ResultsGridHeader>
        <div>IVs</div>
        <div>Stat</div>
        <div>Damage</div>
      </ResultsGridHeader>
      {Object.entries(compactedResults).map(([damageRangeOutput, { damageValues, statFrom, statTo, negative, neutral, positive }]) => (
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
            <div>{damageRangeOutput}</div>
          </ResultsRow>
          {displayRolls && <ResultsDamageRow values={damageValues} />}
        </React.Fragment>
      ))}
    </ResultsGrid>
  );
}
