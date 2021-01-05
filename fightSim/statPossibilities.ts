import { ResultsTensor, Matrix } from './matrixMath.js';

// For Gen III
// Each argument is an Array of each possible value for each input into the stat function
// Nature values should be 1.1, 1.0, or 0.9

export function StatPossibilities(
  baseStats : Array<number> | number,
  IVs : Array<number> | number,
  EVs : Array<number> | number,
  levels : Array<number> | number,
  natures : Array<number> | number,
) : [Record<string, unknown>,
    Record<string, Array<unknown>>,
    Record<string, number>,
    Matrix<number>] {
  const StatFunc = (base : number, IV : number, EV : number, level : number, nature : number) : number => (
    Math.floor((Math.floor(((2 * base + IV + Math.floor(EV / 4)) * level) / 100) + 5) * nature)
  );
  const labels = ['baseStat', 'IVs', 'EVs', 'levels', 'natures'];
  return ResultsTensor(labels, [baseStats, IVs, EVs, levels, natures], StatFunc);
}

export function HPPossibilities(
  baseStats : Array<number> | number,
  IVs : Array<number> | number,
  EVs : Array<number> | number,
  levels : Array<number> | number,
) : [Record<string, unknown>,
    Record<string, Array<unknown>>,
    Record<string, number>,
    Matrix<number>] {
  const StatFunc = (base : number, IV : number, EV : number, level : number) : number => (
    Math.floor(((2 * base + IV + Math.floor(EV / 4)) * level) / 100) + level + 10
  );

  const labels = ['baseStat', 'IVs', 'EVs', 'levels'];
  return ResultsTensor(labels, [baseStats, IVs, EVs, levels], StatFunc);
}

// This for catching the debugger/debug stuff.
/* eslint-disable */
// const test = HPPossibilities(50, [0, 31], [...Array(256).keys()], [5,6,7,8,9,10]);
// const debug = StatPossibilities(50, [...Array(32).keys()], [...Array(255).keys()], [...Array(101).keys()].slice(1), [0.9, 1.0, 1.1]);
// test[3]['1,2,2']
// test[3][[1,2,3] as unknown as keyof Matrix<number>]
// const debugDummy = 0;
