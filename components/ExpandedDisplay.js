import React from 'react';
import { ResultsGrid, ResultsGridHeader, ResultsRow, ResultsDamageRow, ResultsSubheader } from './Layout';

export const ExpandedDisplay = ({ results, displayRolls }) => (
  <>
    {results.map(({ name, rangeSegments }) => (
      <React.Fragment key={name}>
        <ResultsSubheader>{name}</ResultsSubheader>
        <ResultsGrid>
          <ResultsGridHeader>
            <div>IVs</div>
            <div>Stat</div>
            <div>Damage</div>
          </ResultsGridHeader>
          {rangeSegments.map(({ from, to, stat, damageValues, damageRangeOutput }) => (
            <React.Fragment key={`${from} - ${to}`}>
              <ResultsRow>
                <div>{from === to ? from : `${from} - ${to}`}</div>
                <div>{stat}</div>
                <div>{damageRangeOutput}</div>
              </ResultsRow>
              {displayRolls && <ResultsDamageRow>{damageValues.join(', ')}</ResultsDamageRow>}
            </React.Fragment>
          ))}
        </ResultsGrid>
      </React.Fragment>
    ))}
  </>
);
