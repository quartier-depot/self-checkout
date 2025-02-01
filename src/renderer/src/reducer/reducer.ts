import {Actions, ActionTypes} from "../actions/actions";
import {Product} from "../api/products/Product";
import {Cart, Item} from "../api/orders/Cart";
import {Customer} from "../api/customers/Customer";


export type State = {
    searchTerm: string,
    products: Product[] | undefined;
    cart: Cart;
    customer?: Customer;
};

export const initialState: State = {
    products: undefined,
    searchTerm: '',
    cart: {price: 0, quantity: 0, items: []},
    customer: undefined,
};

export function reducer(state: State, action: Actions) {
    switch (action.type) {
        case ActionTypes.SEARCH:
            return {
                ...state,
                searchTerm: action.payload.searchTerm,
                products: search(action.payload.searchTerm, action.payload.products),
            };

            case ActionTypes.SCANNER_INPUT:
            return scannerInput(state, action.payload.scannerInput, action.payload.products, action.payload.customers);

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
    let items:Item[] = [];
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

function scannerInput(state: State, scannerInput: string, products: Product[] | undefined, customers: Customer[] | undefined): State {
    if (scannerInput.startsWith("qdm")) {
        return memberInput(state, scannerInput, customers);
    } else {
        return barcodeInput(state, scannerInput, products);
    }
}

function memberInput(state: State, member: string, customers: Customer[] | undefined) {
    const memberId = member.substring("qdm".length).replaceAll("'", "-");
    if (customers) {
        const customer = customers.find(customer => customer.member_id === memberId);
        if (customer) {
            return {
                ...state,
                customer: customer
            }
        } else {
            console.log("No customer found with memberId "+memberId);
            return state;
        }

    }
    return state;
}

function barcodeInput(state: State, barcode: string, products: Product[] | undefined): State {
    if (products) {
        const filteredProducts = products.filter((product: Product) => {
            return product.barcode === barcode;
        });
        switch (filteredProducts.length) {
            case 0:
                console.log('Nothing found for '+barcode);
                break;
            case 1:
                return {
                    ...state,
                    cart: changeCartQuantity(state.cart, {product: filteredProducts[0], quantity: 1})
                }
            case 2:
            return {
                ...state,
                searchTerm: barcode,
                products: filteredProducts,
            }
        }
    }
    return state;
}

function setCartQuantity(cart: Cart, delta: Item) {
    const alreadyInCart = cart.items.find(item => item.product.id === delta.product.id);
    let items: Item[] = [];
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
