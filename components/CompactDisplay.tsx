import React, { useMemo } from 'react';
import { combineIdenticalLines } from '../utils/calculations';
import { useGridCopy } from '../utils/hooks';
import { formatIVSplit, formatStatRange } from '../utils/rangeFormat';
import { NatureResult } from '../utils/rangeTypes';
import { CopyGridButton } from './CopyGridButton';
import { ResultsGrid, ResultsGridHeader, ResultsRow } from './Layout';
import { ResultsDamageRow } from './ResultsDamageRow';

interface CompactDisplayProps {
  results: NatureResult[];
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

      {Object.entries(compactedResults).map(([damageRangeOutput, { damageValues, statFrom, statTo, negative, neutral, positive }]) => (
        <React.Fragment key={`${statFrom} - ${statTo}`}>
          <ResultsRow>
            <div>
              {formatIVSplit({ negative, neutral, positive })}
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
