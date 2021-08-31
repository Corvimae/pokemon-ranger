import { Stat } from '../../utils/constants';
import { Generation } from '../../utils/rangeTypes';

export const VALID_VARIABLE_TYPES = ['text', 'number', 'boolean', 'select'] as const;

export type RouteVariableType = typeof VALID_VARIABLE_TYPES[number];

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

export interface VariableState {
  value: string | undefined;
  type: RouteVariableType;
  defaultValue: string | undefined;
}

export interface RouteOptionsState {
  compactIVs: boolean;
  hideMedia: boolean;
  ivBackgroundColor: string;
  ivFontFamily: string | undefined;
  ivHorizontalLayout: boolean;
}

export interface RouteState {
  repoPath: string | undefined;
  showOptions: boolean;
  trackers: Record<string, Tracker>;
  variables: Record<string, VariableState>;
  options: RouteOptionsState
}

export const SET_REPO_PATH = 'SET_REPO_PATH';
export const REGISTER_TRACKER = 'REGISTER_TRACKER';
export const SET_SHOW_OPTIONS = 'SET_SHOW_OPTIONS';
export const SET_STAT = 'SET_STAT';
export const SET_MANUAL_POSITIVE_NATURE = 'SET_MANUAL_POSITIVE_NATURE';
export const SET_MANUAL_NEGATIVE_NATURE = 'SET_MANUAL_NEGATIVE_NATURE';
export const SET_MANUAL_NEUTRAL_NATURE = 'SET_MANUAL_NEUTRAL_NATURE';
export const LOAD_OPTIONS = 'LOAD_OPTIONS';
export const SET_OPTION_COMPACT_IVS = 'SET_OPTION_COMPACT_IVS';
export const SET_OPTION_HIDE_MEDIA = 'SET_OPTION_HIDE_MEDIA';
export const SET_OPTION_IV_BACKGROUND_COLOR = 'SET_OPTION_IV_BACKGROUND_COLOR';
export const SET_OPTION_IV_FONT_FAMILY = 'SET_OPTION_IV_FONT_FAMILY';
export const SET_OPTION_IV_HORIZONTAL_LAYOUT = 'SET_OPTION_IV_HORIZONTAL_LAYOUT';
export const TRIGGER_EVOLUTION = 'TRIGGER_EVOLUTION';
export const RESET_TRACKER = 'RESET_TRACKER';
export const SET_STARTING_LEVEL = 'SET_STARTING_LEVEL';
export const REGISTER_VARIABLE = 'REGISTER_VARIABLE';
export const SET_VARIABLE_VALUE = 'SET_VARIABLE_VALUE';
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
  };
}

type SetShowOptionsAction = {
  type: typeof SET_SHOW_OPTIONS;
  payload: {
    value: boolean;
  };
}

type SetStatAction = {
  type: typeof SET_STAT;
  payload: {
    name: string;
    stat: Stat;
    value: number;
    level: number;
  };
}

type SetManualPositiveNatureAction = {
  type: typeof SET_MANUAL_POSITIVE_NATURE;
  payload: {
    name: string;
    stat: Stat | undefined;
  };
}

type SetManualNegativeNatureAction = {
  type: typeof SET_MANUAL_NEGATIVE_NATURE;
  payload: {
    name: string;
    stat: Stat | undefined;
  };
}

type SetManualNeutralNatureAction = {
  type: typeof SET_MANUAL_NEUTRAL_NATURE;
  payload: {
    name: string;
    stat: Stat | undefined;
  };
}

type LoadOptionsAction = {
  type: typeof LOAD_OPTIONS,
  payload: {
    values: Partial<RouteOptionsState>;
  };
}

type SetOptionCompactIVsAction = {
  type: typeof SET_OPTION_COMPACT_IVS;
  payload: {
    value: boolean;
  };
}

type SetOptionHideMediaAction = {
  type: typeof SET_OPTION_HIDE_MEDIA;
  payload: {
    value: boolean;
  };
}

type SetOptionIVBackgroundColorAction = {
  type: typeof SET_OPTION_IV_BACKGROUND_COLOR;
  payload: {
    value: string;
  };
}

type SetOptionIVFontFamilyAction = {
  type: typeof SET_OPTION_IV_FONT_FAMILY;
  payload: {
    value: string;
  };
}

type SetOptionIVHorizontalLayoutAction = {
  type: typeof SET_OPTION_IV_HORIZONTAL_LAYOUT;
  payload: {
    value: boolean;
  };
}

type TriggerEvolutionAction = {
  type: typeof TRIGGER_EVOLUTION;
  payload: {
    name: string;
    deevolve: boolean;
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

type RegisterVariableAction = {
  type: typeof REGISTER_VARIABLE;
  payload: {
    name: string;
    type: RouteVariableType;
    defaultValue?: string;
  };
};

type SetVariableValueAction = {
  type: typeof SET_VARIABLE_VALUE;
  payload: {
    name: string;
    value: string;
  };
};

type LoadFileAction = {
  type: typeof LOAD_FILE;
}

export type RouteAction =
  SetRepoPathAction |
  RegisterTrackerAction |
  SetShowOptionsAction |
  SetStatAction |
  SetManualPositiveNatureAction |
  SetManualNegativeNatureAction |
  SetManualNeutralNatureAction |
  LoadOptionsAction |
  SetOptionCompactIVsAction |
  SetOptionHideMediaAction |
  SetOptionIVBackgroundColorAction |
  SetOptionIVFontFamilyAction |
  SetOptionIVHorizontalLayoutAction |
  TriggerEvolutionAction |
  ResetTrackerAction |
  SetStartingLevelAction |
  RegisterVariableAction |
  SetVariableValueAction |
  LoadFileAction;
