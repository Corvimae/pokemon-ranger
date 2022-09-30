import { Dispatch } from 'react';

export const CENTRAL_ROUTE_REPO_PREFIX = 'ranger.';
export const CENTRAL_ROUTE_REPO_LOCATION = 'https://raw.githubusercontent.com/Corvimae/ranger-routes/main/';
export const CENTRAL_ROUTE_REPO_FILENAME = 'route.mdr';

export function normalizeRouteLocation(location: string): string {
  const decodedLocation = decodeURIComponent(location);

  if (decodedLocation.startsWith(CENTRAL_ROUTE_REPO_PREFIX)) {
    return `${decodedLocation.replace(CENTRAL_ROUTE_REPO_PREFIX, CENTRAL_ROUTE_REPO_LOCATION)}/${CENTRAL_ROUTE_REPO_FILENAME}`;
  }

  return decodedLocation;
}

export function hasParentElement(child: Element | null, parent: Element): boolean {
  if (child === parent) return true;
  if (!child) return false;

  return hasParentElement(child.parentElement, parent);
}

export function splitOnLastElement<T>(list: T[]): [T[], T | undefined] {
  return [list.slice(0, list.length - 1), list[list.length - 1]];
}

export function dispatchAndPersist<T, U>(key: string, value: T, action: (val: T) => U, dispatch: Dispatch<U>): void {
  window.localStorage.setItem(key, JSON.stringify(value));
  dispatch(action(value));
}

export type ErrorableResult<T> = { error: false, value: T } | { error: true, message: string };

export function evaluateAsThrowableOptional<T>(callback: () => T): ErrorableResult<T> {
  try {
    return {
      error: false,
      value: callback(),
    };
  } catch (e) {
    return {
      error: true,
      message: (e as any).message, // eslint-disable-line @typescript-eslint/no-explicit-any
    };
  }
}

export function isElectron(): boolean {
  // this is fine.
  return (window?.electronAPI as unknown) !== undefined ?? false;
}
