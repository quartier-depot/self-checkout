import { Product } from '../api/products/Product';
import { Customer } from '../api/customers/Customer';

export enum ActionTypes {
  SEARCH = 'SEARCH',
  CHANGE_CART_QUANTITY = 'CHANGE_CART_QUANTITY',
  SET_CART_QUANTITY = 'SET_CART_QUANTITY',
  EMPTY_CART = 'EMPTY_CART',
  SET_CUSTOMER = 'SET_CUSTOMER',
  START_NEW_ORDER = 'START_NEW_ORDER',
  SCANNER_INPUT = 'SCANNER_INPUT'
}

export type SearchAction = {
  type: ActionTypes.SEARCH;
  payload: {
    searchTerm: string;
    products: Product[] | undefined;
  };
};

export type ScannerInputAction = {
  type: ActionTypes.SCANNER_INPUT;
  payload: {
    scannerInput: string;
    products: Product[] | undefined;
    customers: Customer[] | undefined;
  };
};

export type ChangeCartQuantityAction = {
  type: ActionTypes.CHANGE_CART_QUANTITY;
  payload: {
    product: Product;
    quantity: number;
  };
};

export type SetCartQuantityAction = {
  type: ActionTypes.SET_CART_QUANTITY;
  payload: {
    product: Product;
    quantity: number;
  };
};

export type SetCustomerAction = {
  type: ActionTypes.SET_CUSTOMER;
  payload?: Customer;
};

export type EmptyCartAction = {
  type: ActionTypes.EMPTY_CART;
};

export type StartNewOrderAction = {
  type: ActionTypes.START_NEW_ORDER;
};

export type Actions =
  | SearchAction
  | ScannerInputAction
  | ChangeCartQuantityAction
  | SetCartQuantityAction
  | EmptyCartAction
  | SetCustomerAction
  | StartNewOrderAction;
