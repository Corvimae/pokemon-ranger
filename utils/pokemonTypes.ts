export const TYPE_NAMES = [
  'normal',
  'fighting',
  'flying',
  'poison',
  'ground',
  'rock',
  'bug',
  'ghost',
  'steel',
  'fire',
  'water',
  'grass',
  'electric',
  'psychic',
  'ice',
  'dragon',
  'dark',
  'fairy',
] as const;

export type TypeName = typeof TYPE_NAMES[number];

interface TypeEffectivenessDefinition {
  double: TypeName[];
  half: TypeName[];
  immune: TypeName[];
}

const typeChart: Record<TypeName, TypeEffectivenessDefinition> = {
  normal: {
    double: [],
    half: ['rock', 'steel'],
    immune: ['ghost'],
  },
  fighting: {
    double: ['normal', 'rock', 'steel', 'ice', 'dark'],
    half: ['flying', 'poison', 'bug', 'psychic', 'fairy'],
    immune: ['ghost'],
  },
  flying: {
    double: ['fighting', 'bug', 'grass'],
    half: ['rock', 'steel', 'electric'],
    immune: [],
  },
  poison: {
    double: ['grass', 'fairy'],
    half: ['poison', 'ground', 'rock', 'ghost'],
    immune: ['steel'],
  },
  ground: {
    double: ['poison', 'rock', 'steel', 'fire', 'electric'],
    half: ['bug', 'grass'],
    immune: ['flying'],
  },
  rock: {
    double: ['flying', 'bug', 'fire', 'ice'],
    half: ['fighting', 'ground', 'steel'],
    immune: [],
  },
  bug: {
    double: ['grass', 'psychic', 'dark'],
    half: ['fighting', 'flying', 'poison', 'ghost', 'steel', 'fire'],
    immune: [],
  },
  ghost: {
    double: ['ghost', 'psychic'],
    half: ['dark'],
    immune: ['normal'],
  },
  steel: {
    double: ['rock', 'ice', 'fairy'],
    half: ['steel', 'fire', 'water', 'electric'],
    immune: [],
  },
  fire: {
    double: ['bug', 'steel', 'grass'],
    half: ['rock', 'fire', 'water', 'dragon'],
    immune: [],
  },
  water: {
    double: ['ground', 'rock', 'fire'],
    half: ['water', 'grass', 'dragon'],
    immune: [],
  },
  grass: {
    double: ['ground', 'rock', 'water'],
    half: ['flying', 'poison', 'bug', 'steel', 'fire', 'grass', 'dragon'],
    immune: [],
  },
  electric: {
    double: ['flying', 'water'],
    half: ['grass', 'electric', 'dragon'],
    immune: ['ground'],
  },
  psychic: {
    double: ['fighting', 'poison'],
    half: ['steel', 'psychic'],
    immune: ['dark'],
  },
  ice: {
    double: ['flying', 'ground', 'grass', 'dragon'],
    half: ['steel', 'fire', 'water', 'ice'],
    immune: [],
  },
  dragon: {
    double: ['dragon'],
    half: ['steel'],
    immune: ['fairy'],
  },
  dark: {
    double: ['ghost', 'psychic'],
    half: ['fighting', 'dark', 'fairy'],
    immune: [],
  },
  fairy: {
    double: ['fighting', 'dragon', 'dark'],
    half: ['poison', 'steel', 'fire'],
    immune: [],
  },
};

interface TypeEffectivenesses {
  x4: TypeName[];
  x2: TypeName[];
  x0: TypeName[];
  half: TypeName[];
  fourth: TypeName[];
}

export function getDefensiveEffectivenesses(type: TypeName | null): TypeEffectivenesses {
  if (!type || !typeChart[type]) {
    return {
      x4: [],
      x2: [],
      x0: [],
      half: [],
      fourth: [],
    };
  }

  return {
    x4: [],
    x2: Object.entries(typeChart).filter(([_key, rules]) => rules.double.indexOf(type) !== -1).map(([key]) => key as TypeName),
    x0: Object.entries(typeChart).filter(([_key, rules]) => rules.immune.indexOf(type) !== -1).map(([key]) => key as TypeName),
    half: Object.entries(typeChart).filter(([_key, rules]) => rules.half.indexOf(type) !== -1).map(([key]) => key as TypeName),
    fourth: [],
  };
}

function exclusiveOr(a: boolean, b: boolean): boolean {
  return (a && !b) || (b && !a);
}

function is4x(type: TypeName, type1: TypeEffectivenesses, type2: TypeEffectivenesses): boolean {
  return type1.x2.indexOf(type) !== -1 && type2.x2.indexOf(type) !== -1;
}

function is2x(type: TypeName, type1: TypeEffectivenesses, type2: TypeEffectivenesses): boolean {
  return exclusiveOr(type1.x2.indexOf(type) !== -1, type2.x2.indexOf(type) !== -1)
    && type1.half.indexOf(type) === -1 && type2.half.indexOf(type) === -1;
}

function isHalf(type: TypeName, type1: TypeEffectivenesses, type2: TypeEffectivenesses): boolean {
  return exclusiveOr(type1.half.indexOf(type) !== -1, type2.half.indexOf(type) !== -1)
    && type1.x2.indexOf(type) === -1 && type2.x2.indexOf(type) === -1;
}

function isFourth(type: TypeName, type1: TypeEffectivenesses, type2: TypeEffectivenesses): boolean {
  return type1.half.indexOf(type) !== -1 && type2.half.indexOf(type) !== -1;
}

export function calculateCombinedDefensiveEffectivenesses(...pokemonTypes: TypeName[]): TypeEffectivenesses {
  const type1 = getDefensiveEffectivenesses(pokemonTypes[0] as TypeName);
  const type2 = getDefensiveEffectivenesses(pokemonTypes[1] as TypeName);

  const allImmunities = [...type1.x0, ...type2.x0];

  return {
    x4: TYPE_NAMES.filter(type => is4x(type, type1, type2) && allImmunities.indexOf(type) === -1),
    x2: TYPE_NAMES.filter(type => is2x(type, type1, type2) && allImmunities.indexOf(type) === -1),
    x0: TYPE_NAMES.filter(type => type1.x0.indexOf(type) !== -1 || type2.x0.indexOf(type) !== -1 || allImmunities.indexOf(type) !== -1),
    half: TYPE_NAMES.filter(type => isHalf(type, type1, type2) && allImmunities.indexOf(type) === -1),
    fourth: TYPE_NAMES.filter(type => isFourth(type, type1, type2) && allImmunities.indexOf(type) === -1),
  };
}

export function calculateMoveEffectiveness(moveType: TypeName, ...pokemonTypes: TypeName[]): number {
  const combinedEffectivness = calculateCombinedDefensiveEffectivenesses(...pokemonTypes);

  if (combinedEffectivness.x4.indexOf(moveType) !== -1) return 4;
  if (combinedEffectivness.x2.indexOf(moveType) !== -1) return 2;
  if (combinedEffectivness.x0.indexOf(moveType) !== -1) return 0;
  if (combinedEffectivness.half.indexOf(moveType) !== -1) return 0.5;
  if (combinedEffectivness.fourth.indexOf(moveType) !== -1) return 0.25;

  return 1;
}
