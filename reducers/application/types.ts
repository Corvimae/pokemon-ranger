export const LOAD_FROM_STORAGE = 'LOAD_FROM_STORAGE';
export const SET_DARK_MODE = 'SET_DARK_MODE';

export interface ApplicationReducerState {
  darkMode: boolean;
}

type LoadFromStorageAction = {
  type: typeof LOAD_FROM_STORAGE;
  payload: Partial<ApplicationReducerState>;
}

type SetDarkModeAction = {
  type: typeof SET_DARK_MODE;
  payload: {
    value: boolean;
  };
};

export type ApplicationReducerAction =
  LoadFromStorageAction |
  SetDarkModeAction;
