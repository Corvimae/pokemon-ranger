import { capitalize } from './utils';

export const STATS = ['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed'] as const;

export type Stat = typeof STATS[number];

export interface StatLine {
  hp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
}

export interface NatureDefinition {
  name: string;
  plus: Stat;
  minus: Stat;
}

const RAW_NATURES = {
  hardy: {
    plus: 'attack',
    minus: 'attack',
  },
  lonely: {
    plus: 'attack',
    minus: 'defense',
  },
  adamant: {
    plus: 'attack',
    minus: 'spAttack',
  },
  naughty: {
    plus: 'attack',
    minus: 'spDefense',
  },
  brave: {
    plus: 'attack',
    minus: 'speed',
  },
  bold: {
    plus: 'defense',
    minus: 'attack',
  },
  docile: {
    plus: 'defense',
    minus: 'defense',
  },
  impish: {
    plus: 'defense',
    minus: 'spAttack',
  },
  lax: {
    plus: 'defense',
    minus: 'spDefense',
  },
  relaxed: {
    plus: 'defense',
    minus: 'speed',
  },
  modest: {
    plus: 'spAttack',
    minus: 'attack',
  },
  mild: {
    plus: 'spAttack',
    minus: 'defense',
  },
  bashful: {
    plus: 'spAttack',
    minus: 'spAttack',
  },
  rash: {
    plus: 'spAttack',
    minus: 'spDefense',
  },
  quiet: {
    plus: 'spAttack',
    minus: 'speed',
  },
  calm: {
    plus: 'spDefense',
    minus: 'attack',
  },
  gentle: {
    plus: 'spDefense',
    minus: 'defense',
  },
  careful: {
    plus: 'spDefense',
    minus: 'spAttack',
  },
  quirky: {
    plus: 'spDefense',
    minus: 'spDefense',
  },
  sassy: {
    plus: 'spDefense',
    minus: 'speed',
  },
  timid: {
    plus: 'speed',
    minus: 'attack',
  },
  hasty: {
    plus: 'speed',
    minus: 'defense',
  },
  jolly: {
    plus: 'speed',
    minus: 'spAttack',
  },
  naive: {
    plus: 'speed',
    minus: 'spDefense',
  },
  serious: {
    plus: 'speed',
    minus: 'speed',
  },
} as const;

export type Nature = keyof typeof RAW_NATURES;

export const NATURES: Record<Nature, NatureDefinition> = Object.entries(RAW_NATURES).reduce((acc, [key, value]) => ({
  ...acc,
  [key]: {
    ...value,
    name: capitalize(key),
  },
}), {} as Record<Nature, NatureDefinition>);

export function createStatLine(hp: number, attack: number, defense: number, spAttack: number, spDefense: number, speed: number): StatLine {
  return { hp, attack, defense, spAttack, spDefense, speed };
}
