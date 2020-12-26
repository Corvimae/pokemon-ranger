import { Pokemon } from './pokeClasses.js'
import { Move } from './moveClasses.js'
import { FetchPokemonByName } from './dataFetchers.js'
import { FetchMoveByName } from './dataFetchers.js'

let starly = new Pokemon(FetchPokemonByName('Starly', 5));
/*starly.pokeName = 'Starly';

starly.IVs['hp'] = 15;
starly.IVs['attack'] = 15;
starly.IVs['defense'] = 15;
starly.IVs['specialAttack'] = 15;
starly.IVs['specialDefense'] = 15;
starly.IVs['speed'] = 15;
starly.level = 5;

starly.RecalcStats();

starly.moves[0] = new Move('physical', //category
    'Normal', //type
    35, //maxPP
    50, //power (in Gen V)
    100, //accuracy
    0, //priority
    true //contact
);*/

//starly.moves[0].moveName = 'Tackle';

let lillipup = new Pokemon(FetchPokemonByName('Lillipup', 5));
//lillipup.pokeName = 'Lillipup';

let moveContext = {
    random : 1
};

function BullyLillipup() {
    'use strict';
    console.log('Starly tackled Lillipup!');
    starly.moves[0].UseMove(moveContext, starly, lillipup);

    if (lillipup.currentHp <= 0) {
        console.log('A kind stranger has healed Lillipup to full!');
        lillipup.currentHp = lillipup.actualStats.hp;
    };
};


BullyLillipup();

const debugDummy = 0;