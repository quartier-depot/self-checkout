import { Middleware } from '@reduxjs/toolkit';
import { changeCartQuantity } from '../slices/cartSlice';

let appInsights: any = null;

export const initializeCartLoggingMiddleware = (insights: any) => {
  appInsights = insights;
};

export const cartLoggingMiddleware: Middleware = () => (next) => (action) => {
  if (appInsights && changeCartQuantity.match(action)) {
    const { product, quantity, source } = action.payload;
    
    appInsights.appInsights.trackEvent(
      { name: 'change-cart-quantity' },
      {
        productId: product.artikel_id,
        quantity: Math.abs(quantity),
        source: source,
        timestamp: new Date().toISOString()
      }
    );
  }
  
  return next(action);
}; 