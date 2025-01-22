import {Product} from "../api/products/Product.ts";

export enum ActionTypes {
    IS_INITIALIZED = "IS_INITIALIZED",
    SEARCH = "SEARCH",
    CHANGE_CART_QUANTITY = "CHANGE_CART_QUANTITY",
    SET_CART_QUANTITY = "SET_CART_QUANTITY",
    EMPTY_CART = "EMPTY_CART",
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

export type ChangeCartQuantityAction = {
    type: ActionTypes.CHANGE_CART_QUANTITY,
    payload: {
        product: Product,
        quantity: number,
    }
}

export type SetCartQuantityAction = {
    type: ActionTypes.SET_CART_QUANTITY,
    payload: {
        product: Product,
        quantity: number,
    }
}

export type EmptyCartAction = {
    type: ActionTypes.EMPTY_CART
}

export type Actions =
    | IsInitializedAction
    | SearchAction
    | ChangeCartQuantityAction
    | SetCartQuantityAction
    | EmptyCartAction;