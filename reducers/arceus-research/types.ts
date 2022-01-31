export const SET_TASK_ACTIVE = 'SET_TASK_ACTIVE';
export const SET_TASK_INACTIVE = 'SET_TASK_INACTIVE';

export const RESET_STATE = 'RESET_STATE';

export interface ArceusResearchReducerState {
  activeTasks: Record<number, Record<string, number>>;
}

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

type ResetStateAction = {
  type: typeof RESET_STATE;
}

export type ArceusResearchReducerAction =
  SetTaskActiveAction |
  SetTaskInactiveAction |
  ResetStateAction;
