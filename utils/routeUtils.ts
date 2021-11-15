import { RouteContext } from '../reducers/route/reducer';

export function useCurrentRouteLevel(source: string | undefined, line: number, manualValue: string | undefined | null): number {
  const state = RouteContext.useState();

  if (!source) return -1;
  if (manualValue !== undefined && manualValue !== null) return Number(manualValue);

  const tracker = state.trackers[source];
  const trackerLevels = tracker?.levelIncrementLines ?? {};

  const [level] = Object.entries(trackerLevels).reduce(([accLevel, accLine], [registeredLevel, registeredLine]) => {
    if (registeredLine > accLine && registeredLine <= line) {
      return [Number(registeredLevel), registeredLine];
    }

    return [accLevel, accLine];
  }, [tracker?.startingLevel ?? -1, -1]);

  return level;
}
