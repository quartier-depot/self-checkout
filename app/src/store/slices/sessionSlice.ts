import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  session: {
    initialState: boolean;
    payment: PaymentState;
  };
}

const initialState: AppState = {
  session: {
    initialState: true,
    payment: {
      state: 'NoPayment',
      orderId: undefined,
      paymentMethod: undefined,
      transactionId: undefined,
      orderTotal: undefined,
      charges: undefined,
    },
  },
};

export type PaymentStates =
  'NoPayment'
  | 'CreatingOrder'
  | 'ProcessingWalletPayment'
  | 'ProcessingPayrexxPayment'
  | 'Success'
  | 'Failure';

export type PaymentMethods = 'Payrexx'| 'Wallet';

export interface PaymentState {
  state: PaymentStates;
  orderId?: string;
  orderTotal?: number;
  paymentMethod?: PaymentMethods;
  transactionId?: number | string;
  charges?: number;
}

interface SetOrderPayload {
  orderId: string | undefined;
  orderTotal: number | undefined;
}

interface SetTransactionIdPayload {
  transactionId: string | number | undefined;
}

const sessionSlice = createSlice({
  name: 'session',
  initialState: initialState,
  reducers: {
    startNewSession: (state) => {
      state.session.initialState = initialState.session.initialState;
      state.session.payment = initialState.session.payment;
      // This action will be handled by extraReducers in cart, customer and products slices
    },
    logActivity: (state) => {
      state.session.initialState = false;
    },
    createOrder: (state) => {
      state.session.payment.state = 'CreatingOrder';
    },
    setOrder: (state, action: PayloadAction<SetOrderPayload>) => {
      state.session.payment.orderId = action.payload.orderId;
      state.session.payment.orderTotal = action.payload.orderTotal;
    },
    setTransactionId: (state, action: PayloadAction<SetTransactionIdPayload>) => {
      state.session.payment.transactionId = action.payload.transactionId;
    },
    payWithWallet: (state) => {
      state.session.payment.paymentMethod = 'Wallet';
      state.session.payment.state = 'ProcessingWalletPayment';
    },
    payWithPayrexx: (state) => {
      state.session.payment.paymentMethod = 'Payrexx';
      state.session.payment.charges = (state.session.payment.orderTotal || 0) * 0.0125 + 0.18;
      state.session.payment.state = 'ProcessingPayrexxPayment';
    },
    showSuccess: (state) => {
      state.session.payment.state = 'Success';
    },
    showFailure: (state) => {
      state.session.payment.state = 'Failure';
    },
    noPayment: (state) => {
      state.session.payment.state = 'NoPayment';
    },
  },
});

export const { startNewSession, logActivity, setOrder, setTransactionId, createOrder, payWithWallet, payWithPayrexx, showSuccess, showFailure, noPayment } = sessionSlice.actions;
export default sessionSlice.reducer; 