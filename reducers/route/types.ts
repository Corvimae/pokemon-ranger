import { Stat } from '../../utils/constants';
import { Generation } from '../../utils/rangeTypes';

export interface StatLine {
  hp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
}

export type EVsByLevel = Record<number, StatLine>;

export interface Tracker {
  name: string;
  evolution: number;
  generation: Generation;
  calculateHiddenPower: boolean;
  startingLevel: number;
  baseStats: StatLine[];
  recordedStats: Record<number, Record<number, StatLine>>;
  evSegments: Record<number, EVsByLevel>;
  manualPositiveNature: Stat | undefined;
  manualNegativeNature: Stat | undefined;
}

export interface RouteState {
  repoPath: string | undefined;
  trackers: Record<string, Tracker>;
}

export const SET_REPO_PATH = 'SET_REPO_PATH';
export const REGISTER_TRACKER = 'REGISTER_TRACKER';
export const SET_STAT = 'SET_STAT';
export const SET_MANUAL_POSITIVE_NATURE = 'SET_MANUAL_POSITIVE_NATURE';
export const SET_MANUAL_NEGATIVE_NATURE = 'SET_MANUAL_NEGATIVE_NATURE';
export const TRIGGER_EVOLUTION = 'TRIGGER_EVOLUTION';
export const RESET_TRACKER = 'RESET_TRACKER';
export const SET_STARTING_LEVEL = 'SET_STARTING_LEVEL';
export const LOAD_FILE = 'LOAD_FILE';

type SetRepoPathAction = {
  type: typeof SET_REPO_PATH;
  payload: {
    repoPath: string | undefined;
  };
};

type RegisterTrackerAction = {
  type: typeof REGISTER_TRACKER;
  payload: {
    name: string;
    generation: Generation;
    calculateHiddenPower: boolean;
    baseStats: StatLine[];
    evSegments: Record<number, EVsByLevel>;
  },
};

type SetStatAction = {
  type: typeof SET_STAT;
  payload: {
    name: string;
    stat: Stat;
    value: number;
    level: number;
  };
}

type SetManualPositiveNature = {
  type: typeof SET_MANUAL_POSITIVE_NATURE;
  payload: {
    name: string;
    stat: Stat | undefined;
  };
}

type SetManualNegativeNature = {
  type: typeof SET_MANUAL_NEGATIVE_NATURE;
  payload: {
    name: string;
    stat: Stat | undefined;
  };
}

type TriggerEvolutionAction = {
  type: typeof TRIGGER_EVOLUTION;
  payload: {
    name: string;
  };
};

type ResetTrackerAction = {
  type: typeof RESET_TRACKER;
  payload: {
    name: string;
  };
};

type SetStartingLevelAction = {
  type: typeof SET_STARTING_LEVEL;
  payload: {
    name: string;
    startingLevel: number;
  };
};

type LoadFileAction = {
  type: typeof LOAD_FILE;
}

export type RouteAction =
  SetRepoPathAction |
  RegisterTrackerAction |
  SetStatAction |
  SetManualPositiveNature |
  SetManualNegativeNature |
  TriggerEvolutionAction |
  ResetTrackerAction |
  SetStartingLevelAction |
  LoadFileAction;
