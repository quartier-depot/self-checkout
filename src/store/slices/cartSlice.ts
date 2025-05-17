import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Cart, Item } from '../../api/orders/Cart';
import { Product } from '../../api/products/Product';
import { startNewOrder } from './appSlice';

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

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    changeCartQuantity: (state, action: PayloadAction<{ product: Product; quantity: number }>) => {
      const { product, quantity: delta } = action.payload;
      const cart = state.cart;
      const alreadyInCart = cart.items.find((item) => item.product.id === product.id);
      let items: Item[] = [];

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
    setCartQuantity: (state, action: PayloadAction<{ product: Product; quantity: number }>) => {
      const { product, quantity: delta } = action.payload;
      const cart = state.cart;
      const alreadyInCart = cart.items.find((item) => item.product.id === product.id);
      let items: Item[] = [];

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
    emptyCart: (state) => {
      state.cart = initialState.cart;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(startNewOrder, (state) => {
      console.log('startNewOrder.cart');
      state.cart = initialState.cart;
    });
  },
});

export const { changeCartQuantity, setCartQuantity, emptyCart } = cartSlice.actions;
export default cartSlice.reducer; 