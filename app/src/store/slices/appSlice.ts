import { createSlice } from '@reduxjs/toolkit';

const sessionSlice = createSlice({
  name: 'session',
  initialState: {},
  reducers: {
    startNewSession: () => {
      // This action will be handled by extraReducers in cart, customer and products slices
    },
  },
});

export const { startNewSession } = sessionSlice.actions;
export default sessionSlice.reducer; 