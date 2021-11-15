import React, { useEffect, useMemo, useRef } from 'react';
import { Nature, NATURES } from 'relicalc';
import { logRouteError, registerTracker, RouteContext } from '../reducers/route/reducer';
import { EVsByLevel } from '../reducers/route/types';
import { arrayToStatLine, parseTypeDefinition } from '../utils/trackerCalculations';
import { splitOnLastElement } from '../utils/utils';

export interface EVSegment {
  startingLevel: number;
  evsByLevel: EVsByLevel;
}

const EV_SECTION_REGEX = /^\s*([1-9][0-9]*):\s*$/;

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
  directInput?: string;
  directInputNatures?: string;
  type?: string;
  position?: string;
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
  directInput,
  directInputNatures,
  type: rawTypes,
  position,
}) => {
  const dispatch = RouteContext.useDispatch();

  const hasRegistered = useRef(false);

  const baseStats = useMemo(() => {
    try {
      return JSON.parse(rawBaseStats || '[]').map(arrayToStatLine);
    } catch {
      dispatch(logRouteError(`Unable to parse base stats for ${species}: ${rawBaseStats}`, position));

      return arrayToStatLine([0, 0, 0, 0, 0, 0]);
    }
  }, [rawBaseStats, dispatch, species, position]);

  const types = useMemo(() => parseTypeDefinition(
    rawTypes || '',
    invalidSegment => {
      dispatch(logRouteError(`Invalid type definition for ${species}: ${invalidSegment}.`, position));
    },
  ), [rawTypes, species, dispatch, position]);

  const staticIVs = useMemo(() => {
    const ivArray = [hpIV, attackIV, defenseIV, spAttackIV, spDefenseIV, speedIV]
      .map(iv => iv ? parseInt(iv, 10) : -1)
      .map(iv => Number.isNaN(iv) ? -1 : iv);

    return arrayToStatLine(ivArray);
  }, [hpIV, attackIV, defenseIV, spAttackIV, spDefenseIV, speedIV]);

  const parsedDirectInputNatures = useMemo(() => {
    try {
      let natures = JSON.parse(directInputNatures || '[]') as string[];

      if (!Array.isArray(natures)) {
        dispatch(logRouteError('directInputNatures must be a JSON array.', position));

        return [];
      }

      natures = natures.map(value => value.toLowerCase());

      const invalidNature = natures.find(value => Object.keys(NATURES).indexOf(value) === -1);

      if (invalidNature) {
        dispatch(logRouteError(`The direct input nature value ${invalidNature} is not a valid nature.`, position));

        return [];
      }

      return natures as Nature[];
    } catch {
      dispatch(logRouteError(`Unable to parse direct input natures: ${directInputNatures}`, position));

      return [];
    }
  }, [directInputNatures, dispatch, position]);

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

      if (!lastSection) {
        dispatch(logRouteError('Invalid EV definition: must lead with a starting level directive.'));

        return acc;
      }

      const stats = evs.split('#')[0].split(',').map(segment => Number(segment.trim()));
      return [
        ...remainingSections,
        {
          ...lastSection,
          evsByLevel: {
            ...lastSection.evsByLevel,
            [Number(level)]: arrayToStatLine(stats),
          },
        },
      ];
    }, []);

    return segments.reduce((acc, { startingLevel, evsByLevel }) => ({
      ...acc,
      [startingLevel]: evsByLevel,
    }), {});
  }, [contents, dispatch]);

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
        directInput?.toLowerCase() === 'true',
        parsedDirectInputNatures,
        types,
      ));
      hasRegistered.current = true;
    }
  }, [dispatch, species, baseStats, hiddenPower, evSegments, generation, staticIVs, nature, directInput, parsedDirectInputNatures, types]);
  
  return null;
};
