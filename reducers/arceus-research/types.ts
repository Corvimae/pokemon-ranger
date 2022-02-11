export const SET_SEARCH_TERM = 'SET_SEARCH_TERM';
export const SET_TASK_ACTIVE = 'SET_TASK_ACTIVE';
export const SET_TASK_INACTIVE = 'SET_TASK_INACTIVE';

export const IMPORT_SAVED_RESEARCH = 'IMPORT_SAVED_RESEARCH';

export const RESET_STATE = 'RESET_STATE';

export interface ArceusResearchReducerState {
  searchTerm: string;
  activeTasks: Record<number, Record<string, number>>;
}

type SetSearchTermAction = {
  type: typeof SET_SEARCH_TERM;
  payload: {
    searchTerm: string;
  };
};

type SetTaskActiveAction = {
  type: typeof SET_TASK_ACTIVE;
  payload: {
    speciesId: number;
    taskName: string;
    value: number;
  };
};

type SetTaskInactiveAction = {
  type: typeof SET_TASK_INACTIVE;
  payload: {
    speciesId: number;
    taskName: string;
    value: number;
  };
};

type ImportSavedResearchAction = {
  type: typeof IMPORT_SAVED_RESEARCH;
  payload: {
    data: Partial<ArceusResearchReducerState>;
  };
};

type ResetStateAction = {
  type: typeof RESET_STATE;
}

export type ArceusResearchReducerAction =
  SetSearchTermAction |
  SetTaskActiveAction |
  SetTaskInactiveAction |
  ImportSavedResearchAction |
  ResetStateAction;
