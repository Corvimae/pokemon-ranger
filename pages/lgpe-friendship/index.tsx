import React, { useCallback } from 'react';
import styled from 'styled-components';
import { NextPage } from 'next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Header, InputSection, InputRow, HelpText, InputSubheader } from '../../components/Layout';
import { Button } from '../../components/Button';
import { setBaseFriendship, addFriendshipEvent, removeFriendshipEvent, reorderFriendshipEvents, resetState, useLGPEFriendshipReducer } from '../../reducers/lgpe-friendship/reducer';
import { calculateLGPEFriendship, LGPEFriendshipEvent } from '../../utils/calculations';

const FRIENDSHIP_EVENT_NAMES: Record<LGPEFriendshipEvent, string> = {
  level: 'Level',
  candy: 'Rare Candy',
  xItem: 'X Item',
  gymFight: 'Major Fight',
};

const LGPEFriendship: NextPage = () => {
  const [state, dispatch] = useLGPEFriendshipReducer();

  const handleResetValues = useCallback(() => {
    dispatch(resetState());
  }, [dispatch]);

  const handleSetBaseFriendship = useCallback(event => {
    dispatch(setBaseFriendship(Number(event.target.value)));
  }, [dispatch]);

  const handleAddFriendshipEvent = useCallback((friendshipEvent: LGPEFriendshipEvent) => {
    dispatch(addFriendshipEvent(friendshipEvent));
  }, [dispatch]);

  const handleRemoveFriendshipEvent = useCallback(id => {
    dispatch(removeFriendshipEvent(id));
  }, [dispatch]);

  const handleDragEnd = useCallback((dragEvent) => {
    const updatedList = [...state.friendshipEvents];
    const [removed] = updatedList.splice(dragEvent.source.index, 1);

    updatedList.splice(dragEvent.destination.index, 0, removed);

    dispatch(reorderFriendshipEvents(updatedList));
  }, [state.friendshipEvents, dispatch]);

  return (
    <Container>
      <LeftColumn>
        <Header>
          LGPE Friendship Calculator
          <div>
            <Button onClick={handleResetValues}>Reset</Button>
          </div>
        </Header>
        <InputSection>
          <Disclaimer>
            This tool is calculates friendship to the <b>best of our knowledge</b>, using friendship
            event deltas that were determined through community trial-and-error. Do not be surprised
            if this tool does not perfectly predict friendship values.
          </Disclaimer>
          <InputRow>
            <label htmlFor="baseFriendship">Base Friendship</label>
            <input id="baseFriendship" value={state.baseFriendship} onChange={handleSetBaseFriendship} />
          </InputRow>
        </InputSection>

        <InputSubheader>Friendship Events</InputSubheader>
        <AddFriendshipActions>
          <Button onClick={() => handleAddFriendshipEvent('level')}>Level</Button>
          <Button onClick={() => handleAddFriendshipEvent('candy')}>Rare Candy</Button>
          <Button onClick={() => handleAddFriendshipEvent('xItem')}>X Item</Button>
          <Button onClick={() => handleAddFriendshipEvent('gymFight')}>Major Fight</Button>
        </AddFriendshipActions>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="friendshipEvents">
            {(provided) => (
              <FriendshipEventList {...provided.droppableProps} ref={provided.innerRef}>
                {state.friendshipEvents.map((friendshipEvent, index) => (
                  <Draggable key={friendshipEvent.id} draggableId={friendshipEvent.id} index={index}>
                    {(provided) => (
                      <FriendshipEvent ref={provided.innerRef} {...provided.draggableProps}>
                        <div {...provided.dragHandleProps}>
                          <FontAwesomeIcon icon={faBars} color="#CCC" />
                        </div>
                        <FriendshipEventText>
                          <FriendshipEventIndex>({index + 1})&nbsp;</FriendshipEventIndex>
                          {FRIENDSHIP_EVENT_NAMES[friendshipEvent.event]}
                        </FriendshipEventText>
                        <Button theme="error" onClick={() => handleRemoveFriendshipEvent(friendshipEvent.id)}>&times;</Button>
                      </FriendshipEvent>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </FriendshipEventList>
            )}
          </Droppable>
        </DragDropContext>
      </LeftColumn>
      <div>
        <Header>Results</Header>
        This Pokémon should have <b>{calculateLGPEFriendship(state.baseFriendship, state.friendshipEvents.map(item => item.event))}</b> Friendship.
      </div>
    </Container>
  );
};

export default LGPEFriendship;

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100%;
  
  & > div {
    padding: 1rem;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  min-height: 0;
  flex-direction: column;
  overflow-y: hidden;
`;

const Disclaimer = styled(HelpText)`
  grid-column: span 2;
`;

const FriendshipEventList = styled.div`
  display: flex;
  min-height: 0;
  grid-column: 1 / -1;
  flex-direction: column;
  overflow-y: auto;
  align-self: stretch;
  flex-grow: 1;
`;

const FriendshipEvent = styled.div`
  display: flex;
  height: 3.25rem;
  align-items: center;
  padding: 0.5rem 0;
  
  & + & {
    border-top: 1px solid #e0e0e0;
  }
`;

const FriendshipEventText = styled.div`
  min-width: 0;
  padding: 0.5rem;
  flex-grow: 1;
  align-self: stretch;
`;

const FriendshipEventIndex = styled.span`
  color: #999;
`;

const AddFriendshipActions = styled.div`
  display: flex;
  grid-column: 1 / -1;
  flex-direction: row;
  align-items: center;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #9cffd0;

  & > button + button {
    margin-left: 0.5rem;
  }
`;