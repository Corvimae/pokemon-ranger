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
}

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

export function calculateLGPEFriendship(baseFriendship: number, friendshipEvents: LGPEFriendshipEvent[]) {
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
            ...(generation >= 5 ? [
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
