import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import configurationReducer from './slices/configurationSlice';
import cartReducer from './slices/cartSlice';
import customerReducer from './slices/customerSlice';
import searchReducer from './slices/searchSlice';
import browseReducer from './slices/browseSlice';
import orderReducer from './slices/orderSlice';
import { woocommerceApi } from './api/woocommerceApi';

// We'll add our reducers here once we create them
const store = configureStore({
  reducer: {
    configuration: configurationReducer,
    cart: cartReducer,
    customer: customerReducer,
    search: searchReducer,
    browse: browseReducer,
    order: orderReducer,
    [woocommerceApi.reducerPath]: woocommerceApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // This might be needed for App Insights
    }).concat(woocommerceApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export { store }; 