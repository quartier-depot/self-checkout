import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import configurationReducer from './slices/configurationSlice';
import cartReducer from './slices/cartSlice';
import customerReducer from './slices/customerSlice';
import productsReducer from './slices/productsSlice';
import orderReducer from './slices/appSlice';
import bulkItemReducer from './slices/bulkItemSlice';
import { api } from './api/api';
import { soundMiddleware } from './middleware/soundMiddleware';
import { cartLoggingMiddleware } from './middleware/cartLoggingMiddleware';
import { bulkItemMiddleware } from './middleware/bulkItemMiddleware.ts';

// We'll add our reducers here once we create them
const store = configureStore({
  reducer: {
    configuration: configurationReducer,
    cart: cartReducer,
    bulkItem: bulkItemReducer,
    customer: customerReducer,
    products: productsReducer,
    order: orderReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // This might be needed for App Insights
    })
    .concat(api.middleware)
    .concat(soundMiddleware)
    .concat(cartLoggingMiddleware)
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