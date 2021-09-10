import React, { useCallback } from 'react';
import styled from 'styled-components';
import { RouteContext, setDirectInputIV } from '../../reducers/route/reducer';
import { Tracker } from '../../reducers/route/types';
import { Nature, NATURES, Stat } from '../../utils/constants';
import { ConfirmedNature } from '../../utils/rangeTypes';
import { capitalize } from '../../utils/utils';
import { Button } from '../Button';
import { IVGrid, IVGridHeader } from './IVGrid';

interface IVInputProps {
  tracker: Tracker;
  stat: Stat;
}

const IVInput: React.FC<IVInputProps> = ({ tracker, stat }) => {
  const dispatch = RouteContext.useDispatch();

  const handleSetStat = useCallback(event => {
    dispatch(setDirectInputIV(tracker.name, stat, Number(event.target.value)));
  }, [dispatch, stat, tracker.name]);

  return (
    <IVInputElementContainer>
      {tracker.staticIVs[stat] === -1 && (
        <IVInputElement
          type="number"
          value={tracker.directInputIVs[stat]}
          onChange={handleSetStat}
        />
      )}
      {tracker.staticIVs[stat] !== -1 && (
        <IVInputStaticValue>{tracker.staticIVs[stat]}</IVInputStaticValue>
      )}
    </IVInputElementContainer>
  );
};

interface IVDirectInputProps {
  tracker: Tracker;
  confirmedNatures: ConfirmedNature;
  onReset: () => void;
  onSetManualNature: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, stat: Stat) => void;
  onNatureButtonClick: (nature: Nature) => void;
  resetConfirmActive: boolean;
}

export const IVDirectInput: React.FC<IVDirectInputProps> = ({ tracker, confirmedNatures, onReset, onNatureButtonClick, onSetManualNature, resetConfirmActive }) => (
  <Container>
    <ActionRow>
      {capitalize(tracker.name)}
      {tracker.directInputNatures.length && tracker.directInputNatures.map(nature => (
        <DirectInputNatureButton
          key={nature}
          active={confirmedNatures[0] === NATURES[nature]?.minus && confirmedNatures[1] === NATURES[nature]?.plus}
          onClick={() => onNatureButtonClick(nature)}
        >
          {capitalize(nature)}
        </DirectInputNatureButton>
      ))}

      <ActionButtons>
        <Button onClick={onReset}>{resetConfirmActive ? 'Are you sure?' : 'Reset'}</Button>
      </ActionButtons>
    </ActionRow>
    <IVGrid generation={tracker.generation}>
      <IVGridHeader tracker={tracker} onSetManualNature={tracker.directInputNatures.length === 0 ? onSetManualNature : undefined} />
      <IVInput tracker={tracker} stat="hp" />
      <IVInput tracker={tracker} stat="attack" />
      <IVInput tracker={tracker} stat="defense" />
      <IVInput tracker={tracker} stat="spAttack" />
      <IVInput tracker={tracker} stat="spDefense" />
      <IVInput tracker={tracker} stat="speed" />
    </IVGrid>
  </Container>
);

const Container = styled.div`
  & + & {
    margin-top: 1rem;
  }
`;

const ActionRow = styled.div`
  display: flex;
  align-items: center;
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
`;

const IVInputElementContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem 0;
`;

const IVInputElement = styled.input`
  border-radius: 0.25rem;
  height: 2rem;
  margin: 0;
  padding: 0.25rem 0.5rem;
  font-size: 1rem;
  color: ${({ theme }) => theme.input.foreground};
  background-color: ${({ theme }) => theme.input.background};
  border: 1px solid ${({ theme }) => theme.input.border};
  width: 5.25rem;
`;

const IVInputStaticValue = styled.span`
  line-height: normal;
`;

const DirectInputNatureButton = styled(Button)<{ active?: boolean }>`
  font-size: 0.875rem;
  margin-left: 1rem;
  background-color: ${props => props.active && '#be45be'};

  &:not(:disabled):hover {
    background-color: ${props => props.active && '#be45be'};
  }
`;
