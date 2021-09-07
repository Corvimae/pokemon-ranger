import React, { useEffect, useMemo, useRef } from 'react';
import { registerTracker, RouteContext } from '../reducers/route/reducer';
import { EVsByLevel, StatLine } from '../reducers/route/types';
import { Nature } from '../utils/constants';
import { splitOnLastElement } from '../utils/utils';

export interface EVSegment {
  startingLevel: number;
  evsByLevel: EVsByLevel;
}

const EV_SECTION_REGEX = /^([1-9][0-9]*):/g;

interface IVCalculatorDirectiveProps {
  species?: string;
  baseStats?: string;
  generation?: string;
  contents?: string;
  hiddenPower?: string;
  hpIV?: string;
  attackIV?: string;
  defenseIV?: string;
  spAttackIV?: string;
  spDefenseIV?: string;
  speedIV?: string;
  nature: string;
}

function arrayToStatRow([hp, attack, defense, spAttack, spDefense, speed]: number[]): StatLine {
  return { hp, attack, defense, spAttack, spDefense, speed };
}

export const IVCalculatorDirective: React.FC<IVCalculatorDirectiveProps> = ({
  species,
  baseStats: rawBaseStats,
  generation,
  hiddenPower,
  contents,
  hpIV,
  attackIV,
  defenseIV,
  spAttackIV,
  spDefenseIV,
  speedIV,
  nature,
}) => {
  const dispatch = RouteContext.useDispatch();

  const hasRegistered = useRef(false);

  const baseStats = useMemo(() => {
    try {
      return JSON.parse(rawBaseStats || '').map(arrayToStatRow);
    } catch {
      console.error(`Unable to pase base stats: ${rawBaseStats}`);

      return arrayToStatRow([0, 0, 0, 0, 0, 0]);
    }
  }, [rawBaseStats]);

  const staticIVs = useMemo(() => {
    const ivArray = [hpIV, attackIV, defenseIV, spAttackIV, spDefenseIV, speedIV]
      .map(iv => iv ? parseInt(iv, 10) : -1)
      .map(iv => Number.isNaN(iv) ? -1 : iv);

    return arrayToStatRow(ivArray);
  }, [hpIV, attackIV, defenseIV, spAttackIV, spDefenseIV, speedIV]);

  const evSegments = useMemo(() => {
    const lines = (contents ?? '').split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    const segments = lines.reduce<EVSegment[]>((acc, line) => {
      const match = EV_SECTION_REGEX.exec(line);

      if (match) {
        const newSection = {
          startingLevel: Number(match[1]),
          evsByLevel: {},
        };

        return [...acc, newSection];
      }

      const [remainingSections, lastSection] = splitOnLastElement(acc);
      
      const [level, evs] = line.split('->');

      if (!lastSection) throw new Error('Invalid EV definition: must lead with a starting level directive.');

      const stats = evs.split('#')[0].split(',').map(segment => Number(segment.trim()));
      return [
        ...remainingSections,
        {
          ...lastSection,
          evsByLevel: {
            ...lastSection.evsByLevel,
            [Number(level)]: arrayToStatRow(stats),
          },
        },
      ];
    }, []);

    return segments.reduce((acc, { startingLevel, evsByLevel }) => ({
      ...acc,
      [startingLevel]: evsByLevel,
    }), {});
  }, [contents]);

  useEffect(() => {
    if (!hasRegistered.current) {
      dispatch(registerTracker(
        species ?? '<no name specified>',
        baseStats,
        generation === 'lgpe' ? 'lgpe' : Number(generation || 4),
        hiddenPower === 'true',
        evSegments,
        staticIVs,
        nature?.toLowerCase() as Nature,
      ));
      hasRegistered.current = true;
    }
  }, [dispatch, species, baseStats, hiddenPower, evSegments, generation, staticIVs, nature]);
  
  return null;
};
