import { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Header, InputSection, InputRow, Checkbox, HelpText } from '../../components/Layout';

function parseRolls(values) {
  const result = values.split(',').map(value => Number(value.trim()));

  if (result.some(Number.isNaN) || !values.trim().length) return null;

  return result;
}

export default function Sum() {
  const [rolls1, setRolls1] = useState('');
  const [rolls2, setRolls2] = useState('');
  const [hpThreshold, setHPThreshold] = useState(100);
  const [includeCrits, setIncludeCrits] = useState(false);
  const [critMultiplier, setCritMultiplier] = useState(2.0);
  const [critChanceDenominator, setCritChanceDenominator] = useState(16);
  const [rolls1Adjusted, setRolls1Adjusted] = useState('');
  const [rolls2Adjusted, setRolls2Adjusted] = useState('');

  const results = useMemo(() => {
    const values1 = parseRolls(rolls1);
    const values2 = parseRolls(rolls2);
    const values1Adjusted = parseRolls(rolls1Adjusted) || values1;
    const values2Adjusted = parseRolls(rolls2Adjusted) || values2;

    if (values1 === null) return { valid: false, message: 'First damage roll input is invalid.' };
    if (values2 === null) return { valid: false, message: 'Second damage roll input is invalid.' };

    const {
      successfulRolls,
      successfulWithOneCrit,
      successfulWithTwoCrits
    } = values1.reduce((acc, value1, index1) => (
      values2.reduce((acc2, value2, index2) => ({
        successfulRolls: acc2.successfulRolls + (value1 + value2 >= hpThreshold ? 1 : 0),
        successfulWithOneCrit:
          acc2.successfulWithOneCrit + (values1Adjusted[index1] * critMultiplier + value2 >= hpThreshold || value1 + values2Adjusted[index2] * critMultiplier >= hpThreshold ? 1 : 0),
        successfulWithTwoCrits:
          acc2.successfulWithTwoCrits + (values1Adjusted[index1]  * critMultiplier + values2Adjusted[index2] * critMultiplier >= hpThreshold ? 1 : 0),
      }), acc)
    ), { successfulRolls: 0, successfulWithOneCrit: 0, successfulWithTwoCrits: 0 });
  
    const critChance = 1 / critChanceDenominator;
    const noCritChance = 1 - critChance;
    
    const critlessSuccessOdds = (successfulRolls / 2.56) * Math.pow(noCritChance, 2);
    const oneCritSuccessOdds = (successfulWithOneCrit / 2.56) * critChance * noCritChance * 2;
    const twoCritSuccessOdds = (successfulWithTwoCrits / 2.56) * Math.pow(critChance, 2);

    return {
      valid: true,
      successfulRolls,
      successfulWithOneCrit,
      successfulWithTwoCrits,
      successfulCritPercentage: critlessSuccessOdds + oneCritSuccessOdds + twoCritSuccessOdds,
    };
  }, [rolls1, rolls2, hpThreshold, includeCrits, critMultiplier, critChanceDenominator, rolls1Adjusted, rolls2Adjusted]);

  return (
    <Container>
      <div>
        <Header>Damage Sum Calculator</Header>
        <InputSection>
          <InputRow>
            <label>First Damage Rolls</label>
            <input value={rolls1} onChange={event => setRolls1(event.target.value)}/>
          </InputRow>
          <InputRow>
            <label>Second Damage Rolls</label>
            <input value={rolls2} onChange={event => setRolls2(event.target.value)}/>
          </InputRow>
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
              <InputRow>
                <label>First Damage Rolls (Combat Stage Adjusted)</label>
                <input value={rolls1Adjusted} onChange={event => setRolls1Adjusted(event.target.value)}/>
                <HelpText>
                  Critical hits ignore negative offensive combat stages and positive defensive combat stages. If
                  this is relevant, you can provide the rolls with neutral combat stages and they will be used
                  to calculate critical hits. If left blank, the standard rolls will be used.
                </HelpText>
              </InputRow>
              <InputRow>
                <label>Second Damage Rolls (Combat Stage Adjusted)</label>
                <input value={rolls2Adjusted} onChange={event => setRolls2Adjusted(event.target.value)}/>
              </InputRow>            
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
              Of 256 possible {includeCrits && 'critless'} damage rolls,&nbsp;
              <b>{results.successfulRolls} ({(results.successfulRolls / 2.56).toFixed(2)}%) </b>
              deal at least {hpThreshold} damage.
            </div>

            {includeCrits && (
              <CritData>
                Including crits, <b>{results.successfulCritPercentage.toFixed(2)}%</b> of all
                possible rolls deal at least {hpThreshold} damage.
              </CritData>
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
  margin-top: 1rem;
`;