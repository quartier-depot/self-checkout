import { initialState, State } from '../reducer';
import { Cart, Item } from '../../api/orders/Cart';
import { CartActionTypes } from './cartAction';
import { Action } from '../action';

export function cartReducer(state: State, action: Action) {
  switch (action.type) {
    case CartActionTypes.CHANGE_CART_QUANTITY:
      return {
        ...state,
        cart: changeCartQuantity(state.cart, action.payload),
      };

    case CartActionTypes.SET_CART_QUANTITY:
      return {
        ...state,
        cart: setCartQuantity(state.cart, action.payload),
      };

    case CartActionTypes.EMPTY_CART:
      return {
        ...state,
        cart: { ...initialState.cart },
      };

    default:
      return state;
  }
}


function changeCartQuantity(cart: Cart, delta: Item) {
  const alreadyInCart = cart.items.find((item) => item.product.id === delta.product.id);
  let items: Item[] = [];
  if (Number.isNaN(delta?.quantity)) {
    throw new Error('NaN');
  }

  if (alreadyInCart) {
    items = cart.items.map((item) => {
      if (item.product.id === delta.product.id) {
        return { product: item.product, quantity: item.quantity + delta.quantity };
      } else {
        return item;
      }
    });
    if (delta.quantity != 0) {
      items = items.filter((item) => item.quantity > 0);
    }
  } else {
    if (delta.quantity <= 0) {
      throw new Error(`quantity must be positive for a new item but is ${delta.quantity}`);
    }
    items = [...cart.items, delta];
  }

  const price = items.reduce((accumulator, item) => accumulator + item.product.price * item.quantity, 0);

  const quantity = items.reduce(
    (accumulator, item) => accumulator + (item.quantity !== undefined ? item.quantity : 0),
    0,
  );
  return { price, quantity, items };
}

function setCartQuantity(cart: Cart, delta: Item) {
  const alreadyInCart = cart.items.find((item) => item.product.id === delta.product.id);
  let items: Item[] = [];
  if (alreadyInCart) {
    items = cart.items.map((item) => {
      if (item.product.id === delta.product.id) {
        if (Number.isNaN(delta.quantity)) {
          return { product: item.product, quantity: 0 };
        } else {
          return { product: item.product, quantity: delta.quantity };
        }
      } else {
        return item;
      }
    });
    if (delta.quantity === 0 || Number.isNaN(delta.quantity)) {
      items = items.filter((item) => item.quantity > 0);
    }
  } else {
    if (delta.quantity <= 0) {
      throw new Error(`quantity must be positive for a new item but is ${delta.quantity}`);
    }
    items = [...cart.items, delta];
  }

  const price = items.reduce((accumulator, item) => accumulator + item.product.price * item.quantity, 0);

  const quantity = items.reduce(
    (accumulator, item) => accumulator + (item.quantity !== undefined ? item.quantity : 0),
    0,
  );
  return { price, quantity, items };
}
