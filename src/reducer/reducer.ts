import {Actions, ActionTypes} from "../actions/actions";
import {Product} from "../api/products/Product.ts";
import {Cart, Item} from "../api/orders/Cart.ts";
import {Customer} from "../api/customers/Customer.ts";


export type State = {
    initialized: boolean;
    searchTerm: string,
    products: Product[] | undefined;
    cart: Cart;
    customer?: Customer;
};

export const initialState: State = {
    initialized: false,
    products: undefined,
    searchTerm: '',
    cart: {price: 0, quantity: 0, items: []},
    customer: undefined,
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

        case ActionTypes.CHANGE_CART_QUANTITY:
            return {
                ...state,
                cart: changeCartQuantity(state.cart, action.payload),
            };

        case ActionTypes.SET_CART_QUANTITY:
            return {
                ...state,
                cart: setCartQuantity(state.cart, action.payload),
            };

        case ActionTypes.EMPTY_CART:
            return {
                ...state,
                cart: {...initialState.cart}
            };

        case ActionTypes.SET_CUSTOMER:
            return {
                ...state,
                customer: action.payload
            };

        case ActionTypes.START_NEW_ORDER:
            return {
                ...initialState,
                initialized: true
            }

        default:
            return state;
    }
}

function search(searchTerm: string, products: Product[] | undefined) {
    if ((!searchTerm)) {
        return undefined;
    }

    if (!products) {
        return [];
    }

    return products.filter(product => product.name.includes(searchTerm) || product.artikel_id?.includes(searchTerm));
}

function changeCartQuantity(cart: Cart, delta: Item) {
    const alreadyInCart = cart.items.find(item => item.product.id === delta.product.id);
    let items = [];
    if (Number.isNaN(delta.quantity)) {
        throw new Error("NaN");
    }

    if (alreadyInCart) {
        items = cart.items.map(item => {
            if (item.product.id === delta.product.id) {
                return {product: item.product, quantity: item.quantity + delta.quantity};
            } else {
                return item;
            }
        });
        if (delta.quantity != 0) {
            items = items.filter(item => item.quantity > 0);
        }
    } else {
        if (delta.quantity <= 0) {
            throw new Error(`quantity must be positive for a new item but is ${delta.quantity}`);
        }
        items = [...cart.items, delta];
    }

    const price = items.reduce((accumulator, item) => accumulator + item.product.price, 0);

    const quantity = items.reduce((accumulator, item) => accumulator + (item.quantity !== undefined ? item.quantity : 0), 0);
    return {price, quantity, items};
}

function setCartQuantity(cart: Cart, delta: Item) {
    const alreadyInCart = cart.items.find(item => item.product.id === delta.product.id);
    let items = [];
    if (alreadyInCart) {
        items = cart.items.map(item => {
            if (item.product.id === delta.product.id) {
                if (Number.isNaN(delta.quantity)) {
                    return {product: item.product, quantity: 0};
                } else {
                    return {product: item.product, quantity: delta.quantity};
                }
            } else {
                return item;
            }
        });
        if (!Number.isNaN(delta.quantity) && delta.quantity != 0) {
            items = items.filter(item => item.quantity > 0);
        }
    } else {
        if (delta.quantity <= 0) {
            throw new Error(`quantity must be positive for a new item but is ${delta.quantity}`);
        }
        items = [...cart.items, delta];
    }

    const price = items.reduce((accumulator, item) => accumulator + item.product.price, 0);

    const quantity = items.reduce((accumulator, item) => accumulator + (item.quantity !== undefined ? item.quantity : 0), 0);
    return {price, quantity, items};
}