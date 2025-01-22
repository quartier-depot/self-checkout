export enum ActionTypes {
    IS_INITIALIZED = "IS_INITIALIZED",
}

export type IsInitializedAction = {
    type: ActionTypes.IS_INITIALIZED;
}

export type Actions =
    | IsInitializedAction;