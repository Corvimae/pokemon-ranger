type TupleOfArrays<T> = {
    [P in Extract<keyof T, number>]: Array<T[P]> | T[P];
}

// Use of any in (A extends any[]) is intentional. Here, A represents an Arbitrary tuple.
// This tuple is mapped to the type of listOfValueSets. For element A[i],
// TupleOfArrays<A>[i] must be of the same type, or an Array of that type.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ResultsTensor<A extends any[], R>(
  axisLabels : Array<string>,
  listOfValueSets : TupleOfArrays<A>,
  mapFunc : (...args : A) => R,
) : [Record<string, unknown>,
    Record<string, Array<unknown>>,
    Record<string, number>,
    Matrix<R>] {
  const constantVals : Record<string, unknown> = {};
  const variableVals : Record<string, Array<unknown>> = {};
  const variableAxis : Record<string, number> = {};

  // More intentional use of any below.
  // This possibly could be a Arrary<Array<any>> or Arrary<Array<unknown>>,
  // but I'm ts'd out right now and the content types are very arbitrary.

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const variableValList : Array<any> = [];
  const numVariableVals : Array<number> = [];
  const variableElements : Array<number> = [];
  const initFuncArgs : A = [] as unknown as A;
    
  let axis = 0;
  for (let i = 0; i < axisLabels.length; i += 1) {
    const element = listOfValueSets[i];
    if (Array.isArray(element)) {
      if (element.length > 1) {
        variableVals[axisLabels[i]] = element;
        variableValList.push(element);
        variableAxis[axisLabels[i]] = axis;
        axis += 1;
        numVariableVals.push(element.length);
        variableElements.push(i);
        initFuncArgs.push(element[0]);
      } if (element.length === 1) {
        const [value] = element;
        constantVals[axisLabels[i]] = value;
        // variableFlag.push(0);
        initFuncArgs.push(element[0]);
      } if (element.length === 0) {
        throw new Error(`Empty Array in element ${i}`);
      }
    } else {
      constantVals[axisLabels[i]] = element;
      // variableFlag.push(0);
      initFuncArgs.push(element);
    }
  }

  if (variableValList.length === 0) throw new Error('Needs to have at least one value that varies');

  // let resultsTensor = ConstuctMultiArray(numVariableVals);

  const resultsTensor = new Matrix<R>(numVariableVals);

  const AsyncFunc = async (args: A, arrayLocation: Array<number>, writeArray : Matrix<R>) : Promise<void> => {
    const writeValue = mapFunc(...args);
    /* let writeLocation = writeArray;
        let i = 0;
        for (; i < arrayLocation.length-1; i += 1) {
            writeLocation = writeLocation[arrayLocation[i]];
        }; */
    // This write here is 100% intentional. Fills an element of ResultsTensor.
    // eslint-disable-next-line no-param-reassign
    writeArray[arrayLocation as unknown as keyof Matrix<R>] = writeValue;
  };
    // let mathPromises =
  let caughtError = null;
  Promise.allSettled(SpawnPromises(initFuncArgs,
    variableElements,
    variableValList,
    AsyncFunc,
    resultsTensor) as unknown as Array<unknown>).catch(error => { caughtError = error; });

  if (!caughtError === null) {
    console.error(caughtError);
    throw caughtError;
  }

  return [constantVals, variableVals, variableAxis, resultsTensor];
}

// More intentional use of any below.
// Same thing about A being an arbitrary tuple.
// variableVals is related to tuple A, but is consumed from left to right,
// so ts would recognize it as belonging to TupleOfArrays<A> (I think).
// We straight up don't care about the return type of the Promise
// beyond it being a Promise. The innermost Promises return void and write
// data. This function is called inside of a Promises.allSettled() call.

/* eslint-disable @typescript-eslint/no-explicit-any */
export type SpawnPromiseCallback<A extends any[], R> = (args : A, arrayLocation : Array<number>, writeLocation : Matrix<R>) => Promise<void>;

async function SpawnPromises<A extends any[], R>(initArgs : A,
  variableElements: Array<number>,
  variableVals : Array<any>,
  AsyncFunc : SpawnPromiseCallback<A, R>,
  writeArray : Matrix<R>,
  arrayLocation : Array<number> = []) : Promise<any> {
  /* eslint-enable @typescript-eslint/no-explicit-any */

  // initArgs Array with the size of the args of asyncFunc
  // variableElements Array of the elements of initArgs to be swept through
  // variableVals Array of values for each variable
  // asyncFunc async Function to sweep through problem space
  // writeArray reference of multiDimensional array to populate

  const promises = [];

  if (variableElements.length === 1) {
    // let arrayLocation = initArgs[variableElements[0]];
    arrayLocation.push(0);

    for (let i = 0; i < variableVals[variableVals.length - 1].length; i += 1) {
      // More intentional writing. This array is copied when passed through recursion.
      // I could copy them into a new variable, but I already need to copy them when passing
      // to avoid race conditions and copying again is more memory (The upper level of
      // recursion could edit it before this level copies).
      // eslint-disable-next-line no-param-reassign
      initArgs[variableElements[0]] = variableVals[variableVals.length - 1][i];
      // eslint-disable-next-line no-param-reassign
      arrayLocation[arrayLocation.length - 1] = i;
      promises.push(AsyncFunc(initArgs.slice() as A, arrayLocation.slice(), writeArray));
    }

    return Promise.allSettled(promises);
  }
        
  /* let arrayLocation;
        if (!Array.isArray(initArgs[variableElements[variableElements.length - 1]])) {
            initArgs[variableElements[variableElements.length - 1]] = [];

        };

        arrayLocation = initArgs[variableElements[variableElements.length - 1]]; */
  arrayLocation.push(0);
  for (let i = 0; i < variableVals[variableVals.length - variableElements.length].length; i += 1) {
    // More intentional writing. This array is copied when passed through recursion.
    // I could copy them into a new variable, but I already need to copy them when passing
    // to avoid race conditions and copying again is more memory (The upper level of
    // recursion could edit it before this level copies).
    // eslint-disable-next-line no-param-reassign
    initArgs[variableElements[0]] = variableVals[arrayLocation.length - 1][i];
    // eslint-disable-next-line no-param-reassign
    arrayLocation[arrayLocation.length - 1] = i;
    promises.push(SpawnPromises(initArgs.slice() as A,
      variableElements.slice(1),
      variableVals,
      AsyncFunc,
      writeArray,
      arrayLocation.slice()));
  }
  return Promise.allSettled(promises);
    
  // currentVariableElement = variableElements[0]
}

export class Matrix<R> {
    [index : string] : Array<number> | Array<R> | R

    length : Array<number>;

    values : Array<R>;
    
    private dimensionOffset : Array<number>;
    
    constructor(dimensionLengths: Array<number>, fillValue : R = null as unknown as R) {
      const arrayLength = dimensionLengths.reduce((acc, cur) => acc * cur, 1.0);
      this.dimensionOffset = dimensionLengths.map((curI, i, arr) => arr.slice(0, i).reduce((acc, curJ) => acc * curJ, 1.0));

      this.length = dimensionLengths;

      this.values = new Array(arrayLength).fill(fillValue);

      const handler = {
        // The reciever argument is needed for Proxy methods.
        // Also, we don't use nor care about it's type really
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/ban-types
        get(target : Matrix<R>, prop : string, reciever : object) {
          if (prop in target) return target[prop as keyof typeof target]; // as typeof target[prop as keyof typeof target];

          const index = prop.split(',').map(curString => Number.parseFloat(curString));

          if (Array.isArray(index)) {
            // Check to make sure the accessing array has same number of dimensions as the matrix
            if (index.length !== target.length.length) {
              throw new Error(`Accessing array doesn't match Matrix dimensions: expected ${
                target.length.length.toString()}, recieved${index.length.toString()}`);
            }

            // Check to make sure none of the accessing array is out of bounds
            for (let i = 0; i < index.length; i += 1) {
              if (typeof index[i] !== 'number') throw new Error(`Key error: ${index}contains values other than numbers`);
              if (index[i] <= target.length[i]) {
                throw new Error(`Dimension ${i} out of Matrix bounds`);
              }
            }
            // dot product of index and dimensionOffset yields the index for the 1D array
            return target.values[target.dimensionOffset.reduce((acc, cur, i) => acc + index[i] * cur, 0)] as R;
          }
          throw new Error(`Key error: ${prop}`);
        },

        // Same as .get() above.
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/ban-types
        set(target : Matrix<R>, prop : string, value : Matrix<R>[keyof Matrix<R>] | R, reciever : object) {
          if (prop in target) {
            const targetProp = prop;
            const targetRef = target;
            let currentValue = targetRef[targetProp as keyof Matrix<R>];
            const setValue = value;
            // type propType = typeof currentValue;
            if (Array.isArray(currentValue) && Array.isArray(setValue)) {
              const firstEleSet = setValue[0];
              // const firstEleCur = currentValue[0];
              if (typeof firstEleSet === typeof currentValue[0]) {
                // const valueToSet = value as typeof currentValue;
                            
                currentValue = setValue;
                // let test = setValue as Extract<typeof setValue, typeof currentValue>;
                // Reflect.set(target, prop, value as typeof currentValue) //as typeof target[prop as keyof typeof target];
                return true;
              }
            }
            if (!Array.isArray(currentValue) && !Array.isArray(setValue)) {
              if (typeof setValue === typeof currentValue) {
                const valueToSet = value as typeof currentValue;
                targetRef[targetProp as keyof Matrix<R>] = valueToSet;
                // Reflect.set(target, prop, value as typeof currentValue) //as typeof target[prop as keyof typeof target];
                return true;
              }
            }

            return false;
          }

          const index = prop.split(',').map(curString => Number.parseFloat(curString));

          if (Array.isArray(index)) {
            // Check to make sure the accessing array has same number of dimensions as the matrix
            if (index.length !== target.length.length) {
              throw new Error(`Accessing array doesn't match Matrix dimensions: expected ${
                target.length.length.toString()}, recieved${index.length.toString()}`);
            }

            // Check to make sure none of the accessing array is out of bounds
            for (let i = 0; i < index.length; i += 1) {
              if (index[i] >= target.length[i]) {
                throw new Error(`Dimension ${i} out of Matrix bounds`);
              }
            }
            // dot product of index and dimensionOffset yields the index for the 1D array
            const arrayIndex = target.dimensionOffset.reduce((acc, cur, i) => acc + index[i] * cur, 0);
            // This is just how setters work in Proxies
            // eslint-disable-next-line no-param-reassign
            target.values[arrayIndex] = value as R;
            return true;
          }
          throw new Error(`Key error: ${prop}`);
        },

      };

      const proxy = new Proxy(this, handler);

      return proxy;
    }
}

// recursively constructs a arg[1]xarg[2]x...xarg[n] matrix implemented as nested arrays.
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
