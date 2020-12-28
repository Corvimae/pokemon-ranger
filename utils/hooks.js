import { useState, useCallback, useEffect, useRef, useReducer } from 'react';
import { useRouter } from 'next/router';

export function useParameterizedReducer(reducer, defaultState, setInitialState) {
  const router = useRouter();
  const hasSetInitialState = useRef(false);
  const previousQueryState = useRef(defaultState);

  const [state, dispatch] = useReducer(reducer, defaultState);

  useEffect(() => {
    const hasNoQueryParameters = typeof window === 'undefined' || [...new URLSearchParams(window.location.search).keys()].length == 0;

    if (!hasSetInitialState.current && (Object.entries(router.query).length > 0 || hasNoQueryParameters)) {
      dispatch(setInitialState(
        Object.entries(router.query)
          .filter(([key]) => Object.keys(defaultState).indexOf(key) !== -1)
          .reduce((acc, [key, value]) => {
            try {
              return {
                ...acc,
                [key]: JSON.parse(decodeURIComponent(value)),
              }
            } catch {
              return acc;
            }
          }, defaultState)
      ));

      hasSetInitialState.current = true;
    }
  }, [router.query, defaultState, dispatch]);

  useEffect(() => {
    if (hasSetInitialState.current && previousQueryState.current !== state)  {
      const updatedQueryParams = Object.entries(state).reduce((acc, [key, value]) => {
        const normalizedValue = typeof defaultState[key] === 'number' ? Number(value) : value;

        if (JSON.stringify(normalizedValue) === JSON.stringify(defaultState[key])) {
          return acc;
        } else {
          return { ...acc, [key]: encodeURIComponent(JSON.stringify(normalizedValue)) };
        }
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
  }, [router.pathname, router.query, state, defaultState]);

  return [state, dispatch];
}

export function useParameterizedState(paramName, defaultValue) {
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
          setState(JSON.parse(decodeURIComponent(paramValue)));
        } catch {
          setState(defaultValue);
        }
      }
    }
  }, [router.query])
  
  const updateState = useCallback(value => {
    const normalizedValue = typeof defaultValue === 'number' ? Number(value) : value;
    setState(normalizedValue);

    hasSetInitialState.current = true;

    let updatedQueryParams = {
      ...router.query,
      [paramName]: encodeURIComponent(JSON.stringify(normalizedValue)),
    };

    if (JSON.stringify(normalizedValue) === JSON.stringify(defaultValue)) {
      updatedQueryParams = Object.entries(updatedQueryParams).filter(([key]) => key !== paramName).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: value,
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
  }, [router.pathname, router.query, paramName, defaultValue]);

  const resetState = useCallback(() => {
    setState(defaultValue);
  }, [defaultValue]);

  return [state, updateState, resetState];
}