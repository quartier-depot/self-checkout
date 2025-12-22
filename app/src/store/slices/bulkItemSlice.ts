import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../api/Product';

interface BulkItemState {
  bulkItem: Product | undefined;
}

const initialState: BulkItemState = {
  bulkItem: undefined
};

interface AddBulkItemPayload {
  product: Product;
}

const bulkItemSlice = createSlice({
  name: 'bulkItem',
  initialState,
  reducers: {
    addBulkItem: (state, action: PayloadAction<AddBulkItemPayload>) => {
      state.bulkItem = action.payload.product;
    },
    removeBulkItem: (state) => {
      state.bulkItem = undefined;
    },
  }
});

export const { addBulkItem, removeBulkItem } = bulkItemSlice.actions;
export default bulkItemSlice.reducer; 