import React, { useMemo } from 'react';
import { ResultsGrid, ResultsGridHeader, ResultsRow, ResultsDamageRow } from './Layout';

function combineIdenticalLines(results) {
  const [negative, neutral, positive] = results;

  return Object.entries({ negative, neutral, positive}).reduce((output, [key, { rangeSegments }]) => (
    rangeSegments.reduce((acc, result) => {
      const currentValue = acc[result.damageRangeOutput];

      return {
        ...acc,
        [result.damageRangeOutput]: {
          ...currentValue,
          damageValues: result.damageValues,
          statFrom: currentValue?.statFrom ?? result.stat,
          statTo: result.stat,
          [key]: {
            ...currentValue?.[key],
            from: (currentValue || {})[key]?.from ?? result.from,
            to: result.to,
          }
        },
      }
    }, output)
  ), {})
}

function formatIVRange(value) {
  if (!value) return 'x';
  if(value.from === 0 && value.to === 31) return '#';

  if(value.from === 0) return `${value.to}-`;
  if(value.to === 31) return `${value.from}+`;

  return `${value.from}–${value.to}`;
}

export const CompactDisplay = ({ results, displayRolls }) => {
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
              {statFrom === statTo ? statFrom : `${statFrom}–${statTo}`}
            </div>
            <div>{damageRangeOutput}</div>
          </ResultsRow>
          {displayRolls && <ResultsDamageRow>{damageValues.join(', ')}</ResultsDamageRow>}
        </React.Fragment>
      ))}
    </ResultsGrid>
  );
}
