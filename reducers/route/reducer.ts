import set from 'lodash/set';
import get from 'lodash/get';
import cloneDeep from 'lodash/cloneDeep';
import { Stat } from '../../utils/constants';
import { prepareContextualReducer } from '../../utils/hooks';
import { EVsByLevel, LOAD_FILE, REGISTER_TRACKER, SET_SHOW_OPTIONS, RESET_TRACKER, RouteAction, RouteState, SET_MANUAL_NEGATIVE_NATURE, SET_MANUAL_NEUTRAL_NATURE, SET_MANUAL_POSITIVE_NATURE, SET_REPO_PATH, SET_STARTING_LEVEL, SET_STAT, StatLine, TRIGGER_EVOLUTION, LOAD_OPTIONS, SET_OPTION_COMPACT_IVS, RouteOptionsState, SET_OPTION_IV_BACKGROUND_COLOR, SET_OPTION_IV_FONT_FAMILY, SET_OPTION_HIDE_MEDIA, SET_OPTION_IV_HORIZONTAL_LAYOUT, RouteVariableType, REGISTER_VARIABLE, SET_VARIABLE_VALUE } from './types';
import { Generation } from '../../utils/rangeTypes';

const defaultState: RouteState = {
  repoPath: undefined,
  showOptions: false,
  trackers: {},
  variables: {},
  options: {
    compactIVs: false,
    hideMedia: false,
    ivBackgroundColor: '#222',
    ivFontFamily: undefined,
    ivHorizontalLayout: false,
  },
};

const reducer = (state: RouteState, action: RouteAction): RouteState => {
  switch (action.type) {
    case SET_REPO_PATH:
      return {
        ...state,
        repoPath: action.payload.repoPath?.replace('/route.mdr', '').replace('/route.md', ''),
      };

    case REGISTER_TRACKER:
      return {
        ...state,
        trackers: {
          ...state.trackers,
          [action.payload.name]: state.trackers[action.payload.name] || {
            name: action.payload.name,
            evolution: 0,
            calculateHiddenPower: action.payload.calculateHiddenPower,
            generation: action.payload.generation,
            startingLevel: Number(Object.keys(action.payload.evSegments)[0] || 5),
            baseStats: action.payload.baseStats,
            recordedStats: {},
            evSegments: action.payload.evSegments,
          },
        },
      };

    case SET_SHOW_OPTIONS:
      return {
        ...state,
        showOptions: action.payload.value,
      };

    case SET_STAT: {
      const path = [
        'trackers',
        action.payload.name,
        'recordedStats',
        state.trackers[action.payload.name].evolution,
        action.payload.level,
        action.payload.stat,
      ];

      return set(
        cloneDeep(state),
        path,
        get(state, path) === action.payload.value ? undefined : action.payload.value,
      );
    }

    case SET_MANUAL_POSITIVE_NATURE:
      return {
        ...state,
        trackers: {
          ...state.trackers,
          [action.payload.name]: {
            ...state.trackers[action.payload.name],
            manualPositiveNature: action.payload.stat,
            manualNegativeNature: state.trackers[action.payload.name].manualNegativeNature === action.payload.stat ? undefined : state.trackers[action.payload.name].manualNegativeNature,
          },
        },
      };

    case SET_MANUAL_NEGATIVE_NATURE:
      return {
        ...state,
        trackers: {
          ...state.trackers,
          [action.payload.name]: {
            ...state.trackers[action.payload.name],
            manualNegativeNature: action.payload.stat,
            manualPositiveNature: state.trackers[action.payload.name].manualPositiveNature === action.payload.stat ? undefined : state.trackers[action.payload.name].manualPositiveNature,
          },
        },
      };

    case SET_MANUAL_NEUTRAL_NATURE:
      return {
        ...state,
        trackers: {
          ...state.trackers,
          [action.payload.name]: {
            ...state.trackers[action.payload.name],
            manualNegativeNature: action.payload.stat,
            manualPositiveNature: action.payload.stat,
          },
        },
      };

    case LOAD_OPTIONS:
      return {
        ...state,
        options: {
          ...state.options,
          ...action.payload.values,
        },
      };

    case SET_OPTION_COMPACT_IVS:
      return {
        ...state,
        options: {
          ...state.options,
          compactIVs: action.payload.value,
        },
      };

    case SET_OPTION_HIDE_MEDIA:
      return {
        ...state,
        options: {
          ...state.options,
          hideMedia: action.payload.value,
        },
      };
  
    case SET_OPTION_IV_BACKGROUND_COLOR:
      return {
        ...state,
        options: {
          ...state.options,
          ivBackgroundColor: action.payload.value,
        },
      };

    case SET_OPTION_IV_FONT_FAMILY:
      return {
        ...state,
        options: {
          ...state.options,
          ivFontFamily: action.payload.value,
        },
      };

    case SET_OPTION_IV_HORIZONTAL_LAYOUT:
      return {
        ...state,
        options: {
          ...state.options,
          ivHorizontalLayout: action.payload.value,
        },
      };

    case TRIGGER_EVOLUTION:
      return set(
        cloneDeep(state),
        ['trackers', action.payload.name, 'evolution'],
        Math.max(0, state.trackers[action.payload.name].evolution + (action.payload.deevolve ? -1 : 1)),
      );

    case RESET_TRACKER:
      return {
        ...state,
        trackers: {
          ...state.trackers,
          [action.payload.name]: {
            ...state.trackers[action.payload.name],
            evolution: 0,
            recordedStats: {},
            manualPositiveNature: undefined,
            manualNegativeNature: undefined,
          },
        },
      };

    case SET_STARTING_LEVEL:
      return {
        ...state,
        trackers: {
          ...state.trackers,
          [action.payload.name]: {
            ...state.trackers[action.payload.name],
            startingLevel: action.payload.startingLevel,
            evolution: 0,
            recordedStats: {},
          },
        },
      };

    case REGISTER_VARIABLE:
      return {
        ...state,
        variables: {
          ...state.variables,
          [action.payload.name]: {
            type: action.payload.type,
            value: action.payload.defaultValue,
            defaultValue: action.payload.defaultValue,
          },
        },
      };

    case SET_VARIABLE_VALUE:
      return set(
        cloneDeep(state),
        ['variables', action.payload.name, 'value'],
        action.payload.value,
      );

    case LOAD_FILE:
      return { ...defaultState };

    default:
      return state;
  }
};

export const RouteContext = prepareContextualReducer(reducer, defaultState);

export function setRepoPath(repoPath: string | undefined): RouteAction {
  return {
    type: SET_REPO_PATH,
    payload: { repoPath },
  };
}

export function registerTracker(name: string, baseStats: StatLine[], generation: Generation, calculateHiddenPower: boolean, evSegments: Record<number, EVsByLevel>): RouteAction {
  return {
    type: REGISTER_TRACKER,
    payload: {
      name,
      baseStats,
      generation,
      calculateHiddenPower,
      evSegments,
    },
  };
}

export function setShowOptions(value: boolean): RouteAction {
  return {
    type: SET_SHOW_OPTIONS,
    payload: { value },
  };
}

export function setStat(name: string, stat: Stat, level: number, value: number): RouteAction {
  return {
    type: SET_STAT,
    payload: {
      name,
      stat,
      level,
      value,
    },
  };
}

export function setManualPositiveNature(name: string, stat?: Stat): RouteAction {
  return {
    type: SET_MANUAL_POSITIVE_NATURE,
    payload: {
      name,
      stat,
    },
  };
}

export function setManualNegativeNature(name: string, stat?: Stat): RouteAction {
  return {
    type: SET_MANUAL_NEGATIVE_NATURE,
    payload: {
      name,
      stat,
    },
  };
}

export function setManualNeutralNature(name: string, stat?: Stat): RouteAction {
  return {
    type: SET_MANUAL_NEUTRAL_NATURE,
    payload: {
      name,
      stat,
    },
  };
}

export function loadOptions(values: Partial<RouteOptionsState>): RouteAction {
  return {
    type: LOAD_OPTIONS,
    payload: { values },
  };
}

export function setOptionCompactIVs(value: boolean): RouteAction {
  return {
    type: SET_OPTION_COMPACT_IVS,
    payload: { value },
  };
}

export function setOptionHideMedia(value: boolean): RouteAction {
  return {
    type: SET_OPTION_HIDE_MEDIA,
    payload: { value },
  };
}

export function setOptionIVBackgroundColor(value: string): RouteAction {
  return {
    type: SET_OPTION_IV_BACKGROUND_COLOR,
    payload: { value },
  };
}

export function setOptionIVFontFamily(value: string): RouteAction {
  return {
    type: SET_OPTION_IV_FONT_FAMILY,
    payload: { value },
  };
}

export function setOptionIVHorizontalLayout(value: boolean): RouteAction {
  return {
    type: SET_OPTION_IV_HORIZONTAL_LAYOUT,
    payload: { value },
  };
}

export function triggerEvolution(name: string, deevolve: boolean): RouteAction {
  return {
    type: TRIGGER_EVOLUTION,
    payload: {
      name,
      deevolve,
    },
  };
}

export function resetTracker(name: string): RouteAction {
  return {
    type: RESET_TRACKER,
    payload: { name },
  };
}

export function setStartingLevel(name: string, startingLevel: number): RouteAction {
  return {
    type: SET_STARTING_LEVEL,
    payload: {
      name,
      startingLevel,
    },
  };
}

export function registerVariable(name: string, type: RouteVariableType, defaultValue?: string): RouteAction {
  return {
    type: REGISTER_VARIABLE,
    payload: {
      name,
      type,
      defaultValue,
    },
  };
}

export function setVariableValue(name: string, value: string): RouteAction {
  return {
    type: SET_VARIABLE_VALUE,
    payload: {
      name,
      value,
    },
  };
}

export function loadFile(): RouteAction {
  return {
    type: LOAD_FILE,
  };
}
