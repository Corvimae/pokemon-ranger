import { LGPEFriendshipEvent } from '../../utils/calculations';

export const SET_BASE_FRIENDSHIP = 'SET_BASE_FRIENDSHIP';
export const ADD_FRIENDSHIP_EVENT = 'ADD_FRIENDSHIP_EVENT';
export const REMOVE_FRIENDSHIP_EVENT = 'REMOVE_FRIENDSHIP_EVENT';
export const REORDER_FRIENDSHIP_EVENTS = 'REORDER_FRIENDSHIP_EVENTS';

export const RESET_STATE = 'RESET_STATE';

export interface LGPEFriendshipRecord {
  id: string;
  event: LGPEFriendshipEvent;
}

export interface LGPEFriendshipState {
  baseFriendship: number;
  friendshipEvents: LGPEFriendshipRecord[];
}

type SetBaseFriendshipAction = {
  type: typeof SET_BASE_FRIENDSHIP;
  payload: {
    value: number;
  };
};

type AddFriendshipEventAction = {
  type: typeof ADD_FRIENDSHIP_EVENT;
  payload: {
    event: LGPEFriendshipEvent;
  };
};

type RemoveFriendshipEventAction = {
  type: typeof REMOVE_FRIENDSHIP_EVENT;
  payload: {
    id: string;
  };
};

type ReorderFriendshipEventAction = {
  type: typeof REORDER_FRIENDSHIP_EVENTS;
  payload: {
    friendshipEvents: LGPEFriendshipRecord[];
  };
};

type ResetStateAction = {
  type: typeof RESET_STATE;
};

export type LGPEFriendshipReducerAction =
  SetBaseFriendshipAction |
  AddFriendshipEventAction |
  RemoveFriendshipEventAction |
  ReorderFriendshipEventAction |
  ResetStateAction;
