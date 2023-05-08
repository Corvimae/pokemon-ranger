import { Dispatch } from 'react';
import { prepareContextualReducer, useParameterizedReducer } from '../../utils/hooks';
import { CassetteBeastsExperienceReducerAction, CassetteBeastsExperienceReducerState, SET_INITIAL_STATE, SET_OPPONENT_CHARACTER_EXP_YIELD, SET_OPPONENT_FORM_EXP_YIELD, SET_OPPONENT_LEVEL, SET_SELF_EXP_BASE_LEVEL, SET_SELF_EXP_GRADIENT, SET_SELF_LEVEL } from './types';

const defaultState: CassetteBeastsExperienceReducerState = {
  selfLevel: 1,
  selfExpGradient: 1,
  selfExpBaseLevel: 0,
  opponentLevel: 1,
  opponentFormExpYield: 40,
  opponentCharacterExpYield: 80,
};

const reducer = (state: CassetteBeastsExperienceReducerState, action: CassetteBeastsExperienceReducerAction): CassetteBeastsExperienceReducerState => {
  switch (action.type) {
    case SET_SELF_LEVEL:
      return {
        ...state,
        selfLevel: action.payload.selfLevel,
      };

    case SET_SELF_EXP_GRADIENT:
      return {
        ...state,
        selfExpGradient: action.payload.selfExpGradient,
      };

    case SET_SELF_EXP_BASE_LEVEL:
      return {
        ...state,
        selfExpBaseLevel: action.payload.selfExpBaseLevel,
      };

    case SET_OPPONENT_LEVEL:
      return {
        ...state,
        opponentLevel: action.payload.opponentLevel,
      };
      
    case SET_OPPONENT_FORM_EXP_YIELD:
      return {
        ...state,
        opponentFormExpYield: action.payload.opponentFormExpYield,
      };

    case SET_OPPONENT_CHARACTER_EXP_YIELD:
      return {
        ...state,
        opponentCharacterExpYield: action.payload.opponentCharacterExpYield,
      };

    case SET_INITIAL_STATE:
      return { ...action.payload };

    default:
      return state;
  }
};

export const useCassetteBeastsExperienceReducer = (): [CassetteBeastsExperienceReducerState, Dispatch<CassetteBeastsExperienceReducerAction>] => (
  useParameterizedReducer(reducer, defaultState, setInitialState)
);

export const CassetteBeastsExperienceContext = prepareContextualReducer(reducer, defaultState);

export function setSelfLevel(selfLevel: number): CassetteBeastsExperienceReducerAction {
  return {
    type: SET_SELF_LEVEL,
    payload: { selfLevel },
  };
}

export function setSelfExpGradient(selfExpGradient: number): CassetteBeastsExperienceReducerAction {
  return {
    type: SET_SELF_EXP_GRADIENT,
    payload: { selfExpGradient },
  };
}
export function setSelfExpBaseLevel(selfExpBaseLevel: number): CassetteBeastsExperienceReducerAction {
  return {
    type: SET_SELF_EXP_BASE_LEVEL,
    payload: { selfExpBaseLevel },
  };
}
export function setOpponentLevel(opponentLevel: number): CassetteBeastsExperienceReducerAction {
  return {
    type: SET_OPPONENT_LEVEL,
    payload: { opponentLevel },
  };
}
export function setOpponentFormExpYield(opponentFormExpYield: number): CassetteBeastsExperienceReducerAction {
  return {
    type: SET_OPPONENT_FORM_EXP_YIELD,
    payload: { opponentFormExpYield },
  };
}

export function setOpponentCharacterExpYield(opponentCharacterExpYield: number): CassetteBeastsExperienceReducerAction {
  return {
    type: SET_OPPONENT_CHARACTER_EXP_YIELD,
    payload: { opponentCharacterExpYield },
  };
}

export function setInitialState(state: CassetteBeastsExperienceReducerState): CassetteBeastsExperienceReducerAction {
  return {
    type: SET_INITIAL_STATE,
    payload: state,
  };
}
