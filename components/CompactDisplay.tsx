import React, { useMemo } from 'react';
import { formatIVRangeSet, formatStatRange, combineIdenticalLines, DamageRangeNatureResult } from 'relicalc';
import { useGridCopy } from '../utils/hooks';
import { CopyGridButton } from './CopyGridButton';
import { ResultsGrid, ResultsGridHeader, ResultsRow } from './Layout';
import { ResultsDamageRow } from './ResultsDamageRow';

interface CompactDisplayProps {
  results: DamageRangeNatureResult[];
  displayRolls: boolean;
}

export const CompactDisplay: React.FC<CompactDisplayProps> = ({ results, displayRolls }) => {
  const gridRef = useGridCopy();
  const compactedResults = useMemo(() => combineIdenticalLines(results), [results]);

  return (
    <ResultsGrid ref={gridRef}>
      <ResultsGridHeader>
        <div>IVs</div>
        <div>Stat</div>
        <div>Damage</div>
      </ResultsGridHeader>

      <CopyGridButton results={Object.values(compactedResults)} />

      {compactedResults.map(({ damageRangeOutput, damageValues, statFrom, statTo, negative, neutral, positive }) => (
        <React.Fragment key={`${statFrom} - ${statTo}`}>
          <ResultsRow>
            <div>
              {formatIVRangeSet({ negative, neutral, positive })}
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
};
