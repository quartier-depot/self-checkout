import { Action, ActionTypes } from './action';
import { Product } from '../api/products/Product';
import { Cart } from '../api/orders/Cart';
import { Customer } from '../api/customers/Customer';
import { cartReducer } from './cart/cartReducer';
import { customerReducer } from './customer/customerReducer';
import { configurationReducer } from './configuration/configurationReducer';

export type State = {
  searchTerm: string;
  products: Product[] | undefined;
  cart: Cart;
  customer?: Customer;
  configuration: Configuration | undefined;
};

export type Configuration = {
  woocommerce: {
    url: string;
    consumerKey: string;
    consumerSecret: string;
  },
  applicationInsights: {
    connectionString: string
  }
  electron: boolean
};

export const initialState: State = {
  products: undefined,
  searchTerm: '',
  cart: { price: 0, quantity: 0, items: [] },
  customer: undefined,
  configuration: undefined,
};

export function reducer(state: State, action: Action) {
  state = cartReducer(state, action);
  state = customerReducer(state, action);
  state = configurationReducer(state, action);

  switch (action.type) {
    case ActionTypes.SEARCH:
      return {
        ...state,
        searchTerm: action.payload.searchTerm,
        products: search(action.payload.searchTerm, action.payload.products),
      };

    case ActionTypes.BROWSE:
      return {
        ...state,
        products: action.payload.products,
      };

    case ActionTypes.START_NEW_ORDER:
      return {
        ...initialState,
        initialized: true,
      };

    default:
      return state;
  }
}

function search(searchTerm: string, products: Product[] | undefined) {
  if (!searchTerm) {
    return undefined;
  }

  if (!products) {
    return [];
  }

  return products.filter(
    (product) => product.artikel_id && product.artikel_id.endsWith(searchTerm) && product.artikel_id.length === searchTerm.length + 1,
  );
}