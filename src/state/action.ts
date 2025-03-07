import { Product } from '../api/products/Product';
import { CartAction } from './cart/cartAction';
import { CustomerAction } from './customer/customerAction';
import { ConfigurationAction } from './configuration/configurationAction';

export enum ActionTypes {
  SEARCH = 'SEARCH',
  START_NEW_ORDER = 'START_NEW_ORDER',
}

export type SearchAction = {
  type: ActionTypes.SEARCH;
  payload: {
    searchTerm: string;
    products: Product[] | undefined;
  };
};

export type StartNewOrderAction = {
  type: ActionTypes.START_NEW_ORDER;
};

export type Action =
  | CartAction
  | ConfigurationAction
  | CustomerAction
  | SearchAction
  | StartNewOrderAction;