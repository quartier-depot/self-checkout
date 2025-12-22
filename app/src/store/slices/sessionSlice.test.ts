import { describe, expect, test } from 'vitest';
import sessionReducer, {
  PaymentState,
  PaymentStates,
  selectPaymentMethod,
  topUpWallet,
  payWithWallet,
  payWithPayrexx,
  showSuccess,
  showFailure,
  cancel,
  createOrder, setOrder, setTransactionId,
} from './sessionSlice';
import { createProduct, Product } from '../api/Product.ts';
import { WalletBalance } from '../api/woocommerceApi/woocommerceApi';
import { Cart } from '../api/Cart.ts';
import { Customer } from '../api/Customer.ts';

describe('sessionSlice', () => {
  describe('payment', () => {
    describe('when in NoPayment', () => {
      test('createOrder moves to CreatingOrder', () => {
        const initialState = buildAppState({
          state: 'NoPayment',
        });
        expect(sessionReducer(initialState, createOrder()).session.payment).toEqual({
          state: 'CreatingOrder',
        });
      });
      test('setOrderId sets the orderId and orderTotal', () => {
        const initialState = buildAppState({
          state: 'NoPayment',
        });
        const action = {
          orderId: 'orderId',
          orderTotal: 42,
        };
        expect(sessionReducer(initialState, setOrder(action)).session.payment).toEqual({
          orderId: 'orderId',
          orderTotal: 42,
          state: 'NoPayment',
        });
      });
    });

    test('when in CreatingOrder, selectPaymentMethod moves to SelectPaymentMethod', () => {
      const initialState = buildAppState({
        state: 'CreatingOrder',
      });
      expect(sessionReducer(initialState, selectPaymentMethod()).session.payment).toEqual({
        state: 'SelectPaymentMethod',
      });
    });

    test('when in SelectPaymentMethod, topUpWallet moves to TopUpWallet', () => {
      const initialState = buildAppState({
        state: 'SelectPaymentMethod',
      });
      expect(sessionReducer(initialState, topUpWallet()).session.payment).toEqual({
        state: 'TopUpWallet',
      });
    });

    test('when in SelectPaymentMethod, payWithWallet moves to ProcessingWalletPayment', () => {
      const initialState = buildAppState({
        state: 'SelectPaymentMethod',
      });
      expect(sessionReducer(initialState, payWithWallet()).session.payment).toEqual({
        state: 'ProcessingWalletPayment',
      });
    });

    test('when in SelectPaymentMethod, payWithPayrexx moves to ProcessingPayrexxPayment', () => {
      const initialState = buildAppState({
        state: 'SelectPaymentMethod',
      });
      expect(sessionReducer(initialState, payWithPayrexx()).session.payment).toEqual({
        state: 'ProcessingPayrexxPayment',
      });
    });

    describe.each([['ProcessingWalletPayment'], ['ProcessingPayrexxPayment']])('when in %s', (currentState: string) => {
      test('setTransactionId moves to Success', () => {
        const initialState = buildAppState({
          state: currentState as unknown as PaymentStates,
        });
        expect(sessionReducer(initialState, setTransactionId({ transactionId: 42 })).session.payment).toEqual({
          state: currentState as unknown as PaymentStates,
          transactionId: 42,
        });
      });
      test('showSuccess moves to Success', () => {
        const initialState = buildAppState({
          state: currentState as unknown as PaymentStates,
        });
        expect(sessionReducer(initialState, showSuccess()).session.payment).toEqual({
          state: 'Success',
        });
      });
      test('showFailure moves to Failure', () => {
        const initialState = buildAppState({
          state: currentState as unknown as PaymentStates,
        });
        expect(sessionReducer(initialState, showFailure()).session.payment).toEqual({
          state: 'Failure',
        });
      });
    });

    test('when in CreatingOrder, showFailure moves to Failure', () => {
      const initialState = buildAppState({
        state: 'CreatingOrder',
      });
      expect(sessionReducer(initialState, showFailure()).session.payment).toEqual({
        state: 'Failure',
      });
    });

    test('when in TopUpWallet, showFailure moves to Failure', () => {
      const initialState = buildAppState({
        state: 'TopUpWallet',
      });
      expect(sessionReducer(initialState, showFailure()).session.payment).toEqual({
        state: 'Failure',
      });
    });

    describe.each([['SelectPaymentMethod'], ['TopUpWallet']])('when in %s', (currentState: string) => {
      test('cancel moves to CancellingPayment', () => {
        const initialState = buildAppState({
          state: currentState as unknown as PaymentStates,
        });
        expect(sessionReducer(initialState, cancel()).session.payment).toEqual({
          state: 'CancellingPayment',
        });
      });
    });
  });
});

function buildAppState(payment: PaymentState) {
  return {
    cart: buildCart(),
    customer: buildCustomer(),
    walletBalance: buildWalletBalance(),
    session: {
      initialState: false,
      payment,
    },
  };
}

function buildCustomer(): Customer {
  return {
    id: 1,
    email: '',
    first_name: '',
    last_name: '',
    username: '',
    member_id: 'M1',
    shipping: {
      first_name: '',
      last_name: '',
      company: '',
      address_1: '',
      address_2: '',
      city: '',
      postcode: '',
      country: '',
    },
    billing: {
      first_name: '',
      last_name: '',
      company: '',
      address_1: '',
      address_2: '',
      city: '',
      postcode: '',
      country: '',
      email: '',
      phone: '',
    },
  };
}


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

const product: Product = createProduct({
  price: 42.24,
  id: 42,
  articleId: 'product',
  name: 'name',
  slug: 'slug',
  barcodes: 'barcode',
  category: 'category',
});