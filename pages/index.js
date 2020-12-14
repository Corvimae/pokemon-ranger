import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import { ExpandedDisplay } from '../components/ExpandedDisplay';
import { CompactDisplay } from '../components/CompactDisplay';

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

  return `${lowExtreme ? `(${lowExtreme}) / ` : ''} ${secondValue === secondToLastValue ? secondValue : `${secondValue} - ${secondToLastValue}`} ${highExtreme ? `/ (${highExtreme})` : ''}`;
}

export default function Home() {
  const [displayExpanded, setDisplayExpanded] = useState(false);
  const [displayRolls, setDisplayRolls] = useState(false);
  
  const [level, setLevel] = useState(5);
  const [baseStat, setBaseStat] = useState(20);
  const [evs, setEVs] = useState(0);
  const [combatStages, setCombatStages] = useState(0);
  const [movePower, setMovePower] = useState(50);
  const [modifier, setModifier] = useState(1)
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
          const damageValues = calculateDamageValues(level, movePower, applyCombatStages(rangeSegment.stat, combatStages), applyCombatStages(opponentStat, opponentCombatStages), modifier);

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
  }, [level, baseStat, evs, movePower, modifier, opponentStat, combatStages, opponentCombatStages]);

  return (
    <Layout>
      <Head>
        <title>Pokémon Ranger</title>
        <link rel="shortcut icon" href="/favicon.png" />
      </Head>
      <Container>
        <div>
          <InputSection>
            <InputSubheader>Pokémon</InputSubheader>
            <InputRow>
              <label>Level</label>
              <input defaultValue={level} onChange={event => setLevel(event.target.value)}/>
            </InputRow>
            
            <InputRow>
              <label>Offensive Base Stat</label>
              <input defaultValue={baseStat} onChange={event => setBaseStat(event.target.value)}/>
            </InputRow>
            
            <InputRow>
              <label>Offensive Stat EVs</label>
              <input defaultValue={evs} onChange={event => setEVs(event.target.value)}/>
            </InputRow>
            
            <InputRow>
              <label>Offensive Combat Stages</label>
              <input defaultValue={combatStages} onChange={event => setCombatStages(event.target.value)}/>
            </InputRow>

            <InputSubheader>Move</InputSubheader>
            <InputRow>
              <label>Move Power</label>
              <input defaultValue={movePower} onChange={event => setMovePower(event.target.value)}/>
            </InputRow>
            <InputRow>
              <label>Modifier</label>
              <input defaultValue={modifier} onChange={event => setModifier(event.target.value)}/>
            </InputRow>

            <InputSubheader>Opponent</InputSubheader>
            <InputRow>
              <label>Defensive Stat</label>
              <input defaultValue={opponentStat} onChange={event => setOpponentStat(event.target.value)}/>
            </InputRow>
            <InputRow>
              <label>Defensive Combat Stages</label>
              <input defaultValue={opponentCombatStages} onChange={event => setOpponentCombatStages(event.target.value)}/>
            </InputRow>
          </InputSection>
        </div>
        <div>
          <ResultsHeader>
            Results
            <div>
              <Button onClick={() => setDisplayExpanded(!displayExpanded)}>{displayExpanded ? 'Show Compact' : 'Show Expanded'}</Button>
              <Button onClick={() => setDisplayRolls(!displayRolls)}>{displayRolls ? 'Hide Rolls' : 'Show Rolls'}</Button>
            </div>
          </ResultsHeader>
          
          {displayExpanded && <ExpandedDisplay results={results} displayRolls={displayRolls} />}
          {!displayExpanded && <CompactDisplay results={results} displayRolls={displayRolls} />}
        </div>
      </Container>
      <Footer>
        Created by <a href="https://twitter.com/Corvimae" target="_blank">@Corvimae</a>.&nbsp;
        <a href="https://github.com/corvimae/pokemon-ranger" target="_blank">View the source.</a>
      </Footer>
    </Layout>
  );
}

const Layout = styled.div`
  display: grid;
  width: 100vw;
  height: 100vh;
  grid-template-rows: 1fr max-content;
`;

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  
  & > div {
    padding: 1rem;
  }
`;

const InputSection = styled.div`
  display: grid;
  grid-template-columns: max-content 1fr;
`;

const InputRow = styled.div`
  display: contents;

  & > label {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 0.5rem;
    padding-right: 0.5rem;
    font-weight: 700;
    line-height: 1.75;
  }

  & > input {
    border-radius: 0.25rem;
    height: 2rem;
    margin: 0 0 0.5rem 0;
    padding: 0.25rem 0.5rem;
    font-size: 1rem;
    border: 1px solid #999;
  }
`;

const InputSubheader = styled.div`
  grid-column: 1 / -1;
  font-size: 1.25rem;
  font-weight: 700;
  color: #666;
  margin: 0.5rem 0;
`;

const ResultsHeader = styled.h2`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.25rem;
  color: #333;
  font-weight: 700;
  margin: 0.5rem 0;
`;

const Button = styled.button`
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  padding: 0.25rem 0.5rem;
  margin: 0;
  background-color: #30b878;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 700;

  &:hover,
  &:active {
    background-color: #4ecf92;
  }

  & + & {
    margin-left: 1rem;
  }
`;

const Footer = styled.div`
  padding: 0.5rem 0.75rem;
  color: #fff;
  background-color: #30b878;

  & > a {
    color: #bceaf5;
  }
`;