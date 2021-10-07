import { NatureType, Stat, StatLine } from 'relicalc';

export const SET_VALUE = 'SET_VALUE';

export const SET_INITIAL_STATE = 'SET_INITIAL_STATE';
export const RESET_STATE = 'RESET_STATE';

export interface RunnabilityReducerState {
  negative: StatLine;
  neutral: StatLine;
  positive: StatLine;
}

type SetValueAction = {
  type: typeof SET_VALUE;
  payload: {
    stat: Stat;
    natureModifier: NatureType;
    value: number;
  };
};

type ResetStateAction = {
  type: typeof RESET_STATE;
}

type SetInitialStateAction = {
  type: typeof SET_INITIAL_STATE;
  payload: RunnabilityReducerState;
};

export type RunnabilityReducerAction =
  SetValueAction |
  ResetStateAction |
  SetInitialStateAction;
