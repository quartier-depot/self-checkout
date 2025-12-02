import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { startNewSession } from './sessionSlice.ts';

export type PaymentStates =  'NoPayment' | 'SelectPaymentRole' | 'CreatingOrder' | 'SelectPaymentMethod' | 'TopUpWallet' | 'ProcessingWalletPayment' | 'ProcessingPayrexxPayment' | 'Success' | 'Failure' | 'CancellingPayment';

export enum PaymentRoles { customer, guest };

export interface PaymentState {
  state: PaymentStates;
  paymentRole?: PaymentRoles;
  orderId?: string;
  orderTotal?: number;
  transactionId?: number | string;
}

const initialState: PaymentState = {
  state: 'NoPayment',
  paymentRole: undefined,
};


interface SetPaymentRolePayload {
  paymentRole: PaymentRoles
}

interface SetOrderPayload {
  orderId: string | undefined;
  orderTotal: number | undefined;
}

interface SetTransactionIdPayload {
  transactionId: string | number | undefined;
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
    setPaymentRole: (state, action: PayloadAction<SetPaymentRolePayload>) => {
      assertStateIn(state, ['NoPayment', 'SelectPaymentRole']);
      state.paymentRole = action.payload.paymentRole;
    } ,
    createOrder: (state) => {
      assertStateIn(state, ['SelectPaymentRole']);
      state.state = 'CreatingOrder';
    },
    setOrder: (state, action: PayloadAction<SetOrderPayload>) => {
      assertStateIn(state, ['NoPayment']);
      state.orderId = action.payload.orderId;
      state.orderTotal = action.payload.orderTotal;
    } ,
    setTransactionId: (state, action: PayloadAction<SetTransactionIdPayload>) => {
      state.transactionId = action.payload.transactionId;
    } ,    
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
      state.state = 'CancellingPayment';
    }
    ,noPayment: (state) => {
      state.state = 'NoPayment';
    }
  },
  extraReducers: (builder) => {
    builder.addCase(startNewSession, (state) => {
      state.state = 'NoPayment';
      state.orderId = undefined;
      state.transactionId = undefined;
      state.orderTotal = undefined;
      state.paymentRole = undefined;
    });
  },
});

function assertStateIn(state: PaymentState, expectedStates: PaymentStates[]) {
  if (!expectedStates.includes(state.state)) {
    console.log(`Expected state to be in ${expectedStates} but was ${state.state}`);
  }
}


export const { selectPaymentRole, setOrder, setPaymentRole, setTransactionId, createOrder, selectPaymentMethod, topUpWallet, payWithWallet, payWithPayrexx, showSuccess, showFailure, cancel, noPayment} = paymentSlice.actions;
export default paymentSlice.reducer; 