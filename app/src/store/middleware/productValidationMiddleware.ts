// store/middleware/productValidationMiddleware.ts
import { Middleware } from '@reduxjs/toolkit';
import { api } from '../api/api.ts';
import { Product } from '../api/products/Product.ts';

let appInsights: any = null;

export const initializeProductValidationMiddleware = (insights: any) => {
  appInsights = insights;
};

export const productValidationMiddleware: Middleware = () => (next) => (action: any) => {
  // Check if this is a fulfilled action from getProducts query
  if (
    action.type === `${api.reducerPath}/executeQuery/fulfilled` &&
    action.meta?.arg?.endpointName === 'getProducts'
  ) {
    const products = action.payload as Product[];

    // Check for duplicate barcodes
    const barcodeMap = new Map<string, Product[]>();
    products.forEach(product => {
      product.barcodes.forEach(barcode => {
        if (!barcodeMap.has(barcode)) {
          barcodeMap.set(barcode, []);
        }
        barcodeMap.get(barcode)!.push(product);
      });
    });

    // Track duplicates to Application Insights
    const duplicates = Array.from(barcodeMap.entries())
      .filter(([_, products]) => products.length > 1);

    if (duplicates.length > 0 && appInsights) {
      duplicates.forEach(([barcode, duplicateProducts]) => {
        appInsights.trackEvent({
          name: 'duplicate-product-barcode-detected',
          properties: {
            barcode,
            productIds: duplicateProducts.map(p => p.id).join(','),
            productNames: duplicateProducts.map(p => p.name).join(',')
          }
        });
      });
    }
  }

  return next(action);
};