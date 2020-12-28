import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { ExpandedDisplay } from '../components/ExpandedDisplay';
import { CompactDisplay } from '../components/CompactDisplay';
import { Header, InputSection, InputRow, InputSubheader, HelpText, Button, Checkbox } from '../components/Layout';
import { resetState, setBaseStat, setCombatStages, setDisplayExpanded, setDisplayRolls, setEVs, setGeneration, setLevel, setMovePower, setMultiTarget, setOffensiveMode, setOpponentCombatStages, setOpponentLevel, setOpponentStat, setOtherModifier, setSTAB, setTypeEffectiveness, setWeatherBoosted, setWeatherReduced, useRangerReducer } from '../reducers/rangerReducer';

const NATURE_MODIFIERS = [
  {
    name: 'Negative Nature',
    modifier: 0.9,
  },
  {
    name: 'Neutral Nature',
    modifier: 1,
  },
  {
    name: 'Positive Nature',
    modifier: 1.1,
  }
]

function calculateStat(level, base, iv, ev, modifier) {
  return Math.floor((Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5) * modifier);
}

function applyCombatStages(stat, combatStages) {
  if (combatStages === 0) return stat;

  if (combatStages > 0) return Math.floor(stat * ((combatStages + 2) / 2));

  return Math.floor(stat * (2 / (Math.abs(combatStages) + 2)));
}

function calculateDamageValues(level, power, attack, defense, preRandModifiers, postRandModifiers) {
  return [...Array(16).keys()].map(randomValue => {
    const levelModifier = Math.trunc(2 * Number(level) / 5) + 2;
    const baseDamage = Math.trunc(Math.floor(levelModifier * Number(power) * Number(attack) / Number(defense)) / 50) + 2;

    return [...preRandModifiers, (85 + randomValue) / 100, ...postRandModifiers].reduce((acc, modifier) => (
      Math.trunc(acc * Number(modifier))
    ), baseDamage);
  });
}

function formatDamageRange(values) {
  const firstValue = values[0];
  const secondValue = values[1];
  const secondToLastValue = values[values.length - 2];
  const lastValue = values[values.length - 1];

  if (firstValue === lastValue) return firstValue;

  const lowExtreme = firstValue !== secondValue && firstValue;
  const highExtreme = secondToLastValue !== lastValue && lastValue;

  return `${lowExtreme ? `(${lowExtreme}) / ` : ''} ${secondValue === secondToLastValue ? secondValue : `${secondValue}–${secondToLastValue}`} ${highExtreme ? `/ (${highExtreme})` : ''}`;
}

export default function Home() {
  const [{
    displayExpanded,
    displayRolls,
    offensiveMode,
    level,
    baseStat,
    evs,
    combatStages,
    movePower,
    typeEffectiveness,
    stab,
    generation,
    multiTarget,
    weatherBoosted,
    weatherReduced,
    otherModifier,
    opponentStat,
    opponentLevel,
    opponentCombatStages,
  }, dispatch] = useRangerReducer();

  const handleResetValues = useCallback(() => {
    dispatch(resetState());
  }, [dispatch]);

  const handleSetDisplayExpanded = useCallback(() => dispatch(setDisplayExpanded(!displayExpanded)), [displayExpanded, dispatch]);
  const handleSetDisplayRolls = useCallback(() => dispatch(setDisplayRolls(!displayRolls)), [displayRolls, dispatch]);
  const handleSetOffensiveMode = useCallback(() => dispatch(setOffensiveMode(!offensiveMode)), [offensiveMode, dispatch]);

  const handleSetLevel = useCallback(event => dispatch(setLevel(event.target.value)), [dispatch]);
  const handleSetBaseStat = useCallback(event => dispatch(setBaseStat(event.target.value)), [dispatch]);
  const handleSetEVs = useCallback(event => dispatch(setEVs(event.target.value)), [dispatch]);
  const handleSetCombatStages = useCallback(event => dispatch(setCombatStages(event.target.value)), [dispatch]);
  const handleSetMovePower = useCallback(event => dispatch(setMovePower(event.target.value)), [dispatch]);
  const handleSetTypeEffectiveness = useCallback(event => dispatch(setTypeEffectiveness(event.target.value)), [dispatch]);
  const handleSetSTAB = useCallback(() => dispatch(setSTAB(!stab)), [stab, dispatch]);
  const handleSetGeneration = useCallback(event => dispatch(setGeneration(event.target.value)), [dispatch]);
  const handleSetMultiTarget = useCallback(() => dispatch(setMultiTarget(!multiTarget)), [multiTarget, dispatch]);
  const handleSetWeatherBoosted = useCallback(() => dispatch(setWeatherBoosted(!weatherBoosted)), [weatherBoosted, dispatch]);
  const handleSetWeatherReduced = useCallback(() => dispatch(setWeatherReduced(!weatherReduced)), [weatherReduced, dispatch]);
  const handleSetOtherModifier = useCallback(event => dispatch(setOtherModifier(event.target.value)), [dispatch]);
  const handleSetOpponentStat = useCallback(event => dispatch(setOpponentStat(event.target.value)), [dispatch]);
  const handleSetOpponentLevel = useCallback(event => dispatch(setOpponentLevel(event.target.value)), [dispatch]);
  const handleSetOpponentCombatStages = useCallback(event => dispatch(setOpponentCombatStages(event.target.value)), [dispatch]);

  const results = useMemo(() => {
    return NATURE_MODIFIERS.map(natureModifierData => {
      const possibleStats = [...Array(32).keys()].map(possibleIV => calculateStat(level, baseStat, possibleIV, evs, natureModifierData.modifier));

      // Combine stats into ranges of like values.
      const rangeSegments = possibleStats.reduce((acc, statValue, iv) => {
        const lastValue = acc[acc.length - 1];

        if (lastValue?.stat === statValue) {
          return [
            ...acc.slice(0, acc.length - 1),
            {
              ...lastValue,
              to: iv,  
            }
          ]; 
        } else {
          return [...acc, {
            stat: statValue,
            from: iv,
            to: iv
          }];
        }
      }, []);

      return {
        name: natureModifierData.name,
        rangeSegments: rangeSegments.map(rangeSegment => {
          const playerStatAdjusted = applyCombatStages(Number(rangeSegment.stat), Number(combatStages));
          const opponentStatAdjusted = applyCombatStages(Number(opponentStat), Number(opponentCombatStages));
          
          const stabAndTypeEffectivenessModifier = [
            stab ? 1.5 : 1,
            typeEffectiveness,
          ];

          const damageValues = calculateDamageValues(
            offensiveMode ? level : opponentLevel,
            movePower,
            offensiveMode ? playerStatAdjusted : opponentStatAdjusted,
            offensiveMode ? opponentStatAdjusted : playerStatAdjusted,
            [ 
              multiTarget ? (generation === 3 ? 0.5 : 0.75) : 1,
              weatherBoosted ? 1.5 : 1,
              weatherReduced ? 0.5 : 1,
              ...(generation === 3 ? stabAndTypeEffectivenessModifier : []),
            ],
            [
              ...(generation === 3 ? [] : stabAndTypeEffectivenessModifier),
              otherModifier
            ]
          );

          return {
            ...rangeSegment,
            damageValues,
            damageRangeOutput: formatDamageRange(damageValues),
            minDamage: Math.min(...damageValues),
            maxDamage: Math.max(...damageValues),
          };
        }),
      };
    });
  }, [level, baseStat, evs, movePower, typeEffectiveness, stab, generation, multiTarget, weatherBoosted, weatherReduced, otherModifier, opponentStat, combatStages, opponentCombatStages, opponentLevel, offensiveMode]);

  return (
    <Container>
      <div>
        <Header>
          {offensiveMode ? 'Offensive' : 'Defensive'} Range Calculator
          <div>
            <Button onClick={handleResetValues}>Reset</Button>
            <Button onClick={handleSetOffensiveMode}>
              Calculate {offensiveMode ? 'Defensive' : 'Offensive'} Ranges
            </Button>
          </div>
        </Header>

        <InputSection>
          <InputSubheader>Pokémon</InputSubheader>

          <InputRow>
            <label>Level</label>
            <input type="number" value={level} onChange={handleSetLevel}/>
          </InputRow>
          
          <InputRow>
            <label>{offensiveMode ? 'Offensive' : 'Defensive'} Base Stat</label>
            <input type="number" value={baseStat} onChange={handleSetBaseStat}/>
          </InputRow>
          
          <InputRow>
            <label>{offensiveMode ? 'Offensive' : 'Defensive'} Stat EVs</label>
            <input type="number" value={evs} onChange={handleSetEVs}/>
          </InputRow>
          
          <InputRow>
            <label>{offensiveMode ? 'Offensive' : 'Defensive'} Combat Stages</label>
            <input type="number" value={combatStages} onChange={handleSetCombatStages}/>
          </InputRow>

          <InputSubheader>Move</InputSubheader>
          <InputRow>
            <label>Move Power</label>
            <input type="number" value={movePower} onChange={handleSetMovePower}/>
          </InputRow>

          <InputRow>
            <label>Type Effectiveness</label>
            <select value={typeEffectiveness} onChange={handleSetTypeEffectiveness}>
              <option value={0.25}>&times;0.25</option>
              <option value={0.5}>&times;0.5</option>
              <option value={1}>&times;1</option>
              <option value={2}>&times;2</option>
              <option value={4}>&times;4</option>
            </select>
          </InputRow>

          <InputRow>
            <label>STAB?</label>
            <Checkbox data-checked={stab} onClick={handleSetSTAB} />
          </InputRow>

          <InputRow>
            <label>Generation</label>
            <select value={generation} onChange={handleSetGeneration}>
              <option value={3}>3</option>
              <option value={4}>4&ndash;6</option>
              <option value={6}>6+</option>
            </select>
            <HelpText>The Gen 3 damage formula is slightly different than the Gen 4+ formula. Critical hits deal less damage in Gen 6+.</HelpText>
          </InputRow>

          <InputRow>
            <label>Weather Boosted?</label>
            <Checkbox data-checked={weatherBoosted} onClick={handleSetWeatherBoosted} />
            <HelpText>Is this a Water-type move used during rain, or a Fire-type move used during harsh sunlight?</HelpText>
          </InputRow>

          <InputRow>
            <label>Weather Reduced?</label>
            <Checkbox data-checked={weatherReduced} onClick={handleSetWeatherReduced} />
            <HelpText>Is this a Water-type move used during harsh sunlight, or a Fire-type move used during rain?</HelpText>
          </InputRow>

          <InputRow>
            <label>Multi Target?</label>
            <Checkbox data-checked={multiTarget} onClick={handleSetMultiTarget} />
            <HelpText>Only applicable to double and triple battles. For Gen 3, only select this if using a move that targets all adjacent foes.</HelpText>
          </InputRow>

          <InputRow>
            <label>Other Modifier</label>
            <input type="number" value={otherModifier} onChange={handleSetOtherModifier}/>
            <HelpText>Any additional modifiers that aren't handled by Ranger.</HelpText>
          </InputRow>

          <InputSubheader>Opponent</InputSubheader>     
          {!offensiveMode && (
            <InputRow>
              <label>Level</label>
              <input type="number" value={opponentLevel} onChange={handleSetOpponentLevel} />
            </InputRow>
          )}
          
          <InputRow>
            <label>{offensiveMode ? 'Defensive' : 'Offensive'} Stat</label>
            <input type="number" value={opponentStat} onChange={handleSetOpponentStat}/>
          </InputRow>

          <InputRow>
            <label>{offensiveMode ? 'Defensive' : 'Offensive'} Combat Stages</label>
            <input type="number" value={opponentCombatStages} onChange={handleSetOpponentCombatStages}/>
          </InputRow>
        </InputSection>
      </div>
      <div>
        <Header>
          Results
          <div>
            <Button onClick={handleSetDisplayExpanded}>{displayExpanded ? 'Show Compact' : 'Show Expanded'}</Button>
            <Button onClick={handleSetDisplayRolls}>{displayRolls ? 'Hide Rolls' : 'Show Rolls'}</Button>
          </div>
        </Header>
        
        {displayExpanded && <ExpandedDisplay results={results} displayRolls={displayRolls} />}
        {!displayExpanded && <CompactDisplay results={results} displayRolls={displayRolls} />}
      </div>
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  
  & > div {
    padding: 1rem;
  }
`;
