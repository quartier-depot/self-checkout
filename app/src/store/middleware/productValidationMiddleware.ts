import { Middleware } from '@reduxjs/toolkit';
import { api } from '../api/api.ts';
import { NO_BARCODE_VALUE, Product } from '../api/products/Product.ts';

let appInsights: any = null;

export const initializeProductValidationMiddleware = (insights: any) => {
  appInsights = insights;
};

export const productValidationMiddleware: Middleware = () => (next) => (action: any) => {
  if (!appInsights) {
    return next(action);
  }

  if (
    action.type === `${api.reducerPath}/executeQuery/fulfilled` &&
    action.meta?.arg?.endpointName === 'getProducts'
  ) {
    const products = action.payload as Product[];

    // Check for duplicate barcodes
    const barcodeMap = new Map<string, Product[]>();
    products.forEach(product => {
      product.barcodes.forEach(barcode => {
        if (barcode.code !== NO_BARCODE_VALUE) {
          if (!barcodeMap.has(barcode.code)) {
            barcodeMap.set(barcode.code, []);
          }
          barcodeMap.get(barcode.code)!.push(product);
        }
      });
    });

    // Track no barcodes to Application Insights
    const noBarcodes = barcodeMap.size === 0;
    if (products.length && noBarcodes) {
      appInsights.trackException(
        { exception: new Error('no product contains a barcode') }
      );
    }

    // Track duplicates to Application Insights
    const duplicates = Array.from(barcodeMap.entries())
      .filter(([_, products]) => products.length > 1);

    if (duplicates.length > 0) {
      duplicates.forEach(([barcode, duplicateProducts]) => {
        appInsights.trackEvent({
          name: 'duplicate-product-barcode-detected',
          properties: {
            barcode,
            productIds: duplicateProducts.map(p => p.id).join(','),
            productNames: duplicateProducts.map(p => p.name).join(','),
          },
        });
      });
    }
  }

  return next(action);
};