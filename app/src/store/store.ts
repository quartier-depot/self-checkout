import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import configurationReducer from './slices/configurationSlice';
import cartReducer from './slices/cartSlice';
import customerReducer from './slices/customerSlice';
import displayReducer from './slices/displaySlice';
import paymentReducer from './slices/paymentSlice';
import sessionReducer from './slices/sessionSlice';
import bulkItemReducer from './slices/bulkItemSlice';
import { aboApi, api, payrexxApi } from './api/api';
import { soundMiddleware } from './middleware/soundMiddleware';
import { cartLoggingMiddleware } from './middleware/cartLoggingMiddleware';
import { bulkItemMiddleware } from './middleware/bulkItemMiddleware.ts';
import { productValidationMiddleware } from './middleware/productValidationMiddleware.ts';
import { customerValidationMiddleware } from './middleware/customerValidationMiddleware.ts';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import { persistReducer, persistStore } from 'redux-persist';
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE } from 'redux-persist/es/constants';

// We'll add our reducers here once we create them
const rootReducer = combineReducers({
  bulkItem: bulkItemReducer,
  cart: cartReducer,
  configuration: configurationReducer,
  customer: customerReducer,
  display: displayReducer,
  session: sessionReducer,
  payment: paymentReducer,
  [api.reducerPath]: api.reducer,
  [aboApi.reducerPath]: aboApi.reducer,
  [payrexxApi.reducerPath]: payrexxApi.reducer,
});

const persistConfig = {
  key: 'root',
  version:1,
  storage,
  blacklist: [api.reducerPath, aboApi.reducerPath, payrexxApi.reducerPath]
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
      .concat(api.middleware)
      .concat(aboApi.middleware)
      .concat(payrexxApi.middleware)
      .concat(soundMiddleware)
      .concat(cartLoggingMiddleware)
      .concat(productValidationMiddleware)
      .concat(customerValidationMiddleware)
      .concat(bulkItemMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

let persistor = persistStore(store)

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default { store, persistor }; 