import React, { useMemo } from 'react';
import styled from 'styled-components';
import { RouteContext } from '../../reducers/route/reducer';
import { calculateKillRanges, calculateRanges, combineIdenticalLines } from '../../utils/calculations';
import { formatIVSplit, formatStatRange } from '../../utils/rangeFormat';
import { ErrorCard } from './ErrorCard';

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
  generation?: string;
  offensive?: string;
  special?: string;
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
  generation = 4,
  offensive = 'true',
  special = 'false',
}) => {
  const state = RouteContext.useState();
  const baseStats = source ? state.trackers[source]?.baseStats[Number(evolution)] : null;

  const rangeResults = useMemo(() => {
    const offensiveBaseStat = special === 'true' ? baseStats?.spAttack : baseStats?.attack;
    const defensiveBaseStat = special === 'true' ? baseStats?.spDefense : baseStats?.defense;

    const ranges = calculateRanges({
      level: Number(level || 0),
      baseStat: (offensive === 'true' ? offensiveBaseStat : defensiveBaseStat) ?? 0,
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
      generation: Number(generation),
      criticalHit: false,
      opponentLevel: Number(opponentLevel),
      offensiveMode: offensive === 'true',
    });

    const threshold = Number(healthThreshold);

    if (threshold !== -1) {
      return calculateKillRanges(ranges, threshold);
    }

    return combineIdenticalLines(ranges);
  }, [baseStats, special, level, offensive, evs, combatStages, movePower, effectiveness, stab, opponentStat, opponentCombatStages, torrent, weatherBoosted, weatherReduced, multiTarget, otherModifier, generation, opponentLevel, healthThreshold]);

  if (!state.trackers[source || '']) return <ErrorCard>No IV table with the name {source} exists.</ErrorCard>;
  if (!level) return <ErrorCard>The level attribute must be specified.</ErrorCard>;
  if (!movePower) return <ErrorCard>The movePower attribute must be specified.</ErrorCard>;
  if (!opponentStat) return <ErrorCard>The opponentStat attribute must be specified.</ErrorCard>;

  return (
    <div>
      <Header>{contents}</Header>
      <RangeGrid>
        <RangeGridHeader>
          <div>IVs</div>
          <div>Stat</div>
          <div>{Number(healthThreshold) === -1 ? 'Damage' : 'Chance to Kill'}</div>
        </RangeGridHeader>
        {Object.entries(rangeResults).map(([key, value], index) => (
          <React.Fragment key={index}>
            <div>{formatIVSplit(value)}</div>
            <div>{formatStatRange(value.statFrom, value.statTo)}</div>
            <div>{Number(healthThreshold) === -1 ? key : `${value.successes} / 16`}</div>
          </React.Fragment>
        ))}
      </RangeGrid>
    </div>
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
    background-color: #eee;
    font-weight: 700;
    padding: 0.25rem 1rem;
  }
`;
