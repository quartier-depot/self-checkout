import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Cart, CartItem } from '../api/Cart';
import { Product } from '../api/Product';
import { startNewSession } from './sessionSlice';

interface CartState {
  cart: Cart;
}

const initialState: CartState = {
  cart: {
    price: 0,
    quantity: 0,
    items: [],
  },
};

export type CartActionSource = 'scan' | 'favourites' | 'search' | 'browse' | 'abo' | 'cart' | '';

interface ChangeCartQuantityPayload {
  product: Product;
  quantity: number;
  source: CartActionSource;
}

interface SetCartQuantityPayload {
  product: Product;
  quantity: number;
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    changeCartQuantity: (state, action: PayloadAction<ChangeCartQuantityPayload>) => {
      const product = action.payload.product;
      const delta = ensureNumber(action.payload.quantity);
      
      const cart = state.cart;
      const alreadyInCart = cart.items.find((item) => item.product.id === product.id);
      let items: CartItem[] = [];

      if (Number.isNaN(delta)) {
        throw new Error('NaN');
      }

      if (alreadyInCart) {
        items = cart.items.map((item) => {
          if (item.product.id === product.id) {
            return { product: item.product, quantity: item.quantity + delta };
          } else {
            return item;
          }
        });
        if (delta !== 0) {
          items = items.filter((item) => item.quantity > 0);
        }
      } else {
        if (delta <= 0) {
          throw new Error(`quantity must be positive for a new item but is ${delta}`);
        }
        items = [...cart.items, { product, quantity: delta }];
      }

      const price = items.reduce((accumulator, item) => accumulator + item.product.price * item.quantity, 0);
      const quantity = items.reduce(
        (accumulator, item) => accumulator + (item.quantity !== undefined ? item.quantity : 0),
        0,
      );

      state.cart = { price, quantity, items };
    },
    setCartQuantity: (state, action: PayloadAction<SetCartQuantityPayload>) => {
      const product = action.payload.product;
      const delta = ensureNumber(action.payload.quantity);
      const cart = state.cart;
      const alreadyInCart = cart.items.find((item) => item.product.id === product.id);
      let items: CartItem[] = [];

      if (alreadyInCart) {
        items = cart.items.map((item) => {
          if (item.product.id === product.id) {
            if (Number.isNaN(delta)) {
              return { product: item.product, quantity: 0 };
            } else {
              return { product: item.product, quantity: delta };
            }
          } else {
            return item;
          }
        });
        if (delta === 0 || Number.isNaN(delta)) {
          items = items.filter((item) => item.quantity > 0);
        }
      } else {
        if (delta <= 0) {
          throw new Error(`quantity must be positive for a new item but is ${delta}`);
        }
        items = [...cart.items, { product, quantity: delta }];
      }

      const price = items.reduce((accumulator, item) => accumulator + item.product.price * item.quantity, 0);
      const quantity = items.reduce(
        (accumulator, item) => accumulator + (item.quantity !== undefined ? item.quantity : 0),
        0,
      );

      state.cart = { price, quantity, items };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(startNewSession, (state) => {
      state.cart = initialState.cart;
    });
  },
});

function ensureNumber(value: number | string): number {
  if (typeof value === 'string') {
    return Number.parseInt(value);
  } else {
    return value;
  }
}

export const { changeCartQuantity, setCartQuantity } = cartSlice.actions;
export default cartSlice.reducer; 