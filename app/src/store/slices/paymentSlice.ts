import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WalletBalance } from '../api/api.ts';
import { Cart } from '../api/cart/Cart.ts';

export type PaymentStates =  'NoPayment' | 'SelectMember' | 'CreatingOrder' | 'SelectPaymentMethod' | 'TopUpWallet' | 'ProcessingWalletPayment' | 'ProcessingPayrexxPayment' | 'Success' | 'Failure';

export interface PaymentState {
  state: PaymentStates;
}

const initialState: PaymentState = {
  state: 'NoPayment'
};


interface StartPaymentPayload {
  cart: Cart;
  walletBalance: WalletBalance;
}

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    startPayment: (state, action: PayloadAction<StartPaymentPayload>) => {
      assertStateIn(state, ['NoPayment', 'SelectMember']);
      assertCartNotEmpty(action.payload.cart);
      if (action.payload.walletBalance.balance < action.payload.cart.price){
        state.state = 'SelectMember';
      } else {
        state.state = 'CreatingOrder';
      }
    },
    selectPaymentMethod: (state) => {
      assertStateIn(state, ['CreatingOrder']);
      state.state = 'SelectPaymentMethod';
    } ,
    topUpWallet: (state) => {
      assertStateIn(state, ['SelectPaymentMethod']);
      state.state = 'TopUpWallet';
    },
    payWithWallet: (state) => {
      assertStateIn(state, ['SelectPaymentMethod']);
      state.state = 'ProcessingWalletPayment';
    },
    payWithPayrexx: (state) => {
      assertStateIn(state, ['SelectPaymentMethod']);
      state.state = 'ProcessingPayrexxPayment';
    },
    showSuccess: (state) => {
      assertStateIn(state, ['ProcessingWalletPayment', 'ProcessingPayrexxPayment']);
      state.state = 'Success';
    },
    showFailure: (state) => {
      state.state = 'Failure';
    },
    cancel: (state) => {
      state.state = 'NoPayment';
    }
  }
});

function assertStateIn(state: PaymentState, expectedStates: PaymentStates[]) {
  if (!expectedStates.includes(state.state)) {
    throw new Error(`Expected state to be in ${expectedStates} but was ${state.state}`);
  }
}

function assertCartNotEmpty(cart: Cart) {
  if (cart.price <= 0) {
    throw new Error(`Expected cart to be not empty`);
  }
}


export const { startPayment, selectPaymentMethod, topUpWallet, payWithWallet, payWithPayrexx, showSuccess, showFailure, cancel } = paymentSlice.actions;
export default paymentSlice.reducer; 