import React from 'react';
import styled from 'styled-components';

interface InlineInfoProps {
  color?: string;
}

export const InlineInfo: React.FC<InlineInfoProps> = ({ color = 'black', children }) => (
  <Container color={color}>{children}</Container>
);

const Container = styled.span<{ color: string }>`
  margin-left: 1rem;
  color: ${props => props.theme.info[props.color]};

  p > &:only-child {
    margin-left: 0;
  }

  h3 > &,
  h4 > & {
    font-weight: 400;
    font-size: 1rem;
  }
`;
