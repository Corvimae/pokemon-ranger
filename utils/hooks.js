import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

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