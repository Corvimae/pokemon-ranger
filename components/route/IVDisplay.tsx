import React, { useMemo } from 'react';
import styled from 'styled-components';
import { RouteContext } from '../../reducers/route/reducer';
import { Tracker } from '../../reducers/route/types';
import { NATURES, Stat, STATS } from '../../utils/constants';
import { formatStatName } from '../../utils/rangeFormat';
import { Generation } from '../../utils/rangeTypes';
import { getPossibleNatureAdjustmentsForStat, IVRangeSet, useCalculationSet } from '../../utils/trackerCalculations';

interface IVDisplayProps {
  tracker: Tracker;
  compactIVs: boolean;
}

function getSymbolForStat(rangeSet: IVRangeSet, stat: Stat, confirmedPositive: Stat | null, confirmedNegative: Stat | null): string {
  if (!rangeSet) return '';

  const [negative, neutral, positive] = getPossibleNatureAdjustmentsForStat(rangeSet, stat, [confirmedNegative, confirmedPositive]);

  if (negative && neutral && positive) return ' ±';
  if (neutral && positive) return ' +';
  if (negative && neutral) return ' -';

  return '';
}

export const IVDisplay: React.FC<IVDisplayProps> = ({ tracker, compactIVs }) => {
  const state = RouteContext.useState();

  const calculationSet = useCalculationSet(tracker.name);

  const {
    ivRanges,
    confirmedNature: [confirmedNegative, confirmedPositive],
  } = calculationSet ?? { confirmedNature: [null, null] };

  const confirmedNatureDefinition = useMemo(() => {
    if (!confirmedNegative || !confirmedPositive) return null;

    return Object.values(NATURES).find(nature => nature.minus === confirmedNegative && nature.plus === confirmedPositive);
  }, [confirmedNegative, confirmedPositive]);
  
  if (!calculationSet || !ivRanges || state.options.hideIVResults) return null;

  return (
    <Container generation={tracker.generation} calculateHiddenPower={tracker.calculateHiddenPower} compactIVs={compactIVs}>
      {!compactIVs && <TrackerName>{tracker.name}</TrackerName>}
      {STATS.filter(stat => tracker.generation > 2 || stat !== 'spDefense').map(stat => (
        <StatDisplay key={stat}>
          <StatName
            positive={stat === confirmedPositive && stat !== confirmedNegative}
            negative={stat === confirmedNegative && stat !== confirmedPositive}
          >
            {tracker.generation <= 2 && stat === 'spAttack' ? 'SPEC' : formatStatName(stat, true)}
            {stat !== 'hp' && getSymbolForStat(ivRanges[stat], stat, confirmedPositive, confirmedNegative)}
          </StatName>
          <div>
            {!ivRanges[stat].combined.some(Number.isFinite) ? (
              'Invalid'
            ) : (
              `${ivRanges[stat].combined[0]}${ivRanges[stat].combined[0] !== ivRanges[stat].combined[1] ? `–${ivRanges[stat].combined[1]}` : ''}`
            )}
          </div>
        </StatDisplay>
      ))}
      {tracker.generation > 2 && (
        <StatDisplay>
          <StatName>Nature</StatName>
          <div>
            {confirmedNatureDefinition?.name ?? '?'}
          </div>
        </StatDisplay>
      )}
      {tracker.calculateHiddenPower && (
        <StatDisplay>
          <StatName>Hidden Power</StatName>
          <div>
            {calculationSet.hiddenPowerType ?? 'N/A'}
          </div>
        </StatDisplay>
      )}
    </Container>
  );
};

const Container = styled.div<{ generation: Generation; calculateHiddenPower?: boolean; compactIVs: boolean }>`
  display: grid;
  grid-template-columns: repeat(${props => props.generation <= 2 ? 5 : 7}, 5.25rem) ${props => props.calculateHiddenPower && 'max-content'};
  padding: ${props => props.compactIVs && '0.25rem 0'};

  & + & {
    margin-top: ${props => props.compactIVs ? 0 : '0.25rem'};
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
