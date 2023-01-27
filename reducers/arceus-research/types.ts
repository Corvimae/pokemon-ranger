export const SET_SEARCH_TERM = 'SET_SEARCH_TERM';
export const SET_SHOW_COMPLETED_ENTRIES = 'SET_SHOW_COMPLETED_ENTRIES';
export const SET_TASK_ACTIVE = 'SET_TASK_ACTIVE';
export const SET_TASK_INACTIVE = 'SET_TASK_INACTIVE';

export const IMPORT_SAVED_RESEARCH = 'IMPORT_SAVED_RESEARCH';

export const RESET_STATE = 'RESET_STATE';

export interface ArceusResearchReducerState {
  searchTerm: string;
  showCompletedEntries: boolean;
  activeTasks: Record<number, Record<string, number>>;
}

type SetSearchTermAction = {
  type: typeof SET_SEARCH_TERM;
  payload: {
    searchTerm: string;
  };
};

type SetShowCompletedEntries = {
  type: typeof SET_SHOW_COMPLETED_ENTRIES;
  payload: {
    value: boolean;
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
  SetShowCompletedEntries |
  SetTaskActiveAction |
  SetTaskInactiveAction |
  ImportSavedResearchAction |
  ResetStateAction;
