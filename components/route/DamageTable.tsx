import React, { useMemo } from 'react';
import styled from 'styled-components';
import { RouteContext } from '../../reducers/route/reducer';
import { calculateKillRanges, calculateRanges, combineIdenticalLines } from '../../utils/calculations';
import { Stat } from '../../utils/constants';
import { formatIVSplit, formatStatName, formatStatRange } from '../../utils/rangeFormat';
import { CombinedIVResult, ConfirmedNature } from '../../utils/rangeTypes';
import { calculateAllPossibleIVRanges, calculatePossibleNature, isIVWithinRange, IVRangeSet } from '../../utils/trackerCalculations';
import { Card } from '../Layout';
import { ErrorCard } from './ErrorCard';

function filterToStatRange<T extends CombinedIVResult>(
  results: Record<string | number, T>,
  confirmedNature: ConfirmedNature,
  stat: Stat,
  ivRanges: IVRangeSet,
): Record<string | number, T> {
  return Object.entries(results).reduce((acc, [key, value]) => {
    if (isIVWithinRange(value, confirmedNature, stat, ivRanges)) {
      return {
        ...acc,
        [key]: value,
      };
    }

    return acc;
  }, {} as Record<string | number, T>);
}

interface DamageTableProps {
  source?: string;
  contents?: string;
  level?: string;
  evolution?: string;
  evs?: string;
  combatStages?: string;
  movePower?: string;
  effectiveness?: string;
  healthThreshold?: string;
  stab?: string;
  opponentStat?: string;
  opponentCombatStages?: string;
  opponentLevel?: string;
  torrent?: string;
  weatherBoosted?: string;
  weatherReduced?: string;
  multiTarget?: string;
  otherModifier?: string;
  offensive?: string;
  special?: string;
  friendship?: string;
  screen?: string;
  otherPowerModifier?: string;
  theme?: string;
}

export const DamageTable: React.FC<DamageTableProps> = ({
  source,
  contents,
  level,
  movePower,
  opponentStat,
  evolution = 0,
  evs = 0,
  combatStages = 0,
  effectiveness = 1,
  stab = 'false',
  opponentCombatStages = 0,
  opponentLevel = 0,
  healthThreshold = -1,
  torrent = 'false',
  weatherBoosted = 'false',
  weatherReduced = 'false',
  multiTarget = 'false',
  otherModifier = 1,
  offensive = 'true',
  special = 'false',
  screen = 'false',
  otherPowerModifier = 1,
  friendship = 0,
  theme = 'info',
}) => {
  const state = RouteContext.useState();
  const baseStats = source ? state.trackers[source]?.baseStats[Number(evolution)] : null;
  const tracker = source && state.trackers[source];

  const ivRanges = useMemo(() => (
    tracker && calculateAllPossibleIVRanges(tracker)
  ), [tracker]);

  const confirmedNature = useMemo(() => ivRanges && tracker && calculatePossibleNature(ivRanges, tracker), [ivRanges, tracker]);
  
  const offensiveStat: Stat = special === 'true' ? 'spAttack' : 'attack';
  const defensiveStat: Stat = special === 'true' ? 'spDefense' : 'defense';
  const relevantStat = offensive === 'true' ? offensiveStat : defensiveStat;

  const rangeResults = useMemo(() => {
    const ranges = calculateRanges({
      level: Number(level || 0),
      baseStat: baseStats?.[relevantStat] ?? 0,
      evs: Number(evs),
      combatStages: Number(combatStages),
      movePower: Number(movePower),
      typeEffectiveness: Number(effectiveness),
      stab: stab === 'true',
      opponentStat: Number(opponentStat),
      opponentCombatStages: Number(opponentCombatStages),
      torrent: torrent === 'true',
      weatherBoosted: weatherBoosted === 'true',
      weatherReduced: weatherReduced === 'true',
      multiTarget: multiTarget === 'true',
      otherModifier: Number(otherModifier),
      generation: (source && state.trackers[source]?.generation) || 4,
      criticalHit: false,
      opponentLevel: Number(opponentLevel),
      offensiveMode: offensive === 'true',
      friendship: Number(friendship),
      screen: screen === 'true',
      otherPowerModifier: Number(otherPowerModifier),
    });

    const threshold = Number(healthThreshold);
    const natureSet = confirmedNature || [null, null];

    if (!ivRanges) return {};

    if (threshold !== -1) {
      return filterToStatRange(calculateKillRanges(ranges, threshold), natureSet, relevantStat, ivRanges[relevantStat]);
    }

    return filterToStatRange(combineIdenticalLines(ranges), natureSet, relevantStat, ivRanges[relevantStat]);
  }, [baseStats, ivRanges, confirmedNature, relevantStat, level, offensive, evs, combatStages, movePower, effectiveness, stab, opponentStat, opponentCombatStages, torrent, weatherBoosted, weatherReduced, multiTarget, otherModifier, friendship, opponentLevel, healthThreshold, screen, otherPowerModifier, source, state.trackers]);

  if (!state.trackers[source || '']) return <ErrorCard>No IV table with the name {source} exists.</ErrorCard>;
  if (!level) return <ErrorCard>The level attribute must be specified.</ErrorCard>;
  if (!movePower) return <ErrorCard>The movePower attribute must be specified.</ErrorCard>;
  if (!opponentStat) return <ErrorCard>The opponentStat attribute must be specified.</ErrorCard>;

  const resultCount = Object.keys(rangeResults).length;
  const isAgainstThreshold = Number(healthThreshold) !== -1;

  return (
    <Card variant={theme}>
      <Header>
        {contents}
        {resultCount === 1 && (
          <span>
            <span>&nbsp;{isAgainstThreshold ? `is a ${Object.values(rangeResults)[0].successes} / 16 range to kill` : `deals ${Object.keys(rangeResults)[0]} damage`}</span>
            <span>&nbsp;at {formatStatRange(Object.values(rangeResults)[0].statFrom, Object.values(rangeResults)[0].statTo)}</span>
            <span>&nbsp;{formatStatName(relevantStat)}</span>
            <span>&nbsp;({formatIVSplit(Object.values(rangeResults)[0])})</span>
          </span>
        )}
      </Header>
      {resultCount > 1 && (
        <RangeGrid>
          <RangeGridHeader>
            <div>IVs</div>
            <div>Stat</div>
            <div>{isAgainstThreshold ? 'Damage' : 'Chance to Kill'}</div>
          </RangeGridHeader>
          {Object.entries(rangeResults).map(([key, value], index) => (
            <React.Fragment key={index}>
              <div>{formatIVSplit(value)}</div>
              <div>{formatStatRange(value.statFrom, value.statTo)}</div>
              <div>{isAgainstThreshold ? `${value.successes} / 16` : key}</div>
            </React.Fragment>
          ))}
        </RangeGrid>
      )}
    </Card>
  );
};

const Header = styled.div`
  font-weight: 700;
  margin-bottom: 0.25rem;
`;

const RangeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);

  & > div {
    padding: 0.25rem 1rem;
  }
`;

const RangeGridHeader = styled.div`
  display: contents;

  & > div {
    background-color: rgba(255, 255, 255, 0.6);
    font-weight: 700;
    padding: 0.25rem 1rem;
  }
`;
