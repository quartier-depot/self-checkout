import { Product } from '../../api/products/Product';

export enum CartActionTypes {
  CHANGE_CART_QUANTITY = 'CHANGE_CART_QUANTITY',
  SET_CART_QUANTITY = 'SET_CART_QUANTITY',
  EMPTY_CART = 'EMPTY_CART',
}

export type ChangeCartQuantityAction = {
  type: CartActionTypes.CHANGE_CART_QUANTITY;
  payload: {
    product: Product;
    quantity: number;
  };
};

export type SetCartQuantityAction = {
  type: CartActionTypes.SET_CART_QUANTITY;
  payload: {
    product: Product;
    quantity: number;
  };
};


export type EmptyCartAction = {
  type: CartActionTypes.EMPTY_CART;
};


export type CartAction =
  | ChangeCartQuantityAction
  | SetCartQuantityAction
  | EmptyCartAction;
