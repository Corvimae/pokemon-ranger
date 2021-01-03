import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Tracker } from '../../reducers/route/types';
import { NATURES, Stat, STATS } from '../../utils/constants';
import { formatStatName } from '../../utils/rangeFormat';
import { calculateAllPossibleIVRanges, calculatePossibleNature, getPossibleNatureAdjustmentsForStat, IVRangeSet } from '../../utils/trackerCalculations';

interface IVDisplayProps {
  tracker: Tracker;
}

function getSymbolForStat(rangeSet: IVRangeSet, stat: Stat, confirmedPositive: Stat | null, confirmedNegative: Stat | null): string {
  if (!rangeSet) return '';

  const [negative, neutral, positive] = getPossibleNatureAdjustmentsForStat(rangeSet, stat, [confirmedNegative, confirmedPositive]);

  if (neutral && positive) return ' +';
  if (negative && neutral) return ' -';
  if (negative && neutral && positive) return ' ±';

  return '';
}

export const IVDisplay: React.FC<IVDisplayProps> = ({ tracker }) => {
  const ivRanges = useMemo(() => calculateAllPossibleIVRanges(tracker), [tracker]);
  const [confirmedNegative, confirmedPositive] = useMemo(() => calculatePossibleNature(ivRanges), [ivRanges]);
  
  const confirmedNature = useMemo(() => {
    if (!confirmedNegative || !confirmedPositive) return null;

    return Object.values(NATURES).find(nature => nature.minus === confirmedNegative && nature.plus === confirmedPositive);
  }, [confirmedNegative, confirmedPositive]);

  return (
    <Container>
      <TrackerName>{tracker.name}</TrackerName>
      {STATS.map(stat => (
        <StatDisplay key={stat}>
          <StatName positive={stat === confirmedPositive} negative={stat === confirmedNegative}>
            {formatStatName(stat, true)}{stat !== 'hp' && getSymbolForStat(ivRanges[stat], stat, confirmedPositive, confirmedNegative)}
          </StatName>
          <div>
            {ivRanges[stat].combined[0]}{ivRanges[stat].combined[0] !== ivRanges[stat].combined[1] && `–${ivRanges[stat].combined[1]}`}
          </div>
        </StatDisplay>
      ))}
      <StatDisplay>
        <StatName>Nature</StatName>
        <div>
          {confirmedNature?.name ?? '?'}
        </div>
      </StatDisplay>
    </Container>
  );
};

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);

  & + & {
    margin-top: 0.25rem;
  }
`;

const TrackerName = styled.div`
  grid-column: 1 / -1;
  padding: 0.5rem 0;
  text-align: center;
  font-weight: 700;

`;

const StatDisplay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StatName = styled.div<{ positive?: boolean; negative?: boolean; }>`
  font-weight: 700;
  margin-bottom: 0.125rem;
  padding: 0 0.25rem;
  color: ${props => {
    if (props.positive) return '#ff7f7f';
    if (props.negative) return '#a1a1ff';

    return '#fff';
  }};
`;
