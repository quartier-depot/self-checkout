import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Customer } from '../../api/customers/Customer';
import { startNewOrder } from './orderSlice';

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
  },
  extraReducers: (builder) => {
    builder.addCase(startNewOrder, (state) => {
      state.customer = undefined;
    });
  },
});

export const { setCustomer } = customerSlice.actions;
export default customerSlice.reducer; 