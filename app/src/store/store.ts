import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import configurationReducer from './slices/configurationSlice';
import cartReducer from './slices/cartSlice';
import customerReducer from './slices/customerSlice';
import displayReducer from './slices/displaySlice.ts';
import orderReducer from './slices/appSlice';
import bulkItemReducer from './slices/bulkItemSlice';
import { aboApi, api } from './api/api';
import { soundMiddleware } from './middleware/soundMiddleware';
import { cartLoggingMiddleware } from './middleware/cartLoggingMiddleware';
import { bulkItemMiddleware } from './middleware/bulkItemMiddleware.ts';
import { productValidationMiddleware } from './middleware/productValidationMiddleware.ts';
import { customerValidationMiddleware } from './middleware/customerValidationMiddleware.ts';

// We'll add our reducers here once we create them
const store = configureStore({
  reducer: {
    bulkItem: bulkItemReducer,
    cart: cartReducer,
    configuration: configurationReducer,
    customer: customerReducer,
    display: displayReducer,
    order: orderReducer,
    [api.reducerPath]: api.reducer,
    [aboApi.reducerPath]: aboApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // This might be needed for App Insights
    })
      .concat(api.middleware)
      .concat(aboApi.middleware)
      .concat(soundMiddleware)
      .concat(cartLoggingMiddleware)
      .concat(productValidationMiddleware)
      .concat(customerValidationMiddleware)
      .concat(bulkItemMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store; 