import { typeEnumerator, FetchTypeMatchup } from './typeMatrix.js';
import { FetchMoveByName } from './dataFetchers.js'

export class Pokemon {
    constructor(pokeJSON) {
        //this.IVs = new StatBlock([0, 31], [0, 31], [0, 31], [0, 31], [0, 31], [0, 31]);

        //let pokeData = JSON.parse(pokeJson);

        this.IVs = new StatBlock(pokeJSON.IVs.hp, 
            pokeJSON.IVs.attack, 
            pokeJSON.IVs.defense, 
            pokeJSON.IVs.specialAttack,
            pokeJSON.IVs.specialDefense,
            pokeJSON.IVs.speed);

        this.EVs = new StatBlock(pokeJSON.EVs.hp,
            pokeJSON.EVs.attack,
            pokeJSON.EVs.defense,
            pokeJSON.EVs.specialAttack,
            pokeJSON.EVs.specialDefense,
            pokeJSON.EVs.speed);

        this.baseStats = new StatBlock(pokeJSON.baseStats.hp,
            pokeJSON.baseStats.attack,
            pokeJSON.baseStats.defense,
            pokeJSON.baseStats.specialAttack,
            pokeJSON.baseStats.specialDefense,
            pokeJSON.baseStats.speed);

        this.nature = new StatBlock(1,
            pokeJSON.nature.attack,
            pokeJSON.nature.defense,
            pokeJSON.nature.specialAttack,
            pokeJSON.nature.specialDefense,
            pokeJSON.nature.speed);

        this.generation = pokeJSON.generation

        this.level = pokeJSON.level;
        // either [type] or [type, type]
        this.type = pokeJSON.type

        this.pokeName = pokeJSON.pokeName

        //**** me abilities will be annoying to implement
        this.ability = pokeJSON.ability;
        this.item = pokeJSON.item;

        this.actualStats = new StatBlock(this.CalcHP(this.generation),
            this.CalcStat(this.generation, 'attack'),
            this.CalcStat(this.generation, 'defense'),
            this.CalcStat(this.generation, 'specialAttack'),
            this.CalcStat(this.generation, 'specialDefense'),
            this.CalcStat(this.generation, 'speed'));

        //Implement Move Fetcher
        this.moves = [(pokeJSON.moves[0] === null)? null : new Move(FetchMoveByName(pokeJSON.moves[0], this.generation)),
            (pokeJSON.moves[1] === null)? null : new Move(FetchMoveByName(pokeJSON.moves[1], this.generation)),
            (pokeJSON.moves[2] === null)? null : new Move(FetchMoveByName(pokeJSON.moves[2], this.generation)),
            (pokeJSON.moves[3] === null)? null : new Move(FetchMoveByName(pokeJSON.moves[3], this.generation))];


        this.currentHp = this.actualStats['hp'];
        this.persistentStatus = pokeJSON.persistentStatus;
        this.temporaryStatus = [];

        this.battleStages = new BattleStageManager();

        //future stuff?
        //back calc IVs from user input
        //EV routing implementation?

    };

    EffectiveStat(stat) {
        //I'm assuming this is floored.
        return Math.floor(this.actualStats[stat] * this.battleStages[stat].statMultiplier)
    };

    CalcStat(generation, stat) {

        switch (generation) {

            case 1:
                if (stat === 'specialDefense') throw new RangeError("Gen I doesn't have specialDefense as a stat.");
            case 2:
                return Math.floor(((this.baseStats[stat] + this.IVs[stat]) * 2 + Math.floor(Math.ceil(Math.sqrt(this.EVs[stat])) / 4)) * this.level / 100) + 5;

            default:
                
                return Math.floor((Math.floor((2 * this.baseStats[stat] + this.IVs[stat] + Math.floor(this.EVs[stat] / 4)) * this.level / 100) + 5) * this.nature[stat]);
        };
    };

    CalcHP(generation) {
        switch (generation) {

            case 1:
            case 2:
                return Math.floor(((this.baseStats['hp'] + this.IVs['hp']) * 2 + Math.floor(Math.ceil(Math.sqrt(this.EVs['hp'])) / 4)) * this.level / 100) + this.level + 10;

            default:
                return Math.floor((2 * this.baseStats['hp'] + this.IVs['hp'] + Math.floor(this.EVs['hp'] / 4)) * this.level / 100) + this.level + 10;
        };

    };

    RecalcStats() {
        this.actualStats['hp'] = this.CalcHP(this.generation);
        this.actualStats['attack'] = this.CalcStat(this.generation, 'attack');
        this.actualStats['defense'] = this.CalcStat(this.generation, 'defense');
        this.actualStats['specialAttack'] = this.CalcStat(this.generation, 'specialAttack');
        this.actualStats['specialDefense'] = this.CalcStat(this.generation, 'specialDefense');
        this.actualStats['speed'] = this.CalcStat(this.generation, 'speed');

    };

    ApplyDamage(moveContext, damage) {
        //Here's where we can check for certain ability/item triggers. When that is set up at least.

        this.currentHp -= damage;
        console.log(damage.toString() + ' damage was dealt!')

        if (this.currentHp <= 0) {
            this.currentHp = 0
            if (this.pokeName) {
                console.log(this.pokeName + ' has fainted!')
            } else {
                console.log('A Pokemon has fainted!');
            };
        };
    };
};

class StatBlock {

    constructor(hp, attack, defense, specialAttack, specialDefense, speed) {
        this.hp = hp;
        this.attack = attack;
        this.defense = defense;
        this.specialAttack = specialAttack;
        this.specialDefense = specialDefense;
        this.speed = speed;
    };

};

class BattleStageManager {

    constructor(generation) {
        this.attack = new StatStage(generation);
        this.defense = new StatStage(generation);
        this.specialAttack = new StatStage(generation);
        this.specialDefense = new StatStage(generation);
        this.speed = new StatStage(generation);
        this.accuracy = new EvAccStatStage(generation, false);
        this.evasion = new EvAccStatStage(generation, true);

    };

    ResetStages() {
        this.attack.stage = 0;
        this.defense.stage = 0;
        this.specialAttack.stage = 0;
        this.specialDefense.stage = 0;
        this.speed.stage = 0;
        this.accuracy.stage = 0;
        this.evasion.stage = 0;
    }
    
};


class StatStage {

    constructor(generation) {
        this._stage = 0;
        if (generation < 3) {
            this.multiplierMap = [25 / 100, 28 / 100, 33 / 100, 40 / 100, 50 / 100, 66 / 100, 1, 150 / 100, 200 / 100, 250 / 100, 300 / 100, 350 / 100, 400 / 100];
        } else {
            this.multiplierMap = [2 / 8, 2 / 7, 2 / 6, 2 / 5, 2 / 4, 2 / 3, 2 / 2, 3 / 2, 4 / 2, 5 / 2, 6 / 2, 7 / 2, 8 / 2];
        };
    };

    get statMultiplier() {
        return this.multiplierMap[this.stage + 6]
    };

    set stage(val) {
        //force val to be within [-6, 6]
        this._stage = Math.min(6, Math.max(-6, val))
    };

    get stage() {
        return this._stage
    };
};


export class EvAccStatStage {
    constructor(generation, isEvasion) {
        this._stage = 0

        this.isEvasion = isEvasion

        switch (generation) {
            case 1:
                this.multiplierMap = [25 / 100, 28 / 100, 33 / 100, 40 / 100, 50 / 100, 66 / 100, 1, 150 / 100, 200 / 100, 250 / 100, 300 / 100, 350 / 100, 400 / 100];
                break;
            case 2:
                this.multiplierMap = [33 / 100, 36 / 100, 43 / 100, 50 / 100, 60 / 100, 75 / 100, 1, 133 / 100, 166 / 100, 200 / 100, 233 / 100, 266 / 100, 300 / 100];
                break;
            case 3:
            case 4:
                this.multiplierMap = [33 / 100, 36 / 100, 43 / 100, 50 / 100, 60 / 100, 75 / 100, 1, 133 / 100, 166 / 100, 200 / 100, 250 / 100, 266 / 100, 300 / 100];
                break;
            default:
                this.multiplierMap = [3 / 9, 3 / 8, 3 / 7, 3 / 6, 3 / 5, 3 / 4, 3 / 3, 4 / 3, 5 / 3, 6 / 3, 7 / 3, 8 / 3, 9 / 3];
        };

        this.generation = generation

    };

    get statMultiplier() {
        if (this.generation > 2) throw new RangeError("Gen III and after should use EvAccStatStage.calcAccMultiplier().");
        return this.isEvasion ? this.multiplierMap[-this.stage + 6] : this.multiplierMap[this.stage + 6]
    };

    static calcAccMultiplier(moveContext, attackingPokemon, defendingPokemon) {
        if (moveContext.generation < 3) {

            return attackingPokemon.battleStages.accuracy.statMultiplier * defendingPokemon.evasion.statMultiplier;

        } else {
            let stageSum = attackingPokemon.battleStages.accuracy.stage - defendingPokemon.battleStages.evasion.stage;
            //force stageSum to be within [-6, 6]
            stageSum = Math.min(6, Math.max(-6, stageSum))

            return attackingPokemon.battleStages.accuracy.multiplierMap[stageSum]
        }
        
    };
};


//class MoveManager {

//    constructor() {

//    };

//};

export class Move {

    //constructor(category, type, maxPP, power, accuracy, priority, contact) {
    constructor(moveJSON) {


        this.category = moveJSON.category;
        /* if (this.category === "physical") {
            this.calcStats = ['attack', 'defense']
        } else if (this.category === "special") {
            this.calcStats = ['specialAttack', 'specialDefense']
        } else {
            this.calcStats = [null, null]
        }; */
        this.calcStats = moveJSON.calcStats;
        this.type = moveJSON.type;
        this.maxPP = moveJSON.maxPP;
        this.currentPP = moveJSON.currentPP;
        this.power = moveJSON.power;
        this.accuracy = moveJSON.accuracy;
        this.priority = moveJSON.priority;
        this.contact = moveJSON.contact;
        this.moveName = moveJSON.moveName;

        this.stabMulti = moveJSON.stabMulti;

        //[[self, allyNear, allyFar], [enemyAcross, enemyNear, enemyFar]]
        this.targeting = moveJSON.targeting;

        //All of the random rolls will be fed to the move through
        //moveContext in class methods. Most moves need at least
        //three rolls, accuracyCheck, critCheck, damageRange
        this.randomRolls = moveJSON.randomRolls;

        //Just gonna assume gen 5 for now since that's the current priority target
        //Remove this when this.CalcDamageMultiplier() is updated.
        this.typeMatrix = FetchTypeMatchup(5);

    };

    UseMove(moveContext, attacker, defender) {
        if (this.currentPP <= 0) throw Error("Can't use a move at 0 PP!");
        this.currentPP -= 1


        if (this.category != 'status') {

            //To Hit here

            //const damage = this.CalcDamage(moveContext, attacker, defender)
            defender.ApplyDamage(moveContext, this.CalcDamage(moveContext, attacker, defender))
        };
        this.AdditionalEffect(moveContext, attacker, defender);
    };

    AdditionalEffect(moveContext, attacker, defender) {
        //move dependent implementation
        return
    };

    CalcDamage(moveContext, attacker, defender) {
        //implement Critical Calcs
        //  RaNdOmNeSs - move this roll into the moveContext to enable control of randomness (ie to methodically calculate all possible damage values)

        //  Pretty sure these are the two biggest sources of variance between fights (IVs and ranges)

        const statRatio = attacker.EffectiveStat(this.calcStats[0]) / defender.EffectiveStat(this.calcStats[1]);
        const random = (85 + Math.random() * 16) / 100;

        const baseDamage = (Math.floor(Math.floor((Math.floor(0.4 * attacker.level) + 2) * this.power * statRatio) / 50) + 2)

        //might want to do some sort of .reduce call on an array of multis from this.CalcDamageMultiplier to better mimic damage calcs in game
        return Math.floor(baseDamage * this.CalcDamageMultiplier(moveContext, attacker, defender) * random)
    };

    CalcDamageMultiplier(moveContext, attacker, defender) {
        //Implement this.
        //Includes:
        //  Targets Gen III + : Gen III - 1 or 0.5, Gen IV+ 1 or 0.75
        //  Weather
        //  Badges (Gen II only)
        //  Crits
        //  STAB - done
        //  Type Effectiveness - Update this to have the typeMatrix be passed by moveContext
        //  Burn
        //  Other
        //
        
        
        const stab = attacker.type.reduce(
            (stabAccum, currentType) => { return (currentType === this.type) ? this.stabMulti : stabAccum },
            1.0);
        console.log(stab);
        const typeEffect = defender.type.reduce(
            (typeEffectAccum, currentType) => { return typeEffectAccum * this.typeMatrix[typeEnumerator[this.type]][typeEnumerator[currentType]] },
            1.0);
        console.log(typeEffect);

        return stab*typeEffect
    }

};