import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import configurationReducer from './slices/configurationSlice';
import cartReducer from './slices/cartSlice';
import customerReducer from './slices/customerSlice';
import displayReducer from './slices/displaySlice';
import sessionReducer from './slices/sessionSlice';
import bulkItemReducer from './slices/bulkItemSlice';
import { soundMiddleware } from './middleware/soundMiddleware';
import { cartLoggingMiddleware } from './middleware/cartLoggingMiddleware';
import { bulkItemMiddleware } from './middleware/bulkItemMiddleware';
import { productValidationMiddleware } from './middleware/productValidationMiddleware';
import { customerValidationMiddleware } from './middleware/customerValidationMiddleware';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import { persistReducer, persistStore } from 'redux-persist';
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE } from 'redux-persist/es/constants';
import { woocommerceApi } from './api/woocommerceApi/woocommerceApi';
import { payrexxApi } from './api/payrexxApi/payrexxApi';
import { restartApi } from './api/restartApi/restartApi';

// We'll add our reducers here once we create them
const rootReducer = combineReducers({
  bulkItem: bulkItemReducer,
  cart: cartReducer,
  configuration: configurationReducer,
  customer: customerReducer,
  display: displayReducer,
  session: sessionReducer,
  [woocommerceApi.reducerPath]: woocommerceApi.reducer,
  [payrexxApi.reducerPath]: payrexxApi.reducer,
  [restartApi.reducerPath]: restartApi.reducer,
});

const persistConfig = {
  key: 'root',
  version:1,
  storage,
  blacklist: [woocommerceApi.reducerPath, payrexxApi.reducerPath, restartApi.reducerPath]
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
      .concat(woocommerceApi.middleware)
      .concat(payrexxApi.middleware)
      .concat(restartApi.middleware)
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