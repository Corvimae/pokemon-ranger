import React from 'react';
import styled from 'styled-components';

const COLORS = {
  red: '#a02c2c',
  blue: '#2626a8',
  green: '#2a8f2a',
  gray: '#686868',
  pink: '#af32a5',
} as const;

type InfoColor = keyof typeof COLORS;

interface InlineInfoProps {
  color?: InfoColor;
}

export const InlineInfo: React.FC<InlineInfoProps> = ({ color = 'gray', children }) => (
  <Container color={color}>{children}</Container>
);

const Container = styled.span<{ color: InfoColor }>`
  margin-left: 1rem;
  color: ${props => COLORS[props.color]};

  p > &:only-child {
    margin-left: 0;
  }

  h3 > &,
  h4 > & {
    font-weight: 400;
    font-size: 1rem;
  }
`;
