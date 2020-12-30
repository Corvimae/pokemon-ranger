
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
        this.eventsListeningFor = {}
        this.isActive = false;
    };

    registerReaction(reaction){

        if (!this.eventsListeningFor.hasOwnProperty(eventName)){

            this.eventsListeningFor[eventName] = [reaction];

        } else {

            this.eventsListeningFor[eventName].Append(reaction);
            this.eventsListeningFor[eventName].sort((Element1, Element2) => Element1.priority - Element2.priority)
        };

    };

    Emit(eventName, eventContext){

        if (!this.eventsListeningFor.hasOwnProperty(eventName)){
            return 1
        };

        let spliceTargets = []

        for (const [index, reaction] in this.eventsListeningFor[eventName].entries()) {
            if (reaction.CheckExistence() && reaction.CheckCondition()) {
                //execute Reaction callback here        
                //reaction.callBack(eventContext);
            };

            if (!reaction.CheckExistence()){
                spliceTargets.Append(index)
            };
        }

        if(spliceTargets.length){
            spliceTargets.reverse();

            for (const target in spliceTargets) {
                
                this.eventsListeningFor[eventName].splice(target)
                
            };
        };
    };

};

class Reaction{

    constructor(eventNames, priority, conditions, callBack, existenceConditions){

        this.eventNames = eventNames;
        this.priority = priority; //Lower priority reactions occur first
        this.conditions = conditions;
        this.callBack = callBack; //Figure out how to implement this
        this.existenceConditions = {
            existenceConditions : existenceConditions,
            deleteThis : False
        };
    };
};

