import { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Header, InputSection, InputRow } from '../../components/Layout';

export default function Sum() {
  const [rolls1, setRolls1] = useState('');
  const [rolls2, setRolls2] = useState('');
  const [hpThreshold, setHPThreshold] = useState(100);

  const results = useMemo(() => {
    const values1 = rolls1.split(',').map(value => Number(value.trim()));
    const values2 = rolls2.split(',').map(value => Number(value.trim()));

    if(values1.some(Number.isNaN) || !rolls1.trim().length) return { valid: false, message: 'First damage roll input is invalid.' };
    if(values2.some(Number.isNaN) || !rolls2.trim().length) return { valid: false, message: 'Second damage roll input is invalid.' };

    const successfulRolls = values1.reduce((acc, value1) => (
      values2.reduce((acc2, value2) => (
        value1 + value2 >= hpThreshold ? acc2 + 1 : acc2
      ), acc)
    ), 0);
  
    return {
      valid: true,
      successfulRolls,
    };
  }, [rolls1, rolls2, hpThreshold]);

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
        </InputSection>
      </div>
      <div>
        <Header>Results</Header>
        {!results.valid && results.message}
        {results.valid && (
          <div>
            Of 256 possible damage rolls,&nbsp;
            <b>{results.successfulRolls} ({(results.successfulRolls / 2.56).toFixed(2)}%) </b>
            deal at least {hpThreshold} damage.
          </div>
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