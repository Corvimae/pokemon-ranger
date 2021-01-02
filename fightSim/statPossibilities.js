import { ResultsTensor } from './matrixMath.js'

//For Gen III
//Each argument is an Array of each possible value for each input into the stat function

export function StatPossibilities(baseStats, IVs, EVs, levels, natures){

    let StatFunc = (base, IV, EV, level, nature) =>{
        return Math.floor((Math.floor((2 * base + IV + Math.floor(EV / 4)) * level / 100) + 5) * nature);
    };
    labels = ['baseStat', 'IVs', 'EVs', 'levels', 'natures'];
    return ResultsTensor(labels, [baseStats, IVs, EVs, levels, natures], StatFunc)
};