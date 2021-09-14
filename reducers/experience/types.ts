import { ExperienceEvent, GrowthRate } from '../../utils/calculations';

export const SET_INITIAL_LEVEL = 'SET_INITIAL_LEVEL';
export const SET_GROWTH_RATE = 'SET_GROWTH_RATE';
export const ADD_RARE_CANDY_EXPERIENCE_EVENT = 'ADD_RARE_CANDY_EXPERIENCE_EVENT';
export const ADD_SPECIES_EXPERIENCE_EVENT = 'ADD_SPECIES_EXPERIENCE_EVENT';
export const ADD_MANUAL_EXPERIENCE_EVENT = 'ADD_MANUAL_EXPERIENCE_EVENT';
export const SET_EXPERIENCE_EVENT_REWARD = 'SET_EXPERIENCE_EVENT_REWARD';
export const REMOVE_EXPERIENCE_EVENT = 'REMOVE_EXPERIENCE_EVENT';
export const REORDER_EXPERIENCE_EVENTS = 'REORDER_EXPERIENCE_EVENTS';
export const TOGGLE_EXPERIENCE_EVENT_ENABLED = 'TOGGLE_EXPERIENCE_EVENT_ENABLED';

export const IMPORT_EXPERIENCE_ROUTE = 'IMPORT_EXPERIENCE_ROUTE';
export const RESET_STATE = 'RESET_STATE';

export interface ExperienceState {
  initialLevel: number;
  growthRate: GrowthRate
  experienceEvents: ExperienceEvent[];
}

type SetInitialLevelAction = {
  type: typeof SET_INITIAL_LEVEL;
  payload: {
    value: number;
  };
};

type SetGrowthRateAction = {
  type: typeof SET_GROWTH_RATE;
  payload: {
    value: GrowthRate;
  };
};

type AddRareCandyExperienceEventAction = {
  type: typeof ADD_RARE_CANDY_EXPERIENCE_EVENT;
  payload: {
    position: number;
  };
};

type AddSpeciesExperienceEventAction = {
  type: typeof ADD_SPECIES_EXPERIENCE_EVENT;
  payload: {
    name: string;
    baseExperience: number;
    level: number;
    expShareEnabled: boolean;
    participated: boolean;
    otherParticipantCount: number;
    otherPokemonHoldingExperienceShare: number;
    partySize: number;
    isTrade: boolean;
    isInternationalTrade: boolean;
    hasLuckyEgg: boolean;
    hasAffectionBoost: boolean;
    isWild: boolean;
    isPastEvolutionPoint: boolean;
    hpEVValue: number;
    attackEVValue: number;
    defenseEVValue: number;
    spAttackEVValue: number;
    spDefenseEVValue: number;
    speedEVValue: number;
    position: number;
  };
};

type AddManualExperienceEventAction = {
  type: typeof ADD_MANUAL_EXPERIENCE_EVENT;
  payload: {
    name: string;
    value: number;
    hpEVValue: number;
    attackEVValue: number;
    defenseEVValue: number;
    spAttackEVValue: number;
    spDefenseEVValue: number;
    speedEVValue: number;
    position: number;
  };
};

type SetExperienceEventRewardAction = {
  type: typeof SET_EXPERIENCE_EVENT_REWARD;
  payload: {
    id: string;
    reward: number;
  };
};

type RemoveExperienceEventAction = {
  type: typeof REMOVE_EXPERIENCE_EVENT;
  payload: {
    id: string;
  };
};

type ReorderExperinceEventsAction = {
  type: typeof REORDER_EXPERIENCE_EVENTS;
  payload: {
    events: ExperienceEvent[];
  };
};

type ToggleExperienceEventEnabledAction = {
  type: typeof TOGGLE_EXPERIENCE_EVENT_ENABLED;
  payload: {
    id: string;
    enabled: boolean;
  };
};

type ImportExperienceRouteAction = {
  type: typeof IMPORT_EXPERIENCE_ROUTE;
  payload: ExperienceState;
}

type ResetStateAction = {
  type: typeof RESET_STATE;
};

export type ExperienceReducerAction =
  SetInitialLevelAction |
  SetGrowthRateAction |
  AddRareCandyExperienceEventAction |
  AddSpeciesExperienceEventAction |
  AddManualExperienceEventAction |
  SetExperienceEventRewardAction |
  RemoveExperienceEventAction |
  ReorderExperinceEventsAction |
  ToggleExperienceEventEnabledAction |
  ImportExperienceRouteAction |
  ResetStateAction;
