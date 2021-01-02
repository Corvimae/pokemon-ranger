export type NatureType = 'negative' | 'neutral' | 'positive';

export interface NatureModifier {
  key: NatureType;
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

export interface CompactRange extends RangeResult {
  statFrom: number;
  statTo: number;
  negative: StatRange;
  neutral: StatRange;
  positive: StatRange;
}

export interface OneShotResult {
  successes: number;
  statFrom: number;
  statTo: number;
  negative: StatRange;
  neutral: StatRange;
  positive: StatRange;
  componentResults: CompactRange[];
}

export type NatureKey = 'negative' | 'neutral' | 'positive';
