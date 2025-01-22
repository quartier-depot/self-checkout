import {Actions, ActionTypes} from "../actions/actions";
import {Product} from "../api/products/Product.ts";

export type State = {
    initialized: boolean;
    searchTerm: string,
    products: Product[] | undefined;
};

export const initialState: State = {
    initialized: false,
    products: undefined,
    searchTerm: '',
};

export function reducer(state: State, action: Actions) {
    switch (action.type) {
        case ActionTypes.IS_INITIALIZED:
            return {
                ...state,
                initialized: true
            };

        case ActionTypes.SEARCH:
            return {
                ...state,
                searchTerm: action.payload.searchTerm,
                products: search(action.payload.searchTerm, action.payload.products),
            };


        default:
            return state;
    }
}

function search(searchTerm: string, products: Product[]|undefined) {
    if ((!searchTerm)) {
        return undefined;
    }

    if (!products) {
        return [];
    }

    return products.filter(product => product.name.includes(searchTerm) || product.artikel_id?.includes(searchTerm));
}