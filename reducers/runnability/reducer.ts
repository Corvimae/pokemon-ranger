import { createStatLine, NatureType, Stat } from 'relicalc';
import { prepareContextualReducer } from '../../utils/hooks';
import { RunnabilityReducerAction, RunnabilityReducerState, SET_VALUE, RESET_STATE, SET_INITIAL_STATE } from './types';

const defaultState: RunnabilityReducerState = {
  negative: createStatLine(0, 0, 0, 0, 0, 0),
  neutral: createStatLine(0, 0, 0, 0, 0, 0),
  positive: createStatLine(0, 0, 0, 0, 0, 0),
};

const reducer = (state: RunnabilityReducerState, action: RunnabilityReducerAction): RunnabilityReducerState => {
  switch (action.type) {
    case SET_VALUE: {
      return {
        ...state,
        [action.payload.natureModifier]: {
          ...state[action.payload.natureModifier],
          [action.payload.stat]: action.payload.value,
        },
      };
    }

    case RESET_STATE:
      return { ...defaultState };

    case SET_INITIAL_STATE:
      return { ...action.payload };

    default:
      return state;
  }
};

export const RunnabilityContext = prepareContextualReducer(reducer, defaultState);

export function setValue(stat: Stat, natureModifier: NatureType, value: number): RunnabilityReducerAction {
  return {
    type: SET_VALUE,
    payload: {
      stat,
      natureModifier,
      value,
    },
  };
}

export function setInitialState(state: RunnabilityReducerState): RunnabilityReducerAction {
  return {
    type: SET_INITIAL_STATE,
    payload: state,
  };
}

export function resetState(): RunnabilityReducerAction {
  return {
    type: RESET_STATE,
  };
}
