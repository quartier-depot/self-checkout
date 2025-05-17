import { createSlice } from '@reduxjs/toolkit';

const orderSlice = createSlice({
  name: 'order',
  initialState: {},
  reducers: {
    startNewOrder: () => {
      // This action will be handled by extraReducers in cart and customer slices
    },
  },
});

export const { startNewOrder } = orderSlice.actions;
export default orderSlice.reducer; 