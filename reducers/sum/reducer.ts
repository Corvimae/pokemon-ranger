import { Dispatch } from 'react';
import { useParameterizedReducer } from '../../utils/hooks';
import { RESET_STATE, SET_INITIAL_STATE, ADD_ROLL, REMOVE_ROLL, SET_ADJUSTED_ROLL, SET_CRIT_CHANCE_DENOMINATOR, SET_CRIT_MULTIPLIER, SET_HP_THRESHOLD, SET_INCLUDE_CRITS, SET_ROLL, SumReducerAction, SumReducerState } from './types';

const defaultState: SumReducerState = {
  rolls: ['', ''],
  hpThreshold: 100,
  includeCrits: false,
  critMultiplier: 2.0,
  critChanceDenominator: 16,
  adjustedRolls: ['', ''],
};

const reducer = (state: SumReducerState, action: SumReducerAction): SumReducerState => {
  switch (action.type) {
    case SET_ROLL: {
      return {
        ...state,
        rolls: state.rolls.reduce<string[]>((acc, roll, index) => [
          ...acc,
          index === action.payload.index ? action.payload.roll : roll,
        ], []),
      };
    }

    case SET_HP_THRESHOLD:
      return {
        ...state,
        hpThreshold: action.payload.hpThreshold,
      };

    case SET_INCLUDE_CRITS:
      return {
        ...state,
        includeCrits: action.payload.includeCrits,
      };

    case SET_CRIT_MULTIPLIER:
      return {
        ...state,
        critMultiplier: action.payload.critMultiplier,
      };

    case SET_CRIT_CHANCE_DENOMINATOR:
      return {
        ...state,
        critChanceDenominator: action.payload.critChanceDenominator,
      };

    case SET_ADJUSTED_ROLL:
      return {
        ...state,
        adjustedRolls: state.adjustedRolls.reduce<string[]>((acc, roll, index) => [
          ...acc,
          index === action.payload.index ? action.payload.adjustedRoll : roll,
        ], []),
      };

    case ADD_ROLL:
      return {
        ...state,
        rolls: [...state.rolls, ''],
        adjustedRolls: [...state.adjustedRolls, ''],
      };

    case REMOVE_ROLL:
      return {
        ...state,
        rolls: state.rolls.filter((_value, rollIndex) => rollIndex !== action.payload.index),
        adjustedRolls: state.adjustedRolls.filter((_value, rollIndex) => rollIndex !== action.payload.index),
      };

    case RESET_STATE:
      return { ...defaultState };

    case SET_INITIAL_STATE:
      return { ...action.payload };

    default:
      return state;
  }
};

export const useSumReducer = (): [SumReducerState, Dispatch<SumReducerAction>] => (
  useParameterizedReducer(reducer, defaultState, setInitialState)
);

export function setRoll(roll: string, index: number): SumReducerAction {
  return {
    type: SET_ROLL,
    payload: {
      roll,
      index,
    },
  };
}

export function setHPThreshold(hpThreshold: number): SumReducerAction {
  return {
    type: SET_HP_THRESHOLD,
    payload: { hpThreshold },
  };
}

export function setIncludeCrits(includeCrits: boolean): SumReducerAction {
  return {
    type: SET_INCLUDE_CRITS,
    payload: { includeCrits },
  };
}

export function setCritMultiplier(critMultiplier: number): SumReducerAction {
  return {
    type: SET_CRIT_MULTIPLIER,
    payload: { critMultiplier },
  };
}

export function setCritChanceDenominator(critChanceDenominator: number): SumReducerAction {
  return {
    type: SET_CRIT_CHANCE_DENOMINATOR,
    payload: { critChanceDenominator },
  };
}

export function setAdjustedRoll(adjustedRoll: string, index: number): SumReducerAction {
  return {
    type: SET_ADJUSTED_ROLL,
    payload: {
      adjustedRoll,
      index,
    },
  };
}

export function addRoll(): SumReducerAction {
  return {
    type: ADD_ROLL,
  };
}

export function removeRoll(index: number): SumReducerAction {
  return {
    type: REMOVE_ROLL,
    payload: { index },
  };
}

export function setInitialState(state: SumReducerState): SumReducerAction {
  return {
    type: SET_INITIAL_STATE,
    payload: state,
  };
}

export function resetState(): SumReducerAction {
  return {
    type: RESET_STATE,
  };
}
