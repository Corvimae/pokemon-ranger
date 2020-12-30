import React, { useMemo, useRef } from 'react';
import { combineIdenticalLines, NatureResult } from '../utils/calculations';
import { useGridCopy } from '../utils/hooks';
import { formatIVRange, formatStatRange } from '../utils/rangeFormat';
import { CopyGridButton } from './CopyGridButton';
import { ResultsGrid, ResultsGridHeader, ResultsRow } from './Layout';
import { ResultsDamageRow } from './ResultsDamageRow';

interface CompactDisplayProps {
  results: NatureResult[];
  displayRolls: boolean;
}

export const CompactDisplay: React.FC<CompactDisplayProps> = ({ results, displayRolls }) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const compactedResults = useMemo(() => combineIdenticalLines(results), [results]);

  useGridCopy(gridRef);

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
