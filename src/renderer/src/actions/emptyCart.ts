import { Action, ActionTypes } from './action';

export function emptyCart(): Action {
  return {
    type: ActionTypes.EMPTY_CART
  };
}
