import { Generation, calculateExperienceGain, GrowthRate, calculateExperienceRequiredForLevel } from 'relicalc';

export type LGPEFriendshipEvent = 'level' | 'candy' | 'xItem' | 'gymFight';

const LGPE_FRIENDSHIP_EVENTS: Record<LGPEFriendshipEvent, [number, number]> = {
  level: [2, 1],
  candy: [5, 3],
  xItem: [1, 1],
  gymFight: [4, 3],
};

export function calculateLGPEFriendship(baseFriendship: number, friendshipEvents: LGPEFriendshipEvent[]): number {
  return friendshipEvents.reduce((friendship, action) => (
    friendship + LGPE_FRIENDSHIP_EVENTS[action][friendship < 100 ? 0 : 1]
  ), baseFriendship);
}

interface BaseExperienceEvent {
  id: string;
  enabled: boolean;
}

interface RareCandyExperienceEvent extends BaseExperienceEvent {
  type: 'rareCandy';
}

export interface SpeciesExperienceEvent extends BaseExperienceEvent {
  type: 'species';
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
}

interface ManualExperienceEvent extends BaseExperienceEvent {
  type: 'manual';
  name: string;
  value: number;
  hpEVValue: number;
  attackEVValue: number;
  defenseEVValue: number;
  spAttackEVValue: number;
  spDefenseEVValue: number;
  speedEVValue: number;
}

export type ExperienceEvent = RareCandyExperienceEvent | SpeciesExperienceEvent | ManualExperienceEvent;

function calculateExperienceGainedFromEvent(event: ExperienceEvent, generation: Generation, currentExperience: number, growthRate: GrowthRate, level: number) {
  switch (event.type) {
    case 'manual':
      return event.value;

    case 'rareCandy':
      if (level === 100) return 0;

      return calculateExperienceRequiredForLevel(level + 1, growthRate) - currentExperience;
    case 'species':
      return calculateExperienceGain(
        generation,
        event.baseExperience,
        level,
        event.level,
        {
          expShareEnabled: event.expShareEnabled,
          participated: event.participated,
          otherParticipantCount: event.otherParticipantCount,
          otherPokemonHoldingExperienceShare: event.otherPokemonHoldingExperienceShare,
          partySize: event.partySize,
          isDomesticTrade: event.isTrade,
          isInternationalTrade: event.isInternationalTrade,
          hasLuckyEgg: event.hasLuckyEgg,
          hasAffectionBoost: event.hasAffectionBoost,
          isWild: event.isWild,
          isPastEvolutionPoint: event.isPastEvolutionPoint,
        },
      );

    default:
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      throw new Error(`Unsupported experience event: ${(event as any).type}.`);
  }
}

type EVSet = [number, number, number, number, number, number];

export type ExperienceEventWithMetadata = ExperienceEvent & {
  experienceGained: number;
  isLevelUp: boolean;
  levelAfterExperience: number;
  totalExperience: number;
  evs: EVSet;
}

export function buildExperienceRoute(generation: Generation, initialLevel: number, growthRate: GrowthRate, events: ExperienceEvent[]): ExperienceEventWithMetadata[] {
  const startingExperience = calculateExperienceRequiredForLevel(initialLevel, growthRate);

  const [updatedEvents] = events.reduce<[ExperienceEvent[], number, number, EVSet]>(([eventAcc, level, expTotal, evTotal], event) => {
    if (!event.enabled) return [[...eventAcc, event], level, expTotal, evTotal];

    let updatedEVs = evTotal;
    
    if (event.type === 'species' || event.type === 'manual') {
      updatedEVs = [
        evTotal[0] + event.hpEVValue,
        evTotal[1] + event.attackEVValue,
        evTotal[2] + event.defenseEVValue,
        evTotal[3] + event.spAttackEVValue,
        evTotal[4] + event.spDefenseEVValue,
        evTotal[5] + event.speedEVValue,
      ];
    }
   
    if (level >= 100) {
      return [
        [
          ...eventAcc,
          {
            ...event,
            experienceGained: 0,
            isLevelUp: false,
            levelAfterExperience: 100,
            totalExperience: expTotal,
            evs: updatedEVs,
          },
        ],
        level,
        expTotal,
        updatedEVs,
      ];
    }

    const experienceForNextLevel = calculateExperienceRequiredForLevel(level + 1, growthRate);
    const experienceGained = calculateExperienceGainedFromEvent(event, generation, expTotal, growthRate, level);
    const isLevelUp = expTotal + experienceGained >= experienceForNextLevel;

    let levelAfterExperience = level;

    while (calculateExperienceRequiredForLevel(levelAfterExperience + 1, growthRate) <= expTotal + experienceGained) {
      levelAfterExperience += 1;
    }
    
    return [
      [...eventAcc, {
        ...event,
        experienceGained,
        isLevelUp,
        levelAfterExperience,
        totalExperience: expTotal + experienceGained,
        evs: updatedEVs,
      }],
      levelAfterExperience,
      expTotal + experienceGained,
      updatedEVs,
    ];
  }, [[], initialLevel, startingExperience, [0, 0, 0, 0, 0, 0]]);

  return updatedEvents as ExperienceEventWithMetadata[];
}
