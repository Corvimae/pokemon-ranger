import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { NextPage } from 'next';
import { NatureType, Stat, StatLine } from 'relicalc';
import { range } from 'lodash';
import { Card, Disclaimer, Header, InputRow } from '../../components/Layout';
import { Button } from '../../components/Button';
import { setValue, resetState, RunnabilityContext } from '../../reducers/runnability/reducer';

const NON_NEUTRAL_MODIFIER_CHANCE = 4 / 25;
const NEUTRAL_MODIFIER_CHANCE = 1 - (NON_NEUTRAL_MODIFIER_CHANCE * 2);

function statValuesBesidesHP(row: StatLine): number[] {
  return [row.attack, row.defense, row.spAttack, row.spDefense, row.speed];
}

function calculateIVOdds(value: number | 'x' | 'X' | '-'): number {
  if (value === 'x' || value === 'X' || value === '-') return 0;

  return (32 - value) / 32;
}

interface StatInputProps {
  stat: Stat;
  natureModifier: NatureType;
  id?: string;
}

const StatInput: React.FC<StatInputProps> = ({ id, stat, natureModifier }) => {
  const state = RunnabilityContext.useState();
  const dispatch = RunnabilityContext.useDispatch();

  const handleUpdateValue = useCallback(event => {
    dispatch(setValue(stat, natureModifier, event.target.value));
  }, [stat, natureModifier, dispatch]);

  return (
    <div>
      <input
        id={id}
        value={state[natureModifier][stat]}
        onChange={handleUpdateValue}
      />
    </div>
  );
};

const Runnability: NextPage = () => {
  const state = RunnabilityContext.useState();
  const dispatch = RunnabilityContext.useDispatch();

  const handleResetValues = useCallback(() => {
    dispatch(resetState());
  }, [dispatch]);

  const runnabilityPercent = useMemo(() => {
    const negativeOdds = statValuesBesidesHP(state.negative).map(minimumIV => (
      NON_NEUTRAL_MODIFIER_CHANCE * calculateIVOdds(minimumIV)
    ));
    const neutralOdds = statValuesBesidesHP(state.neutral).map(minimumIV => (
      NEUTRAL_MODIFIER_CHANCE * calculateIVOdds(minimumIV)
    ));
    const positiveOdds = statValuesBesidesHP(state.positive).map(minimumIV => (
      NON_NEUTRAL_MODIFIER_CHANCE * calculateIVOdds(minimumIV)
    ));

    const oddsPerStat = range(0, 6).map(index => [
      negativeOdds[index],
      neutralOdds[index],
      positiveOdds[index],
    ].reduce((a, b) => a + b, 0));

    return oddsPerStat.reduce((a, b) => a * b, calculateIVOdds(state.neutral.hp)) * 100;
  }, [state]);

  const hasInvalidIVValue = [
    ...Object.values(state.negative),
    ...Object.values(state.neutral),
    ...Object.values(state.positive),
  ].some(value => value < 0 || value > 31);

  const isResultInvalid = hasInvalidIVValue
    || Number.isNaN(runnabilityPercent)
    || runnabilityPercent < 0
    || runnabilityPercent > 100;

  return (
    <Container>
      <div>
        <Header>
          Runnability Calculator

          <div>
            <Button onClick={handleResetValues}>Reset</Button>
          </div>
        </Header>
        <Disclaimer>
          If no value is allowed, enter &ldquo;x&rdquo; or &ldquo;-&rdquo;.
        </Disclaimer>
        <InputGrid>
          <HeaderRow>
            <div />
            <header>Negative</header>
            <header>Neutral</header>
            <header>Positive</header>
          </HeaderRow>
          <InputRow>
            <label htmlFor="hpInput">HP</label>
            <div />
            <StatInput id="hpInput" stat="hp" natureModifier="neutral" />
            <div />
          </InputRow>
          <InputRow>
            <label htmlFor="minusAttackInput">Attack</label>
            <StatInput id="minusAttackInput" stat="attack" natureModifier="negative" />
            <StatInput stat="attack" natureModifier="neutral" />
            <StatInput stat="attack" natureModifier="positive" />
          </InputRow>
          <InputRow>
            <label htmlFor="minusDefenseInput">Defense</label>
            <StatInput id="minusDefenseInput" stat="defense" natureModifier="negative" />
            <StatInput stat="defense" natureModifier="neutral" />
            <StatInput stat="defense" natureModifier="positive" />
          </InputRow>
          <InputRow>
            <label htmlFor="minusSpAttackInput">Sp. Attack</label>
            <StatInput id="minusSpAttackInput" stat="spAttack" natureModifier="negative" />
            <StatInput stat="spAttack" natureModifier="neutral" />
            <StatInput stat="spAttack" natureModifier="positive" />
          </InputRow>
          <InputRow>
            <label htmlFor="minusSpDefenseInput">Sp. Defense</label>
            <StatInput id="minusSpDefenseInput" stat="spDefense" natureModifier="negative" />
            <StatInput stat="spDefense" natureModifier="neutral" />
            <StatInput stat="spDefense" natureModifier="positive" />
          </InputRow>
          <InputRow>
            <label htmlFor="minusSpeedInput">Speed</label>
            <StatInput id="minusSpeedInput" stat="speed" natureModifier="negative" />
            <StatInput stat="speed" natureModifier="neutral" />
            <StatInput stat="speed" natureModifier="positive" />
          </InputRow>
        </InputGrid>
      </div>
      <div>
        <Header>Results</Header>
        {isResultInvalid && (
          <ResultsCard variant="error">
            One or more IV values are invalid.
          </ResultsCard>
        )}
        {!isResultInvalid && (
          <ResultsCard variant="warning">
            There is a {runnabilityPercent.toFixed(2)}% chance for this Pokémon to have runnable IVs.
          </ResultsCard>
        )}
      </div>
    </Container>
  );
};

export default RunnabilityContext.connect(Runnability);

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  
  & > div {
    padding: 1rem;
  }
`;

const InputGrid = styled.div`
  display: grid;
  grid-template-columns: max-content repeat(3, 1fr);

  & > div > div {
    padding: 0.25rem 0.5rem;
  }
`;

const HeaderRow = styled(InputRow)`
  & > header {
    justify-content: flex-start;
    padding: 0.25rem 0.5rem;
  }
`;

const ResultsCard = styled(Card)`
  padding: 0.5rem 1rem;
`;
