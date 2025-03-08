import { Action } from '../action';
import { State } from '../reducer';
import { CustomerActionTypes } from './customerAction';


export function customerReducer(state: State, action: Action) {
  switch (action.type) {
    case CustomerActionTypes.SET_CUSTOMER:
      return {
        ...state,
        customer: action.payload,
      };

    default:
      return state;
  }
}

