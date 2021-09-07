/* eslint-disable no-nested-ternary */
import { formatDamageRange } from './rangeFormat';
import { CompactRange, Generation, NatureKey, NatureModifier, NatureResult, OneShotResult, StatRange } from './rangeTypes';

export const NATURE_MODIFIERS: NatureModifier[] = [
  {
    key: 'negative',
    name: 'Negative Nature',
    modifier: 0.9,
  },
  {
    key: 'neutral',
    name: 'Neutral Nature',
    modifier: 1,
  },
  {
    key: 'positive',
    name: 'Positive Nature',
    modifier: 1.1,
  },
];

export type LGPEFriendshipEvent = 'level' | 'candy' | 'xItem' | 'gymFight';

const LGPE_FRIENDSHIP_EVENTS: Record<LGPEFriendshipEvent, [number, number]> = {
  level: [2, 1],
  candy: [5, 3],
  xItem: [1, 1],
  gymFight: [4, 4],
};

function getMultiTargetModifier(generation: Generation): number {
  return generation === 3 ? 0.5 : 0.75;
}

export function calculateGen1Stat(level: number, base: number, iv: number, ev: number): number {
  return Math.floor((Math.floor(((2 * (base + iv) + Math.floor(Math.ceil(Math.sqrt(ev)) / 4)) * level) / 100) + 5));
}

export function calculateStat(level: number, base: number, iv: number, ev: number, modifier: number): number {
  return Math.floor((Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5) * modifier);
}

export function calculateLGPEStat(level: number, base: number, iv: number, av: number, modifier: number, friendship: number): number {
  const friendshipModifier = 1 + Math.floor(10 * (friendship / 255)) / 100;

  return Math.floor(Math.floor((Math.floor(((2 * base + iv) * level) / 100) + 5) * modifier) * friendshipModifier) + av;
}

export function calculateHP(level: number, base: number, iv: number, ev: number, generation: Generation): number {
  if (generation <= 2) {
    return Math.floor((Math.floor(((2 * (base + iv) + Math.floor(Math.ceil(Math.sqrt(ev)) / 4)) * level) / 100) + level + 10));
  }

  if (generation === 'lgpe') {
    return Math.floor(((2 * base + iv) * level) / 100) + level + 10 + ev;
  }

  return Math.floor((Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10));
}

export function applyCombatStages(stat: number, combatStages: number): number {
  if (combatStages === 0) return stat;

  if (combatStages > 0) return Math.floor(stat * ((combatStages + 2) / 2));

  return Math.floor(stat * (2 / (Math.abs(combatStages) + 2)));
}

export function calculateLGPEFriendship(baseFriendship: number, friendshipEvents: LGPEFriendshipEvent[]): number {
  return friendshipEvents.reduce((friendship, action) => (
    friendship + LGPE_FRIENDSHIP_EVENTS[action][friendship < 100 ? 0 : 1]
  ), baseFriendship);
}

export interface CalculateRangesParameters {
  level: number;
  baseStat: number;
  evs: number;
  combatStages: number;
  stab: boolean;
  typeEffectiveness: number;
  offensiveMode: boolean;
  movePower: number;
  criticalHit: boolean;
  torrent: boolean;
  multiTarget: boolean;
  weatherBoosted: boolean;
  weatherReduced: boolean;
  generation: Generation;
  otherModifier: number;
  opponentLevel: number;
  opponentStat: number;
  opponentCombatStages: number;
  friendship: number;
  screen: boolean;
  otherPowerModifier: number;
}

export function calculateRanges({
  level,
  baseStat,
  evs,
  combatStages,
  stab,
  typeEffectiveness,
  offensiveMode,
  movePower,
  criticalHit,
  torrent,
  multiTarget,
  weatherBoosted,
  weatherReduced,
  generation,
  otherModifier,
  opponentLevel,
  opponentStat,
  opponentCombatStages,
  friendship,
  screen,
  otherPowerModifier,
}: CalculateRangesParameters): NatureResult[] {
  return NATURE_MODIFIERS.map(natureModifierData => {
    const possibleStats = [...Array(32).keys()].map(possibleIV => {
      if (generation === 'lgpe') {
        return calculateLGPEStat(level, baseStat, possibleIV, evs, natureModifierData.modifier, friendship);
      }
      return calculateStat(level, baseStat, possibleIV, evs, natureModifierData.modifier);
    });

    // Combine stats into ranges of like values.
    const rangeSegments = possibleStats.reduce<StatRange[]>((acc, statValue, iv) => {
      const lastValue = acc[acc.length - 1];

      if (lastValue?.stat === statValue) {
        return [
          ...acc.slice(0, acc.length - 1),
          {
            ...lastValue,
            to: iv,
          },
        ];
      }

      return [
        ...acc,
        {
          stat: statValue,
          from: iv,
          to: iv,
        },
      ];
    }, []);

    return {
      name: natureModifierData.name,
      rangeSegments: rangeSegments.map(rangeSegment => {
        const playerStatAdjusted = applyCombatStages(rangeSegment.stat, combatStages);
        const opponentStatAdjusted = applyCombatStages(opponentStat, opponentCombatStages);

        const stabAndTypeEffectivenessModifier = [
          stab ? 1.5 : 1,
          typeEffectiveness,
        ];

        const critMultiplier = generation <= 5 ? 2.0 : 1.5;
        const offensiveStat = offensiveMode ? playerStatAdjusted : opponentStatAdjusted;
        const defensiveStat = offensiveMode ? opponentStatAdjusted : playerStatAdjusted;
        const baseScreenMultiplier = multiTarget ? (2 / 3) : 0.5;
        const screenModifier = screen && !criticalHit ? baseScreenMultiplier : 1;

        const damageValues = calculateDamageValues(
          offensiveMode ? level : opponentLevel,
          torrent && generation <= 4 ? movePower * 1.5 : movePower,
          torrent && generation >= 5 ? offensiveStat * 1.5 : offensiveStat,
          defensiveStat,
          [
            ...(generation === 4 ? [
              screenModifier,
              multiTarget ? getMultiTargetModifier(generation) : 1,
              weatherBoosted ? 1.5 : 1,
              weatherReduced ? 0.5 : 1,
            ] : []),
            otherPowerModifier,
          ],
          [
            ...((generation >= 5 || generation === 'lgpe') ? [
              multiTarget ? getMultiTargetModifier(generation) : 1,
              weatherBoosted ? 1.5 : 1,
              weatherReduced ? 0.5 : 1,
            ] : []),
            criticalHit ? critMultiplier : 1.0,
            ...(generation === 3 ? stabAndTypeEffectivenessModifier : []),
          ],
          [
            ...(generation === 3 ? [] : stabAndTypeEffectivenessModifier),
            ...(generation >= 5 ? [screenModifier] : []),
            otherModifier,
          ],
        );

        return {
          ...rangeSegment,
          damageValues,
          damageRangeOutput: formatDamageRange(damageValues),
          minDamage: Math.min(...damageValues),
          maxDamage: Math.max(...damageValues),
        };
      }),
    };
  });
}

export function calculateDamageValues(
  level: number,
  power: number,
  attack: number,
  defense: number,
  basePowerModifiers: number[],
  preRandModifiers: number[],
  postRandModifiers: number[],
): number[] {
  return [...Array(16).keys()].map(randomValue => {
    const levelModifier = Math.trunc((2 * level) / 5) + 2;
    const adjustedPower = basePowerModifiers.reduce((acc, modifier) => Math.trunc(acc * modifier), power);
    const baseDamage = Math.trunc(Math.floor((levelModifier * adjustedPower * attack) / defense) / 50) + 2;

    return [...preRandModifiers, (85 + randomValue) / 100, ...postRandModifiers].reduce((acc, modifier) => (
      Math.trunc(acc * modifier)
    ), baseDamage);
  });
}

export function mergeStatRanges(a: StatRange | undefined, b: StatRange): StatRange {
  if (!a) return b;
  if (!b) return a;

  return {
    stat: -1,
    from: Math.min(a.from, b.from),
    to: Math.max(a.to, b.to),
  };
}

export function combineIdenticalLines(results: NatureResult[]): Record<string, CompactRange> {
  const [negative, neutral, positive] = results;

  return (Object.entries({ negative, neutral, positive }) as [NatureKey, NatureResult][])
    .reduce<Record<string, CompactRange>>((output, [key, { rangeSegments }]) => (
      rangeSegments.reduce((acc, result) => {
        const currentValue = acc[result.damageRangeOutput];

        return {
          ...acc,
          [result.damageRangeOutput]: {
            ...currentValue,
            damageValues: result.damageValues,
            damageRangeOutput: result.damageRangeOutput,
            statFrom: currentValue?.statFrom ?? result.stat,
            statTo: Math.max(result.stat, acc[result.damageRangeOutput]?.statTo ?? 0),
            [key]: {
              ...currentValue?.[key],
              from: (currentValue || {})[key]?.from ?? result.from,
              to: result.to,
            },
          },
        };
      }, output)
    ), {});
}

export function calculateKillRanges(results: NatureResult[], healthThreshold: number): Record<number, OneShotResult> {
  return Object.values(combineIdenticalLines(results))
    .reduce<Record<number, OneShotResult>>((acc, result) => {
      const successes = result.damageValues.filter(value => value >= healthThreshold).length;
      const currentValue = acc[successes];

      return {
        ...acc,
        [successes]: {
          successes,
          statFrom: Math.min(currentValue?.statFrom || Number.MAX_VALUE, result.statFrom),
          statTo: Math.max(currentValue?.statTo || Number.MIN_VALUE, result.statTo),
          negative: mergeStatRanges(currentValue?.negative, result.negative),
          neutral: mergeStatRanges(currentValue?.neutral, result.neutral),
          positive: mergeStatRanges(currentValue?.positive, result.positive),
          componentResults: [
            ...(currentValue?.componentResults || []),
            result,
          ],
        },
      };
    }, {});
}

export type GrowthRate = 'fast' | 'medium-fast' | 'medium-slow' | 'slow' | 'erratic' | 'fluctuating';

interface BaseExperienceEvent {
  id: string;
  enabled: boolean;
}

interface RareCandyExperienceEvent extends BaseExperienceEvent {
  type: 'rareCandy';
}

interface SpeciesExperienceEvent extends BaseExperienceEvent {
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

function calculateExperienceRequiredForLevel(level: number, growthRate: GrowthRate): number {
  if (level <= 1) return 0;
  if (level > 100) return -1;

  switch (growthRate) {
    case 'fast':
      return Math.floor((level ** 3) * 0.8);

    case 'medium-fast':
      return level ** 3;
    
    case 'medium-slow':
      return Math.floor(1.2 * (level ** 3) - 15 * (level ** 2) + 100 * level - 140);

    case 'slow':
      return Math.floor(1.25 * (level ** 3));

    case 'erratic':
      if (level < 50) return Math.floor(((level ** 3) * (100 - level)) / 50);
      if (level < 68) return Math.floor(((level ** 3) * (150 - level)) / 100);
      if (level < 98) return Math.floor(((level ** 3) * Math.floor((1911 - (10 * level)) / 3)) / 500);
    
      return Math.floor(((level ** 3) * (160 - level)) / 100);

    case 'fluctuating':
      if (level < 15) return Math.floor((level ** 3) * ((Math.floor((level + 1) / 3) + 24) / 50));
      if (level < 36) return Math.floor((level ** 3) * ((level + 14) / 50));

      return Math.floor((level ** 3) * ((Math.floor(level / 2) + 32) / 50));
    default:
      throw new Error(`Unsupported growth rate: ${growthRate}.`);
  }
}

function calculateExperienceShareMultiplier(
  generation: Generation,
  expShareEnabled: boolean,
  participated: boolean,
  otherParticipantCount: number,
  otherPokemonHoldingExperienceShare: number,
  partySize: number,
): number {
  const participantCount = otherParticipantCount + 1;
  const expShareCount = otherPokemonHoldingExperienceShare + (expShareEnabled ? 1 : 0);

  if (generation === 1) {
    if (!expShareEnabled) return participantCount;

    if (participated) return 2 * participantCount;

    return 2 * participantCount * partySize;
  }
  
  if (generation <= 5) {
    if (expShareCount === 0) return participantCount;

    if (participated) return 2 * participantCount;
      
    return 2 * expShareCount;
  }

  if (participated) return 1;

  if (expShareEnabled || generation >= 8 || generation === 'lgpe') return 2;

  return 1;
}
function getInternationalTradeMultiplier(generation: Generation) {
  if (generation < 4) return 1.5;
  if (generation === 5) return 6963 / 4096;
  
  return 1.7;
}

function calculateExperienceGain(
  generation: Generation,
  baseExperience: number,
  level: number,
  opponentLevel: number,
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
): number {
  const wildMultiplier = isWild ? 1 : 1.5;
  const luckyEggMultiplier = hasLuckyEgg ? 1.5 : 1;
  const affectionMultiplier = hasAffectionBoost ? 1.2 : 1;
  const expShareMultiplier = calculateExperienceShareMultiplier(
    generation,
    expShareEnabled,
    participated,
    otherParticipantCount,
    otherPokemonHoldingExperienceShare,
    partySize,
  );
  const tradeMultiplier = isInternationalTrade ? getInternationalTradeMultiplier(generation) : (isTrade ? 1.5 : 1);
  const evolutionMultiplier = generation >= 6 && isPastEvolutionPoint ? 1.2 : 1;
  
  if (generation === 5) {
    const multiplier1 = (multiplyForGeneration(baseExperience * opponentLevel, wildMultiplier, generation) / (Math.fround(5.0) * expShareMultiplier));
    const multiplier2 = gamefreakPowerOfTwoPointFive((Math.fround(2.0) * opponentLevel + Math.fround(10.0)) / (opponentLevel + level + Math.fround(10.0)));

    return multiplyAllForGeneration(Math.floor(multiplier1 * multiplier2) + Math.fround(1.0), [tradeMultiplier, luckyEggMultiplier], generation);
  }

  if (generation >= 7) {
    // I'm not sure if Gen 8 actually uses this formula...
    const multiplier1 = multiplyAllForGeneration(baseExperience * opponentLevel, [evolutionMultiplier], generation) / (Math.fround(5.0) * expShareMultiplier);
    const multiplier2 = gamefreakPowerOfTwoPointFive((Math.fround(2.0) * opponentLevel + Math.fround(10.0)) / (opponentLevel + level + Math.fround(10.0)));

    return multiplyAllForGeneration(Math.floor(multiplier1 * multiplier2) + Math.fround(1.0), [tradeMultiplier, luckyEggMultiplier, affectionMultiplier], generation);
  }

  return integerMultiply(
    wildMultiplier,
    tradeMultiplier,
    luckyEggMultiplier,
    affectionMultiplier,
    evolutionMultiplier,
  ) * Math.floor((baseExperience * opponentLevel) / (7 * expShareMultiplier));
}

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
        event.expShareEnabled,
        event.participated,
        event.otherParticipantCount,
        event.otherPokemonHoldingExperienceShare,
        event.partySize,
        event.isTrade,
        event.isInternationalTrade,
        event.hasLuckyEgg,
        event.hasAffectionBoost,
        event.isWild,
        event.isPastEvolutionPoint,
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
        evs: updatedEVs,
      }],
      levelAfterExperience,
      expTotal + experienceGained,
      updatedEVs,
    ];
  }, [[], initialLevel, startingExperience, [0, 0, 0, 0, 0, 0]]);

  return updatedEvents as ExperienceEventWithMetadata[];
}

function integerMultiply(...values: number[]): number {
  return values.reduce((acc, mult) => Math.floor(acc * mult), 1);
}

function multiplyForGeneration(value: number, multiplier: number, generation: Generation) {
  if (generation === 5 || generation >= 7 || generation === 'lgpe') {
    let preliminaryValue = value * to4096Numerator(multiplier);
    const requiresAdjustment = (preliminaryValue & 4095) > 2048;

    preliminaryValue >>= 12;
    return Math.fround(requiresAdjustment ? preliminaryValue + 1 : preliminaryValue);
  }

  return Math.fround(Math.floor(value * multiplier));
}

function multiplyAllForGeneration(value: number, multipliers: number[], generation: Generation) {
  return multipliers.reduce((acc, multiplier) => multiplyForGeneration(acc, multiplier, generation), value);
}

function to4096Numerator(value: number): number {
  return Math.floor(value * 4096 + 0.5);
}

function gamefreakPowerOfTwoPointFive(value: number): number {
  const rounded = Math.fround(value);

  return Math.fround(Math.fround(rounded * rounded) * Math.fround(Math.sqrt(rounded)));
}
