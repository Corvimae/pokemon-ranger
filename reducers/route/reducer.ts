import set from 'lodash/set';
import get from 'lodash/get';
import cloneDeep from 'lodash/cloneDeep';
import { createStatLine, Nature, Stat, StatLine } from '../../utils/constants';
import { prepareContextualReducer } from '../../utils/hooks';
import { EVsByLevel, LOAD_FILE, REGISTER_TRACKER, SET_SHOW_OPTIONS, RESET_TRACKER, RouteAction, RouteState, SET_MANUAL_NEGATIVE_NATURE, SET_MANUAL_NEUTRAL_NATURE, SET_MANUAL_POSITIVE_NATURE, SET_REPO_PATH, SET_STARTING_LEVEL, SET_STAT, TRIGGER_EVOLUTION, LOAD_OPTIONS, RouteOptionsState, SET_OPTION_IV_BACKGROUND_COLOR, SET_OPTION_IV_FONT_FAMILY, RouteVariableType, REGISTER_VARIABLE, SET_VARIABLE_VALUE, RESET_ROUTE, SET_DIRECT_INPUT_IV, SET_MANUAL_NATURE, SET_BOOLEAN_OPTION, BooleanRouteOptionStateKey } from './types';
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
    expandConditions: false,
    renderOnlyTrackers: false,
    hideIVResults: false,
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
            staticIVs: action.payload.staticIVs,
            staticNature: action.payload.staticNature,
            directInput: action.payload.directInput,
            directInputIVs: createStatLine(0, 0, 0, 0, 0, 0),
            directInputNatures: action.payload.directInputNatures ?? [],
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

    case SET_MANUAL_NATURE:
      return {
        ...state,
        trackers: {
          ...state.trackers,
          [action.payload.name]: {
            ...state.trackers[action.payload.name],
            manualPositiveNature: action.payload.positive,
            manualNegativeNature: action.payload.negative,
          },
        },
      };

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

    case SET_BOOLEAN_OPTION:
      return {
        ...state,
        options: {
          ...state.options,
          [action.payload.key]: action.payload.value,
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

    case SET_DIRECT_INPUT_IV:
      return set(
        cloneDeep(state),
        ['trackers', action.payload.name, 'directInputIVs', action.payload.stat],
        action.payload.value,
      );

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
            directInputIVs: createStatLine(0, 0, 0, 0, 0, 0),
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
    
    case RESET_ROUTE:
      return {
        ...state,
        variables: Object.entries(state.variables).reduce((acc, [key, item]) => ({
          ...acc,
          [key]: {
            ...item,
            value: item.defaultValue,
          },
        }), {}),
        trackers: Object.keys(state.trackers).reduce((acc, key) => ({
          ...acc,
          [key]: {
            ...state.trackers[key],
            evolution: 0,
            recordedStats: {},
            manualPositiveNature: undefined,
            manualNegativeNature: undefined,
          },
        }), {}),
      };

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

export function registerTracker(name: string, baseStats: StatLine[], generation: Generation, calculateHiddenPower: boolean, evSegments: Record<number, EVsByLevel>, staticIVs: StatLine, staticNature: Nature | undefined, directInput: boolean, directInputNatures: Nature[] | undefined): RouteAction {
  return {
    type: REGISTER_TRACKER,
    payload: {
      name,
      baseStats,
      generation,
      calculateHiddenPower,
      evSegments,
      staticIVs,
      staticNature,
      directInput,
      directInputNatures,
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

export function setManualNature(name: string, positive?: Stat, negative?: Stat): RouteAction {
  return {
    type: SET_MANUAL_NATURE,
    payload: {
      name,
      positive,
      negative,
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

export function setBooleanOption(key: BooleanRouteOptionStateKey, value: boolean): RouteAction {
  return {
    type: SET_BOOLEAN_OPTION,
    payload: { key, value },
  };
}

export function setDirectInputIV(name: string, stat: Stat, value: number): RouteAction {
  return {
    type: SET_DIRECT_INPUT_IV,
    payload: {
      name,
      stat,
      value,
    },
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

export function resetRoute(): RouteAction {
  return {
    type: RESET_ROUTE,
  };
}

export function loadFile(): RouteAction {
  return {
    type: LOAD_FILE,
  };
}
