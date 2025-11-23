import { describe, expect, test } from 'vitest';
import paymentReducer, { PaymentState, PaymentStates, selectPaymentMethod, startPayment, topUpWallet, payWithWallet, payWithPayrexx, showSuccess, showFailure, cancel } from './paymentSlice';
import { Product } from '../api/products/Product.ts';
import { Barcode } from '../api/products/Barcode.ts';
import { WalletBalance } from '../api/api.ts';
import { Cart } from '../api/cart/Cart.ts';

describe('paymentSlice', () => {
  test('when in CreatingOrder, startPayment throws', () => {
    const initialState: PaymentState = {
      state: 'CreatingOrder',
    };
    const action = {
      cart: buildCart(),
      walletBalance: buildWalletBalance(),
    };
    expect(() => paymentReducer(initialState, startPayment(action))).toThrowError();
  });

  describe.each([['NoPayment'], ['SelectMember']])('when in %s', (currentState: string) => {
    test('and wallet balance is insufficient, startPayment moves to SelectMember state', () => {
      const initialState: PaymentState = {
        state: currentState as unknown as PaymentStates,
      };
      const action = {
        cart: buildCart(),
        walletBalance: buildWalletBalance(0),
      };
      expect(paymentReducer(initialState, startPayment(action))).toEqual({
        state: 'SelectMember',
      });
    });
    test('and wallet balance is sufficient, startPayment moves to CreatingOrder state', () => {
      const initialState: PaymentState = {
        state: currentState as unknown as PaymentStates,
      };
      const action = {
        cart: buildCart(),
        walletBalance: buildWalletBalance(),
      };
      expect(paymentReducer(initialState, startPayment(action))).toEqual({
        state: 'CreatingOrder',
      });
    });
  });

  test('when in CreatingOrder, selectPaymentMethod moves to SelectPaymentMethod', () => {
    const initialState: PaymentState = {
      state: 'CreatingOrder',
    };
    expect(paymentReducer(initialState, selectPaymentMethod())).toEqual({
      state: 'SelectPaymentMethod',
    });
  });

  test('when in SelectPaymentMethod, topUpWallet moves to TopUpWallet', () => {
    const initialState: PaymentState = {
      state: 'SelectPaymentMethod',
    };
    expect(paymentReducer(initialState, topUpWallet())).toEqual({
      state: 'TopUpWallet',
    });
  });

  test('when in SelectPaymentMethod, payWithWallet moves to ProcessingWalletPayment', () => {
    const initialState: PaymentState = {
      state: 'SelectPaymentMethod',
    };
    expect(paymentReducer(initialState, payWithWallet())).toEqual({
      state: 'ProcessingWalletPayment',
    });
  });

  test('when in SelectPaymentMethod, payWithPayrexx moves to ProcessingPayrexxPayment', () => {
    const initialState: PaymentState = {
      state: 'SelectPaymentMethod',
    };
    expect(paymentReducer(initialState, payWithPayrexx())).toEqual({
      state: 'ProcessingPayrexxPayment',
    });
  });

  describe.each([['ProcessingWalletPayment'], ['ProcessingPayrexxPayment']])('when in %s', (currentState: string) => {
    test('showSuccess moves to Success', () => {
      const initialState: PaymentState = {
        state: currentState as unknown as PaymentStates,
      };
      expect(paymentReducer(initialState, showSuccess())).toEqual({
        state: 'Success',
      });
    });

    test('showFailure moves to Failure', () => {
      const initialState: PaymentState = {
        state: currentState as unknown as PaymentStates,
      };
      expect(paymentReducer(initialState, showFailure())).toEqual({
        state: 'Failure',
      });
    });
  });

  test('when in CreatingOrder, showFailure moves to Failure', () => {
    const initialState: PaymentState = {
      state: 'CreatingOrder',
    };
    expect(paymentReducer(initialState, showFailure())).toEqual({
      state: 'Failure',
    });
  });

  test('when in TopUpWallet, showFailure moves to Failure', () => {
    const initialState: PaymentState = {
      state: 'TopUpWallet',
    };
    expect(paymentReducer(initialState, showFailure())).toEqual({
      state: 'Failure',
    });
  });

  describe.each([['SelectMember'], ['SelectPaymentMethod'], ['TopUpWallet']])('when in %s', (currentState: string) => {
    test('cancel moves to NoPayment', () => {
      const initialState: PaymentState = {
        state: currentState as unknown as PaymentStates,
      };
      expect(paymentReducer(initialState, cancel())).toEqual({
        state: 'NoPayment',
      });
    });
  });

});

function buildWalletBalance(balance: number = 100): WalletBalance {
  return {
    currency: 'CHF',
    balance: balance,
  };
}

function buildCart(): Cart {
  return {
    items: [{ product, quantity: 1 }],
    price: product.price,
    quantity: 1,
  };
}

const product: Product = new Product({
  price: 42.24,
  id: 42,
  articleId: 'product',
  name: 'name',
  slug: 'slug',
  barcodes: [new Barcode('barcode')],
  category: 'category',
});