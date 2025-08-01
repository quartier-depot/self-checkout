import { Middleware } from '@reduxjs/toolkit';
import { changeCartQuantity } from '../slices/cartSlice';

let appInsights: any = null;

export const initializeCartLoggingMiddleware = (insights: any) => {
  appInsights = insights;
};

export const cartLoggingMiddleware: Middleware = () => (next) => (action) => {
  if (appInsights && changeCartQuantity.match(action)) {
    const { product, quantity, source } = action.payload;
    console.log('track event', product.artikel_id, product.name, quantity, source);
    appInsights.appInsights.trackEvent(
      { name: 'change-cart-quantity' },
      {
        productId: product.artikel_id,
        name: product.name.substring(0, 30),
        hasBarcodes: product.hasBarcodes(),
        quantity: Math.abs(quantity),
        source: source
      }
    );
  }
  
  return next(action);
}; 