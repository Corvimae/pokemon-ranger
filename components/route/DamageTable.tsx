import React, { useContext, useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { logRouteError, RouteContext } from '../../reducers/route/reducer';
import { Tracker } from '../../reducers/route/types';
import { calculateKillRanges, calculateRanges, combineIdenticalLines } from '../../utils/calculations';
import { Stat } from '../../utils/constants';
import { calculateMoveEffectiveness, TypeName, TYPE_NAMES } from '../../utils/pokemonTypes';
import { formatIVSplit, formatStatName, formatStatRange } from '../../utils/rangeFormat';
import { CombinedIVResult, ConfirmedNature } from '../../utils/rangeTypes';
import { useCurrentRouteLevel } from '../../utils/routeUtils';
import { isIVWithinRange, IVRangeSet, useCalculationSet } from '../../utils/trackerCalculations';
import { Card } from '../Layout';
import { ErrorCard } from './ErrorCard';
import { PokemonBlockContext, PokemonStatContext } from './PokemonBlock';

function validateDamageTableValues(
  trackers: Record<string, Tracker>,
  source: string | undefined,
  pokemonContext: PokemonStatContext,
  movePower: string | undefined,
  opponentStat: string | undefined,
): string | null {
  // If the trackers aren't registered yet, just wait.

  if (!trackers[source || '']) {
    return `No IV table with the name ${source} exists.`;
  }

  if (!movePower) {
    return 'The movePower attribute must be specified.';
  }

  if (!opponentStat && !pokemonContext.stats) {
    return 'Either the opponentStat attribute must be specified, or stats must be defined in the parent pokemon block.';
  }

  return null;
}

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
  position?: string;
  line: string;
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
  type?: string;
  theme?: string;
}

export const DamageTable: React.FC<DamageTableProps> = ({
  source,
  contents,
  position,
  line,
  level: rawLevel,
  movePower,
  opponentLevel,
  opponentStat,
  evolution = 0,
  evs = -1,
  combatStages = 0,
  effectiveness,
  stab,
  opponentCombatStages = 0,
  healthThreshold = '-1',
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
  type,
  theme = 'info',
}) => {
  const state = RouteContext.useState();
  const dispatch = RouteContext.useDispatch();
  const pokemonContext = useContext(PokemonBlockContext);
  const baseStats = source ? state.trackers[source]?.baseStats[Number(evolution)] : null;

  const calculationSet = useCalculationSet(source);

  const level = useCurrentRouteLevel(source, Number(line), rawLevel);

  const offensiveStat: Stat = special === 'true' ? 'spAttack' : 'attack';
  const defensiveStat: Stat = special === 'true' ? 'spDefense' : 'defense';
  const relevantStat = offensive?.toLowerCase() === 'true' ? offensiveStat : defensiveStat;
  const opponentRelevantStat = offensive?.toLowerCase() === 'true' ? defensiveStat : offensiveStat;

  const trackerEvs = evs === -1 ? calculationSet?.tracker && (calculationSet.tracker.evSegments[calculationSet.tracker.startingLevel]?.[Number(level)]?.[relevantStat] ?? 0) : evs;

  const moveType = useMemo(() => {
    const parsedType = type?.trim().toLowerCase();

    if (parsedType && TYPE_NAMES.indexOf(parsedType as TypeName) === -1) {
      dispatch(logRouteError(`Invalid type definition for damage table: ${type}.`, position));

      return null;
    }

    return (parsedType as TypeName) || null;
  }, [type, position, dispatch]);

  const hpThreshold = useMemo(() => {
    const useParentHPThreshold = healthThreshold?.toLowerCase() === 'auto';
    const offensiveMode = offensive.toLowerCase() === 'true';

    if (useParentHPThreshold && !offensiveMode) {
      dispatch(logRouteError('"auto" health threshold is only supported for offensive calculations.', position));

      return -1;
    }

    return offensiveMode && useParentHPThreshold && pokemonContext.stats ? pokemonContext.stats.hp : Number(healthThreshold);
  }, [healthThreshold, offensive, dispatch, position, pokemonContext.stats]);
  
  const rangeResults = useMemo(() => {
    if (!calculationSet) return {};
    const parsedEffectiveness = effectiveness === undefined || effectiveness == null || effectiveness === '' ? null : Number(effectiveness);
    const parsedStab = stab === null || stab === undefined ? null : stab === 'true';
    const parsedOpponentStat = opponentStat === null || opponentStat === undefined ? null : Number(opponentStat);
    const parsedOpponentLevel = opponentLevel === null || opponentLevel === undefined ? null : Number(opponentLevel);
    const sourceTypes = source ? state.trackers[source]?.types : [];
    const offensiveMode = offensive.toLowerCase() === 'true';
    const offensiveTypeSet = (offensiveMode ? sourceTypes : pokemonContext.types) ?? [];
    const defensiveTypeSet = (offensiveMode ? pokemonContext.types : sourceTypes) ?? [];
    const isCalculatedStab = moveType ? offensiveTypeSet.indexOf(moveType) !== -1 : false;
    const generation = (source && state.trackers[source]?.generation) || 4;
    const defensiveEffectiveness = moveType && defensiveTypeSet.length ? calculateMoveEffectiveness(moveType, generation, ...defensiveTypeSet) : 1;

    const ranges = calculateRanges({
      level: Number(level || 0),
      baseStat: baseStats?.[relevantStat] ?? 0,
      evs: Number(trackerEvs),
      combatStages: Number(combatStages),
      movePower: Number(movePower),
      typeEffectiveness: parsedEffectiveness ?? defensiveEffectiveness,
      stab: parsedStab ?? isCalculatedStab,
      opponentStat: parsedOpponentStat ?? pokemonContext.stats?.[opponentRelevantStat] ?? 5,
      opponentLevel: parsedOpponentLevel ?? pokemonContext.level ?? 5,
      opponentCombatStages: Number(opponentCombatStages),
      torrent: torrent === 'true',
      weatherBoosted: weatherBoosted === 'true',
      weatherReduced: weatherReduced === 'true',
      multiTarget: multiTarget === 'true',
      otherModifier: Number(otherModifier),
      generation,
      criticalHit: false,
      offensiveMode,
      friendship: Number(friendship),
      screen: screen === 'true',
      otherPowerModifier: Number(otherPowerModifier),
    });

    const natureSet = calculationSet.confirmedNature || [null, null];
    
    if (hpThreshold !== -1) {
      return filterToStatRange(calculateKillRanges(ranges, hpThreshold), natureSet, relevantStat, calculationSet.ivRanges[relevantStat]);
    }

    return filterToStatRange(combineIdenticalLines(ranges), natureSet, relevantStat, calculationSet.ivRanges[relevantStat]);
  }, [baseStats, calculationSet, relevantStat, level, offensive, trackerEvs, combatStages, movePower, effectiveness, stab, opponentStat, opponentCombatStages, torrent, weatherBoosted, weatherReduced, multiTarget, otherModifier, friendship, opponentLevel, screen, otherPowerModifier, source, state.trackers, opponentRelevantStat, pokemonContext, moveType, hpThreshold]);

  const error = useRef<string | null>(null);

  useEffect(() => {
    if (error.current === null && Object.keys(state.trackers).length > 0) {
      error.current = validateDamageTableValues(state.trackers, source, pokemonContext, movePower, opponentStat);

      if (error.current) dispatch(logRouteError(error.current, position));
    }
  }, [state.trackers, movePower, source, pokemonContext, opponentStat, dispatch, position]);

  if (error.current) return <ErrorCard>{error.current}</ErrorCard>;

  const resultCount = Object.keys(rangeResults).length;
  const isAgainstThreshold = hpThreshold !== -1;

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
            <div>{formatStatName(relevantStat)}</div>
            <div>{isAgainstThreshold ? 'Chance to Kill' : 'Damage'}</div>
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
    background-color: ${({ theme }) => theme.gridHeader.cardFade};
    font-weight: 700;
    padding: 0.25rem 1rem;
  }
`;
