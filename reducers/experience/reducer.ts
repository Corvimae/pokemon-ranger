import { Dispatch, useReducer } from 'react';
import { v4 as uuid } from 'uuid';
import { ExperienceEvent, GrowthRate } from '../../utils/calculations';
import { ADD_MANUAL_EXPERIENCE_EVENT, ADD_RARE_CANDY_EXPERIENCE_EVENT, ADD_SPECIES_EXPERIENCE_EVENT, ExperienceReducerAction, ExperienceState, REMOVE_EXPERIENCE_EVENT, REORDER_EXPERIENCE_EVENTS, RESET_STATE, SET_EXPERIENCE_EVENT_REWARD, SET_GROWTH_RATE, SET_INITIAL_LEVEL } from './types';

const defaultState: ExperienceState = {
  initialLevel: 5,
  growthRate: 'fast',
  experienceEvents: [],
};

const reducer = (state: ExperienceState, action: ExperienceReducerAction): ExperienceState => {
  switch (action.type) {
    case SET_INITIAL_LEVEL:
      return {
        ...state,
        initialLevel: action.payload.value,
      };

    case SET_GROWTH_RATE:
      return {
        ...state,
        growthRate: action.payload.value,
      };

    case ADD_RARE_CANDY_EXPERIENCE_EVENT:
      return {
        ...state,
        experienceEvents: [...state.experienceEvents, {
          id: uuid(),
          type: 'rareCandy',
        }],
      };

    case ADD_SPECIES_EXPERIENCE_EVENT:
      return {
        ...state,
        experienceEvents: [...state.experienceEvents, {
          id: uuid(),
          type: 'species',
          name: action.payload.name,
          baseExperience: action.payload.baseExperience,
          level: action.payload.level,
          expShareEnabled: action.payload.expShareEnabled,
          participated: action.payload.participated,
          otherParticipantCount: action.payload.otherParticipantCount,
          otherPokemonHoldingExperienceShare: action.payload.otherPokemonHoldingExperienceShare,
          partySize: action.payload.partySize,
          isTrade: action.payload.isTrade,
          isInternationalTrade: action.payload.isInternationalTrade,
          hasLuckyEgg: action.payload.hasLuckyEgg,
          hasAffectionBoost: action.payload.hasAffectionBoost,
          isWild: action.payload.isWild,
          isPastEvolutionPoint: action.payload.isPastEvolutionPoint,
        }],
      };

    case ADD_MANUAL_EXPERIENCE_EVENT:
      return {
        ...state,
        experienceEvents: [...state.experienceEvents, {
          id: uuid(),
          type: 'manual',
          name: action.payload.name,
          value: action.payload.value,
        }],
      };

    case SET_EXPERIENCE_EVENT_REWARD:
      return {
        ...state,
        experienceEvents: state.experienceEvents.reduce((acc, event) => [
          ...acc,
          action.payload.id === event.id ? {
            ...event,
            experience: action.payload.reward,
          } : event,
        ], [] as ExperienceEvent[]),
      };

    case REMOVE_EXPERIENCE_EVENT:
      return {
        ...state,
        experienceEvents: state.experienceEvents.reduce((acc, event) => (
          action.payload.id === event.id ? acc : [...acc, event]
        ), [] as ExperienceEvent[]),
      };

    case REORDER_EXPERIENCE_EVENTS:
      return {
        ...state,
        experienceEvents: action.payload.events,
      };
      
    case RESET_STATE:
      return { ...defaultState };

    default:
      return state;
  }
};

export const useExperienceReducer = (): [ExperienceState, Dispatch<ExperienceReducerAction>] => useReducer(reducer, defaultState);

export function setInitialLevel(value: number): ExperienceReducerAction {
  return {
    type: SET_INITIAL_LEVEL,
    payload: { value },
  };
}

export function setGrowthRate(value: GrowthRate): ExperienceReducerAction {
  return {
    type: SET_GROWTH_RATE,
    payload: { value },
  };
}

export function addRareCandyExperienceEvent(): ExperienceReducerAction {
  return {
    type: ADD_RARE_CANDY_EXPERIENCE_EVENT,
  };
}

export function addSpeciesExperienceEvent(
  name: string,
  baseExperience: number,
  level: number,
  expShareEnabled: boolean,
  participated: boolean,
  otherParticipantCount: number,
  otherPokemonHoldingExperienceShare: number,
  partySize: number,
  isTrade: boolean,
  isInternationalTrade: boolean,
  hasLuckyEgg: boolean,
  hasAffectionBoost: boolean,
  isWild: boolean,
  isPastEvolutionPoint: boolean,
): ExperienceReducerAction {
  return {
    type: ADD_SPECIES_EXPERIENCE_EVENT,
    payload: {
      name,
      baseExperience,
      level,
      expShareEnabled,
      participated,
      otherParticipantCount,
      otherPokemonHoldingExperienceShare,
      partySize,
      isTrade,
      isInternationalTrade,
      hasLuckyEgg,
      hasAffectionBoost,
      isWild,
      isPastEvolutionPoint,
    },
  };
}

export function addManualExperienceEvent(name: string, value: number): ExperienceReducerAction {
  return {
    type: ADD_MANUAL_EXPERIENCE_EVENT,
    payload: {
      name,
      value,
    },
  };
}

export function setExperienceEventReward(id: string, reward: number): ExperienceReducerAction {
  return {
    type: SET_EXPERIENCE_EVENT_REWARD,
    payload: { id, reward },
  };
}

export function removeExperienceEvent(id: string): ExperienceReducerAction {
  return {
    type: REMOVE_EXPERIENCE_EVENT,
    payload: { id },
  };
}

export function reorderExperienceEvents(events: ExperienceEvent[]): ExperienceReducerAction {
  return {
    type: REORDER_EXPERIENCE_EVENTS,
    payload: { events },
  };
}

export function resetState(): ExperienceReducerAction {
  return {
    type: RESET_STATE,
  };
}
