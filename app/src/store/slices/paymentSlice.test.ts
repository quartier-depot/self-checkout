import { describe, expect, test } from 'vitest';
import paymentReducer, {
  PaymentState,
  PaymentStates,
  selectPaymentMethod,
  selectPaymentRole,
  topUpWallet,
  payWithWallet,
  payWithPayrexx,
  showSuccess,
  showFailure,
  cancel,
  createOrder, PaymentRoles, setOrder, setPaymentRole, setTransactionId,
} from './paymentSlice';
import { Product } from '../api/products/Product.ts';
import { Barcode } from '../api/products/Barcode.ts';
import { WalletBalance } from '../api/api.ts';
import { Cart } from '../api/cart/Cart.ts';
import { Customer } from '../api/customers/Customer.ts';

describe('paymentSlice', () => {
  describe('when in NoPayment', () => {
    test('selectPaymentRole moves to SelectPaymentRole state', () => {
      const initialState: PaymentState = {
        state: 'NoPayment',
      };

      expect(paymentReducer(initialState, selectPaymentRole())).toEqual({
        state: 'SelectPaymentRole',
        paymentRole: undefined,
      });
    });
    test('createOrder moves to CreatingOrder', () => {
      const initialState: PaymentState = {
        state: 'NoPayment',
      };
      expect(paymentReducer(initialState, createOrder())).toEqual({
        state: 'CreatingOrder',
      });
    });
    test('setOrderId sets the orderId and orderTotal', () => {
      const initialState: PaymentState = {
        state: 'NoPayment',
      };
      const action = {
        orderId: 'orderId',
        orderTotal: 42,
      };
      expect(paymentReducer(initialState, setOrder(action))).toEqual({
        orderId: 'orderId',
        orderTotal: 42,
        state: 'NoPayment',
      });
    });
    test('setPaymentRole sets the payment role', () => {
      const initialState: PaymentState = {
        state: 'NoPayment',
      };
      const action = {
        paymentRole: PaymentRoles.guest,
      };
      expect(paymentReducer(initialState, setPaymentRole(action))).toEqual({
        paymentRole: PaymentRoles.guest,
        state: 'NoPayment',
      });
    });
  });

  describe('when in SelectPaymentRole', () => {
    test('selectPaymentRole moves to SelectPaymentRole state', () => {
      const initialState: PaymentState = {
        state: 'NoPayment',
      };

      expect(paymentReducer(initialState, selectPaymentRole())).toEqual({
        state: 'SelectPaymentRole',
        paymentRole: undefined,
      });
    });
    test('setPaymentRole sets the payment role', () => {
      const initialState: PaymentState = {
        state: 'NoPayment',
      };
      const action = {
        paymentRole: PaymentRoles.guest,
      };
      expect(paymentReducer(initialState, setPaymentRole(action))).toEqual({
        paymentRole: PaymentRoles.guest,
        state: 'NoPayment',
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
    test('setTransactionId moves to Success', () => {
      const initialState: PaymentState = {
        state: currentState as unknown as PaymentStates,
      };
      expect(paymentReducer(initialState, setTransactionId({ transactionId: 42 }))).toEqual({
        state: currentState as unknown as PaymentStates,
        transactionId: 42,
      });
    });
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

  describe.each([['SelectPaymentRole'], ['SelectPaymentMethod'], ['TopUpWallet']])('when in %s', (currentState: string) => {
    test('cancel moves to CancellingPayment', () => {
      const initialState: PaymentState = {
        state: currentState as unknown as PaymentStates,
      };
      expect(paymentReducer(initialState, cancel())).toEqual({
        state: 'CancellingPayment',
      });
    });
  });

});

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

const product: Product = new Product({
  price: 42.24,
  id: 42,
  articleId: 'product',
  name: 'name',
  slug: 'slug',
  barcodes: [new Barcode('barcode')],
  category: 'category',
});