import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { ExpandedDisplay } from '../components/ExpandedDisplay';
import { CompactDisplay } from '../components/CompactDisplay';
import { Header, InputSection, InputRow, InputSubheader, HelpText, Button, Checkbox } from '../components/Layout';

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

function calculateDamageValues(level, power, attack, defense, modifier) {
  return [...Array(16).keys()].map(randomValue => {
    const levelModifier = Math.trunc(2 * Number(level) / 5) + 2;
    const baseDamage = Math.trunc(Math.trunc(levelModifier * Number(power) * Number(attack) / Number(defense)) / 50) + 2;

    return Math.trunc(Math.trunc(baseDamage * Number(modifier)) * (randomValue / 100 + 0.85));
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
  const [displayExpanded, setDisplayExpanded] = useState(false);
  const [displayRolls, setDisplayRolls] = useState(false);
  const [offensiveMode, setOffensiveMode] = useState(true);
  
  const [level, setLevel] = useState(5);
  const [baseStat, setBaseStat] = useState(20);
  const [evs, setEVs] = useState(0);
  const [combatStages, setCombatStages] = useState(0);
  const [movePower, setMovePower] = useState(50);
  const [typeEffectiveness, setTypeEffectiveness] = useState(1);
  const [stab, setSTAB] = useState(false);
  const [multiTarget, setMultiTarget] = useState(false);
  const [weatherBoosted, setWeatherBoosted] = useState(false);
  const [weatherReduced, setWeatherReduced] = useState(false);
  const [otherModifier, setOtherModifier] = useState(1)
  const [opponentStat, setOpponentStat] = useState(20);
  const [opponentCombatStages, setOpponentCombatStages] = useState(0);

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
          const playerStatAdjusted = applyCombatStages(rangeSegment.stat, Number(combatStages));
          const opponentStatAdjusted = applyCombatStages(opponentStat, Number(opponentCombatStages));

          const combinedModifier = [
            typeEffectiveness,
            stab ? 1.5 : 1,
            multiTarget ? 0.75 : 1,
            weatherBoosted ? 1.5 : 1,
            weatherReduced ? 0.5 : 1,
            otherModifier
          ].reduce((acc, value) => value * acc, 1);
          
          const damageValues = calculateDamageValues(
            level,
            movePower,
            offensiveMode ? playerStatAdjusted : opponentStatAdjusted,
            offensiveMode ? opponentStatAdjusted : playerStatAdjusted,
            combinedModifier
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
  }, [level, baseStat, evs, movePower, typeEffectiveness, stab, multiTarget, weatherBoosted, weatherReduced, otherModifier, opponentStat, combatStages, opponentCombatStages, offensiveMode]);

  return (
    <Container>
      <div>
        <Header>
          {offensiveMode ? 'Offensive' : 'Defensive'} Range Calculator
          <Button onClick={() => setOffensiveMode(!offensiveMode)}>
            Calculate {offensiveMode ? 'Defensive' : 'Offensive'} Ranges
          </Button>
        </Header>

        <InputSection>
          <InputSubheader>Pokémon</InputSubheader>

          {offensiveMode && (
            <InputRow>
              <label>Level</label>
              <input type="number" value={level} onChange={event => setLevel(event.target.value)}/>
            </InputRow>
          )}
          
          <InputRow>
            <label>{offensiveMode ? 'Offensive' : 'Defensive'} Base Stat</label>
            <input type="number" value={baseStat} onChange={event => setBaseStat(event.target.value)}/>
          </InputRow>
          
          <InputRow>
            <label>{offensiveMode ? 'Offensive' : 'Defensive'} Stat EVs</label>
            <input type="number" value={evs} onChange={event => setEVs(event.target.value)}/>
          </InputRow>
          
          <InputRow>
            <label>{offensiveMode ? 'Offensive' : 'Defensive'} Combat Stages</label>
            <input type="number" value={combatStages} onChange={event => setCombatStages(event.target.value)}/>
          </InputRow>

          <InputSubheader>Move</InputSubheader>
          <InputRow>
            <label>Move Power</label>
            <input type="number" value={movePower} onChange={event => setMovePower(event.target.value)}/>
          </InputRow>

          <InputRow>
            <label>Type Effectiveness?</label>
            <select value={typeEffectiveness} onChange={event => setTypeEffectiveness(event.target.value)}>
              <option value={0.25}>&times;0.25</option>
              <option value={0.5}>&times;0.5</option>
              <option value={1}>&times;1</option>
              <option value={2}>&times;2</option>
              <option value={4}>&times;4</option>
            </select>
          </InputRow>

          <InputRow>
            <label>STAB?</label>
            <Checkbox data-checked={stab} onClick={() => setSTAB(!stab)} />
          </InputRow>

          <InputRow>
            <label>Weather Boosted?</label>
            <Checkbox data-checked={weatherBoosted} onClick={() => setWeatherBoosted(!weatherBoosted)} />
            <HelpText>Is this a Water-type move used during rain, or a Fire-type move used during harsh sunlight?</HelpText>
          </InputRow>

          <InputRow>
            <label>Weather Reduced?</label>
            <Checkbox data-checked={weatherReduced} onClick={() => setWeatherReduced(!weatherReduced)} />
            <HelpText>Is this a Water-type move used during harsh sunlight, or a Fire-type move used during rain?</HelpText>
          </InputRow>

          <InputRow>
            <label>Multi Target?</label>
            <Checkbox data-checked={multiTarget} onClick={() => setMultiTarget(!multiTarget)} />
            <HelpText>Only applicable to double and triple battles. Does not work for Gen 3.</HelpText>
          </InputRow>

          <InputRow>
            <label>Other Modifier</label>
            <input type="number" value={otherModifier} onChange={event => setOtherModifier(event.target.value)}/>
            <HelpText>Any additional modifiers that aren't handled by Ranger.</HelpText>
          </InputRow>

          <InputSubheader>Opponent</InputSubheader>     
          {!offensiveMode && (
            <InputRow>
              <label>Level</label>
              <input type="number" value={level} onChange={event => setLevel(event.target.value)}/>
            </InputRow>
          )}
          
          <InputRow>
            <label>{offensiveMode ? 'Defensive' : 'Offensive'} Stat</label>
            <input type="number" value={opponentStat} onChange={event => setOpponentStat(event.target.value)}/>
          </InputRow>

          <InputRow>
            <label>{offensiveMode ? 'Defensive' : 'Offensive'} Combat Stages</label>
            <input type="number" value={opponentCombatStages} onChange={event => setOpponentCombatStages(event.target.value)}/>
          </InputRow>
        </InputSection>
      </div>
      <div>
        <Header>
          Results
          <div>
            <Button onClick={() => setDisplayExpanded(!displayExpanded)}>{displayExpanded ? 'Show Compact' : 'Show Expanded'}</Button>
            <Button onClick={() => setDisplayRolls(!displayRolls)}>{displayRolls ? 'Hide Rolls' : 'Show Rolls'}</Button>
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
