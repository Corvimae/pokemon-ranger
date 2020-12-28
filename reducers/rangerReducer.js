import { useParameterizedReducer } from '../utils/hooks';

const SET_DISPLAY_EXPANDED = 'SET_DISPLAY_EXPANDED';
const SET_DISPLAY_ROLLS = 'SET_DISPLAY_ROLLS';
const SET_OFFENSIVE_MODE = 'SET_OFFENSIVE_MODE';
const SET_LEVEL = 'SET_LEVEL';
const SET_BASE_STAT = 'SET_BASE_STAT';
const SET_EVS = 'SET_EVS';
const SET_COMBAT_STAGES = 'SET_COMBAT_STAGES';
const SET_MOVE_POWER = 'SET_MOVE_POWER';
const SET_TYPE_EFFECTIVENESS = 'SET_TYPE_EFFECTIVENESS';
const SET_STAB = 'SET_STAB';
const SET_GENERATION = 'SET_GENERATION';
const SET_MULTI_TARGET = 'SET_MULTI_TARGET';
const SET_WEATHER_BOOSTED = 'SET_WEATHER_BOOSTED';
const SET_WEATHER_REDUCED = 'SET_WEATHER_REDUCED';
const SET_OTHER_MODIFIER = 'SET_OTHER_MODIFIER';
const SET_OPPONENT_STAT = 'SET_OPPONENT_STAT';
const SET_OPPONENT_LEVEL = 'SET_OPPONENT_LEVEL'
const SET_OPPONENT_COMBAT_STAGES = 'SET_OPPONENT_COMBAT_STAGES';

const SET_INITIAL_STATE = 'SET_INITIAL_STATE';
const RESET_STATE = 'RESET_STATE';

const defaultState = {
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
  multiTarget: false,
  weatherBoosted: false,
  weatherReduced: false,
  otherModifier: 1,
  opponentStat: 20,
  opponentLevel: 5,
  opponentCombatStages: 0,
};

const reducer = (state, { type, payload }) => {
  switch (type) {
    case SET_DISPLAY_EXPANDED:
      return {
        ...state,
        displayExpanded: payload.displayExpanded,
      };

    case SET_DISPLAY_ROLLS:
      return {
        ...state,
        displayRolls: payload.displayRolls,
      };

    case SET_OFFENSIVE_MODE:
      return {
        ...state,
        offensiveMode: payload.offensiveMode,
      };

    case SET_LEVEL:
      return {
        ...state,
        level: payload.level,
      };

    case SET_BASE_STAT:
      return {
        ...state,
        baseStat: payload.baseStat,
      };

    case SET_EVS:
      return {
        ...state,
        evs: payload.evs,
      };

    case SET_COMBAT_STAGES:
      return {
        ...state,
        combatStages: payload.combatStages,
      };

    case SET_MOVE_POWER:
      return {
        ...state,
        movePower: payload.movePower,
      };

    case SET_TYPE_EFFECTIVENESS:
      return {
        ...state,
        typeEffectiveness: payload.typeEffectiveness,
      };

    case SET_STAB:
      return {
        ...state,
        stab: payload.stab,
      };

    case SET_GENERATION:
      return {
        ...state,
        generation: payload.generation,
      };

    case SET_MULTI_TARGET:
      return {
        ...state,
        multiTarget: payload.multiTarget,
      };
  
    case SET_WEATHER_BOOSTED: 
      return {
        ...state,
        weatherBoosted: payload.weatherBoosted,
      };

    case SET_WEATHER_REDUCED:
      return {
        ...state,
        weatherReduced: payload.weatherReduced,
      };

    case SET_OTHER_MODIFIER:
      return {
        ...state,
        otherModifier: payload.otherModifier,
      };

    case SET_OPPONENT_STAT:
      return {
        ...state,
        opponentStat: payload.opponentStat,
      };

    case SET_OPPONENT_LEVEL:
      return {
        ...state,
        opponentLevel: payload.opponentLevel,
      };

    case SET_OPPONENT_COMBAT_STAGES:
      return {
        ...state,
        opponentCombatStages: payload.opponentCombatStages
      };

    case SET_INITIAL_STATE:
      return { ...payload };  

    case RESET_STATE:
      return { ...defaultState };

    default:
      return state;
  }
}

export const useRangerReducer = () => useParameterizedReducer(reducer, defaultState, setInitialState);

export function setDisplayExpanded(displayExpanded) {
  return {
    type: SET_DISPLAY_EXPANDED,
    payload: { displayExpanded },
  };
}

export function setDisplayRolls(displayRolls) {
  return {
    type: SET_DISPLAY_ROLLS,
    payload: { displayRolls },
  };
}

export function setOffensiveMode(offensiveMode) {
  return {
    type: SET_OFFENSIVE_MODE,
    payload: { offensiveMode },
  };
}

export function setLevel(level) {
  return {
    type: SET_LEVEL,
    payload: { level: Number(level) },
  };
}

export function setBaseStat(baseStat) {
  return {
    type: SET_BASE_STAT,
    payload: { baseStat: Number(baseStat) },
  };
}

export function setEVs(evs) {
  return {
    type: SET_EVS,
    payload: { evs: Number(evs) },
  };
}

export function setCombatStages(combatStages) {
  return {
    type: SET_COMBAT_STAGES,
    payload: { combatStages: Number(combatStages) },
  };
}

export function setMovePower(movePower) {
  return {
    type: SET_MOVE_POWER,
    payload: { movePower: Number(movePower) },
  };
}

export function setTypeEffectiveness(typeEffectiveness) {
  return {
    type: SET_TYPE_EFFECTIVENESS,
    payload: { typeEffectiveness },
  };
}

export function setSTAB(stab) {
  return {
    type: SET_STAB,
    payload: { stab },
  };
}

export function setGeneration(generation) {
  return {
    type: SET_GENERATION,
    payload: { generation },
  };
}

export function setMultiTarget(multiTarget) {
  return {
    type: SET_MULTI_TARGET,
    payload: { multiTarget },
  };
}

export function setWeatherBoosted(weatherBoosted) {
  return {
    type: SET_WEATHER_BOOSTED,
    payload: { weatherBoosted },
  };
}

export function setWeatherReduced(weatherReduced) {
  return {
    type: SET_WEATHER_REDUCED,
    payload: { weatherReduced },
  };
}

export function setOtherModifier(otherModifier) {
  return {
    type: SET_OTHER_MODIFIER,
    payload: { otherModifier: Number(otherModifier) },
  };
}

export function setOpponentStat(opponentStat) {
  return {
    type: SET_OPPONENT_STAT,
    payload: { opponentStat: Number(opponentStat) },
  };
}

export function setOpponentLevel(opponentLevel) {
  return {
    type: SET_OPPONENT_LEVEL,
    payload: { opponentLevel: Number(opponentLevel) },
  };
}

export function setOpponentCombatStages(opponentCombatStages) {
  return {
    type: SET_OPPONENT_COMBAT_STAGES,
    payload: { opponentCombatStages: Number(opponentCombatStages) },
  };
}

export function setInitialState(state) {
  return {
    type: SET_INITIAL_STATE,
    payload: state,
  };
}

export function resetState() {
  return {
    type: RESET_STATE,
  };
}
