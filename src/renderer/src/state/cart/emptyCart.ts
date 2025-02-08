import { Action } from '../action';
import { CartActionTypes } from './cartAction';

export function emptyCart(): Action {
  return {
    type: CartActionTypes.EMPTY_CART
  };
}
