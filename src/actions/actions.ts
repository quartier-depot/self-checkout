import {Product} from "../api/products/Product.ts";
import {Customer} from "../api/customers/Customer.ts";

export enum ActionTypes {
    IS_INITIALIZED = "IS_INITIALIZED",
    SEARCH = "SEARCH",
    CHANGE_CART_QUANTITY = "CHANGE_CART_QUANTITY",
    SET_CART_QUANTITY = "SET_CART_QUANTITY",
    EMPTY_CART = "EMPTY_CART",
    SET_CUSTOMER = "SET_CUSTOMER",
    START_NEW_ORDER = "START_NEW_ORDER",
    BARCODE_SEARCH = 'BARCODE_SEARCH'
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

export type BarcodeSearchAction = {
    type: ActionTypes.BARCODE_SEARCH,
    payload: {
        barcode: string,
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

export type SetCustomerAction = {
    type: ActionTypes.SET_CUSTOMER,
    payload?: Customer;
}

export type EmptyCartAction = {
    type: ActionTypes.EMPTY_CART
}

export type StartNewOrderAction = {
    type: ActionTypes.START_NEW_ORDER
}

export type Actions =
    | IsInitializedAction
    | SearchAction
    | BarcodeSearchAction
    | ChangeCartQuantityAction
    | SetCartQuantityAction
    | EmptyCartAction
    | SetCustomerAction
    | StartNewOrderAction;