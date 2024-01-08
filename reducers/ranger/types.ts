import { Generation } from 'relicalc';

export const DISPLAY_MODES = ['expanded', 'compact', 'ohko'] as const;

export const SET_DISPLAY_MODE = 'SET_DISPLAY_MODE';
export const SET_DISPLAY_ROLLS = 'SET_DISPLAY_ROLLS';
export const SET_OFFENSIVE_MODE = 'SET_OFFENSIVE_MODE';
export const SET_LEVEL = 'SET_LEVEL';
export const SET_BASE_STAT = 'SET_BASE_STAT';
export const SET_EVS = 'SET_EVS';
export const SET_COMBAT_STAGES = 'SET_COMBAT_STAGES';
export const SET_MOVE_POWER = 'SET_MOVE_POWER';
export const SET_TYPE_EFFECTIVENESS = 'SET_TYPE_EFFECTIVENESS';
export const SET_STAB = 'SET_STAB';
export const SET_GENERATION = 'SET_GENERATION';
export const SET_CRITICAL_HIT = 'SET_CRITICAL_HIT';
export const SET_DOUBLES = 'SET_DOUBLES';
export const SET_TORRENT = 'SET_TORRENT';
export const SET_MULTI_TARGET = 'SET_MULTI_TARGET';
export const SET_WEATHER_BOOSTED = 'SET_WEATHER_BOOSTED';
export const SET_WEATHER_REDUCED = 'SET_WEATHER_REDUCED';
export const SET_OTHER_MODIFIER = 'SET_OTHER_MODIFIER';
export const SET_OPPONENT_STAT = 'SET_OPPONENT_STAT';
export const SET_OPPONENT_LEVEL = 'SET_OPPONENT_LEVEL';
export const SET_OPPONENT_COMBAT_STAGES = 'SET_OPPONENT_COMBAT_STAGES';
export const SET_HEALTH_THRESHOLD = 'SET_HEALTH_THRESHOLD';
export const SET_FRIENDSHIP = 'SET_FRIENDSHIP';
export const SET_SCREEN = 'SET_SCREEN';
export const SET_CHOICE_ITEM = 'SET_CHOICE_ITEM';
export const SET_ADAPTABILITY = 'SET_ADAPTABILITY';
export const SET_TERASTALLIZED = 'SET_TERASTALLIZED';
export const SET_OTHER_POWER_MODIFIER = 'SET_OTHER_POWER_MODIFIER';
export const SET_STAT_MODIFIER = 'SET_STAT_MODIFIER';
export const SET_OPPONENT_STAT_MODIFIER = 'SET_OPPONENT_STAT_MODIFIER';
export const SET_INITIAL_STATE = 'SET_INITIAL_STATE';
export const RESET_STATE = 'RESET_STATE';

export type DisplayMode = typeof DISPLAY_MODES[number];

export interface RangerReducerState {
  displayMode: DisplayMode;
  displayRolls: boolean;
  offensiveMode: boolean;
  level: number;
  baseStat: number;
  evs: number;
  combatStages: number;
  movePower: number;
  typeEffectiveness: number;
  stab: boolean;
  generation: Generation;
  criticalHit: boolean;
  torrent: boolean;
  doubles: boolean;
  multiTarget: boolean;
  weatherBoosted: boolean;
  weatherReduced: boolean;
  otherModifier: number;
  opponentStat: number;
  opponentLevel: number;
  opponentCombatStages: number;
  healthThreshold: number;
  friendship: number;
  screen: boolean;
  choiceItem: boolean;
  adaptability: boolean;
  terastallized: boolean;
  statModifier: number;
  opponentStatModifier: number;
  otherPowerModifier: number;
}

type SetDisplayModeAction = {
  type: typeof SET_DISPLAY_MODE,
  payload: {
    displayMode: DisplayMode;
  };
};

type SetDisplayRollsAction = {
  type: typeof SET_DISPLAY_ROLLS,
  payload: {
    displayRolls: boolean;
  };
};

type SetOffensiveModeAction = {
  type: typeof SET_OFFENSIVE_MODE;
  payload: {
    offensiveMode: boolean;
  };
};

type SetLevelAction = {
  type: typeof SET_LEVEL;
  payload: {
    level: number;
  };
};

type SetBaseStatAction = {
  type: typeof SET_BASE_STAT;
  payload: {
    baseStat: number;
  };
};

type SetEVsAction = {
  type: typeof SET_EVS;
  payload: {
    evs: number;
  };
};

type SetCombatStagesAction = {
  type: typeof SET_COMBAT_STAGES;
  payload: {
    combatStages: number;
  };
};

type SetMovePowerAction = {
  type: typeof SET_MOVE_POWER;
  payload: {
    movePower: number;
  };
};

type SetTypeEffectivenessAction = {
  type: typeof SET_TYPE_EFFECTIVENESS;
  payload: {
    typeEffectiveness: number;
  };
};

type SetSTABAction = {
  type: typeof SET_STAB;
  payload: {
    stab: boolean;
  };
};

type SetGenerationAction = {
  type: typeof SET_GENERATION;
  payload: {
    generation: Generation;
  };
};

type SetCriticalHitAction = {
  type: typeof SET_CRITICAL_HIT;
  payload: {
    criticalHit: boolean;
  };
};

type SetDoublesAction = {
  type: typeof SET_DOUBLES;
  payload: {
    doubles: boolean;
  };
};

type SetTorrentAction = {
  type: typeof SET_TORRENT;
  payload: {
    torrent: boolean;
  };
};

type SetMultiTargetAction = {
  type: typeof SET_MULTI_TARGET;
  payload: {
    multiTarget: boolean;
  };
};

type SetWeatherBoostedAction = {
  type: typeof SET_WEATHER_BOOSTED;
  payload: {
    weatherBoosted: boolean;
  };
};

type SetWeatherReducedAction = {
  type: typeof SET_WEATHER_REDUCED;
  payload: {
    weatherReduced: boolean;
  };
};

type SetOtherModifierAction = {
  type: typeof SET_OTHER_MODIFIER;
  payload: {
    otherModifier: number;
  };
};

type SetOpponentStatAction = {
  type: typeof SET_OPPONENT_STAT;
  payload: {
    opponentStat: number;
  };
};

type SetOpponentLevelAction = {
  type: typeof SET_OPPONENT_LEVEL;
  payload: {
    opponentLevel: number;
  };
};

type SetOpponentCombatStagesAction = {
  type: typeof SET_OPPONENT_COMBAT_STAGES;
  payload: {
    opponentCombatStages: number;
  };
};

type SetHealthThresholdAction = {
  type: typeof SET_HEALTH_THRESHOLD;
  payload: {
    healthThreshold: number;
  };
};

type SetFriendshipAction = {
  type: typeof SET_FRIENDSHIP,
  payload: {
    friendship: number;
  };
}

type SetScreenAction = {
  type: typeof SET_SCREEN,
  payload: {
    screen: boolean;
  };
}

type SetChoiceItemAction = {
  type: typeof SET_CHOICE_ITEM,
  payload: {
    choiceItem: boolean;
  };
}

type SetStatModifierAction = {
  type: typeof SET_STAT_MODIFIER;
  payload: {
    statModifier: number;
  };
};

type SetAdaptabilityAction = {
  type: typeof SET_ADAPTABILITY;
  payload: {
    adaptability: boolean;
  };
};

type SetTerastallizedAction = {
  type: typeof SET_TERASTALLIZED;
  payload: {
    terastallized: boolean;
  };
};

type SetOpponentStatModifierAction = {
  type: typeof SET_OPPONENT_STAT_MODIFIER;
  payload: {
    opponentStatModifier: number;
  };
};

type SetOtherPowerModifierAction = {
  type: typeof SET_OTHER_POWER_MODIFIER;
  payload: {
    otherPowerModifier: number;
  };
};

type ResetStateAction = {
  type: typeof RESET_STATE;
}

type SetInitialStateAction = {
  type: typeof SET_INITIAL_STATE;
  payload: RangerReducerState;
};

export type RangerReducerAction =
  SetDisplayModeAction |
  SetDisplayRollsAction |
  SetOffensiveModeAction |
  SetLevelAction |
  SetBaseStatAction |
  SetEVsAction |
  SetCombatStagesAction |
  SetMovePowerAction |
  SetTypeEffectivenessAction |
  SetSTABAction |
  SetGenerationAction |
  SetCriticalHitAction |
  SetDoublesAction |
  SetTorrentAction |
  SetMultiTargetAction |
  SetWeatherBoostedAction |
  SetWeatherReducedAction |
  SetOtherModifierAction |
  SetOpponentStatAction |
  SetOpponentLevelAction |
  SetOpponentCombatStagesAction |
  SetHealthThresholdAction |
  SetFriendshipAction |
  SetScreenAction |
  SetChoiceItemAction |
  SetAdaptabilityAction |
  SetTerastallizedAction |
  SetOtherPowerModifierAction |
  SetStatModifierAction |
  SetOpponentStatModifierAction |
  ResetStateAction |
  SetInitialStateAction;
