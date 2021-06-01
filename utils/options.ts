import { Dispatch } from "react";
import { loadOptions as loadOptionsAction } from "../reducers/route/reducer";
import { RouteAction, RouteOptionsState } from "../reducers/route/types";

const ROUTE_OPTIONS_COMPACT_IVS = 'ROUTE_OPTIONS_COMPACT_IVS';
const ROUTE_OPTIONS_IVS_BACKGROUND_COLOR = 'ROUTE_OPTIONS_IVS_BACKGROUND_COLOR';
const ROUTE_OPTIONS_IVS_FONT_FAMILY = 'ROUTE_OPTIONS_IVS_FONT_FAMILY';

export const OptionKeys = {
  ROUTE_OPTIONS_COMPACT_IVS,
  ROUTE_OPTIONS_IVS_BACKGROUND_COLOR,
  ROUTE_OPTIONS_IVS_FONT_FAMILY,
};

const ReducerKeys: Record<string, keyof RouteOptionsState> = {
  [ROUTE_OPTIONS_COMPACT_IVS]: 'compactIVs',
  [ROUTE_OPTIONS_IVS_BACKGROUND_COLOR]: 'ivBackgroundColor',
  [ROUTE_OPTIONS_IVS_FONT_FAMILY]: 'ivFontFamily',
}

export function loadOptions(dispatch: Dispatch<RouteAction>) {
  const values = Object.entries(ReducerKeys).reduce((acc, [storageKey, reducerKey]) => {
    const value = window.localStorage.getItem(storageKey);
    
    return value == null ? acc : { ...acc, [reducerKey]: JSON.parse(value) };
  }, {});

  dispatch(loadOptionsAction(values));
}