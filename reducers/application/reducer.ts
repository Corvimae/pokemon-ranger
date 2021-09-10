import { prepareContextualReducer } from '../../utils/hooks';
import { ApplicationReducerAction, ApplicationReducerState, LOAD_FROM_STORAGE, SET_DARK_MODE } from './types';

const RANGER_DARK_MODE_KEY = 'RANGER_DARK_MODE';

const defaultState: ApplicationReducerState = {
  darkMode: false,
};

const reducer = (state: ApplicationReducerState, action: ApplicationReducerAction): ApplicationReducerState => {
  switch (action.type) {
    case LOAD_FROM_STORAGE:
      return {
        ...state,
        ...action.payload,
      };

    case SET_DARK_MODE:
      return {
        ...state,
        darkMode: action.payload.value,
      };

    default:
      return state;
  }
};

export const ApplicationContext = prepareContextualReducer(reducer, defaultState);

export function loadFromStorage(): ApplicationReducerAction {
  return {
    type: LOAD_FROM_STORAGE,
    payload: {
      darkMode: global.localStorage?.getItem(RANGER_DARK_MODE_KEY) === 'true',
    },
  };
}
export function setDarkMode(value: boolean): ApplicationReducerAction {
  global.localStorage?.setItem(RANGER_DARK_MODE_KEY, value.toString());

  return {
    type: SET_DARK_MODE,
    payload: { value },
  };
}
