import { Stat } from './constants';

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

export interface CombinedIVResult {
  negative: StatRange;
  neutral: StatRange;
  positive: StatRange
}

type CombinedRangeResult = RangeResult & CombinedIVResult;

export interface CompactRange extends CombinedRangeResult {
  statFrom: number;
  statTo: number;
}

export interface OneShotResult extends CombinedIVResult {
  successes: number;
  statFrom: number;
  statTo: number;
  componentResults: CompactRange[];
}

export type ConfirmedNature = [Stat | null, Stat | null];

export type NatureKey = 'negative' | 'neutral' | 'positive';
