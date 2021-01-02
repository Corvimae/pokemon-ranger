import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Tracker } from '../../reducers/route/types';
import { NATURES, Stat, STATS } from '../../utils/constants';
import { calculateAllPossibleIVRanges, calculatePossibleNature, IVRangeSet } from '../../utils/trackerCalculations';

const STAT_NAMES: Record<Stat, string> = {
  hp: 'HP',
  attack: 'ATK',
  defense: 'DEF',
  spAttack: 'SP. ATK',
  spDefense: 'SP. DEF',
  speed: 'SPD',
};

interface IVDisplayProps {
  tracker: Tracker;
}

function getSymbolForStat(rangeSet: IVRangeSet, confirmedPositive: Stat | null, confirmedNegative: Stat | null): string {
  if (confirmedPositive === null && rangeSet.negative[0] === -1 && (confirmedNegative !== null || rangeSet.positive[0] !== -1)) return ' +';
  if (confirmedNegative === null && rangeSet.negative[0] !== -1 && (confirmedPositive !== null || rangeSet.positive[0] === -1)) return ' -';
  if (confirmedNegative === null && confirmedPositive === null && rangeSet.negative[0] !== -1 && rangeSet.positive[0] !== -1) return ' ±';

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
        <StatDisplay>
          <StatName positive={stat === confirmedPositive} negative={stat === confirmedNegative}>
            {STAT_NAMES[stat]}{stat !== 'hp' && getSymbolForStat(ivRanges[stat], confirmedPositive, confirmedNegative)}
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
  color: ${props => {
    if (props.positive) return '#ff7f7f';
    if (props.negative) return '#a1a1ff';

    return '#fff';
  }};
`;
