import { createSlice } from '@reduxjs/toolkit';

const appSlice = createSlice({
  name: ' ',
  initialState: {},
  reducers: {
    startNewOrder: () => {
      // This action will be handled by extraReducers in cart, customer and products slices
    },
  },
});

export const { startNewOrder } = appSlice.actions;
export default appSlice.reducer; 