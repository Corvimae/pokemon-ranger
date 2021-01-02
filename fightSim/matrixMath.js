function ResultsTensor(axisLabels, listOfValueSets, mapFunc) {
    
    let constantVals = {};

    let variableVals = {};
    let variableValList = [];
    let variableAxis = [];
    let numVariableVals = [];
    let variableElements = [];
    let initFuncArgs = [];

    let i = 0;
    let axis = 0;
    for (const element in listOfValueSets) {
        
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
                variableFlag.push(0);
                initFuncArgs.push(listOfValueSets[i][0]);
            };
        } else {
            constantVals[axisLabels[i]] = listOfValueSets[i];
            variableFlag.push(0);
            initFuncArgs.push(listOfValueSets[i]);
        };
        i++
    };

    let resultsTensor = ConstuctMultiArray(numVariableVals);

    const AsyncFunc = async (args, arrayLocation, writeArray) => {
        const writeValue =  mapFunc(...args);
        let writeLocation = writeArray
        let i = 0
        for (; i < arrayLocation.length-1; index++) {
            writeLocation = writeLocation[arrayLocation[i]];
        };
        writeLocation[arrayLocation[i+1]] = writeValue
        return
    };
    //let mathPromises = 
    Promises.allSettled(SpawnPromises(initFuncArgs, variableElements, variableValList, AsyncFunc, resultsTensor));

    return [constantVals, variableVals, variableAxis, resultsTensor]
    
};

async function SpawnPromises(initArgs, variableElements, variableVals, AsyncFunc, writeArray, arrayLocation = []){
    //initArgs Array with the size of the args of asyncFunc
    //variableElements Array of the elements of initArgs to be swept through
    //variableVals Array of values for each variable
    //asyncFunc async Function to sweep through problem space
    //writeArray reference of multiDimensional array to populate

    let promises = []

    if (variableElements.length === 1) {

        //let arrayLocation = initArgs[variableElements[0]];
        arrayLocation.push(0);

        for (let i = 0; i < variableVals[variableVals.length-1].length; i++) {
            initArgs[variableElements[0]] = variableVals[variableVals.length-1][i];
            arrayLocation[arrayLocation.length-1] = i;
            promises.push(AsyncFunc(initArgs.splice(), arrayLocation.splice(), writeLocation));
        };

        return Promise.allSettled(promises);

    } else {
        
        /*let arrayLocation;
        if (!Array.isArray(initArgs[variableElements[variableElements.length - 1]])) {
            initArgs[variableElements[variableElements.length - 1]] = [];

        };

        arrayLocation = initArgs[variableElements[variableElements.length - 1]];*/
        arrayLocation.push(0)
        for (let i = 0; i < variableVals[variableVals.length-variableElements.length].length; i++) {

            initArgs[variableElements[0]] = variableVals[variableVals.length-1][i];
            arrayLocation[arrayLocation.length-variableElements.length] = i;
            promises.push(SpawnPromises(initArgs.slice(),
                                        variableElements.slice(1), 
                                        variableVals,
                                        AsyncFunc, 
                                        writeArray, 
                                        arrayLocation = arrayLocation.slice()));
        };
        return Promise.allSettled(promises);
    };
    //currentVariableElement = variableElements[0]

}

function ConstuctMultiArray(axisLengths){
    
    if (axisLengths === []) return 0;
    
    const currentAxisLength = axisLengths[0];
    const currentAxisElement = ConstuctMultiArray(axisLengths.slice(1));
    let currentAxis = []
    for (let i = 0; index < length; index++) {
        currentAxis.push(currentAxisElement);
    };
    return currentAxis
};
