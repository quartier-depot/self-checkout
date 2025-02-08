import { Product } from '../api/products/Product';
import { Customer } from '../api/customers/Customer';
import { CartAction } from './cart/cartAction';

export enum ActionTypes {
  SEARCH = 'SEARCH',
  SET_CUSTOMER = 'SET_CUSTOMER',
  START_NEW_ORDER = 'START_NEW_ORDER',
}

export type SearchAction = {
  type: ActionTypes.SEARCH;
  payload: {
    searchTerm: string;
    products: Product[] | undefined;
  };
};

export type SetCustomerAction = {
  type: ActionTypes.SET_CUSTOMER;
  payload?: Customer;
};

export type StartNewOrderAction = {
  type: ActionTypes.START_NEW_ORDER;
};

export type Action =
  | CartAction
  | SearchAction
  | SetCustomerAction
  | StartNewOrderAction;
