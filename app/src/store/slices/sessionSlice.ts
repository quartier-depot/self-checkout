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
      transactionId: undefined,
      orderTotal: undefined,
      paymentRole: undefined,
    },
  },
};

export type PaymentStates =
  'NoPayment'
  | 'SelectPaymentRole'
  | 'CreatingOrder'
  | 'SelectPaymentMethod'
  | 'TopUpWallet'
  | 'ProcessingWalletPayment'
  | 'ProcessingPayrexxPayment'
  | 'Success'
  | 'Failure'
  | 'CancellingPayment';

export enum PaymentRoles { customer, guest };

export interface PaymentState {
  state: PaymentStates;
  paymentRole?: PaymentRoles;
  orderId?: string;
  orderTotal?: number;
  transactionId?: number | string;
}

interface SetPaymentRolePayload {
  paymentRole: PaymentRoles;
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
    selectPaymentRole: (state) => {
      assertStateIn(state, ['NoPayment']);
      state.session.payment.state = 'SelectPaymentRole';
      state.session.payment.paymentRole = undefined;
    },
    setPaymentRole: (state, action: PayloadAction<SetPaymentRolePayload>) => {
      assertStateIn(state, ['NoPayment', 'SelectPaymentRole']);
      state.session.payment.paymentRole = action.payload.paymentRole;
    },
    createOrder: (state) => {
      assertStateIn(state, ['NoPayment']);
      state.session.payment.state = 'CreatingOrder';
    },
    setOrder: (state, action: PayloadAction<SetOrderPayload>) => {
      assertStateIn(state, ['NoPayment']);
      state.session.payment.orderId = action.payload.orderId;
      state.session.payment.orderTotal = action.payload.orderTotal;
    },
    setTransactionId: (state, action: PayloadAction<SetTransactionIdPayload>) => {
      state.session.payment.transactionId = action.payload.transactionId;
    },
    selectPaymentMethod: (state) => {
      assertStateIn(state, ['CreatingOrder']);
      state.session.payment.state = 'SelectPaymentMethod';
    },
    topUpWallet: (state) => {
      assertStateIn(state, ['SelectPaymentMethod']);
      state.session.payment.state = 'TopUpWallet';
    },
    payWithWallet: (state) => {
      assertStateIn(state, ['SelectPaymentMethod']);
      state.session.payment.state = 'ProcessingWalletPayment';
    },
    payWithPayrexx: (state) => {
      assertStateIn(state, ['SelectPaymentMethod']);
      state.session.payment.state = 'ProcessingPayrexxPayment';
    },
    showSuccess: (state) => {
      assertStateIn(state, ['ProcessingWalletPayment', 'ProcessingPayrexxPayment']);
      state.session.payment.state = 'Success';
    },
    showFailure: (state) => {
      state.session.payment.state = 'Failure';
    },
    cancel: (state) => {
      state.session.payment.state = 'CancellingPayment';
    }
    , noPayment: (state) => {
      state.session.payment.state = 'NoPayment';
    },
  },
});


function assertStateIn(state: AppState, expectedStates: PaymentStates[]) {
  if (!expectedStates.includes(state.session.payment.state)) {
    console.log(`Expected state to be in ${expectedStates} but was ${state.session.payment.state}`);
  }
}

export const { startNewSession, logActivity, selectPaymentRole, setOrder, setPaymentRole, setTransactionId, createOrder, selectPaymentMethod, topUpWallet, payWithWallet, payWithPayrexx, showSuccess, showFailure, cancel, noPayment } = sessionSlice.actions;
export default sessionSlice.reducer; 