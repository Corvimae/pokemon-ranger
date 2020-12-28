export interface NatureModifier {
  name: string;
  modifier: number;
}

export interface StatRange {
  stat: number;
  from: number;
  to: number;
}

export interface RangeResult extends StatRange {
  damageValues: number[];
  damageRangeOutput: string;
  minDamage: number;
  maxDamage: number;
}

export interface NatureResult {
  name: string;
  rangeSegments: RangeResult[];
}

export const NATURE_MODIFIERS: NatureModifier[] = [
  {
    name: 'Negative Nature',
    modifier: 0.9,
  },
  {
    name: 'Neutral Nature',
    modifier: 1,
  },
  {
    name: 'Positive Nature',
    modifier: 1.1,
  }
];

export function calculateStat(level: number, base: number, iv: number, ev: number, modifier: number): number {
  return Math.floor((Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5) * modifier);
}

export function applyCombatStages(stat: number, combatStages: number): number {
  if (combatStages === 0) return stat;

  if (combatStages > 0) return Math.floor(stat * ((combatStages + 2) / 2));

  return Math.floor(stat * (2 / (Math.abs(combatStages) + 2)));
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
  generation: number;
  otherModifier: number;
  opponentLevel: number;
  opponentStat: number;
  opponentCombatStages: number;
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
  opponentCombatStages
}: CalculateRangesParameters): NatureResult[] {
  return NATURE_MODIFIERS.map(natureModifierData => {
    const possibleStats = [...Array(32).keys()].map(possibleIV => calculateStat(level, baseStat, possibleIV, evs, natureModifierData.modifier));

    // Combine stats into ranges of like values.
    const rangeSegments = possibleStats.reduce<StatRange[]>((acc, statValue, iv) => {
      const lastValue = acc[acc.length - 1];

      if (lastValue?.stat === statValue) {
        return [
          ...acc.slice(0, acc.length - 1),
          {
            ...lastValue,
            to: iv,  
          }
        ]; 
      } else {
        return [...acc, {
          stat: statValue,
          from: iv,
          to: iv
        }];
      }
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
        const defensiveStat =  offensiveMode ? opponentStatAdjusted : playerStatAdjusted;

        const damageValues = calculateDamageValues(
          offensiveMode ? level : opponentLevel,
          torrent && generation <= 4 ? movePower * 1.5 : movePower,
          torrent && generation >= 5 ? offensiveStat * 1.5 : offensiveStat,
          defensiveStat,
          [ 
            multiTarget ? (generation === 3 ? 0.5 : 0.75) : 1,
            weatherBoosted ? 1.5 : 1,
            weatherReduced ? 0.5 : 1,
            criticalHit ? critMultiplier : 1.0,
            ...(generation === 3 ? stabAndTypeEffectivenessModifier : []),
          ],
          [
            ...(generation === 3 ? [] : stabAndTypeEffectivenessModifier),
            otherModifier
          ]
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
  preRandModifiers: number[],
  postRandModifiers: number[]
): number[] {
  return [...Array(16).keys()].map(randomValue => {
    const levelModifier = Math.trunc(2 * level / 5) + 2;
    const baseDamage = Math.trunc(Math.floor(levelModifier * power * attack / defense) / 50) + 2;

    return [...preRandModifiers, (85 + randomValue) / 100, ...postRandModifiers].reduce((acc, modifier) => (
      Math.trunc(acc * modifier)
    ), baseDamage);
  });
}

export function formatDamageRange(values: number[]): string {
  const firstValue = values[0];
  const secondValue = values[1];
  const secondToLastValue = values[values.length - 2];
  const lastValue = values[values.length - 1];

  if (firstValue === lastValue) return `${firstValue}`;

  const lowExtreme = firstValue !== secondValue && firstValue;
  const highExtreme = secondToLastValue !== lastValue && lastValue;

  return `${lowExtreme ? `(${lowExtreme}) / ` : ''} ${secondValue === secondToLastValue ? secondValue : `${secondValue}–${secondToLastValue}`} ${highExtreme ? `/ (${highExtreme})` : ''}`;
}