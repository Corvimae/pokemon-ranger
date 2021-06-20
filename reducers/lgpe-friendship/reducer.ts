import { Dispatch, useReducer } from 'react';
import { v4 as uuid } from 'uuid';
import { LGPEFriendshipEvent } from '../../utils/calculations';
import { ADD_FRIENDSHIP_EVENT, LGPEFriendshipRecord, LGPEFriendshipReducerAction, LGPEFriendshipState, REMOVE_FRIENDSHIP_EVENT, REORDER_FRIENDSHIP_EVENTS, RESET_STATE, SET_BASE_FRIENDSHIP } from './types';

const defaultState: LGPEFriendshipState = {
  baseFriendship: 70,
  friendshipEvents: [],
};

const reducer = (state: LGPEFriendshipState, action: LGPEFriendshipReducerAction): LGPEFriendshipState => {
  switch (action.type) {
    case SET_BASE_FRIENDSHIP:
      return {
        ...state,
        baseFriendship: action.payload.value,
      };

    case ADD_FRIENDSHIP_EVENT:
      return {
        ...state,
        friendshipEvents: [...state.friendshipEvents, {
          id: uuid(),
          event: action.payload.event,
        }],
      };

    case REMOVE_FRIENDSHIP_EVENT:
      return {
        ...state,
        friendshipEvents: state.friendshipEvents.reduce((acc, event) => (
          action.payload.id === event.id ? acc : [...acc, event]
        ), [] as LGPEFriendshipRecord[]),
      };

    case REORDER_FRIENDSHIP_EVENTS:
      return {
        ...state,
        friendshipEvents: action.payload.friendshipEvents,
      };
      
    case RESET_STATE:
      return { ...defaultState };

    default:
      return state;
  }
};

export const useLGPEFriendshipReducer = (): [LGPEFriendshipState, Dispatch<LGPEFriendshipReducerAction>] => useReducer(reducer, defaultState);

export function setBaseFriendship(value: number): LGPEFriendshipReducerAction {
  return {
    type: SET_BASE_FRIENDSHIP,
    payload: { value },
  };
}

export function addFriendshipEvent(event: LGPEFriendshipEvent): LGPEFriendshipReducerAction {
  return {
    type: ADD_FRIENDSHIP_EVENT,
    payload: { event },
  };
}

export function removeFriendshipEvent(id: string): LGPEFriendshipReducerAction {
  return {
    type: REMOVE_FRIENDSHIP_EVENT,
    payload: { id },
  };
}

export function reorderFriendshipEvents(friendshipEvents: LGPEFriendshipRecord[]): LGPEFriendshipReducerAction {
  return {
    type: REORDER_FRIENDSHIP_EVENTS,
    payload: { friendshipEvents },
  };
}

export function resetState(): LGPEFriendshipReducerAction {
  return {
    type: RESET_STATE,
  };
}
