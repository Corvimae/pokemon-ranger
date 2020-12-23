
/*I think I want to separate out battle state from the actual
functionality of the battle engine to an extent. This way I can
short cut normal battle behavior under certain circumstances
*/
class BattleEngine {

    constructor(){
        this.trainers = []
        

    };

    //CallTrainerStrategies
    //CallCheaterStrategies
    //RoundBeginingCheck
    //DetermineMoveOrder
    //ExecuteTurn
    //  BeginingOfTurnCheck
    //  ExecuteMove
    //  EndOfTurnCheck
    //EndOfRoundCheck
};

class BeatDownEngine {

    constructor(){
        this.trainers = []
        

    };

};

//The Move Context will contain most of the non-pokemon specific
//battle state. At least the stuff needed to make moves and abilities function
class MoveContext{

    constructor(generation){
        this.weather = null;
        this.generation = null;
        this.randomRolls = [];
    };

}

//Listeners manage Reactions, and check to see if the Reactions conditions
//are met.
class Listener{

    constructor(){
        this.Reactions = []
        this.isActive = false;
    };

    

};

class Event{

    constructor(){

    };

};