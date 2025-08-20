import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Middleware, MiddlewareAPI } from '@reduxjs/toolkit';
import { productValidationMiddleware, initializeProductValidationMiddleware } from './productValidationMiddleware';
import { Product } from '../api/products/Product.ts';

describe('productValidationMiddleware', () => {
  let mockAppInsights: { 
    trackEvent: ReturnType<typeof vi.fn>, 
    trackException: ReturnType<typeof vi.fn> };
  let mockNext: ReturnType<typeof vi.fn>;
  let mockStore: MiddlewareAPI;
  let middleware: Middleware;

  beforeEach(() => {
    // Create mock for AppInsights
    mockAppInsights = {
      trackEvent: vi.fn(),
      trackException: vi.fn()
    };

    // Initialize the middleware with mock AppInsights
    initializeProductValidationMiddleware(mockAppInsights);

    // Create mock for next middleware
    mockNext = vi.fn();

    // Create mock store
    mockStore = {
      dispatch: vi.fn(),
      getState: vi.fn(),
    };

    // Initialize middleware
    middleware = productValidationMiddleware as Middleware;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should pass through non-product actions unchanged', () => {
    const action = { type: 'TEST_ACTION' };
    middleware(mockStore)(mockNext)(action);

    expect(mockNext).toHaveBeenCalledWith(action);
    expect(mockAppInsights.trackEvent).not.toHaveBeenCalled();
  });

  it('should detect and track duplicate barcodes', () => {
    const products: Product[] = [
        buildProduct(1, ['123', '456']),
        buildProduct(2, ['123', '789']), // Duplicate barcode '123'
    ];

    const action = buildAction(products);

    middleware(mockStore)(mockNext)(action);

    // Verify that next middleware was called
    expect(mockNext).toHaveBeenCalledWith(action);

    // Verify that AppInsights was called with correct data
    expect(mockAppInsights.trackEvent).toHaveBeenCalledWith({
      name: 'duplicate-product-barcode-detected',
      properties: {
        barcode: '123',
        productIds: '1,2',
        productNames: 'Product 1,Product 2',
      },
    });
  });

  it('should not track when there are no duplicate barcodes', () => {
    const products: Product[] = [
      buildProduct(1, ['123']),
      buildProduct(2, ['456']),
    ];

    const action = buildAction(products);
    
    middleware(mockStore)(mockNext)(action);

    expect(mockNext).toHaveBeenCalledWith(action);
    expect(mockAppInsights.trackEvent).not.toHaveBeenCalled();
  });

  it('should detect and track no barcodes', () => {
    const products: Product[] = [
      buildProduct(1, []),
      buildProduct(2, []),
    ];

    const action = buildAction(products);

    middleware(mockStore)(mockNext)(action);
    
    expect(mockNext).toHaveBeenCalledWith(action);
    expect(mockAppInsights.trackException).toHaveBeenCalled();
  });

  it('should handle undefined appInsights', () => {
    // Reset appInsights to undefined
    initializeProductValidationMiddleware(undefined);

    const products: Product[] = [
      buildProduct(1, ['123']),
      buildProduct(2, ['123']),
    ];

    const action = buildAction(products);
    
    middleware(mockStore)(mockNext)(action);

    // Should not throw and should pass through the action
    expect(mockNext).toHaveBeenCalledWith(action);
  });
});

function buildProduct(id: number, barcodes: string[] = []): Product {
  return new Product({
    id: id,
    artikel_id: `A${id}`,
    barcodes: barcodes,
    name: `Product ${id}`,
    slug: `product-${id}`
  });
}

function buildAction(products: Product[]) {
  return {
    type: `api/executeQuery/fulfilled`,
    meta: {
      arg: {
        endpointName: 'getProducts',
      },
    },
    payload: products,
  };
}