import {Product} from "../api/products/Product.ts";

export enum ActionTypes {
    IS_INITIALIZED = "IS_INITIALIZED",
    SEARCH = "SEARCH"
}

export type IsInitializedAction = {
    type: ActionTypes.IS_INITIALIZED;
}

export type SearchAction = {
    type: ActionTypes.SEARCH,
    payload: {
        searchTerm: string,
        products: Product[] | undefined,
    }
}

export type Actions =
    | IsInitializedAction
    | SearchAction;