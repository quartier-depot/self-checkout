import { Action } from '../action';
import { State } from '../reducer';
import { ConfigurationActionTypes } from './configurationAction';

export function configurationReducer(state: State, action: Action): State {
  switch (action.type) {
    case ConfigurationActionTypes.SET_CONFIGURATION:
      console.log("setting config");
      return {
        ...state,
        configuration: action.payload,
      };
    default:
      return state;
  }
}