import React, { useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { NextPage } from 'next';
import { calculateCombinedDamage, CombinedDamageOdds } from 'relicalc';
import { Header, InputSection, InputRow, Checkbox, HelpText, InputSubheader, ResultsGridHeader, ResultsGrid, ResultsRow } from '../../components/Layout';
import { Button } from '../../components/Button';
import { resetState, useSumReducer, setAdjustedRoll, setRoll, removeRoll, addRoll, setHPThreshold, setCritMultiplier, setCritChanceDenominator, setIncludeCrits } from '../../reducers/sum/reducer';

type RollResults = { valid: false; message: string; } | { valid: true, values: CombinedDamageOdds[] };

function parseRolls(values: string): number[] | null {
  const result = values.split(',').map(value => Number(value.trim()));

  if (result.some(Number.isNaN) || !values.trim().length) return null;

  return result;
}

const Sum: NextPage = () => {
  const [state, dispatch] = useSumReducer();

  const handleResetValues = useCallback(() => {
    dispatch(resetState());
  }, [dispatch]);

  const handleUpdateRoll = useCallback((event, index) => {
    dispatch(setRoll(event.target.value, index));
  }, [dispatch]);

  const handleUpdateAdjustedRoll = useCallback((event, index) => {
    dispatch(setAdjustedRoll(event.target.value, index));
  }, [dispatch]);

  const handleSetIncludeCrits = useCallback(() => {
    dispatch(setIncludeCrits(!state.includeCrits));
  }, [dispatch, state.includeCrits]);

  const handleSetHPThreshold = useCallback(event => {
    dispatch(setHPThreshold(Number(event.target.value)));
  }, [dispatch]);

  const handleSetCritMultiplier = useCallback(event => {
    dispatch(setCritMultiplier(Number(event.target.value)));
  }, [dispatch]);

  const handleSetCritChanceDenominator = useCallback(event => {
    dispatch(setCritChanceDenominator(Number(event.target.value)));
  }, [dispatch]);

  const handleRemoveRoll = useCallback(index => {
    dispatch(removeRoll(index));
  }, [dispatch]);

  const handleAddRoll = useCallback(() => {
    dispatch(addRoll());
  }, [dispatch]);

  const combinationCount = useMemo(() => (
    (state.rolls.map(parseRolls)?.[0]?.length ?? 0) ** state.rolls.length
  ), [state.rolls]);

  const results = useMemo<RollResults>(() => {
    const values = state.rolls.map(parseRolls) as number[][];
    const adjustedValues = state.adjustedRolls.map(parseRolls);

    const invalidRollIndex = values.findIndex(roll => roll === null);

    if (invalidRollIndex !== -1) return { valid: false, message: `Roll input is invalid: ${state.rolls[invalidRollIndex]}.` };

    return {
      valid: true,
      values: calculateCombinedDamage(
        values,
        state.hpThreshold,
        {
          critAdjustedValues: adjustedValues,
          critChanceDenominator: state.critChanceDenominator,
          critMultiplier: state.critMultiplier,
        },
      ),
    };
  }, [state]);

  return (
    <Container>
      <div>
        <Header>
          Damage Sum Calculator
          <div>
            <Button onClick={handleResetValues}>Reset</Button>
          </div>
        </Header>
        <InputSection>
          <InputSubheader>Damage Rolls</InputSubheader>
          {state.rolls.map((roll, index) => (
            <RemovableInputRow key={index}>
              {index === 0 ? <div /> : <RemoveButton onClick={() => handleRemoveRoll(index)}>&mdash;</RemoveButton>}
              <input value={roll} onChange={event => handleUpdateRoll(event, index)} />
            </RemovableInputRow>
          ))}
          <AddRollRow>
            <Button onClick={handleAddRoll}>+ Add Roll</Button>
          </AddRollRow>

          <InputRow>
            <label htmlFor="targetHP">Target HP</label>
            <input id="targetHP" value={state.hpThreshold} onChange={handleSetHPThreshold} />
          </InputRow>
          <InputRow>
            <label htmlFor="includeCrits">Include Crits?</label>
            <Checkbox id="includeCrits" data-checked={state.includeCrits} onClick={handleSetIncludeCrits} />
          </InputRow>
          {state.includeCrits && (
            <>
              <InputRow>
                <label htmlFor="critChanceDenominator">Crit Chance Denominator</label>
                <input
                  id="critChanceDenominator"
                  value={state.critChanceDenominator}
                  onChange={handleSetCritChanceDenominator}
                />
                <HelpText>16 for Gen 2-6, 24 for Gen 7+</HelpText>
              </InputRow>
              <InputRow>
                <label htmlFor="critMultiplier">Crit Multiplier</label>
                <input type="number" id="critMultiplier" value={state.critMultiplier} onChange={handleSetCritMultiplier} />
                <HelpText>2.0 for Gen 2-5, 1.5 for Gen 6+</HelpText>
              </InputRow>
              <InputSubheader>Adjusted Damage Rolls</InputSubheader>
              <FullWidthHelpText>
                Critical hits ignore negative offensive combat stages and positive defensive combat stages. If
                this is relevant, you can provide the rolls with neutral combat stages and they will be used
                to calculate critical hits. If left blank, the standard rolls will be used.
              </FullWidthHelpText>
              {state.rolls.map((_roll, index) => (
                <FullWidthInputRow key={index}>
                  <input
                    value={state.adjustedRolls[index]}
                    onChange={event => handleUpdateAdjustedRoll(event, index)}
                    placeholder={state.rolls[index]}
                  />
                </FullWidthInputRow>
              ))}
            </>
          )}

        </InputSection>
      </div>
      <div>
        <Header>Results</Header>
        {!results.valid && results.message}
        {results.valid && (
          <>
            <div>
              Of {combinationCount} possible {state.includeCrits && 'critless'} damage rolls,&nbsp;
              <b>{results.values[0].successes} ({((results.values[0].successes / combinationCount) * 100).toFixed(2)}%) </b>
              deal at least {state.hpThreshold} damage.
            </div>

            {state.includeCrits && (
              <>
                <CritData>
                  Including crits,&nbsp;
                  <b>{(results.values.reduce((acc, value) => acc + ((value.successes / combinationCount) * value.odds), 0) * 100).toFixed(2)}% </b>
                  of all possible rolls deal at least {state.hpThreshold} damage.
                </CritData>
                <ResultsGrid>
                  <ResultsGridHeader>
                    <div>Number of crits</div>
                    <div>Succesful combinations</div>
                    <div>Odds</div>
                  </ResultsGridHeader>
                  {results.values.map(value => (
                    <ResultsRow key={value.critCount}>
                      <div>{value.critCount}</div>
                      <div>{value.successes} of {combinationCount * value.binomialCoefficient}</div>
                      <div>
                        {((value.successes / combinationCount) * value.odds * 100).toFixed(2)}%
                      </div>
                    </ResultsRow>
                  ))}
                </ResultsGrid>
              </>
            )}
          </>
        )}
      </div>
    </Container>
  );
};

export default Sum;

const Container = styled.div`
    display: grid;
  grid-template-columns: 1fr 1fr;
  
  & > div {
    padding: 1rem;
  }
`;

const CritData = styled.div`
  margin: 1rem 0;
`;

const FullWidthHelpText = styled(HelpText)`
  grid-column: span 2;
`;

const FullWidthInputRow = styled(InputRow)`
  display: block;
  grid-column: 1 / -1;

  & > input {
    width: 100%;
  }
`;

const AddRollRow = styled(FullWidthInputRow)`
  margin-bottom: 1rem;
`;

const RemovableInputRow = styled(FullWidthInputRow)`
  display: flex;
  align-items: center;
  grid-column: span 2;

  & > input {
    min-width: 0;
    flex-shrink: 1;
    align-self: stretch;
  }
`;

const RemoveButton = styled(Button)`
  background-color: #c20d00;
  margin: 0 1rem 0.5rem 0;
  height: calc(100% - 0.5rem);

  &:hover,
  &:active {
    background-color: #d4554c;
  }
`;
