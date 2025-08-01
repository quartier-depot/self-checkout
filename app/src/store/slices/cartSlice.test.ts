import { describe, expect, test } from 'vitest';
import cartReducer, { changeCartQuantity, setCartQuantity } from './cartSlice';
import { Product } from '../../store/api/products/Product';

describe('cartSlice', () => {
  test('when cart is empty, on change cart quantity by +1 sets product once', () => {
    const initialState = {
      cart: {
        price: 0,
        quantity: 0,
        items: [],
      },
    };

    const actual = cartReducer(
      initialState,
      changeCartQuantity({ product, quantity: 1, source: '' }),
    );

    expectProductOnce(actual);
  });

  test('when cart is empty, on set cart quantity to 2 sets product twice', () => {
    const initialState = {
      cart: {
        price: 0,
        quantity: 0,
        items: [],
      },
    };

    const actual = cartReducer(
      initialState,
      setCartQuantity({ product, quantity: 2 }),
    );

    expectProductTwice(actual);
  });

  test('when cart contains product once, on change cart quantity by +1 sets product twice', () => {
    const initialState = {
      cart: {
        price: product.price,
        quantity: 1,
        items: [{ product, quantity: 1 }],
      },
    };

    const actual = cartReducer(
      initialState,
      changeCartQuantity({ product, quantity: 1, source: '' }),
    );

    expectProductTwice(actual);
  });

  test('when cart contains product once, on change cart quantity by -1 empties cart', () => {
    const initialState = {
      cart: {
        price: product.price,
        quantity: 1,
        items: [{ product, quantity: 1 }],
      },
    };

    const actual = cartReducer(
      initialState,
      changeCartQuantity({ product, quantity: -1, source: '' }),
    );

    expectEmptyCart(actual);
  });

  test('when cart contains product once, on set cart quantity to 2 sets product twice', () => {
    const initialState = {
      cart: {
        price: product.price,
        quantity: 1,
        items: [{ product, quantity: 1 }],
      },
    };

    const actual = cartReducer(
      initialState,
      setCartQuantity({ product, quantity: 2 }),
    );

    expectProductTwice(actual);
  });

  test('when cart contains product once, on set cart quantity to 0 empties cart', () => {
    const initialState = {
      cart: {
        price: product.price,
        quantity: 1,
        items: [{ product, quantity: 1 }],
      },
    };

    const actual = cartReducer(
      initialState,
      setCartQuantity({ product, quantity: 0 }),
    );

    expectEmptyCart(actual);
  });

  test('when cart contains product three times, on change cart quantity by -1 sets product twice', () => {
    const initialState = {
      cart: {
        price: product.price * 3,
        quantity: 3,
        items: [{ product, quantity: 3 }],
      },
    };

    const actual = cartReducer(
      initialState,
      changeCartQuantity({ product, quantity: -1, source: '' }),
    );

    expectProductTwice(actual);
  });
});

function expectProductOnce(actual: { cart: { items: { product: Product; quantity: number }[]; price: number; quantity: number } }) {
  expect(actual.cart.items.length).toBe(1);
  expect(actual.cart.items[0].product).toBe(product);
  expect(actual.cart.items[0].quantity).toBe(1);
  expect(actual.cart.price).toBe(product.price);
  expect(actual.cart.quantity).toBe(1);
}

function expectProductTwice(actual: { cart: { items: { product: Product; quantity: number }[]; price: number; quantity: number } }) {
  expect(actual.cart.items.length).toBe(1);
  expect(actual.cart.items[0].product).toBe(product);
  expect(actual.cart.items[0].quantity).toBe(2);
  expect(actual.cart.price).toBe(product.price * 2);
  expect(actual.cart.quantity).toBe(2);
}

function expectEmptyCart(actual: { cart: { items: { product: Product; quantity: number }[]; price: number; quantity: number } }) {
  expect(actual.cart.items.length).toBe(0);
  expect(actual.cart.price).toBe(0);
  expect(actual.cart.quantity).toBe(0);
}

const product: Product = {
  price: 42.24,
  id: 42,
  artikel_id: 'product',
  name: 'name',
  slug: 'slug',
  barcodes: ['barcode'],
  gestell: 'gestell',
  external_url: 'external_url',
  freitext: 'freitext',
  hasBarcodes: () => true,
  hasMatchingBarcode: (_: string) => true,
  isBulkItem: () => false,
}; 