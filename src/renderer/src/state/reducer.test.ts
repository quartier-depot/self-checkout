import { describe, expect, test } from 'vitest';
import { initialState, reducer, State } from './reducer';
import { Product } from '../api/products/Product';
import { changeCartQuantity } from './cart/changeCartQuantity';
import { setCartQuantity } from './cart/setCartQuantity';
import { emptyCart } from './cart/emptyCart';

describe('reducer', () => {
  describe('cart', () => {
    describe('when cart is empty', () => {
      const state: State = initialState;
      test('on change cart quantity by 1 updates price, quantity and items', () => {
        const actual = reducer(
          state,
          changeCartQuantity(1, product)
        ).cart;

        expect(actual.items.length).toBe(1);
        expect(actual.items[0].product).toBe(product);
        expect(actual.items[0].quantity).toBe(1);
        expect(actual.price).toBe(product.price);
        expect(actual.quantity).toBe(1);
      });

      // noinspection DuplicatedCode
      test('on set cart quantity to 2 updates price, quantity and items', () => {
        const actual = reducer(
          state,
          setCartQuantity(2, product)
        ).cart;

        expect(actual.items.length).toBe(1);
        expect(actual.items[0].product).toBe(product);
        expect(actual.items[0].quantity).toBe(2);
        expect(actual.price).toBe(product.price * 2);
        expect(actual.quantity).toBe(2);
      });

      test('on empty cart resets price, quantity and items', () => {
        const actual = reducer(
          state,
          emptyCart()
        ).cart;

        expect(actual.items.length).toBe(0);
        expect(actual.price).toBe(0);
        expect(actual.quantity).toBe(0);
      });
    });

    describe('when cart contains 1 product', () => {
      const state: State = {
        ...initialState,
        cart: {
          price: product.price,
          quantity: 1,
          items: [{ product: product, quantity: 1 }]
        }
      };

      test('on change cart quantity by 1 doubles price, quantity and updates items', () => {
        const actual = reducer(
          state,
          changeCartQuantity(1, product)
        ).cart;

        expect(actual.items.length).toBe(1);
        expect(actual.items[0].product).toBe(product);
        expect(actual.items[0].quantity).toBe(2);
        expect(actual.price).toBe(product.price * 2);
        expect(actual.quantity).toBe(2);
      });

      test('on change cart quantity by -1 resets price and quantity and clears items', () => {
        const actual = reducer(
          state,
          changeCartQuantity(-1, product)
        ).cart;

        expect(actual.items.length).toBe(0);
        expect(actual.price).toBe(0);
        expect(actual.quantity).toBe(0);
      });

      test('on set cart quantity to 2 updates price, quantity and items', () => {
        const actual = reducer(
          state,
          setCartQuantity(2, product)
        ).cart;

        expect(actual.items.length).toBe(1);
        expect(actual.items[0].product).toBe(product);
        expect(actual.items[0].quantity).toBe(2);
        expect(actual.price).toBe(product.price * 2);
        expect(actual.quantity).toBe(2);
      });
    });
  });
});

const product: Product = {
  price: 42.24,
  id: 42,
  product_id: '42',
  artikel_id: 'product',
  name: 'name',
  permalink: 'permalink',
  barcode: 'barcode',
  external_url: 'external_url'
};