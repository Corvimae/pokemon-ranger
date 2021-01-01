export const SET_ROLL = 'SET_ROLL';
export const SET_HP_THRESHOLD = 'SET_HP_THRESHOLD';
export const SET_INCLUDE_CRITS = 'SET_INCLUDE_CRITS';
export const SET_CRIT_MULTIPLIER = 'SET_CRIT_MULTIPLIER';
export const SET_CRIT_CHANCE_DENOMINATOR = 'SET_CRIT_CHANCE_DENOMINATOR';
export const SET_ADJUSTED_ROLL = 'SET_ADJUSTED_ROLL';
export const ADD_ROLL = 'ADD_ROLL';
export const REMOVE_ROLL = 'REMOVE_ROLL';

export const SET_INITIAL_STATE = 'SET_INITIAL_STATE';
export const RESET_STATE = 'RESET_STATE';

export interface SumReducerState {
  rolls: string[];
  hpThreshold: number;
  includeCrits: boolean;
  critMultiplier: number;
  critChanceDenominator: number;
  adjustedRolls: string[];
}

type SetRollAction = {
  type: typeof SET_ROLL;
  payload: {
    roll: string;
    index: number;
  };
};

type SetHPThresholdAction = {
  type: typeof SET_HP_THRESHOLD;
  payload: {
    hpThreshold: number;
  };
};

type SetIncludeCritsAction = {
  type: typeof SET_INCLUDE_CRITS;
  payload: {
    includeCrits: boolean;
  };
};

type SetCritMultiplierAction = {
  type: typeof SET_CRIT_MULTIPLIER;
  payload: {
    critMultiplier: number;
  };
};

type SetCritChanceDenominatorAction = {
  type: typeof SET_CRIT_CHANCE_DENOMINATOR;
  payload: {
    critChanceDenominator: number;
  };
};

type SetAdjustedRollAction = {
  type: typeof SET_ADJUSTED_ROLL;
  payload: {
    adjustedRoll: string;
    index: number;
  };
};

type AddRollAction = {
  type: typeof ADD_ROLL;
};

type RemoveRollAction = {
  type: typeof REMOVE_ROLL;
  payload: {
    index: number;
  };
};

type ResetStateAction = {
  type: typeof RESET_STATE;
}

type SetInitialStateAction = {
  type: typeof SET_INITIAL_STATE;
  payload: SumReducerState;
};

export type SumReducerAction =
  SetRollAction |
  SetHPThresholdAction |
  SetIncludeCritsAction |
  SetCritMultiplierAction |
  SetCritChanceDenominatorAction |
  SetAdjustedRollAction |
  AddRollAction |
  RemoveRollAction |
  ResetStateAction |
  SetInitialStateAction;
