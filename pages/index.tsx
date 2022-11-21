import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { NextPage } from 'next';
import { calculateDamageRanges } from 'relicalc';
import { ExpandedDisplay } from '../components/ExpandedDisplay';
import { CompactDisplay } from '../components/CompactDisplay';
import { Header, InputSection, InputRow, InputSubheader, HelpText, Checkbox, Card } from '../components/Layout';
import { Button } from '../components/Button';
import { resetState, setAdaptability, setBaseStat, setChoiceItem, setCombatStages, setCriticalHit, setDisplayMode, setDisplayRolls, setEVs, setFriendship, setGeneration, setHealthThreshold, setLevel, setMovePower, setMultiTarget, setOffensiveMode, setOpponentCombatStages, setOpponentLevel, setOpponentStat, setOpponentStatModifier, setOtherModifier, setOtherPowerModifier, setScreen, setSTAB, setStatModifier, setTerastallized, setTorrent, setTypeEffectiveness, setWeatherBoosted, setWeatherReduced, useRangerReducer } from '../reducers/ranger/reducer';
import { OneShotDisplay } from '../components/OneShotDisplay';
import { DisplayMode } from '../reducers/ranger/types';
import { DisplayModeToggle } from '../components/DisplayModeToggle';

const Home: NextPage = () => {
  const [state, dispatch] = useRangerReducer();
  const [calculationError, setCalculationError] = useState<string | null>(null);

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
  const handleSetGeneration = useCallback(event => {
    dispatch(setGeneration(event.target.value === 'lgpe' ? event.target.value : Number(event.target.value)));
  }, [dispatch]);
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
  const handleSetFriendship = useCallback(event => dispatch(setFriendship(Number(event.target.value))), [dispatch]);
  const handleSetScreen = useCallback(() => dispatch(setScreen(!state.screen)), [state.screen, dispatch]);
  const handleSetChoiceItem = useCallback(() => dispatch(setChoiceItem(!state.choiceItem)), [state.choiceItem, dispatch]);
  const handleSetAdaptability = useCallback(() => dispatch(setAdaptability(!state.adaptability)), [state.adaptability, dispatch]);
  const handleSetTerastallized = useCallback(() => dispatch(setTerastallized(!state.terastallized)), [state.terastallized, dispatch]);
  const handleSetOtherPowerModifier = useCallback(event => dispatch(setOtherPowerModifier(Number(event.target.value))), [dispatch]);
  const handleSetStatModifier = useCallback(event => dispatch(setStatModifier(Number(event.target.value))), [dispatch]);
  const handleSetOpponentStatModifier = useCallback(event => dispatch(setOpponentStatModifier(Number(event.target.value))), [dispatch]);

  const results = useMemo(() => {
    try {
      const ranges = calculateDamageRanges(state);

      setCalculationError(null);

      return ranges;
    } catch (e) {
      setCalculationError((e as Error).message);

      return [];
    }
  }, [state]);

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
            <label htmlFor="level">Level</label>
            <input id="level" type="number" value={state.level} onChange={handleSetLevel} />
          </InputRow>

          <InputRow>
            <label htmlFor="playerBaseStat">{playerStatPrefix} Base Stat</label>
            <input id="playerBaseStat" type="number" value={state.baseStat} onChange={handleSetBaseStat} />
          </InputRow>

          <InputRow>
            <label htmlFor="evs">{playerStatPrefix} Stat {state.generation === 'lgpe' ? 'AVs' : 'EVs'}</label>
            <input id="evs" type="number" value={state.evs} onChange={handleSetEVs} />
          </InputRow>

          <InputRow>
            <label htmlFor="playerCombatStages">{playerStatPrefix} Combat Stages</label>
            <input id="playerCombatStages" type="number" value={state.combatStages} onChange={handleSetCombatStages} />
          </InputRow>

          <InputRow>
            <label htmlFor="playerStatModifier">{playerStatPrefix} Stat Modifier</label>
            <input id="playerStatModifier" type="number" value={state.statModifier} onChange={handleSetStatModifier} />
            <HelpText>
              Any additional modifiers to the Pokémon&apos;s stat that aren&apos;t handled by Ranger, such as Huge Power.
              This value is a multiplier; if you don&apos;t need a miscellaneous stat modifier, set it to 1.
            </HelpText>
          </InputRow>

          {state.generation === 'lgpe' && (
          <InputRow>
            <label htmlFor="friendship">Friendship</label>
            <input id="friendship" type="number" value={state.friendship} onChange={handleSetFriendship} />
          </InputRow>
          )}

          <InputSubheader>Move</InputSubheader>
          <InputRow>
            <label htmlFor="movePower">Move Power</label>
            <input id="movePower" type="number" value={state.movePower} onChange={handleSetMovePower} />
          </InputRow>

          <InputRow>
            <label htmlFor="typeEffectiveness">Type Effectiveness</label>
            <select id="typeEffectiveness" value={state.typeEffectiveness} onChange={handleSetTypeEffectiveness}>
              <option value={0.25}>&times;0.25</option>
              <option value={0.5}>&times;0.5</option>
              <option value={1}>&times;1</option>
              <option value={2}>&times;2</option>
              <option value={4}>&times;4</option>
            </select>
          </InputRow>

          <InputRow>
            <label htmlFor="stab">STAB?</label>
            <Checkbox id="stab" data-checked={state.stab} onClick={handleSetSTAB} />
          </InputRow>

          {state.generation === 9 && (
            <InputRow>
              <label htmlFor="terastallized">Terastallized?</label>
              <Checkbox id="terastallized" data-checked={state.terastallized} onClick={handleSetTerastallized} />
              <HelpText>
                This modifier only applies if the move matches the attacker&apos;s Tera type.
              </HelpText>
            </InputRow>
          )}

          <InputRow>
            <label htmlFor="otherPowerModifier">Base Power Modifier</label>
            <input id="otherPowerModifier" type="number" value={state.otherPowerModifier} onChange={handleSetOtherPowerModifier} />
            <HelpText>
              Any additional modifiers to the base power that aren&apos;t handled by Ranger, such as held items.
              This value is a multiplier; if you don&apos;t need a miscellaneous power modifier, set it to 1.
            </HelpText>
          </InputRow>

          <InputSubheader>Opponent</InputSubheader>
          {!state.offensiveMode && (
          <InputRow>
            <label htmlFor="opponentLevel">Level</label>
            <input id="opponentLevel" type="number" value={state.opponentLevel} onChange={handleSetOpponentLevel} />
          </InputRow>
          )}

          <InputRow>
            <label htmlFor="opponentStat">{opponentStatPrefix} Stat</label>
            <input id="opponentStat" type="number" value={state.opponentStat} onChange={handleSetOpponentStat} />
          </InputRow>

          <InputRow>
            <label htmlFor="opponentCombatStages">{opponentStatPrefix} Combat Stages</label>
            <input id="opponentCombatStages" type="number" value={state.opponentCombatStages} onChange={handleSetOpponentCombatStages} />
          </InputRow>

          <InputRow>
            <label htmlFor="opponentStatModifier">{opponentStatPrefix} Stat Modifier</label>
            <input id="opponentStatModifier" type="number" value={state.opponentStatModifier} onChange={handleSetOpponentStatModifier} />
            <HelpText>
              Any additional modifiers to the opponent Pokémon&apos;s stat that aren&apos;t handled by Ranger, such as Huge Power.
              This value is a multiplier; if you don&apos;t need a miscellaneous stat modifier, set it to 1.
            </HelpText>
          </InputRow>

          <InputSubheader>Modifiers</InputSubheader>

          <InputRow>
            <label htmlFor="criticalHit">Critical Hit?</label>
            <Checkbox id="criticalHit" data-checked={state.criticalHit} onClick={handleSetCriticalHit} />
            <HelpText>Critical hits deal 2&times; damage in Gen 3&ndash;5 and 1.5&times; damage in Gen 6+.</HelpText>
          </InputRow>

          <InputRow>
            <label htmlFor="torrent">Torrent/Overgrow/Blaze?</label>
            <Checkbox id="torrent" data-checked={state.torrent} onClick={handleSetTorrent} />
            <HelpText>These abilities double the base power in Gen 3&ndash;4, and boost Attack or Sp. Attack by 50% in Gen 5+.</HelpText>
          </InputRow>

          <InputRow>
            <label htmlFor="screen">Screen Active?</label>
            <Checkbox id="screen" data-checked={state.screen} onClick={handleSetScreen} />
            <HelpText>Does the defender have Reflect up and is the attacker using a physical move, or does the defender have Light Screen up and the attacker is using a special move?</HelpText>
          </InputRow>

          <InputRow>
            <label htmlFor="weatherBoosted">Weather Boosted?</label>
            <Checkbox id="weatherBoosted" data-checked={state.weatherBoosted} onClick={handleSetWeatherBoosted} />
            <HelpText>Is this a Water-type move used during rain, or a Fire-type move used during harsh sunlight?</HelpText>
          </InputRow>

          <InputRow>
            <label htmlFor="weatherReduced">Weather Reduced?</label>
            <Checkbox id="weatherReduced" data-checked={state.weatherReduced} onClick={handleSetWeatherReduced} />
            <HelpText>Is this a Water-type move used during harsh sunlight, or a Fire-type move used during rain?</HelpText>
          </InputRow>

          <InputRow>
            <label htmlFor="multiTarget">Multi Target?</label>
            <Checkbox id="multiTarget" data-checked={state.multiTarget} onClick={handleSetMultiTarget} />
            <HelpText>Only applicable to double and triple battles. For Gen 3, only select this if using a move that targets all adjacent foes.</HelpText>
          </InputRow>

          <InputRow>
            <label htmlFor="choiceItem">Choice Band/Specs?</label>
            <Checkbox id="choiceItem" data-checked={state.choiceItem} onClick={handleSetChoiceItem} />
            <HelpText>Is the attacker using a physical move and holding the Choice Band, or using a special move and holding the Choice Specs?</HelpText>
          </InputRow>

          <InputRow>
            <label htmlFor="adaptibility">Adaptability</label>
            <Checkbox id="adaptibility" data-checked={state.adaptability} onClick={handleSetAdaptability} />
            <HelpText>Does the attacker have the ability Adaptability?</HelpText>
          </InputRow>

          <InputRow>
            <label htmlFor="otherModifier">Other Modifier</label>
            <input id="otherModifier" type="number" value={state.otherModifier} onChange={handleSetOtherModifier} />
            <HelpText>
              Any additional modifiers that aren&apos;t handled by Ranger.
              This value is a multiplier; if you don&apos;t need a miscellaneous modifier, set it to 1.
            </HelpText>
          </InputRow>

          <InputSubheader>Settings</InputSubheader>
          <InputRow>
            <label htmlFor="generation">Generation</label>
            <select id="generation" value={state.generation} onChange={handleSetGeneration}>
              <option value={3}>3 (Ruby/Sapphire/Emerald)</option>
              <option value={4}>4 (Diamond/Pearl/Platinum)</option>
              <option value={5}>5 (Black/White and Black 2/White 2)</option>
              <option value={6}>6-8 (X/Y, (Ultra) Sun/Moon, Sword/Shield)</option>
              <option value={9}>9 (Scarlet/Violet)</option>
              <option value="lgpe">Let&apos;s Go</option>
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
        {state.generation === 9 && (
          <Card variant="warning">
            <p>
              Gen 9 calculations may not perfectly match in-game damage until further research is
              done to verify Ranger&apos;s implementation of Gen 9 mechanics.
            </p>
          </Card>
        )}
        {calculationError && (
        <Card variant="error">
          <h3>Unable to calculate damage ranges.</h3>
          <p>{calculationError}</p>
        </Card>
        )}

        {!calculationError && state.displayMode === 'expanded' && <ExpandedDisplay results={results} displayRolls={state.displayRolls} />}
        {!calculationError && state.displayMode === 'compact' && <CompactDisplay results={results} displayRolls={state.displayRolls} />}
        {!calculationError && state.displayMode === 'ohko' && (
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
};

export default Home;

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  
  & > div {
    padding: 1rem;
  }
`;
