type TupleOfArrays<T> = {
    [P in Extract<keyof T, number>]: Array<T[P]> | T[P];
}

export function ResultsTensor<A extends any[], R>(axisLabels : Array<string>, 
    listOfValueSets : TupleOfArrays<A>, mapFunc : (...args : A ) => R) : [Record<string, unknown>, Record<string, Array<unknown>>, Record<string, number>, Matrix<R>]{
    
    const constantVals : Record<string, unknown> = {};

    const variableVals : Record<string, Array<unknown>> = {};
    const variableValList : Array<any> = [];
    const variableAxis : Record<string, number> = {};
    const numVariableVals : Array<any> = [];
    const variableElements : Array<number> = [];
    const initFuncArgs : A = [] as unknown as A;
    
    
    let axis = 0;
    for (let i = 0; i < axisLabels[axisLabels.length-1].length; i += 1) {
        const element = listOfValueSets[i];
        if (Array.isArray(element)) {
            if (element.length > 1) {
                variableVals[axisLabels[i]] = element;
                variableValList.push(element)
                variableAxis[axisLabels[i]] = axis;
                axis += 1;
                numVariableVals.push(element.length);
                variableElements.push(i);
                initFuncArgs.push(element[0]);
            } else {
                constantVals[axisLabels[i]] = element[0];
                //variableFlag.push(0);
                initFuncArgs.push(element[0]);
            };
        } else {
            constantVals[axisLabels[i]] = element;
            //variableFlag.push(0);
            initFuncArgs.push(element);
        };
        i += 1;
    };

    if (variableValList.length === 0) throw new Error('Needs to have at least one variable');

    //let resultsTensor = ConstuctMultiArray(numVariableVals);

    let resultsTensor = new Matrix<R>(numVariableVals);

    const AsyncFunc = async (args: A, arrayLocation: Array<number>, writeArray : Matrix<R>) : Promise<void> =>{
        const writeValue =  mapFunc(...args);
        /* let writeLocation = writeArray;
        let i = 0;
        for (; i < arrayLocation.length-1; i += 1) {
            writeLocation = writeLocation[arrayLocation[i]];
        }; */
        writeArray[arrayLocation as unknown as keyof Matrix<R>] = writeValue;
    };  
    //let mathPromises = 
    let caughtError = null;
    Promise.allSettled(SpawnPromises(initFuncArgs,
        variableElements,
        variableValList,
        AsyncFunc,
        resultsTensor) as unknown as Array<unknown>).catch((error) => caughtError = error);

    if (!caughtError===null){
        console.log(caughtError);
        throw caughtError;
    }

    return [constantVals, variableVals, variableAxis, resultsTensor];
    
};

async function SpawnPromises<A extends any[], R>(initArgs : A,
    variableElements: Array<number>,
    variableVals : Array<any>,
    AsyncFunc : (args : A, arrayLocation : Array<number>, writeLocation : Matrix<R> ) => Promise<void>,
    writeArray : Matrix<R>,
    arrayLocation : Array<number> = [] ) : Promise<any>{
    //initArgs Array with the size of the args of asyncFunc
    //variableElements Array of the elements of initArgs to be swept through
    //variableVals Array of values for each variable
    //asyncFunc async Function to sweep through problem space
    //writeArray reference of multiDimensional array to populate

    let promises = [];

    if (variableElements.length === 1) {

        //let arrayLocation = initArgs[variableElements[0]];
        arrayLocation.push(0);

        for (let i = 0; i < variableVals[variableVals.length-1].length; i += 1) {
            initArgs[variableElements[0]] = variableVals[variableVals.length-1][i];
            arrayLocation[arrayLocation.length-1] = i;
            promises.push(AsyncFunc(initArgs.slice() as A, arrayLocation.slice(), writeArray));
        };

        return Promise.allSettled(promises);

    } else {
        
        /*let arrayLocation;
        if (!Array.isArray(initArgs[variableElements[variableElements.length - 1]])) {
            initArgs[variableElements[variableElements.length - 1]] = [];

        };

        arrayLocation = initArgs[variableElements[variableElements.length - 1]];*/
        arrayLocation.push(0);
        for (let i = 0; i < variableVals[variableVals.length-variableElements.length].length; i += 1) {

            initArgs[variableElements[0]] = variableVals[arrayLocation.length-1][i];
            arrayLocation[arrayLocation.length-1] = i;
            promises.push(SpawnPromises(initArgs.slice() as A,
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



export class Matrix<R> {
    [index : string] : Array<number> | Array<R> | R
    length : Array<number>;
    values : Array<R>;
    
    private dimensionOffset : Array<number>;
    
    constructor(dimensionLengths: Array<number>, fillValue : R = null as unknown as R){

        let arrayLength = dimensionLengths.reduce((acc,cur) => {return acc * cur}, 1.0);
        this.dimensionOffset = dimensionLengths.map((cur, i, arr) => arr.slice(0,i).reduce((acc,cur) => {return acc * cur}, 1.0))

        this.length = dimensionLengths;

        this.values = new Array(arrayLength).fill(fillValue);

        let handler = {

            get : function(target : Matrix<R>, prop : string, reciever : object){
                if(prop in target) return target[prop as keyof typeof target]; //as typeof target[prop as keyof typeof target];

                const index = prop.split(',').map(Number.parseFloat);

                if(Array.isArray(index)){
                    //Check to make sure the accessing array has same number of dimensions as the matrix
                    if (index.length !== target.length.length)throw new Error("Accessing array doesn't match Matrix dimensions: expected " 
                        + target.length.length.toString() + ", recieved" + index.length.toString());

                    //Check to make sure none of the accessing array is out of bounds
                    for (let i = 0; i < index.length; i += 1) {
                        if (typeof index[i] !== "number") throw new Error('Key error: ' + index + 'contains values other than numbers' );
                        if (index[i] <=  target.length[i]){
                            throw new Error("Dimension " + i + " out of Matrix bounds");
                        };
                    };
                    //dot product of index and dimensionOffset yields the index for the 1D array
                    return target.values[target.dimensionOffset.reduce((acc,cur, i) => {return acc + index[i] * cur}, 0)] as R;
                };
                throw new Error('Key error: ' + prop);
            },

            set : function(target : Matrix<R>, prop : string, value : Matrix<R>[keyof Matrix<R>] | R, reciever : object){
                if(prop in target){
                    const targetProp = prop;
                    const targetRef = target;                 
                    let currentValue = targetRef[targetProp as keyof Matrix<R>];
                    const setValue = value;
                    //type propType = typeof currentValue;
                    if (Array.isArray(currentValue) && Array.isArray(setValue)) {
                        const firstEleSet = setValue[0];
                        //const firstEleCur = currentValue[0];
                        if (typeof firstEleSet === typeof currentValue[0]){
                            //const valueToSet = value as typeof currentValue;
                            
                            currentValue = setValue;
                            //let test = setValue as Extract<typeof setValue, typeof currentValue>;
                            //Reflect.set(target, prop, value as typeof currentValue) //as typeof target[prop as keyof typeof target];
                            return true
                        };
                    };
                    if (!Array.isArray(currentValue) && !Array.isArray(setValue)) {
                        if (typeof setValue === typeof currentValue){
                            const valueToSet = value as typeof currentValue;
                            targetRef[targetProp as keyof Matrix<R>] = valueToSet;
                            //Reflect.set(target, prop, value as typeof currentValue) //as typeof target[prop as keyof typeof target];
                            return true
                        };
                    };

                    return false;
                    
                };

                const index = prop.split(',').map(Number.parseFloat);

                if(Array.isArray(index)){
                    //Check to make sure the accessing array has same number of dimensions as the matrix
                    if (index.length !== target.length.length)throw new Error("Accessing array doesn't match Matrix dimensions: expected " 
                        + target.length.length.toString() + ", recieved" + index.length.toString());

                    //Check to make sure none of the accessing array is out of bounds
                    for (let i = 0; i < index.length; i += 1) {
                        if (index[0] <=  target.length[0]){
                            throw new Error("Dimension " + i + " out of Matrix bounds");
                        };
                    };
                    //dot product of index and dimensionOffset yields the index for the 1D array
                    const arrayIndex = target.dimensionOffset.reduce((acc,cur, i) => {return acc + index[i] * cur}, 0)
                    target.values[arrayIndex] as R;
                    return true
                };
                throw new Error('Key error: ' + prop);
            },

        };

        let proxy = new Proxy(this, handler);

        return proxy;

    };

};

//recursively constructs a arg[1]xarg[2]x...xarg[n] matrix implemented as nested arrays.
/* Deprecated
function ConstuctMultiArray<R>(axisLengths : Array<number>): Array<R> | null {
    
    if (axisLengths.length === 0) return null;
    
    const currentAxisLength = axisLengths[0];
    const currentAxisElement = ConstuctMultiArray(axisLengths.slice(1));
    let currentAxis = [];
    for (let i = 0; i < currentAxisLength; i++) {
        currentAxis.push((Array.isArray(currentAxisElement)) ? currentAxisElement.slice() : currentAxisElement);
    };
    return currentAxis as R[];
};
*/