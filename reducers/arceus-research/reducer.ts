import { prepareContextualReducer } from '../../utils/hooks';
import { ArceusResearchReducerAction, ArceusResearchReducerState, SET_TASK_ACTIVE, SET_TASK_INACTIVE, RESET_STATE } from './types';

const defaultState: ArceusResearchReducerState = {
  activeTasks: {},
};

const reducer = (state: ArceusResearchReducerState, action: ArceusResearchReducerAction): ArceusResearchReducerState => {
  switch (action.type) {
    case SET_TASK_ACTIVE:
      return {
        ...state,
        activeTasks: {
          ...state.activeTasks,
          [action.payload.speciesId]: {
            ...(state.activeTasks[action.payload.speciesId] ?? {}),
            [action.payload.taskName]: action.payload.value,
          },
        },
      };

    case SET_TASK_INACTIVE:
      return {
        ...state,
        activeTasks: {
          ...state.activeTasks,
          [action.payload.speciesId]: {
            ...(state.activeTasks[action.payload.speciesId] ?? {}),
            [action.payload.taskName]: 0,
          },
        },
      };

    case RESET_STATE:
      return { ...defaultState };

    default:
      return state;
  }
};

export const ArceusResearchContext = prepareContextualReducer(reducer, defaultState);

export function setTaskActive(speciesId: number, taskName: string, value: number): ArceusResearchReducerAction {
  return {
    type: SET_TASK_ACTIVE,
    payload: {
      speciesId,
      taskName,
      value,
    },
  };
}

export function setTaskInactive(speciesId: number, taskName: string, value: number): ArceusResearchReducerAction {
  return {
    type: SET_TASK_INACTIVE,
    payload: {
      speciesId,
      taskName,
      value,
    },
  };
}

export function resetState(): ArceusResearchReducerAction {
  return {
    type: RESET_STATE,
  };
}
