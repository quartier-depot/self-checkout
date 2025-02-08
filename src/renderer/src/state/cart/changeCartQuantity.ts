import { Action } from '../action';
import { Product } from '../../api/products/Product';
import { CartActionTypes } from './cartAction';

export function changeCartQuantity(delta: number, product: Product): Action {
  return {
    type: CartActionTypes.CHANGE_CART_QUANTITY,
    payload: {
      product: product,
      quantity: delta
    }
  };
}
