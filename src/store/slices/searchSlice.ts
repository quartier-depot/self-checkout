import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { startNewOrder } from './orderSlice';

interface SearchState {
  searchTerm: string;
}

const initialState: SearchState = {
  searchTerm: '',
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(startNewOrder, (state) => {
      state.searchTerm = '';
    });
  },
});

export const { setSearchTerm } = searchSlice.actions;
export default searchSlice.reducer; 