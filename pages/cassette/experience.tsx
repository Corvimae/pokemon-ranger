import { NextPage } from 'next';
import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { Header, HelpText, InputRow, InputSection, InputSubheader } from '../../components/Layout';
import { CassetteBeastsExperienceContext, setOpponentCharacterExpYield, setOpponentFormExpYield, setOpponentLevel, setSelfExpBaseLevel, setSelfExpGradient, setSelfLevel, useCassetteBeastsExperienceReducer } from '../../reducers/cassette/reducer';

// From BattleFormulas.gd
function getExperienceToLevel(level: number, expGradient: number, expBaseLevel: number) {
  const expPoints = expGradient * (level / 5) + expBaseLevel;

  return Math.floor(expPoints ** 3);
}

function getExperienceYieldInner(level: number, formExpYield: number, characterExpYield: number) {
  const effectiveLevel = Math.floor(((75 + level) * level) / 96) + 1;
    
  return Math.floor(((formExpYield + characterExpYield) * effectiveLevel * 2) / 35);
}

function getExperienceYield(level: number, formExpYield: number, characterExpYield: number) {
  const threshold = 20;

  if (level >= threshold) {
    return Math.floor(getExperienceYieldInner(level, formExpYield, characterExpYield));
  }

  const target = getExperienceYieldInner(threshold, formExpYield, characterExpYield);
  const start = getExperienceYieldInner(level, formExpYield, characterExpYield);

  return Math.floor(start + Math.floor((target - start) / 3));
}

const CassetteBeastsExpCalculator: NextPage = () => {
  const [state, dispatch] = useCassetteBeastsExperienceReducer();

  const handleSetOpponentLevel = useCallback(event => (
    dispatch(setOpponentLevel(Number(event.target.value)))
  ), [dispatch]);

  const handleSetOpponentFormExpYield = useCallback(event => (
    dispatch(setOpponentFormExpYield(Number(event.target.value)))
  ), [dispatch]);

  const handleSetOpponentCharacterExpYield = useCallback(event => (
    dispatch(setOpponentCharacterExpYield(Number(event.target.value)))
  ), [dispatch]);

  const handleSetSelfLevel = useCallback(event => (
    dispatch(setSelfLevel(Number(event.target.value)))
  ), [dispatch]);

  const handleSetSelfExpGradient = useCallback(event => (
    dispatch(setSelfExpGradient(Number(event.target.value)))
  ), [dispatch]);

  const handleSetSelfExpBaseLevel = useCallback(event => (
    dispatch(setSelfExpBaseLevel(Number(event.target.value)))
  ), [dispatch]);

  const yieldedExperience = useMemo(() => (
    getExperienceYield(state.opponentLevel, state.opponentFormExpYield, state.opponentCharacterExpYield)
  ), [state.opponentCharacterExpYield, state.opponentFormExpYield, state.opponentLevel]);

  const experienceForPreviousLevel = useMemo(() => {
    if (state.selfLevel <= 1) return 0;

    return getExperienceToLevel(state.selfLevel - 1, state.selfExpGradient, state.selfExpBaseLevel);
  }, [state.selfExpBaseLevel, state.selfExpGradient, state.selfLevel]);

  const experienceForLevel = useMemo(() => (
    getExperienceToLevel(state.selfLevel, state.selfExpGradient, state.selfExpBaseLevel)
  ), [state.selfExpBaseLevel, state.selfExpGradient, state.selfLevel]);

  return (
    <Container>
      <div>
        <InputSection>
          <InputSubheader>Experience Yield</InputSubheader>
          <InputRow>
            <label htmlFor="opponentLevel">Opponent Level</label>
            <input id="opponentLevel" type="number" value={state.opponentLevel} onChange={handleSetOpponentLevel} />
          </InputRow>
          <InputRow>
            <label htmlFor="opponentCharacterExpYield">Opponent Character Experience Yield</label>
            <input id="opponentCharacterExpYield" type="number" value={state.opponentCharacterExpYield} onChange={handleSetOpponentCharacterExpYield} />
            <HelpText>For random encounters, this value is 80.</HelpText>
          </InputRow>
          <InputRow>
            <label htmlFor="opponentFormExpYield">Opponent Species Experience Yield</label>
            <input id="opponentFormExpYield" type="number" value={state.opponentFormExpYield} onChange={handleSetOpponentFormExpYield} />
          </InputRow>
        </InputSection>
      </div>
      <div>
        <Header>Experience Yield Results</Header>
        <p>Yields <b>{yieldedExperience}</b> experience.</p>
      </div>
      <Divider />
      <div>
        <InputSection>
          <InputSubheader>Experience to Level</InputSubheader>
          <InputRow>
            <label htmlFor="selfLevel">Level</label>
            <input id="selfLevel" type="number" value={state.selfLevel} onChange={handleSetSelfLevel} />
          </InputRow>
          <InputRow>
            <label htmlFor="selfExpGradient">Experience Gradient</label>
            <input id="selfExpGradient" type="number" value={state.selfExpGradient} onChange={handleSetSelfExpGradient} />
          </InputRow>
          <InputRow>
            <label htmlFor="selfExpBaseLevel">Base Experience Level</label>
            <input id="selfExpBaseLevel" type="number" value={state.selfExpBaseLevel} onChange={handleSetSelfExpBaseLevel} />
          </InputRow>
        </InputSection>
      </div>
      <div>
        <Header>Experience to Level Results</Header>
        <p>Level {state.selfLevel} requires <b>{experienceForLevel}</b> experience.</p>
        {state.selfLevel > 1 && (
          <p>
            Going from level {state.selfLevel - 1} to {state.selfLevel} requires <b>{experienceForLevel - experienceForPreviousLevel}</b> experience.
          </p>
        )}
      </div>
    </Container>
  );
};

export default CassetteBeastsExperienceContext.connect(CassetteBeastsExpCalculator);

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  
  & > div {
    padding: 1rem;
  }
`;

const Divider = styled.div`
  grid-column: 1 / -1;
  height: 1px;
  background-color: ${({ theme }) => theme.label};

  && {
    padding: 0;
  }
`;
