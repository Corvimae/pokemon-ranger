import { Stat } from '../../utils/constants';

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
  startingLevel: number;
  baseStats: StatLine[];
  recordedStats: Record<number, Record<number, StatLine>>;
  evSegments: Record<number, EVsByLevel>;
}

export interface RouteState {
  trackers: Record<string, Tracker>;
}

export const REGISTER_TRACKER = 'REGISTER_TRACKER';
export const SET_STAT = 'SET_STAT';
export const TRIGGER_EVOLUTION = 'TRIGGER_EVOLUTION';
export const RESET_TRACKER = 'RESET_TRACKER';
export const SET_STARTING_LEVEL = 'SET_STARTING_LEVEL';

type RegisterTrackerAction = {
  type: typeof REGISTER_TRACKER;
  payload: {
    name: string;
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

export type RouteAction =
  RegisterTrackerAction |
  SetStatAction |
  TriggerEvolutionAction |
  ResetTrackerAction |
  SetStartingLevelAction;
