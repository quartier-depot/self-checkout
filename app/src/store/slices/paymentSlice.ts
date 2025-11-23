import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type PaymentStates =  'NoPayment' | 'SelectPaymentRole' | 'CreatingOrder' | 'SelectPaymentMethod' | 'TopUpWallet' | 'ProcessingWalletPayment' | 'ProcessingPayrexxPayment' | 'Success' | 'Failure' | 'CancellingPayment';

export enum PaymentRoles { customer, guest };

export interface PaymentState {
  state: PaymentStates;
  paymentRole?: PaymentRoles;
  orderId?: string;
  orderTotal?: number;
}

const initialState: PaymentState = {
  state: 'NoPayment',
  paymentRole: undefined,
};


interface CreateOrderPayload {
  paymentRole: PaymentRoles
}

interface SelectPaymentMethod {
  orderId: string;
  orderTotal: number;
}

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    selectPaymentRole: (state) => {
      assertStateIn(state, ['NoPayment']);
      state.state = 'SelectPaymentRole';
      state.paymentRole = undefined;
    },
    createOrder: (state, action: PayloadAction<CreateOrderPayload>) => {
      assertStateIn(state, ['SelectPaymentRole']);
      state.state = 'CreatingOrder';
      state.paymentRole = action.payload.paymentRole;
    },
    selectPaymentMethod: (state, action: PayloadAction<SelectPaymentMethod>) => {
      assertStateIn(state, ['CreatingOrder']);
      state.state = 'SelectPaymentMethod';
      state.orderId = action.payload.orderId;
      state.orderTotal = action.payload.orderTotal;
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
      state.state = 'CancellingPayment';
    }
    ,noPayment: (state) => {
      state.state = 'NoPayment';
    }
  }
});

function assertStateIn(state: PaymentState, expectedStates: PaymentStates[]) {
  if (!expectedStates.includes(state.state)) {
    console.log(`Expected state to be in ${expectedStates} but was ${state.state}`);
  }
}


export const { selectPaymentRole, createOrder, selectPaymentMethod, topUpWallet, payWithWallet, payWithPayrexx, showSuccess, showFailure, cancel, noPayment} = paymentSlice.actions;
export default paymentSlice.reducer; 