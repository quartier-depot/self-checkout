import { Middleware } from '@reduxjs/toolkit';
import { changeCartQuantity } from '../slices/cartSlice';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';

// Create a singleton instance of the middleware
let appInsights: ApplicationInsights | null = null;

// Initialize the middleware with the Application Insights context
export const initializeCartLoggingMiddleware = (insights: ApplicationInsights) => {
  appInsights = insights;
};

export const cartLoggingMiddleware: Middleware = () => (next) => (action) => {
  if (appInsights && changeCartQuantity.match(action)) {
    const { product, quantity } = action.payload;
    
    appInsights.trackEvent(
      { name: 'cart-action' },
      {
        action: quantity > 0 ? 'add' : 'remove',
        productId: product.artikel_id,
        productName: product.name,
        quantity: Math.abs(quantity),
        timestamp: new Date().toISOString()
      }
    );
  }
  
  return next(action);
}; 