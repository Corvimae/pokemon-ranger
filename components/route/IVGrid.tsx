import React from 'react';
import { Generation, Stat } from 'relicalc';
import styled from 'styled-components';
import { Tracker } from '../../reducers/route/types';

interface IVGridHeaderProps {
  tracker: Tracker;
  onSetManualNature?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, stat: Stat) => void;
}

export const IVGridHeader: React.FC<IVGridHeaderProps> = ({ tracker, onSetManualNature }) => {
  const isUninteractable = tracker.staticNature !== undefined || onSetManualNature === undefined;

  return (
    <>
      <IVGridHeaderCell uninteractable>
        HP
      </IVGridHeaderCell>
      <IVGridHeaderCell
        isPositive={tracker.manualPositiveNature === 'attack'}
        isNegative={tracker.manualNegativeNature === 'attack'}
        onClick={event => !isUninteractable && onSetManualNature?.(event, 'attack')}
        uninteractable={isUninteractable}
      >
        ATK
      </IVGridHeaderCell>
      <IVGridHeaderCell
        isPositive={tracker.manualPositiveNature === 'defense'}
        isNegative={tracker.manualNegativeNature === 'defense'}
        onClick={event => !isUninteractable && onSetManualNature?.(event, 'defense')}
        uninteractable={isUninteractable}
      >
        DEF
      </IVGridHeaderCell>
      <IVGridHeaderCell
        isPositive={tracker.manualPositiveNature === 'spAttack'}
        isNegative={tracker.manualNegativeNature === 'spAttack'}
        onClick={event => !isUninteractable && onSetManualNature?.(event, 'spAttack')}
        uninteractable={isUninteractable}
      >
        {tracker.generation > 2 ? 'SP. ATK' : 'SPEC'}
      </IVGridHeaderCell>
      {tracker.generation > 2 && (
        <IVGridHeaderCell
          isPositive={tracker.manualPositiveNature === 'spDefense'}
          isNegative={tracker.manualNegativeNature === 'spDefense'}
          onClick={event => !isUninteractable && onSetManualNature?.(event, 'spDefense')}
          uninteractable={isUninteractable}
        >
          SP. DEF
        </IVGridHeaderCell>
      )}
      <IVGridHeaderCell
        isPositive={tracker.manualPositiveNature === 'speed'}
        isNegative={tracker.manualNegativeNature === 'speed'}
        onClick={event => !isUninteractable && onSetManualNature?.(event, 'speed')}
        uninteractable={isUninteractable}
      >
        SPE
      </IVGridHeaderCell>
    </>
  );
};

const IVGridHeaderCell = styled.button<{ uninteractable?: boolean; isPositive?: boolean; isNegative?: boolean }>`
  color: ${props => {
    if (props.isPositive && props.isNegative) return props.theme.sidebar.foreground;
    if (props.isPositive) return '#ff7f7f';
    if (props.isNegative) return '#a1a1ff';

    return props.theme.sidebar.foreground;
  }};
  border: none;
  padding: 0.5rem;
  font-weight: 700;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.1);
  margin: 0;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 700;
  cursor: ${props => props.uninteractable ? 'cursor' : 'pointer'};

  &:not(:disabled):hover,
  &:not(:disabled):active {
    background-color: ${props => !props.uninteractable && 'rgba(255, 255, 255, 0.2)'};
  }

  &:disabled {
    opacity: 0.5;
  }
`;

export const IVGrid = styled.div<{ generation: Generation }>`
  display: grid;
  grid-template-columns: repeat(${({ generation }) => generation > 2 ? 6 : 5}, 1fr);
  margin-top: 0.5rem;
`;
