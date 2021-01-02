import { StatRange } from './rangeTypes';

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

export function formatIVRange(value: StatRange): string {
  if (!value) return 'x';
  if (value.from === 0 && value.to === 31) return '0+';

  if (value.from === 0) return `${value.to}${value.to === 0 ? '' : '-'}`;
  if (value.to === 31) return `${value.from}${value.from === 31 ? '' : '+'}`;

  if (value.from === value.to) return `${value.from}`;

  return `${value.from}–${value.to}`;
}

export function formatIVSplit(values: { negative: StatRange; neutral: StatRange; positive: StatRange }): string {
  return `${formatIVRange(values.negative)} / ${formatIVRange(values.neutral)} / ${formatIVRange(values.positive)}`;
}

export function formatStatRange(from: number, to: number): string {
  return from === to ? `${from}` : `${from}–${to}`;
}
