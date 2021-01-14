import set from 'lodash/set';
import cloneDeep from 'lodash/cloneDeep';
import { Stat } from '../../utils/constants';
import { prepareContextualReducer } from '../../utils/hooks';
import { EVsByLevel, LOAD_FILE, REGISTER_TRACKER, RESET_TRACKER, RouteAction, RouteState, SET_REPO_PATH, SET_STARTING_LEVEL, SET_STAT, StatLine, TRIGGER_EVOLUTION } from './types';
import { Generation } from '../../utils/rangeTypes';

const defaultState: RouteState = {
  repoPath: undefined,
  trackers: {},
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

    case SET_STAT:
      return set(
        cloneDeep(state),
        [
          'trackers',
          action.payload.name,
          'recordedStats',
          state.trackers[action.payload.name].evolution,
          action.payload.level,
          action.payload.stat,
        ],
        action.payload.value,
      );

    case TRIGGER_EVOLUTION:
      return set(
        cloneDeep(state),
        ['trackers', action.payload.name, 'evolution'],
        state.trackers[action.payload.name].evolution + 1,
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

export function triggerEvolution(name: string): RouteAction {
  return {
    type: TRIGGER_EVOLUTION,
    payload: { name },
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

export function loadFile(): RouteAction {
  return {
    type: LOAD_FILE,
  };
}
