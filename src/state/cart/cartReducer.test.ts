import { describe, expect, test } from 'vitest';
import { initialState as withoutProducts, reducer, State } from '../reducer';
import { Product } from '../../api/products/Product';
import { changeCartQuantity } from './changeCartQuantity';
import { setCartQuantity } from './setCartQuantity';
import { emptyCart } from './emptyCart';


describe('cartReducer', () => {

  describe('when cart is empty', () => {

    test('on change cart quantity by +1 sets product once', () => {
      const actual = reducer(
        withoutProducts,
        changeCartQuantity(1, product),
      );

      expectProductOnce(actual);
    });

    test('on set cart quantity to 2 sets product twice', () => {
      const actual = reducer(
        withoutProducts,
        setCartQuantity(2, product),
      );

      expectProductTwice(actual);
    });

    test('on empty cart empties cart', () => {
      const actual = reducer(
        withoutProducts,
        emptyCart(),
      );

      expectEmptyCart(actual);
    });
  });

  describe('when cart contains product once', () => {

    test('on change cart quantity by +1 sets product twice', () => {
      const actual = reducer(
        withProductOnce,
        changeCartQuantity(1, product),
      );

      expectProductTwice(actual);
    });

    test('on change cart quantity by -1 empties cart', () => {
      const actual = reducer(
        withProductOnce,
        changeCartQuantity(-1, product),
      );

      expectEmptyCart(actual);
    });

    test('on set cart quantity to 2 sets product twice', () => {
      const actual = reducer(
        withProductOnce,
        setCartQuantity(2, product),
      );

      expectProductTwice(actual);
    });

    test('on set cart quantity to 0 empties cart', () => {
      const actual = reducer(
        withProductOnce,
        setCartQuantity(0, product),
      );

      expectEmptyCart(actual);
    });
  });

  describe('when cart contains product three times', () => {

    test('on change cart quantity by +1 sets product twice', () => {
      const actual = reducer(
        withProductThreeTimes,
        changeCartQuantity(-1, product),
      );

      expectProductTwice(actual);
    });
  });
});

function expectProductOnce(actual: State) {
  expect(actual.cart.items.length).toBe(1);
  expect(actual.cart.items[0].product).toBe(product);
  expect(actual.cart.items[0].quantity).toBe(1);
  expect(actual.cart.price).toBe(product.price);
  expect(actual.cart.quantity).toBe(1);
}

function expectProductTwice(actual: State) {
  expect(actual.cart.items.length).toBe(1);
  expect(actual.cart.items[0].product).toBe(product);
  expect(actual.cart.items[0].quantity).toBe(2);
  expect(actual.cart.price).toBe(product.price * 2);
  expect(actual.cart.quantity).toBe(2);
}

function expectEmptyCart(actual: State) {
  expect(actual.cart.items.length).toBe(0);
  expect(actual.cart.price).toBe(0);
  expect(actual.cart.quantity).toBe(0);
}

const product: Product = {
  price: 42.24,
  id: 42,
  product_id: '42',
  artikel_id: 'product',
  name: 'name',
  slug: 'slug',
  barcode: 'barcode',
  external_url: 'external_url',
};

const withProductOnce: State = {
  ...withoutProducts,
  cart: {
    price: product.price,
    quantity: 1,
    items: [{ product: product, quantity: 1 }],
  },
};

const withProductThreeTimes: State = {
  ...withoutProducts,
  cart: {
    price: product.price * 3,
    quantity: 3,
    items: [{ product: product, quantity: 3 }],
  },
};