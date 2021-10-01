import React, { useCallback } from 'react';
import styled from 'styled-components';
import { Button } from './Button';

interface ResultsDamageRowProps {
  values: number[];
  className?: string;
}

export const ResultsDamageRow: React.FC<ResultsDamageRowProps> = ({ values, className }) => {
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(values.join(','));
  }, [values]);

  return (
    <Container className={className} data-range-excluded>
      {values.join(', ')}
      <CopyButton onClick={handleCopy}>Copy</CopyButton>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  grid-column: 1 / -1;
  color: ${({ theme }) => theme.label};
  font-size: 0.825rem;
  margin: 0.25rem 0 0 0;
  padding: 0.25rem 0.5rem;
  font-variant-numeric: tabular-nums;
  justify-content: flex-end;
  align-items: center;
  color: ${({ theme }) => theme.label};

  &:hover {
    background-color: ${({ theme }) => theme.backgroundSelected};
    color: ${({ theme }) => theme.foreground};
  }
`;

const CopyButton = styled(Button)`
  margin-left: 1rem;
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
`;
