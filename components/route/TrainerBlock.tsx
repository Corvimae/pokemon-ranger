import React from 'react';
import styled from 'styled-components';
import { ContainerLabel } from '../Layout';
import { COLORS } from './InlineInfo';

interface TrainerBlockProps {
  info?: string;
  infoColor?: string;
}

export const TrainerBlock: React.FC<TrainerBlockProps> = ({ info, infoColor, children }) => (
  <Container info={info} infoColor={infoColor}>
    {children}
  </Container>
);

const Container = styled.div<{ info?: string; infoColor?: string; }>`
  padding-left: 2rem;

  & > ul {
    padding-left: 0;
    line-height: 1.65;
    list-style-type: none;
  }

  & > ${ContainerLabel} {
    margin-left: -2rem;
    font-size: 1.25rem;
    font-weight: 700;

    & + * {
      margin-top: 0.5rem;
    }

    &:after {
      content: ${props => props.info && `"${props.info}"`};
      color: ${props => COLORS[props.infoColor as keyof typeof COLORS] || COLORS.black};
      margin-left: 1rem;
      font-weight: 400;
      font-size: 1rem;
    }
  }
`;
