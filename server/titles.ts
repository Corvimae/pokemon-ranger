export interface GameTitleMetadata {
  title: string;
  generation: number;
  shortTitle?: string;
  aliases?: string[];
}

const RECOGNIZED_GAME_TITLES: Record<string, GameTitleMetadata> = {
  redBlue: {
    title: 'Pokémon Red & Blue',
    shortTitle: 'Red & Blue',
    generation: 1,
    aliases: ['red', 'blue', 'rb'],
  },
  yellow: {
    title: 'Pokémon Yellow',
    shortTitle: 'Yellow',
    generation: 1,
  },
  goldSilver: {
    title: 'Pokémon Gold & Silver',
    shortTitle: 'Gold & Silver',
    generation: 2,
    aliases: ['gold', 'silver', 'gs'],
  },
  crystal: {
    title: 'Pokémon Crystal',
    shortTitle: 'Crystal',
    generation: 2,
  },
  rubySapphire: {
    title: 'Pokémon Ruby & Sapphire',
    shortTitle: 'Ruby & Sapphire',
    generation: 3,
    aliases: ['ruby', 'sapphire', 'rs'],
  },
  frlg: {
    title: 'Pokémon FireRed & LeafGreen',
    shortTitle: 'FireRed & LeafGreen',
    generation: 3,
    aliases: ['fr', 'lg', 'frlg'],
  },
  emerald: {
    title: 'Pokémon Emerald',
    shortTitle: 'Emerald',
    generation: 3,
  },
  colosseum: {
    title: 'Pokémon Colosseum',
    shortTitle: 'Colosseum',
    aliases: ['colo'],
    generation: 3,
  },
  xd: {
    title: 'Pokémon XD: Gale of Darkness',
    shortTitle: 'XD: Gale of Darkness',
    aliases: ['xd'],
    generation: 3,
  },
  diamondPearl: {
    title: 'Pokémon Diamond & Pearl',
    shortTitle: 'Diamond & Pearl',
    generation: 4,
    aliases: ['diamond', 'pearl', 'dp'],
  },
  platinum: {
    title: 'Pokémon Platinum',
    shortTitle: 'Platinum',
    generation: 4,
  },
  hgss: {
    title: 'Pokémon HeartGold & SoulSilver',
    shortTitle: 'HeartGold & SoulSilver',
    generation: 4,
    aliases: ['heartgold', 'soulsilver', 'hgss'],
  },
  pbr: {
    title: 'Pokémon Battle Revolution',
    shortTitle: 'Battle Revolution',
    generation: 4,
    aliases: ['pbr'],
  },
  b1w1: {
    title: 'Pokémon Black & White',
    shortTitle: 'Black & White',
    aliases: ['black', 'white', 'black 1', 'white1', 'b1', 'w1', 'bw'],
    generation: 5,
  },
  b2w2: {
    title: 'Pokémon Black 2 & White 2',
    shortTitle: 'Black 2 & White 2',
    aliases: ['black 2', 'white 2', 'b2', 'w2'],
    generation: 5,
  },
  xy: {
    title: 'Pokémon X & Y',
    shortTitle: 'X & Y',
    generation: 6,
    aliases: ['x', 'y', 'x y'],
  },
  oras: {
    title: 'Pokémon Omega Ruby & Alpha Sapphire',
    shortTitle: 'Omega Ruby & Alpha Sapphire',
    aliases: ['or', 'as', 'omega ruby', 'alpha sapphire', 'or as'],
    generation: 6,
  },
  sunMoon: {
    title: 'Pokémon Sun & Moon',
    shortTitle: 'Sun & Moon',
    generation: 7,
    aliases: ['sun', 'moon', 'sm'],
  },
  usum: {
    title: 'Pokémon Ultra Sun & Ultra Moon',
    shortTitle: 'Ultra Sun & Ultra Moon',
    aliases: ['ultra sun', 'ultra moon', 'us', 'um', 'us um'],
    generation: 7,
  },
  lgpe: {
    title: 'Pokémon Let\'s Go, Pikachu! & Let\'s Go, Eevee!',
    shortTitle: 'Let\'s Go, Pikachu/Eevee!',
    aliases: ['lgp', 'lge', 'lets go pikachu', 'lets go eevee', 'lets go'],
    generation: 7,
  },
  swsh: {
    title: 'Pokémon Sword & Shield',
    shortTitle: 'Sword & Shield',
    generation: 8,
    aliases: ['sw', 'sh', 'sword', 'shield'],
  },
  bdsp: {
    title: 'Pokémon Brilliant Diamond & Shining Pearl',
    shortTitle: 'Brilliant Diamond & Shining Pearl',
    generation: 8,
    aliases: ['brilliant diamond', 'shining pearl', 'bd', 'sp'],
  },
  pla: {
    title: 'Pokémon Legends: Arceus',
    shortTitle: 'Legends: Arceus',
    generation: 8,
    aliases: ['pla', 'legends arceus', 'arceus'],
  },
  scavi: {
    title: 'Pokémon Scarlet & Violet',
    shortTitle: 'Scarlet & Violet',
    generation: 9,
    aliases: ['scavi', 'sv'],
  },
};

function normalizeString(value: string): string {
  return value.toLowerCase().replace(/\W/g, '');
}

export function normalizeGameTitle(title: string): GameTitleMetadata | null {
  const normalizedTitle = normalizeString(title);

  const match = Object.entries(RECOGNIZED_GAME_TITLES).find(([key, value]) => [
    key,
    value.title,
    value.shortTitle,
    value.title.replace('&', 'and'),
    value.shortTitle?.replace('&', 'and'),
    ...(value.aliases ?? []),
  ].some(alias => alias !== undefined && normalizeString(alias) === normalizedTitle));

  return match ? match[1] : null;
}
