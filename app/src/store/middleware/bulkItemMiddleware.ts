import { Middleware } from '@reduxjs/toolkit';
import { changeCartQuantity } from '../slices/cartSlice';
import { addBulkItem } from '../slices/bulkItemSlice.ts';

export const bulkItemMiddleware: Middleware = () => (next) => (action) => {
  if (changeCartQuantity.match(action)) {
    const { product, quantity } = action.payload;
    if (product.isBulkItem && quantity === 1) {
      console.log('add bulk item');
      return next(addBulkItem({product}));
    }
  }

  return next(action);
}