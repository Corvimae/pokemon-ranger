import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { ExpandedDisplay } from '../components/ExpandedDisplay';
import { CompactDisplay } from '../components/CompactDisplay';
import { Header, InputSection, InputRow, InputSubheader, HelpText, Button, Checkbox } from '../components/Layout';
import { resetState, setBaseStat, setCombatStages, setCriticalHit, setDisplayMode, setDisplayRolls, setEVs, setGeneration, setHealthThreshold, setLevel, setMovePower, setMultiTarget, setOffensiveMode, setOpponentCombatStages, setOpponentLevel, setOpponentStat, setOtherModifier, setSTAB, setTorrent, setTypeEffectiveness, setWeatherBoosted, setWeatherReduced, useRangerReducer } from '../reducers/ranger/reducer';
import { calculateRanges } from '../utils/calculations';
import { OneShotDisplay } from '../components/OneShotDisplay';
import { DisplayMode } from '../reducers/ranger/types';
import { DisplayModeToggle } from '../components/DisplayModeToggle';

export default function Home() {
  const [state, dispatch] = useRangerReducer();

  const handleResetValues = useCallback(() => {
    dispatch(resetState());
  }, [dispatch]);

  const handleSetDisplayMode = useCallback((mode: DisplayMode) => dispatch(setDisplayMode(mode)), [dispatch]);
  const handleSetDisplayRolls = useCallback(() => dispatch(setDisplayRolls(!state.displayRolls)), [state.displayRolls, dispatch]);
  const handleSetOffensiveMode = useCallback(() => dispatch(setOffensiveMode(!state.offensiveMode)), [state.offensiveMode, dispatch]);

  const handleSetLevel = useCallback(event => dispatch(setLevel(Number(event.target.value))), [dispatch]);
  const handleSetBaseStat = useCallback(event => dispatch(setBaseStat(Number(event.target.value))), [dispatch]);
  const handleSetEVs = useCallback(event => dispatch(setEVs(Number(event.target.value))), [dispatch]);
  const handleSetCombatStages = useCallback(event => dispatch(setCombatStages(Number(event.target.value))), [dispatch]);
  const handleSetMovePower = useCallback(event => dispatch(setMovePower(Number(event.target.value))), [dispatch]);
  const handleSetTypeEffectiveness = useCallback(event => dispatch(setTypeEffectiveness(Number(event.target.value))), [dispatch]);
  const handleSetSTAB = useCallback(() => dispatch(setSTAB(!state.stab)), [state.stab, dispatch]);
  const handleSetGeneration = useCallback(event => dispatch(setGeneration(Number(event.target.value))), [dispatch]);
  const handleSetCriticalHit = useCallback(() => dispatch(setCriticalHit(!state.criticalHit)), [state.criticalHit, dispatch]);
  const handleSetTorrent = useCallback(() => dispatch(setTorrent(!state.torrent)), [state.torrent, dispatch]);
  const handleSetMultiTarget = useCallback(() => dispatch(setMultiTarget(!state.multiTarget)), [state.multiTarget, dispatch]);
  const handleSetWeatherBoosted = useCallback(() => dispatch(setWeatherBoosted(!state.weatherBoosted)), [state.weatherBoosted, dispatch]);
  const handleSetWeatherReduced = useCallback(() => dispatch(setWeatherReduced(!state.weatherReduced)), [state.weatherReduced, dispatch]);
  const handleSetOtherModifier = useCallback(event => dispatch(setOtherModifier(Number(event.target.value))), [dispatch]);
  const handleSetOpponentStat = useCallback(event => dispatch(setOpponentStat(Number(event.target.value))), [dispatch]);
  const handleSetOpponentLevel = useCallback(event => dispatch(setOpponentLevel(Number(event.target.value))), [dispatch]);
  const handleSetOpponentCombatStages = useCallback(event => dispatch(setOpponentCombatStages(Number(event.target.value))), [dispatch]);
  const handleSetHealthThreshold = useCallback(event => dispatch(setHealthThreshold(Number(event.target.value))), [dispatch]);

  const results = useMemo(() => calculateRanges(state), [state]);

  const playerStatPrefix = state.offensiveMode ? 'Offensive' : 'Defensive';
  const opponentStatPrefix = state.offensiveMode ? 'Defensive' : 'Offensive';

  return (
    <Container>
      <div>
        <Header>
          {playerStatPrefix} Range Calculator
          <div>
            <Button onClick={handleResetValues}>Reset</Button>
            <Button onClick={handleSetOffensiveMode}>
              Calculate {state.offensiveMode ? 'Defensive' : 'Offensive'} Ranges
            </Button>
          </div>
        </Header>

        <InputSection>
          <InputSubheader>Pokémon</InputSubheader>

          <InputRow>
            <label>Level</label>
            <input type="number" value={state.level} onChange={handleSetLevel}/>
          </InputRow>
          
          <InputRow>
            <label>{playerStatPrefix} Base Stat</label>
            <input type="number" value={state.baseStat} onChange={handleSetBaseStat}/>
          </InputRow>
          
          <InputRow>
            <label>{playerStatPrefix} Stat EVs</label>
            <input type="number" value={state.evs} onChange={handleSetEVs}/>
          </InputRow>
          
          <InputRow>
            <label>{playerStatPrefix} Combat Stages</label>
            <input type="number" value={state.combatStages} onChange={handleSetCombatStages}/>
          </InputRow>

          <InputSubheader>Move</InputSubheader>
          <InputRow>
            <label>Move Power</label>
            <input type="number" value={state.movePower} onChange={handleSetMovePower}/>
          </InputRow>

          <InputRow>
            <label>Type Effectiveness</label>
            <select value={state.typeEffectiveness} onChange={handleSetTypeEffectiveness}>
              <option value={0.25}>&times;0.25</option>
              <option value={0.5}>&times;0.5</option>
              <option value={1}>&times;1</option>
              <option value={2}>&times;2</option>
              <option value={4}>&times;4</option>
            </select>
          </InputRow>

          <InputRow>
            <label>STAB?</label>
            <Checkbox data-checked={state.stab} onClick={handleSetSTAB} />
          </InputRow>

          <InputSubheader>Opponent</InputSubheader>     
          {!state.offensiveMode && (
            <InputRow>
              <label>Level</label>
              <input type="number" value={state.opponentLevel} onChange={handleSetOpponentLevel} />
            </InputRow>
          )}
          
          <InputRow>
            <label>{opponentStatPrefix} Stat</label>
            <input type="number" value={state.opponentStat} onChange={handleSetOpponentStat}/>
          </InputRow>

          <InputRow>
            <label>{opponentStatPrefix} Combat Stages</label>
            <input type="number" value={state.opponentCombatStages} onChange={handleSetOpponentCombatStages}/>
          </InputRow>

          <InputSubheader>Modifiers</InputSubheader>

          <InputRow>
            <label>Critical Hit?</label>
            <Checkbox data-checked={state.criticalHit} onClick={handleSetCriticalHit} />
            <HelpText>Critical hits deal 2&times; damage in Gen 3&ndash;5 and 1.5&times; damage in Gen 6+.</HelpText>
          </InputRow>

          <InputRow>
            <label>Torrent/Overgrow/Blaze?</label>
            <Checkbox data-checked={state.torrent} onClick={handleSetTorrent} />
            <HelpText>These abilities double the base power in Gen 3&ndash;4, and boost Attack or Sp. Attack by 50% in Gen 5+.</HelpText>
          </InputRow>

          <InputRow>
            <label>Weather Boosted?</label>
            <Checkbox data-checked={state.weatherBoosted} onClick={handleSetWeatherBoosted} />
            <HelpText>Is this a Water-type move used during rain, or a Fire-type move used during harsh sunlight?</HelpText>
          </InputRow>

          <InputRow>
            <label>Weather Reduced?</label>
            <Checkbox data-checked={state.weatherReduced} onClick={handleSetWeatherReduced} />
            <HelpText>Is this a Water-type move used during harsh sunlight, or a Fire-type move used during rain?</HelpText>
          </InputRow>

          <InputRow>
            <label>Multi Target?</label>
            <Checkbox data-checked={state.multiTarget} onClick={handleSetMultiTarget} />
            <HelpText>Only applicable to double and triple battles. For Gen 3, only select this if using a move that targets all adjacent foes.</HelpText>
          </InputRow>

          <InputRow>
            <label>Other Modifier</label>
            <input type="number" value={state.otherModifier} onChange={handleSetOtherModifier}/>
            <HelpText>Any additional modifiers that aren't handled by Ranger.</HelpText>
          </InputRow>

          <InputSubheader>Settings</InputSubheader>
          <InputRow>
            <label>Generation</label>
            <select value={state.generation} onChange={handleSetGeneration}>
              <option value={3}>3 (Ruby/Sapphire/Emerald)</option>
              <option value={4}>4 (Diamond/Pearl/Platinum)</option>
              <option value={5}>5 (Black/White and Black 2/White 2)</option>
              <option value={6}>6+ (X/Y and beyond)</option>
            </select>
            <HelpText>The Gen 3 damage formula is slightly different than the Gen 4+ formula. Critical hits deal less damage in Gen 6+.</HelpText>
          </InputRow>
        </InputSection>
      </div>
      <div>
        <Header>
          Results
          <div>
            <DisplayModeToggle displayMode={state.displayMode} setDisplayMode={handleSetDisplayMode} />
            <Button onClick={handleSetDisplayRolls}>{state.displayRolls ? 'Hide Rolls' : 'Show Rolls'}</Button>
          </div>
        </Header>

        {state.displayMode === 'expanded' && <ExpandedDisplay results={results} displayRolls={state.displayRolls} />}
        {state.displayMode === 'compact' && <CompactDisplay results={results} displayRolls={state.displayRolls} />}
        {state.displayMode === 'ohko' && (
          <OneShotDisplay
            results={results}
            healthThreshold={state.healthThreshold}
            setHealthThreshold={handleSetHealthThreshold}
            displayRolls={state.displayRolls}
          />
        )}
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
