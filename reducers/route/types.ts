import { Nature, Stat, StatLine } from '../../utils/constants';
import { TypeName } from '../../utils/pokemonTypes';
import { Generation } from '../../utils/rangeTypes';

export const VALID_VARIABLE_TYPES = ['text', 'number', 'boolean', 'select'] as const;

export type RouteVariableType = typeof VALID_VARIABLE_TYPES[number];

export type BooleanRouteOptionStateKey = keyof Omit<RouteOptionsState, 'ivBackgroundColor' | 'ivFontFamily' | 'customCSS'>

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
  staticIVs: StatLine;
  staticNature: Nature | undefined;
  directInput: boolean;
  directInputNatures: Nature[];
  directInputIVs: StatLine;
  currentLevel: number;
  types: TypeName[];
  levelIncrementLines: Record<number, number>;
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
  customCSS: string | undefined;
  ivHorizontalLayout: boolean;
  expandConditions: boolean;
  renderOnlyTrackers: boolean;
  hideIVResults: boolean;
  debugMode: boolean;
}

export interface RouteState {
  repoPath: string | undefined;
  showOptions: boolean;
  trackers: Record<string, Tracker>;
  variables: Record<string, VariableState>;
  options: RouteOptionsState;
  routeErrors: string[];
}

export const SET_REPO_PATH = 'SET_REPO_PATH';
export const REGISTER_TRACKER = 'REGISTER_TRACKER';
export const SET_SHOW_OPTIONS = 'SET_SHOW_OPTIONS';
export const SET_STAT = 'SET_STAT';
export const SET_MANUAL_NATURE = 'SET_MANUAL_NATURE';
export const SET_MANUAL_POSITIVE_NATURE = 'SET_MANUAL_POSITIVE_NATURE';
export const SET_MANUAL_NEGATIVE_NATURE = 'SET_MANUAL_NEGATIVE_NATURE';
export const SET_MANUAL_NEUTRAL_NATURE = 'SET_MANUAL_NEUTRAL_NATURE';
export const SET_CURRENT_LEVEL = 'SET_CURRENT_LEVEL';
export const LOAD_OPTIONS = 'LOAD_OPTIONS';
export const SET_OPTION_IV_BACKGROUND_COLOR = 'SET_OPTION_IV_BACKGROUND_COLOR';
export const SET_OPTION_IV_FONT_FAMILY = 'SET_OPTION_IV_FONT_FAMILY';
export const SET_OPTION_CUSTOM_CSS = 'SET_OPTION_CUSTOM_CSS';
export const SET_BOOLEAN_OPTION = 'SET_BOOLEAN_OPTION';
export const SET_DIRECT_INPUT_IV = 'SET_DIRECT_INPUT_IV';
export const TRIGGER_EVOLUTION = 'TRIGGER_EVOLUTION';
export const RESET_TRACKER = 'RESET_TRACKER';
export const SET_STARTING_LEVEL = 'SET_STARTING_LEVEL';
export const REGISTER_VARIABLE = 'REGISTER_VARIABLE';
export const SET_VARIABLE_VALUE = 'SET_VARIABLE_VALUE';
export const SET_LEVEL_INCREMENT_LINE = 'SET_LEVEL_INCREMENT_LINE';
export const RESET_ROUTE = 'RESET_ROUTE';
export const LOAD_FILE = 'LOAD_FILE';
export const LOG_ROUTE_ERROR = 'LOG_ROUTE_ERROR';

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
    staticIVs: StatLine;
    staticNature: Nature | undefined;
    directInput: boolean;
    directInputNatures: Nature[] | undefined;
    types: TypeName[];
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

type SetManualNatureAction = {
  type: typeof SET_MANUAL_NATURE;
  payload: {
    name: string;
    positive: Stat | undefined;
    negative: Stat | undefined;
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

type SetCurrentLevelAction = {
  type: typeof SET_CURRENT_LEVEL;
  payload: {
    name: string;
    level: number;
  };
}

type LoadOptionsAction = {
  type: typeof LOAD_OPTIONS,
  payload: {
    values: Partial<RouteOptionsState>;
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

type SetOptionCustomCSSAction = {
  type: typeof SET_OPTION_CUSTOM_CSS;
  payload: {
    value: string;
  };
}

type SetBooleanOptionAction = {
  type: typeof SET_BOOLEAN_OPTION;
  payload: {
    key: BooleanRouteOptionStateKey;
    value: boolean;
  };
}

type SetDirectInputIVAction = {
  type: typeof SET_DIRECT_INPUT_IV;
  payload: {
    name: string;
    stat: Stat;
    value: number;
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

type SetLevelIncrementLineAction = {
  type: typeof SET_LEVEL_INCREMENT_LINE;
  payload: {
    source: string;
    level: number;
    line: number;
  };
};

type ResetRouteAction = {
  type: typeof RESET_ROUTE;
};

type LoadFileAction = {
  type: typeof LOAD_FILE;
}

type LogRouteErrorAction = {
  type: typeof LOG_ROUTE_ERROR;
  payload: {
    message: string;
  };
}

export type RouteAction =
  SetRepoPathAction |
  RegisterTrackerAction |
  SetShowOptionsAction |
  SetStatAction |
  SetManualNatureAction |
  SetManualPositiveNatureAction |
  SetManualNegativeNatureAction |
  SetManualNeutralNatureAction |
  SetCurrentLevelAction |
  LoadOptionsAction |
  SetOptionIVBackgroundColorAction |
  SetOptionIVFontFamilyAction |
  SetOptionCustomCSSAction |
  SetBooleanOptionAction |
  SetDirectInputIVAction |
  TriggerEvolutionAction |
  ResetTrackerAction |
  SetStartingLevelAction |
  RegisterVariableAction |
  SetVariableValueAction |
  SetLevelIncrementLineAction |
  ResetRouteAction |
  LoadFileAction |
  LogRouteErrorAction;
