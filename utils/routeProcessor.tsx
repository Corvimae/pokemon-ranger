import React from 'react';
import merge from 'deepmerge';
import unified from 'unified';
import remark from 'remark-parse';
import remarkToRehype from 'remark-rehype';
import rehypeToReact from 'rehype-react';
import directive from 'remark-directive';
import raw from 'rehype-raw';
import sanitize from 'rehype-sanitize';
import gh from 'hast-util-sanitize/lib/github.json';
import { Schema } from 'hast-util-sanitize';
import { directiveConverter } from '../directives/directiveConverter';
import { IVCalculatorDirective } from '../directives/IVCalculatorDirective';
import { DamageTable } from '../components/route/DamageTable';
import { ConditionalBlock } from '../components/route/ConditionalBlock';
import { ContainerLabel } from '../components/Layout';
import { InlineInfo } from '../components/route/InlineInfo';
import { TrainerBlock } from '../components/route/TrainerBlock';
import { PokemonBlock } from '../components/route/PokemonBlock';
import { RouteCard } from '../components/route/RouteCard';
import { RouteImage } from '../components/route/RouteImage';
import { VariableBlock } from '../components/route/VariableBlock';
import { CalculationDirective } from '../components/route/CalculationDirective';

const schema = merge(gh, {
  tagNames: [
    'tracker',
    'if',
    'damage',
    'level',
    'card',
    'info',
    'trainer',
    'pokemon',
    'containerlabel',
    'variable',
    'calc',
  ],
  attributes: {
    tracker: [
      'species',
      'contents',
      'baseStats',
      'hiddenPower',
      'generation',
      'hpIV',
      'attackIV',
      'defenseIV',
      'spAttackIV',
      'spDefenseIV',
      'speedIV',
      'nature',
      'directInput',
      'directInputNatures',
    ],
    if: ['condition', 'level', 'evolution', 'source', 'theme'],
    card: ['theme'],
    info: ['color'],
    trainer: ['info', 'infoColor'],
    pokemon: ['info', 'infoColor'],
    damage: [
      'source',
      'contents',
      'level',
      'evolution',
      'evs',
      'combatStages',
      'movePower',
      'effectiveness',
      'stab',
      'opponentStat',
      'opponentCombatStages',
      'opponentLevel',
      'torrent',
      'weatherBoosted',
      'weatherReduced',
      'multiTarget',
      'otherModifier',
      'friendship',
      'offensive',
      'special',
      'healthThreshold',
      'screen',
      'otherPowerModifier',
      'theme',
    ],
    variable: ['theme', 'type', 'name', 'title', 'options', 'defaultValue'],
    calc: ['color', 'contents', 'source', 'level', 'evolution', 'format'],
  },
});

const EmptyComponent: React.FC = () => <></>;

const FULL_COMPONENT_SET = {
  img: RouteImage,
  tracker: IVCalculatorDirective,
  if: ConditionalBlock,
  damage: DamageTable,
  card: RouteCard,
  info: InlineInfo,
  trainer: TrainerBlock,
  pokemon: PokemonBlock,
  containerlabel: ContainerLabel,
  variable: VariableBlock,
  calc: CalculationDirective,
};

const TRACKER_ONLY_COMPONENT_SET = {
  ...Object.keys(FULL_COMPONENT_SET).reduce((acc, key) => ({ ...acc, [key]: EmptyComponent }), {}),
  tracker: IVCalculatorDirective,
  a: EmptyComponent,
  p: EmptyComponent,
  ol: EmptyComponent,
  ul: EmptyComponent,
  h1: EmptyComponent,
  h2: EmptyComponent,
  h3: EmptyComponent,
  h4: EmptyComponent,
  h5: EmptyComponent,
  h6: EmptyComponent,
};

export function buildRouteProcessor(renderOnlyTrackers: boolean): unified.Processor<unified.Settings> {
  const componentSet = renderOnlyTrackers ? TRACKER_ONLY_COMPONENT_SET : FULL_COMPONENT_SET;

  return unified()
    .use(remark)
    .use(directive)
    .use(directiveConverter)
    .use(remarkToRehype, { allowDangerousHtml: true })
    .use(raw)
    .use(sanitize, (schema as unknown) as Schema)
    .use(rehypeToReact, {
      createElement: React.createElement,
      components: componentSet as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    });
}
