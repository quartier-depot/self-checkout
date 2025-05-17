import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../../api/products/Product';

interface BrowseState {
  products: Product[] | { gestell: string; products: Product[] }[] | undefined;
}

const initialState: BrowseState = {
  products: undefined,
};

const browseSlice = createSlice({
  name: 'browse',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[] | { gestell: string; products: Product[] }[]>) => {
      state.products = action.payload;
    },
    clearProducts: (state) => {
      state.products = undefined;
    },
  },
});

export const { setProducts, clearProducts } = browseSlice.actions;
export default browseSlice.reducer; 