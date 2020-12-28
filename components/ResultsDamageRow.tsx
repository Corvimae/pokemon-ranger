import React, { useCallback, useRef } from 'react';
import styled from 'styled-components';
import { Button } from './Layout';

interface ResultsDamageRowProps {
  values: number[];
};

export const ResultsDamageRow: React.FC<ResultsDamageRowProps> = ({ values }) => {
  const handleCopy = useCallback(() => {
    const copyArea = document.createElement('textarea');

    copyArea.textContent = values.join(',');
    document.body.appendChild(copyArea);

    copyArea.select();
    document.execCommand("copy");
    
    document.body.removeChild(copyArea);
  }, [values]);

  return (
    <Container>
      {values.join(', ')}
      <CopyButton onClick={handleCopy}>Copy</CopyButton>
    </Container>
  );
}

const Container = styled.div`
  grid-column: 1 / -1;
  color: #666;
  font-size: 0.825rem;
  padding: 0.25rem 0.5rem;
`;

const CopyButton = styled(Button)`
  margin-left: 1rem;
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
`;
