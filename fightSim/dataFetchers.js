//The functions here are placeholders for pulling pokemon JSON data
//With my luck, anything I'd write would break upon contact with a browser

//console.log(process.cwd());
//console.log(__dirname);

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { openSync, readFileSync, closeSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(__dirname);

export function FetchPokemonByName(pokeName, generation) {

    let filepath = __dirname + '/gen' + generation.toString() + '/pokemon/' + pokeName + '.json';
    let file ;
    try {
        file = openSync(filepath, 'r');

    } catch (error) {
        console.log(error.message);
        if (error.message === "ENOENT: no such file or directory, open '" + filepath + "'"){
            console.log(error.info);
            error.info = {
                pokeName : pokeName,
                generation : generation
            };
            console.log(error.info);
        };
        throw error
    };

    let data = readFileSync(file, 'utf8');
    closeSync(file);

    return JSON.parse(data);
};

export function FetchMoveByName(moveName, generation) {

    let filepath = __dirname + '/gen' + generation.toString() + '/moves/' + moveName + '.json';
    let file ;
    try {
        file = openSync(filepath, 'r');

    } catch (error) {
        console.log(error.message);
        if (error.message === "ENOENT: no such file or directory, open '" + filepath + "'"){
            console.log(error.info);
            error.info = {
                moveName : moveName,
                generation : generation
            };
            console.log(error.info);
        };
        throw error
    };

    let data = readFileSync(file, 'utf8');
    closeSync(file);

    return JSON.parse(data);
};

const dummy = 0;