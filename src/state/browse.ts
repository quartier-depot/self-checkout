import { ActionTypes } from './action';
import { Product } from '../api/products/Product';
import { Action } from './action';

export function browse(products: Product[]): Action {
    return {
        type: ActionTypes.BROWSE,
        payload: {
          products: products,
        },
      };
    }