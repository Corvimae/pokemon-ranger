import { prepareContextualReducer } from '../../utils/hooks';
import { ArceusResearchReducerAction, ArceusResearchReducerState, SET_SEARCH_TERM, SET_TASK_ACTIVE, SET_TASK_INACTIVE, RESET_STATE, IMPORT_SAVED_RESEARCH } from './types';

const defaultState: ArceusResearchReducerState = {
  searchTerm: '',
  activeTasks: {},
};

const reducer = (state: ArceusResearchReducerState, action: ArceusResearchReducerAction): ArceusResearchReducerState => {
  switch (action.type) {
    case SET_SEARCH_TERM:
      return {
        ...state,
        searchTerm: action.payload.searchTerm,
      };

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
      return {
        ...defaultState,
        searchTerm: state.searchTerm, // Keep the active search term cuz it's easier :)
      };

    case IMPORT_SAVED_RESEARCH:
      return {
        ...state,
        activeTasks: action.payload.data,
      };

    default:
      return state;
  }
};

export const ArceusResearchContext = prepareContextualReducer(reducer, defaultState);

export function setSearchTerm(searchTerm: string): ArceusResearchReducerAction {
  return {
    type: SET_SEARCH_TERM,
    payload: {
      searchTerm,
    },
  };
}
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

export function importSavedResearch(data: Record<number, Record<string, number>>): ArceusResearchReducerAction {
  return {
    type: IMPORT_SAVED_RESEARCH,
    payload: {
      data,
    },
  };
}

export function resetState(): ArceusResearchReducerAction {
  return {
    type: RESET_STATE,
  };
}
