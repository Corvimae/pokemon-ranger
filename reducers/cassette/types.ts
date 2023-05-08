export const SET_SELF_LEVEL = 'SET_SELF_LEVEL';
export const SET_SELF_EXP_GRADIENT = 'SET_SELF_EXP_GRADIENT';
export const SET_SELF_EXP_BASE_LEVEL = 'SET_SELF_EXP_BASE_LEVEL';
export const SET_OPPONENT_LEVEL = 'SET_OPPONENT_LEVEL';
export const SET_OPPONENT_FORM_EXP_YIELD = 'SET_OPPONENT_FORM_EXP_YIELD';
export const SET_OPPONENT_CHARACTER_EXP_YIELD = 'SET_OPPONENT_CHARACTER_EXP_YIELD';
export const SET_INITIAL_STATE = 'SET_INITIAL_STATE';

export interface CassetteBeastsExperienceReducerState {
  selfLevel: number;
  selfExpGradient: number;
  selfExpBaseLevel: number;
  opponentLevel: number;
  opponentFormExpYield: number;
  opponentCharacterExpYield: number;
}

type SetSelfLevelAction = {
  type: typeof SET_SELF_LEVEL;
  payload: {
    selfLevel: number;
  };
};

type SetSelfExpGradientAction = {
  type: typeof SET_SELF_EXP_GRADIENT;
  payload: {
    selfExpGradient: number;
  };
};

type SetSelfExpBaseLevelAction = {
  type: typeof SET_SELF_EXP_BASE_LEVEL;
  payload: {
    selfExpBaseLevel: number;
  };
};

type SetOpponentLevelAction = {
  type: typeof SET_OPPONENT_LEVEL;
  payload: {
    opponentLevel: number;
  };
};

type SetOpponentFormExpYieldAction = {
  type: typeof SET_OPPONENT_FORM_EXP_YIELD;
  payload: {
    opponentFormExpYield: number;
  };
};

type SetOpponentCharacterExpYieldAction = {
  type: typeof SET_OPPONENT_CHARACTER_EXP_YIELD;
  payload: {
    opponentCharacterExpYield: number;
  };
};

type SetInitialStateAction = {
  type: typeof SET_INITIAL_STATE,
  payload: CassetteBeastsExperienceReducerState;
};

export type CassetteBeastsExperienceReducerAction =
  SetSelfLevelAction |
  SetSelfExpGradientAction |
  SetSelfExpBaseLevelAction |
  SetOpponentLevelAction |
  SetOpponentFormExpYieldAction |
  SetOpponentCharacterExpYieldAction |
  SetInitialStateAction;
