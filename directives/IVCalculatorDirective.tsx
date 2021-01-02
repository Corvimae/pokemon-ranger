import React, { useEffect, useMemo, useRef } from 'react';
import { registerTracker, RouteContext } from '../reducers/route/reducer';
import { EVsByLevel, StatLine } from '../reducers/route/types';
import { splitOnLastElement } from '../utils/utils';

export interface EVSegment {
  startingLevel: number;
  evsByLevel: EVsByLevel;
}

const EV_SECTION_REGEX = /^([1-9][0-9]*):/g;

interface IVCalculatorDirectiveProps {
  species?: string;
  baseStats?: string;
  contents?: string;
}

function arrayToStatRow([hp, attack, defense, spAttack, spDefense, speed]: number[]): StatLine {
  return { hp, attack, defense, spAttack, spDefense, speed };
}

export const IVCalculatorDirective: React.FC<IVCalculatorDirectiveProps> = ({ species, baseStats: rawBaseStats, contents }) => {
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

  const evSegments = useMemo(() => {
    const lines = (contents ?? '').split('\n').map(line => line.trim());
    
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
      dispatch(registerTracker(species ?? '<no name specified>', baseStats, evSegments));
      hasRegistered.current = true;
    }
  }, [dispatch, species, baseStats, evSegments]);
  
  return null;
};
