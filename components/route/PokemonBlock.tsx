import React, { useMemo } from 'react';
import styled from 'styled-components';
import { logRouteError, RouteContext } from '../../reducers/route/reducer';
import { calculateStat } from '../../utils/calculations';
import { Nature, NATURES, StatLine, STATS } from '../../utils/constants';
import { TypeName } from '../../utils/pokemonTypes';
import { getNatureMultiplier, parseStatLine, parseTypeDefinition } from '../../utils/trackerCalculations';
import { BorderlessCard, Card, ContainerLabel } from '../Layout';

export interface PokemonStatContext {
  level?: number;
  stats?: StatLine;
  types?: TypeName[];
}

export const PokemonBlockContext = React.createContext<PokemonStatContext>({});

interface PokemonBlockProps {
  info?: string;
  infoColor?: string;
  level?: string;
  baseStats?: string;
  ivs?: string;
  evs?: string;
  stats?: string;
  nature?: string;
  type?: string;
  position?: string;
}

export const PokemonBlock: React.FC<PokemonBlockProps> = ({
  info,
  infoColor,
  level: rawLevel,
  baseStats: rawBaseStats,
  ivs: rawIVs,
  evs: rawEVs,
  stats: rawStats,
  type,
  nature,
  position,
  children,
}) => {
  const dispatch = RouteContext.useDispatch();

  const level = Number(rawLevel ?? 0);
  const baseStats = useMemo(() => parseStatLine(
    rawBaseStats ?? '[0,0,0,0,0,0]',
    error => dispatch(logRouteError(error, position)),
  ), [rawBaseStats, dispatch, position]);
  const ivs = useMemo(() => parseStatLine(
    rawIVs ?? '[0,0,0,0,0,0]',
    error => dispatch(logRouteError(error, position)),
  ), [rawIVs, dispatch, position]);
  const evs = useMemo(() => parseStatLine(
    rawEVs ?? '[0,0,0,0,0,0]',
    error => dispatch(logRouteError(error, position)),
  ), [rawEVs, dispatch, position]);
  const stats = useMemo(() => parseStatLine(
    rawStats ?? '[0,0,0,0,0,0]',
    error => dispatch(logRouteError(error, position)),
  ), [rawStats, dispatch, position]);

  const natureDefinition = useMemo(() => {
    if (nature) {
      const matchingNature = NATURES[nature.toLowerCase() as Nature];

      if (!matchingNature) {
        dispatch(logRouteError(`${nature} is not a valid nature.`, position));

        return NATURES.hardy;
      }

      return matchingNature;
    }
    return NATURES.hardy;
  }, [nature, dispatch, position]);

  const types = useMemo(() => parseTypeDefinition(
    type || '',
    invalidSegment => {
      dispatch(logRouteError(`Invalid type definition for Pokémon block: ${invalidSegment}.`, position));
    },
  ), [type, dispatch, position]);

  const calculatedStats = useMemo(() => {
    if (stats.hp !== 0 || stats.attack !== 0 || stats.defense !== 0 || stats.spAttack !== 0 || stats.spDefense !== 0 || stats.speed !== 0) {
      return stats;
    }

    if (!rawBaseStats) return undefined;

    return STATS.reduce((acc, stat) => ({
      ...acc,
      [stat]: calculateStat(
        level,
        baseStats[stat],
        ivs[stat],
        evs[stat],
        getNatureMultiplier(stat, natureDefinition),
      ),
    }), {}) as StatLine;
  }, [level, stats, baseStats, ivs, evs, natureDefinition, rawBaseStats]);

  const blockContext = useMemo(() => ({
    level,
    types,
    stats: calculatedStats,
  }), [level, calculatedStats, types]);

  return (
    <Container info={info} infoColor={infoColor}>
      <PokemonBlockContext.Provider value={blockContext}>
        {children}
      </PokemonBlockContext.Provider>
    </Container>
  );
};

const Container = styled.div<{ info?: string; infoColor?: string; }>`
  padding-left: 3rem;
  margin-left: -0.5rem;
  border-left: 4px solid #717dbe;

  & > ${ContainerLabel} {
    margin-left: -2rem;
    font-size: 1rem;
    font-weight: 700;

    & + * {
      margin-top: 0.5rem;
    }

    &:after {
      content: ${props => props.info && `"${props.info}"`};
      color: ${props => props.theme.info[props.infoColor ?? 'black']};
      margin-left: 1rem;
      font-weight: 400;
      font-size: 1rem;
    }
  }

  & > ul,
  & > ${Card} > ul,
  & > ${BorderlessCard} > ul {
    padding-left: 0;
  }

  & ul {
    line-height: 1.65;
    list-style-type: none;
  }

  & > ${BorderlessCard}:last-child {
    margin-bottom: 1rem;
  }
`;
