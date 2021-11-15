import { Dispatch } from 'react';
import { loadOptions as loadOptionsAction } from '../reducers/route/reducer';
import { RouteAction, RouteOptionsState } from '../reducers/route/types';

const ROUTE_OPTIONS_COMPACT_IVS = 'ROUTE_OPTIONS_COMPACT_IVS';
const ROUTE_OPTIONS_HIDE_MEDIA = 'ROUTE_OPTIONS_HIDE_MEDIA';
const ROUTE_OPTIONS_IVS_BACKGROUND_COLOR = 'ROUTE_OPTIONS_IVS_BACKGROUND_COLOR';
const ROUTE_OPTIONS_IVS_FONT_FAMILY = 'ROUTE_OPTIONS_IVS_FONT_FAMILY';
const ROUTE_OPTIONS_IVS_HORIZONTAL_LAYOUT = 'ROUTE_OPTIONS_VERTICAL_LAYOUT';
const ROUTE_OPTIONS_EXPAND_CONDITIONS = 'ROUTE_OPTIONS_EXPAND_CONDITIONS';
const ROUTE_OPTIONS_RENDER_ONLY_TRACKERS = 'ROUTE_OPTIONS_RENDER_ONLY_TRACKERS';
const ROUTE_OPTIONS_HIDE_IV_RESULTS = 'ROUTE_OPTIONS_HIDE_IV_RESULTS';
const ROUTE_OPTIONS_MANUAL_EV_INPUT = 'ROUTE_OPTIONS_MANUAL_EV_INPUT';
const ROUTE_OPTIONS_CUSTOM_CSS = 'ROUTE_OPTIONS_CUSTOM_CSS';
const ROUTE_OPTIONS_DEBUG_MODE = 'ROUTE_OPTIONS_DEBUG_MODE';

export const OptionKeys = {
  ROUTE_OPTIONS_COMPACT_IVS,
  ROUTE_OPTIONS_HIDE_MEDIA,
  ROUTE_OPTIONS_IVS_BACKGROUND_COLOR,
  ROUTE_OPTIONS_IVS_FONT_FAMILY,
  ROUTE_OPTIONS_IVS_HORIZONTAL_LAYOUT,
  ROUTE_OPTIONS_EXPAND_CONDITIONS,
  ROUTE_OPTIONS_RENDER_ONLY_TRACKERS,
  ROUTE_OPTIONS_HIDE_IV_RESULTS,
  ROUTE_OPTIONS_MANUAL_EV_INPUT,
  ROUTE_OPTIONS_CUSTOM_CSS,
  ROUTE_OPTIONS_DEBUG_MODE,
};

const ReducerKeys: Record<string, keyof RouteOptionsState> = {
  [ROUTE_OPTIONS_COMPACT_IVS]: 'compactIVs',
  [ROUTE_OPTIONS_HIDE_MEDIA]: 'hideMedia',
  [ROUTE_OPTIONS_IVS_BACKGROUND_COLOR]: 'ivBackgroundColor',
  [ROUTE_OPTIONS_IVS_FONT_FAMILY]: 'ivFontFamily',
  [ROUTE_OPTIONS_IVS_HORIZONTAL_LAYOUT]: 'ivHorizontalLayout',
  [ROUTE_OPTIONS_EXPAND_CONDITIONS]: 'expandConditions',
  [ROUTE_OPTIONS_RENDER_ONLY_TRACKERS]: 'renderOnlyTrackers',
  [ROUTE_OPTIONS_HIDE_IV_RESULTS]: 'hideIVResults',
  [ROUTE_OPTIONS_MANUAL_EV_INPUT]: 'manualEVInput',
  [ROUTE_OPTIONS_CUSTOM_CSS]: 'customCSS',
  [ROUTE_OPTIONS_DEBUG_MODE]: 'debugMode',
};

export function loadOptions(dispatch: Dispatch<RouteAction>): void {
  const values = Object.entries(ReducerKeys).reduce((acc, [storageKey, reducerKey]) => {
    const value = window.localStorage.getItem(storageKey);
    
    return value == null ? acc : { ...acc, [reducerKey]: JSON.parse(value) };
  }, {});

  dispatch(loadOptionsAction(values));
}
