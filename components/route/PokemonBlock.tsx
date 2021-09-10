import React from 'react';
import styled from 'styled-components';
import { BorderlessCard, Card, ContainerLabel } from '../Layout';

interface PokemonBlockProps {
  info?: string;
  infoColor?: string;
}

export const PokemonBlock: React.FC<PokemonBlockProps> = ({ info, infoColor, children }) => (
  <Container info={info} infoColor={infoColor}>
    {children}
  </Container>
);

const Container = styled.div<{ info?: string; infoColor?: string; }>`
  padding-left: 3rem;
  margin-left: -0.5rem;
  border-left: 4px solid #717dbe;

  & > ${ContainerLabel} {
    margin-left: -2rem;
    font-size: 1rem;
    font-weight: 700;

    & + * {
      margin-top: 0.5rem;
    }

    &:after {
      content: ${props => props.info && `"${props.info}"`};
      color: ${props => props.theme.info[props.infoColor ?? 'black']};
      margin-left: 1rem;
      font-weight: 400;
      font-size: 1rem;
    }
  }

  & > ul,
  & > ${Card} > ul,
  & > ${BorderlessCard} > ul {
    padding-left: 0;
  }

  & ul {
    line-height: 1.65;
    list-style-type: none;
  }

  & > ${BorderlessCard}:last-child {
    margin-bottom: 1rem;
  }
`;
