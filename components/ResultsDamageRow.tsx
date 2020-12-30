import React, { useCallback } from 'react';
import styled from 'styled-components';
import { Button } from './Button';

interface ResultsDamageRowProps {
  values: number[];
  className?: string;
};

export const ResultsDamageRow: React.FC<ResultsDamageRowProps> = ({ values, className }) => {
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(values.join(','));
  }, [values]);

  return (
    <Container className={className} data-range-excluded={true}>
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
