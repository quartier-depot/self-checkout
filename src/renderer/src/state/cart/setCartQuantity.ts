import { Action, ActionTypes } from '../action';
import { Product } from '../../api/products/Product';

export function setCartQuantity(delta: number, product: Product): Action {
  return {
    type: ActionTypes.SET_CART_QUANTITY,
    payload: {
      product: product,
      quantity: delta
    }
  };
}
