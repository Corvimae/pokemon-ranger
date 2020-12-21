import { Pokemon, Move } from './pokeClasses.js'

export let starly = new Pokemon(40, 55, 30, 30, 30, 60, ['Normal','Flying'], 5);
starly.pokeName = 'Starly';

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
);

starly.moves[0].moveName = 'Tackle';

export let lillipup = new Pokemon(45, 60, 45, 25, 45, 55, ['Normal'], 5);
lillipup.pokeName = 'Lillipup';

export function BullyLillipup() {
    'use strict';
    console.log('Starly tackled Lillipup!');
    starly.moves[0].UseMove(null, starly, lillipup);

    if (lillipup.currentHp <= 0) {
        console.log('A kind stranger has healed Lillipup to full!');
        lillipup.currentHp = lillipup.actualStats.hp;
    };
};


