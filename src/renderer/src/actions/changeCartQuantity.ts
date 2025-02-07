import { Action, ActionTypes } from './action';
import { Product } from '../api/products/Product';

export function changeCartQuantity(delta: number, product: Product): Action {
  return {
    type: ActionTypes.CHANGE_CART_QUANTITY,
    payload: {
      product: product,
      quantity: delta
    }
  };
}
