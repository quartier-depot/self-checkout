import { Action } from '../action';
import { Product } from '../../api/products/Product';
import { CartActionTypes } from './cartAction';

export function setCartQuantity(delta: number, product: Product): Action {
  return {
    type: CartActionTypes.SET_CART_QUANTITY,
    payload: {
      product: product,
      quantity: delta
    }
  };
}
