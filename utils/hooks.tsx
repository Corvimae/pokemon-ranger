import React, { Reducer, Dispatch, useState, useCallback, useEffect, useRef, useReducer, createContext, useContext } from 'react';
import { useRouter } from 'next/router';
import { hasParentElement, splitOnLastElement } from './utils';

export function useParameterizedReducer<S, A>(
  reducer: Reducer<S, A>,
  defaultState: S,
  setInitialState: (state: S) => A,
): [S, Dispatch<A>] {
  const router = useRouter();
  const hasSetInitialState = useRef(false);
  const previousQueryState = useRef(defaultState);

  const [state, dispatch] = useReducer(reducer, defaultState);

  useEffect(() => {
    const hasNoQueryParameters = typeof window === 'undefined' || [...new URLSearchParams(window.location.search).keys()].length === 0;

    if (!hasSetInitialState.current && (Object.entries(router.query).length > 0 || hasNoQueryParameters)) {
      dispatch(setInitialState(
        Object.entries(router.query)
          .filter(([key]) => Object.keys(defaultState).indexOf(key) !== -1)
          .reduce((acc, [key, value]) => {
            try {
              return {
                ...acc,
                [key]: JSON.parse(decodeURIComponent(value as string)),
              };
            } catch {
              return acc;
            }
          }, defaultState),
      ));

      hasSetInitialState.current = true;
    }
  }, [router.query, defaultState, dispatch, setInitialState]);

  useEffect(() => {
    if (hasSetInitialState.current && previousQueryState.current !== state) {
      const updatedQueryParams = (Object.entries(state) as [keyof S, unknown][]).reduce((acc, [key, value]) => {
        const normalizedValue = key !== 'generation' && typeof defaultState[key] === 'number' ? Number(value) : value;

        if (JSON.stringify(normalizedValue) === JSON.stringify(defaultState[key])) {
          return acc;
        }

        return {
          ...acc,
          [key]: encodeURIComponent(JSON.stringify(normalizedValue)),
        };
      }, {});

      previousQueryState.current = state;

      router.push(
        {
          pathname: router.pathname,
          query: updatedQueryParams,
        },
        undefined,
        { shallow: true },
      );
    }
  }, [router, state, defaultState]);

  return [state, dispatch];
}

export function useParameterizedState<T>(paramName: string, defaultValue: T): [T, (value: T) => void, () => void] {
  const router = useRouter();
  const hasSetInitialState = useRef(false);

  const [state, setState] = useState(defaultValue);

  useEffect(() => {
    if (!hasSetInitialState.current && router.query[paramName] !== undefined) {
      hasSetInitialState.current = true;
      const paramValue = router.query[paramName];

      if (paramValue === null) {
        setState(defaultValue);
      } else {
        try {
          setState(JSON.parse(decodeURIComponent(paramValue as string)));
        } catch {
          setState(defaultValue);
        }
      }
    }
  }, [router.query, defaultValue, paramName]);

  const updateState = useCallback(value => {
    const normalizedValue = typeof defaultValue === 'number' ? Number(value) : value;
    setState(normalizedValue);

    hasSetInitialState.current = true;

    let updatedQueryParams = {
      ...router.query,
      [paramName]: encodeURIComponent(JSON.stringify(normalizedValue)),
    };

    if (JSON.stringify(normalizedValue) === JSON.stringify(defaultValue)) {
      updatedQueryParams = Object.entries(updatedQueryParams).filter(([key]) => key !== paramName).reduce((acc, [key, paramValue]) => ({
        ...acc,
        [key]: paramValue,
      }), {});
    }

    router.push(
      {
        pathname: router.pathname,
        query: updatedQueryParams,
      },
      undefined,
      { shallow: true },
    );
  }, [router, paramName, defaultValue]);

  const resetState = useCallback(() => {
    setState(defaultValue);
  }, [defaultValue]);

  return [state, updateState, resetState];
}

export function useGridCopy(): React.RefObject<HTMLDivElement> {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleCopy = (event: ClipboardEvent) => {
      event.stopPropagation();
      event.preventDefault();

      if (ref.current && event.target instanceof HTMLElement && hasParentElement(event.target, ref.current)) {
        const selection = window.getSelection();
        const range = selection?.getRangeAt(0);

        if (range?.commonAncestorContainer.nodeName === '#text') {
          try {
            navigator.clipboard.writeText(selection?.toString() ?? '');

            return;
          } catch (e) {
            console.error('Unable to copy to clipboard: ', e);
          }
        }
        
        const elementsFromAncestorSelections = (range?.commonAncestorContainer as Element).getElementsByTagName('*');

        const allSelectedElements = Array.from(elementsFromAncestorSelections).reduce<Element[]>((elements, element) => {
          const excluded = element.getAttribute('data-range-excluded');

          return selection?.containsNode(element, true) && !excluded ? [...elements, element] : elements;
        }, []);

        const [, groups] = allSelectedElements.reduce<[Element | null, Element[][]]>(([parent, groupSet], element) => {
          const [remainingGroups, lastGroup] = splitOnLastElement(groupSet);

          if (parent && hasParentElement(element, parent)) {
            return [parent, [...remainingGroups, [...(lastGroup || []), element]]];
          }

          return [element, [...groupSet, []]];
        }, [null, []]);

        const text = groups.map(row => {
          const mergedLineContents = row.reduce<string[]>((acc, element) => {
            const [remainingSegments, lastSegment] = splitOnLastElement(acc);
            const cellContents = element.textContent?.trim() ?? '';

            if (element.getAttribute('data-range-merge')) {
              return [...remainingSegments, `${(lastSegment ?? '')} ${cellContents}`];
            }

            return [...acc, cellContents];
          }, []);

          return mergedLineContents.join('\t\t\t');
        }).join('\n');

        try {
          navigator.clipboard.writeText(text);
        } catch (e) {
          console.error('Unable to copy to clipboard: ', e);
        }
      }
    };

    document.body.addEventListener('copy', handleCopy);

    return () => {
      document.body.removeEventListener('copy', handleCopy);
    };
  }, []);

  return ref;
}

interface Action {
  type: string;
  [extraProps: string]: unknown;
}

interface PreparedContextualReducerResource<S, A> {
  connect: <T>(component: React.FC<T>) => React.FC<T>;
  useState: () => S;
  useDispatch: () => React.Dispatch<A>;
}
export function prepareContextualReducer<S, A extends Action>(
  reducer: React.Reducer<S, A>,
  initialState: S,
): PreparedContextualReducerResource<S, A> {
  const StateContext = createContext<S | null>(null);
  const DispatchContext = createContext<React.Dispatch<A> | null>(null);

  const ReducerProvider: React.FC = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    return (
      <StateContext.Provider value={state}>
        <DispatchContext.Provider value={dispatch}>
          {children}
        </DispatchContext.Provider>
      </StateContext.Provider>
    );
  };

  return {
    connect<T>(Component: React.FC<T>): React.FC<T> {
      return (props: T): React.ReactElement => <ReducerProvider><Component {...props} /></ReducerProvider>;
    },
    useState: (): S => useContext(StateContext) as S,
    useDispatch: (): React.Dispatch<A> => useContext(DispatchContext) as React.Dispatch<A>,
  };
}

export function useLocalStorage<T>(key: string, defaultValue: T | null = null): [T | null, (value: T) => void] {
  var storedValue = window.localStorage.getItem(key);
  const [value, setValue] = useState<T | null>(storedValue === null ? defaultValue : (JSON.parse(storedValue) as T));
  const updateValue = useCallback((value: T) => {
    window.localStorage.setItem(key, JSON.stringify(value));

    setValue(value);
  }, []);


  return [value, updateValue];
}

export function useOnMount(callback: React.EffectCallback): void {
  const savedCallback = useRef<React.EffectCallback>();

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    const onDismount = savedCallback.current?.();

    return (): void => {
      if (onDismount) onDismount();
    };
  }, []);
}