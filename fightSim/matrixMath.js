export function ResultsTensor(axisLabels, listOfValueSets, mapFunc) {
    
    let constantVals = {};

    let variableVals = {};
    let variableValList = [];
    let variableAxis = {};
    let numVariableVals = [];
    let variableElements = [];
    let initFuncArgs = [];

    let i = 0;
    let axis = 0;
    for (const element of listOfValueSets) {
        
        if (Array.isArray(element)) {
            if (element.length > 1) {
                variableVals[axisLabels[i]] = listOfValueSets[i];
                variableValList.push(element)
                variableAxis[axisLabels[i]] = axis;
                axis++;
                numVariableVals.push(element.length);
                variableElements.push(i);
                initFuncArgs.push(listOfValueSets[i][0]);
            } else {
                constantVals[axisLabels[i]] = listOfValueSets[i][0];
                //variableFlag.push(0);
                initFuncArgs.push(listOfValueSets[i][0]);
            };
        } else {
            constantVals[axisLabels[i]] = listOfValueSets[i];
            //variableFlag.push(0);
            initFuncArgs.push(listOfValueSets[i]);
        };
        i++
    };

    if (variableVals.length === 0) throw new Error('Needs to have at least one variable');

    let resultsTensor = ConstuctMultiArray(numVariableVals);

    const AsyncFunc = async (args, arrayLocation, writeArray) => {
        const writeValue =  mapFunc(...args);
        let writeLocation = writeArray;
        let i = 0;
        for (; i < arrayLocation.length-1; i++) {
            writeLocation = writeLocation[arrayLocation[i]];
        };
        writeLocation[arrayLocation[i]] = writeValue;
        return
    };
    //let mathPromises = 
    let caughtError = null;
    Promise.allSettled(SpawnPromises(initFuncArgs, variableElements, variableValList, AsyncFunc, resultsTensor)).catch((error) => caughtError = error);

    if (!caughtError===null){
        console.log(caughtError);
        throw caughtError;
    }

    return [constantVals, variableVals, variableAxis, resultsTensor];
    
};

async function SpawnPromises(initArgs, variableElements, variableVals, AsyncFunc, writeArray, arrayLocation = []){
    //initArgs Array with the size of the args of asyncFunc
    //variableElements Array of the elements of initArgs to be swept through
    //variableVals Array of values for each variable
    //asyncFunc async Function to sweep through problem space
    //writeArray reference of multiDimensional array to populate

    let promises = [];

    if (variableElements.length === 1) {

        //let arrayLocation = initArgs[variableElements[0]];
        arrayLocation.push(0);

        for (let i = 0; i < variableVals[variableVals.length-1].length; i++) {
            initArgs[variableElements[0]] = variableVals[variableVals.length-1][i];
            arrayLocation[arrayLocation.length-1] = i;
            promises.push(AsyncFunc(initArgs.slice(), arrayLocation.slice(), writeArray));
        };

        return Promise.allSettled(promises);

    } else {
        
        /*let arrayLocation;
        if (!Array.isArray(initArgs[variableElements[variableElements.length - 1]])) {
            initArgs[variableElements[variableElements.length - 1]] = [];

        };

        arrayLocation = initArgs[variableElements[variableElements.length - 1]];*/
        arrayLocation.push(0);
        for (let i = 0; i < variableVals[variableVals.length-variableElements.length].length; i++) {

            initArgs[variableElements[0]] = variableVals[arrayLocation.length-1][i];
            arrayLocation[arrayLocation.length-1] = i;
            promises.push(SpawnPromises(initArgs.slice(),
                                        variableElements.slice(1), 
                                        variableVals,
                                        AsyncFunc, 
                                        writeArray, 
                                        arrayLocation.slice()));
        };
        return Promise.allSettled(promises);
    };
    //currentVariableElement = variableElements[0]

}

export class Matrix {

    constructor(dimensionLengths){

        let arrayLength = dimensionLengths.reduce((acc,cur) => {return acc*cur},
                                                1.0);

        this.length = dimensionLengths;

        this.values = new Array(arrayLength).fill(0)

        let handler = {

            get : function(target, prop, reciever){
                if(Array.isArray(prop)){
                    if (prop.length != target.length){throw new Error('dimension')};

                };
            },

        };

        let proxy = new Proxy()

    };

};


//recursively constructs a arg[1]xarg[2]x...xarg[n] matrix implemented as nested arrays.

function ConstuctMultiArray(axisLengths){
    
    if (axisLengths.length === 0) return 0;
    
    const currentAxisLength = axisLengths[0];
    const currentAxisElement = ConstuctMultiArray(axisLengths.slice(1));
    let currentAxis = [];
    for (let i = 0; i < currentAxisLength; i++) {
        currentAxis.push((Array.isArray(currentAxisElement)) ? currentAxisElement.slice() : currentAxisElement);
    };
    return currentAxis;
};
