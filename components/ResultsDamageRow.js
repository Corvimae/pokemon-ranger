import React, { useCallback } from 'react';
import styled from 'styled-components';
import { Button } from './Layout';

export const ResultsDamageRow = ({ values }) => {
  const handleCopy = useCallback(() => {
    navigator.permissions.query({ name: 'clipboard-write' }).then(result => {
      if (result.state === 'granted' || result.state === 'prompt') {
        navigator.clipboard.writeText(values.join(','));
      }
    });
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