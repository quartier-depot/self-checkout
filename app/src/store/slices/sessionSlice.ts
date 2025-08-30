import { createSlice } from '@reduxjs/toolkit';

interface AppState {
  session: {
    initialState: boolean;
  }
}

const initialState: AppState = {
  session: {
    initialState: true
  }
};

const sessionSlice = createSlice({
  name: 'session',
  initialState: initialState,
  reducers: {
    startNewSession: (state) => {
      state.session = { initialState: true };
      // This action will be handled by extraReducers in cart, customer and products slices
    },
    logActivity: (state) => {
      state.session = { initialState: false };
    }
  },
});

export const { startNewSession, logActivity } = sessionSlice.actions;
export default sessionSlice.reducer; 