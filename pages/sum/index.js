import { useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { Header, InputSection, InputRow, Button, Checkbox, HelpText, InputSubheader, ResultsGridHeader, ResultsGrid, ResultsRow } from '../../components/Layout';
import { Combination, CartesianProduct } from 'js-combinatorics/umd/combinatorics';

function factorial(value, sum = 1) {
  if (!value || value <= 1) return sum;

  return factorial(value - 1, sum * value);
}
function parseRolls(values) {
  const result = values.split(',').map(value => Number(value.trim()));

  if (result.some(Number.isNaN) || !values.trim().length) return null;

  return result;
}

export default function Sum() {
  const [rolls, setRolls] = useState(['', '']);
  const [hpThreshold, setHPThreshold] = useState(100);
  const [includeCrits, setIncludeCrits] = useState(false);
  const [critMultiplier, setCritMultiplier] = useState(2.0);
  const [critChanceDenominator, setCritChanceDenominator] = useState(16);
  const [adjustedRolls, setAdjustedRolls] = useState(['', '']);

  const handleUpdateRolls = useCallback((event, index) => {
    const updatedRolls = [...rolls];

    updatedRolls[index] = event.target.value;

    setRolls(updatedRolls);
  }, [rolls]);

  const handleUpdateAdjustedRolls = useCallback((event, index) => {
    const updatedAdjustedRolls = [...adjustedRolls];

    updatedAdjustedRolls[index] = event.target.value;

    setAdjustedRolls(updatedAdjustedRolls);
  }, [adjustedRolls]);

  const handleRemoveRoll = useCallback((index) => {
    setRolls(rolls.filter((_value, rollIndex) => rollIndex !== index));
    setAdjustedRolls(adjustedRolls.filter((_value, rollIndex) => rollIndex !== index));
  }, [rolls, adjustedRolls]);

  const handleAddRoll = useCallback(() => {
    setRolls([...rolls, '']);
    setAdjustedRolls([...adjustedRolls, '']);
  }, [rolls, adjustedRolls]);

  const combinationCount = useMemo(() => Math.pow(rolls.map(parseRolls)?.[0]?.length ?? 0, rolls.length), [rolls]);

  const results = useMemo(() => {
    const values = rolls.map(parseRolls);
    const adjustedValues = adjustedRolls.map(parseRolls);

    const invalidRollIndex = values.findIndex(roll => roll === null);

    if (invalidRollIndex !== -1) return { valid: false, message: `Roll input is invalid: ${rolls[invalidRollIndex]}.` };

    const valuesWithAdjustments = values.map((valueSet, index) => (
      valueSet.slice(0, values[0].length).map((value, subIndex) => ({
        value,
        adjusted: adjustedValues[index]?.[subIndex] || value,
        index,
        subIndex,
      }))
    ));
    
    const results = [...new CartesianProduct(...valuesWithAdjustments)].reduce((critAcc, rolls) => [
      ...critAcc,  
      [...Array(rolls.length + 1).keys()].reduce((rollAcc, numCrits) => {
        const combinations = numCrits === rolls.length + 1 ? [rolls] : [...new Combination(rolls, numCrits)];

        const critSuccesses = combinations.reduce((critAcc, critValues) => {
          const nonCritValues = rolls.filter(roll => !critValues.some(critRoll => critRoll.index === roll.index && critRoll.subIndex === roll.subIndex));

          const nonCritDamage = nonCritValues.reduce((acc, { value }) => acc + value, 0);
          const critDamage = critValues.reduce((acc, { value, adjusted }) => acc + Math.trunc((adjusted || value) * critMultiplier), 0);
          
          return critAcc + (nonCritDamage + critDamage >= hpThreshold ? 1 : 0);
        }, 0);

        return [
          ...rollAcc, 
          critSuccesses,
        ];
      }, [])
    ], []);
    
    const summedResults = results.reduce((acc, rollResults) => (
      rollResults.reduce((totals, successes, index) => {
        totals[index] = (totals[index] || 0) + successes;

        return totals;
      }, acc)
    ), []);

    return {
      valid: true,
      values: summedResults,
    }
  }, [rolls, hpThreshold, includeCrits, critMultiplier, critChanceDenominator, adjustedRolls]);

  const critOdds = useMemo(() => {
    const trialSize = rolls.length;
    const critChance = 1 / critChanceDenominator;

    return [...Array(rolls.length + 1).keys()].map(numCrits => ({
      odds: Math.pow(critChance, numCrits) * Math.pow(1 - critChance, trialSize - numCrits),
      binomialCoefficient: factorial(trialSize) / (factorial(numCrits) * factorial(trialSize - numCrits)),
    }));
  }, [rolls, critChanceDenominator]);

  return (
    <Container>
      <div>
        <Header>Damage Sum Calculator</Header>
        <InputSection>
          <InputSubheader>Damage Rolls</InputSubheader>
          {rolls.map((roll, index) => (
            <RemovableInputRow key={index}>
              <input value={roll} onChange={event => handleUpdateRolls(event, index)} />
              {index === 0 ? <div /> : <RemoveButton onClick={() => handleRemoveRoll(index)}>&mdash;</RemoveButton>}
            </RemovableInputRow>
          ))}
          <AddRollRow>
            <Button onClick={handleAddRoll}>+ Add Roll</Button>
          </AddRollRow>

          <InputRow>
            <label>Target HP</label>
            <input value={hpThreshold} onChange={event => setHPThreshold(event.target.value)}/>
          </InputRow>
          <InputRow>
            <label>Include Crits?</label>
            <Checkbox data-checked={includeCrits} onClick={() => setIncludeCrits(!includeCrits)} />
          </InputRow>
          {includeCrits && (
            <>
              <InputRow>
                <label>Crit Chance Denominator</label>
                <input value={critChanceDenominator} onChange={event => setCritChanceDenominator(event.target.value)}/>        
                <HelpText>16 for Gen 2-6, 24 for Gen 7+</HelpText>
              </InputRow>
              <InputRow>
                <label>Crit Multiplier</label>
                <input value={critMultiplier} onChange={event => setCritMultiplier(event.target.value)}/>        
                <HelpText>2.0 for Gen 2-5, 1.5 for Gen 6+</HelpText>
              </InputRow>
              <InputSubheader>Adjusted Damage Rolls</InputSubheader>
              <FullWidthHelpText>
                Critical hits ignore negative offensive combat stages and positive defensive combat stages. If
                this is relevant, you can provide the rolls with neutral combat stages and they will be used
                to calculate critical hits. If left blank, the standard rolls will be used.
              </FullWidthHelpText>
              {rolls.map((_roll, index) => (
                <FullWidthInputRow key={index}>
                  <input
                    value={adjustedRolls[index]}
                    onChange={event => handleUpdateAdjustedRolls(event, index)}
                    placeholder={rolls[index]}
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
              Of {combinationCount} possible {includeCrits && 'critless'} damage rolls,&nbsp;
              <b>{results.values[0]} ({(results.values[0] / combinationCount * 100).toFixed(2)}%) </b>
              deal at least {hpThreshold} damage.
            </div>

            {includeCrits && (
              <>
                <CritData>
                  Including crits,&nbsp;
                  <b>{(results.values.reduce((acc, value, index) => acc + ((value / combinationCount) * critOdds[index]?.odds), 0) * 100).toFixed(2)}% </b>
                  of all possible rolls deal at least {hpThreshold} damage.
                </CritData>
                <ResultsGrid>
                  <ResultsGridHeader>
                    <div>Number of crits</div>
                    <div>Succesful combinations</div>
                    <div>Odds</div>
                  </ResultsGridHeader>
                  {results.values.map((value, index) => (
                    <ResultsRow key={index}>
                      <div>{index}</div>
                      <div>{results.values[index]} of {combinationCount * critOdds[index]?.binomialCoefficient}</div>
                      <div>{((value / combinationCount) * critOdds[index]?.odds * 100).toFixed(2)}%</div>
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
}

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
`

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
  margin: 0 0 0.5rem 1rem;
  height: calc(100% - 0.5rem);

  &:hover,
  &:active {
    background-color: #d4554c;
  }
`;