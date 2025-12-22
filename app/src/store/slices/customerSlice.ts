import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Customer } from '../api/Customer';
import { startNewSession } from './sessionSlice';

interface CustomerState {
  customer?: Customer;
}

const initialState: CustomerState = {
  customer: undefined,
};

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    setCustomer: (state, action: PayloadAction<Customer | undefined>) => {
      state.customer = action.payload;
    },
    logoutCustomer: (state) => {
      state.customer = undefined;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(startNewSession, (state) => {
      state.customer = initialState.customer;
    });
  },
});

export const { setCustomer, logoutCustomer } = customerSlice.actions;
export default customerSlice.reducer; 