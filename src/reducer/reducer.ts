import {Actions, ActionTypes} from "../actions/actions";

export type State = {
    initialized: boolean;
};

export const initialState: State = {
    initialized: false,
};

export function reducer(state: State, action: Actions) {
    switch (action.type) {
        case ActionTypes.IS_INITIALIZED:
            return {
                ...state,
                initialized: true};

        default:
            return state;
    }
}