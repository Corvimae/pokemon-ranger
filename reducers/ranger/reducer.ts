import { useParameterizedReducer } from '../../utils/hooks';
import { RangerReducerAction, RangerReducerState, RESET_STATE, SET_BASE_STAT, SET_COMBAT_STAGES, SET_CRITICAL_HIT, SET_DISPLAY_EXPANDED, SET_DISPLAY_ROLLS, SET_EVS, SET_GENERATION, SET_INITIAL_STATE, SET_LEVEL, SET_MOVE_POWER, SET_MULTI_TARGET, SET_OFFENSIVE_MODE, SET_OPPONENT_COMBAT_STAGES, SET_OPPONENT_LEVEL, SET_OPPONENT_STAT, SET_OTHER_MODIFIER, SET_STAB, SET_TORRENT, SET_TYPE_EFFECTIVENESS, SET_WEATHER_BOOSTED, SET_WEATHER_REDUCED } from './types';

const defaultState: RangerReducerState = {
  displayExpanded: false,
  displayRolls: false,
  offensiveMode: true,
  level: 5,
  baseStat: 20,
  evs: 0,
  combatStages: 0,
  movePower: 50,
  typeEffectiveness: 1,
  stab: false,
  generation: 4,
  criticalHit: false,
  torrent: false,
  multiTarget: false,
  weatherBoosted: false,
  weatherReduced: false,
  otherModifier: 1,
  opponentStat: 20,
  opponentLevel: 5,
  opponentCombatStages: 0,
};

const reducer = (state: RangerReducerState, action: RangerReducerAction): RangerReducerState => {
  switch (action.type) {
    case SET_DISPLAY_EXPANDED:
      return {
        ...state,
        displayExpanded: action.payload.displayExpanded,
      };

    case SET_DISPLAY_ROLLS:
      return {
        ...state,
        displayRolls: action.payload.displayRolls,
      };

    case SET_OFFENSIVE_MODE:
      return {
        ...state,
        offensiveMode: action.payload.offensiveMode,
      };

    case SET_LEVEL:
      return {
        ...state,
        level: action.payload.level,
      };

    case SET_BASE_STAT:
      return {
        ...state,
        baseStat: action.payload.baseStat,
      };

    case SET_EVS:
      return {
        ...state,
        evs: action.payload.evs,
      };

    case SET_COMBAT_STAGES:
      return {
        ...state,
        combatStages: action.payload.combatStages,
      };

    case SET_MOVE_POWER:
      return {
        ...state,
        movePower: action.payload.movePower,
      };

    case SET_TYPE_EFFECTIVENESS:
      return {
        ...state,
        typeEffectiveness: action.payload.typeEffectiveness,
      };

    case SET_STAB:
      return {
        ...state,
        stab: action.payload.stab,
      };

    case SET_GENERATION:
      return {
        ...state,
        generation: action.payload.generation,
      };

    case SET_CRITICAL_HIT:
      return {
        ...state,
        criticalHit: action.payload.criticalHit,
      };

    case SET_TORRENT:
      return {
        ...state,
        torrent: action.payload.torrent,
      };

    case SET_MULTI_TARGET:
      return {
        ...state,
        multiTarget: action.payload.multiTarget,
      };
  
    case SET_WEATHER_BOOSTED: 
      return {
        ...state,
        weatherBoosted: action.payload.weatherBoosted,
      };

    case SET_WEATHER_REDUCED:
      return {
        ...state,
        weatherReduced: action.payload.weatherReduced,
      };

    case SET_OTHER_MODIFIER:
      return {
        ...state,
        otherModifier: action.payload.otherModifier,
      };

    case SET_OPPONENT_STAT:
      return {
        ...state,
        opponentStat: action.payload.opponentStat,
      };

    case SET_OPPONENT_LEVEL:
      return {
        ...state,
        opponentLevel: action.payload.opponentLevel,
      };

    case SET_OPPONENT_COMBAT_STAGES:
      return {
        ...state,
        opponentCombatStages: action.payload.opponentCombatStages
      };

    case SET_INITIAL_STATE:
      return { ...action.payload };  

    case RESET_STATE:
      return { ...defaultState };

    default:
      return state;
  }
}

export const useRangerReducer = () => useParameterizedReducer(reducer, defaultState, setInitialState);

export function setDisplayExpanded(displayExpanded: boolean): RangerReducerAction {
  return {
    type: SET_DISPLAY_EXPANDED,
    payload: { displayExpanded },
  };
}

export function setDisplayRolls(displayRolls: boolean): RangerReducerAction {
  return {
    type: SET_DISPLAY_ROLLS,
    payload: { displayRolls },
  };
}

export function setOffensiveMode(offensiveMode: boolean): RangerReducerAction {
  return {
    type: SET_OFFENSIVE_MODE,
    payload: { offensiveMode },
  };
}

export function setLevel(level: number): RangerReducerAction {
  return {
    type: SET_LEVEL,
    payload: { level: Number(level) },
  };
}

export function setBaseStat(baseStat: number): RangerReducerAction {
  return {
    type: SET_BASE_STAT,
    payload: { baseStat: Number(baseStat) },
  };
}

export function setEVs(evs: number): RangerReducerAction {
  return {
    type: SET_EVS,
    payload: { evs: Number(evs) },
  };
}

export function setCombatStages(combatStages: number): RangerReducerAction {
  return {
    type: SET_COMBAT_STAGES,
    payload: { combatStages: Number(combatStages) },
  };
}

export function setMovePower(movePower: number): RangerReducerAction {
  return {
    type: SET_MOVE_POWER,
    payload: { movePower: Number(movePower) },
  };
}

export function setTypeEffectiveness(typeEffectiveness: number): RangerReducerAction {
  return {
    type: SET_TYPE_EFFECTIVENESS,
    payload: { typeEffectiveness },
  };
}

export function setSTAB(stab: boolean): RangerReducerAction {
  return {
    type: SET_STAB,
    payload: { stab },
  };
}

export function setGeneration(generation: number): RangerReducerAction {
  return {
    type: SET_GENERATION,
    payload: { generation },
  };
}

export function setCriticalHit(criticalHit: boolean): RangerReducerAction {
  return {
    type: SET_CRITICAL_HIT,
    payload: { criticalHit },
  }
}

export function setTorrent(torrent: boolean): RangerReducerAction {
  return {
    type: SET_TORRENT,
    payload: { torrent },
  };
}

export function setMultiTarget(multiTarget: boolean): RangerReducerAction {
  return {
    type: SET_MULTI_TARGET,
    payload: { multiTarget },
  };
}

export function setWeatherBoosted(weatherBoosted: boolean): RangerReducerAction {
  return {
    type: SET_WEATHER_BOOSTED,
    payload: { weatherBoosted },
  };
}

export function setWeatherReduced(weatherReduced: boolean): RangerReducerAction {
  return {
    type: SET_WEATHER_REDUCED,
    payload: { weatherReduced },
  };
}

export function setOtherModifier(otherModifier: number): RangerReducerAction {
  return {
    type: SET_OTHER_MODIFIER,
    payload: { otherModifier: Number(otherModifier) },
  };
}

export function setOpponentStat(opponentStat: number): RangerReducerAction {
  return {
    type: SET_OPPONENT_STAT,
    payload: { opponentStat: Number(opponentStat) },
  };
}

export function setOpponentLevel(opponentLevel: number): RangerReducerAction {
  return {
    type: SET_OPPONENT_LEVEL,
    payload: { opponentLevel: Number(opponentLevel) },
  };
}

export function setOpponentCombatStages(opponentCombatStages: number): RangerReducerAction {
  return {
    type: SET_OPPONENT_COMBAT_STAGES,
    payload: { opponentCombatStages: Number(opponentCombatStages) },
  };
}

export function setInitialState(state: RangerReducerState): RangerReducerAction {
  return {
    type: SET_INITIAL_STATE,
    payload: state,
  };
}

export function resetState(): RangerReducerAction {
  return {
    type: RESET_STATE,
  };
}
