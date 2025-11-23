import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WalletBalance } from '../api/api.ts';
import { Cart } from '../api/cart/Cart.ts';

export type PaymentStates =  'NoPayment' | 'SelectMember' | 'CreatingOrder' | 'SelectPaymentMethod' | 'TopUpWallet';

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
    }
  }
});

function assertStateIn(state: PaymentState, expectedStates: PaymentStates[]) {
  if (!expectedStates.includes(state.state)) {
    throw new Error(`Expected state to be in ${expectedStates} but was ${initialState.state}`);
  }
}


export const { startPayment, selectPaymentMethod } = paymentSlice.actions;
export default paymentSlice.reducer; 