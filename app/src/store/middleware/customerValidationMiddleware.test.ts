import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Middleware, MiddlewareAPI } from '@reduxjs/toolkit';
import { customerValidationMiddleware, initializeCustomerValidationMiddleware } from './customerValidationMiddleware';
import { Customer } from '../api/customers/Customer.ts';

describe('customerValidationMiddleware', () => {
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
    initializeCustomerValidationMiddleware(mockAppInsights);

    // Create mock for next middleware
    mockNext = vi.fn();

    // Create mock store
    mockStore = {
      dispatch: vi.fn(),
      getState: vi.fn(),
    };

    // Initialize middleware
    middleware = customerValidationMiddleware as Middleware;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should pass through non-product actions unchanged', () => {
    const action = { type: 'TEST_ACTION' };
    middleware(mockStore)(mockNext)(action);

    expect(mockNext).toHaveBeenCalledWith(action);
    expect(mockAppInsights.trackEvent).not.toHaveBeenCalled();
    expect(mockAppInsights.trackException).not.toHaveBeenCalled();
  });

  it('should detect and track duplicate memberIds', () => {
    const customers: Customer[] = [
        buildCustomer(1, '123'),
        buildCustomer(2, '123'), // Duplicate barcode '123'
    ];

    const action = buildAction(customers);

    middleware(mockStore)(mockNext)(action);
    
    expect(mockNext).toHaveBeenCalledWith(action);
    expect(mockAppInsights.trackException).toHaveBeenCalled();
  });

  it('should ignore duplicate OPT-OUT memberIds', () => {
    const customers: Customer[] = [
      buildCustomer(1, 'OPT-OUT'),
      buildCustomer(2, 'OPT-OUT'), // Duplicate memberId 'OPT-OUT'
      buildCustomer(3, '123'), // avoids not customer contains a member_id error
    ];

    const action = buildAction(customers);

    middleware(mockStore)(mockNext)(action);

    expect(mockNext).toHaveBeenCalledWith(action);
    expect(mockAppInsights.trackException).not.toHaveBeenCalled();
  });

  it('should not track when there are no duplicate memberIds', () => {
    const customers: Customer[] = [
      buildCustomer(1, '123'),
      buildCustomer(2, '456'),
    ];

    const action = buildAction(customers);
    
    middleware(mockStore)(mockNext)(action);

    expect(mockNext).toHaveBeenCalledWith(action);
    expect(mockAppInsights.trackException).not.toHaveBeenCalled();
  });

  it('should detect and track no memberId', () => {
    const customers: Customer[] = [
      buildCustomer(1, ''),
      buildCustomer(2, ''),
    ];

    const action = buildAction(customers);

    middleware(mockStore)(mockNext)(action);
    
    expect(mockNext).toHaveBeenCalledWith(action);
    expect(mockAppInsights.trackException).toHaveBeenCalled();
  });

  it('should handle undefined appInsights', () => {
    // Reset appInsights to undefined
    initializeCustomerValidationMiddleware(undefined);

    const customers: Customer[] = [
      buildCustomer(1, '123'),
      buildCustomer(2, '123'),
    ];

    const action = buildAction(customers);
    
    middleware(mockStore)(mockNext)(action);

    // Should not throw and should pass through the action
    expect(mockNext).toHaveBeenCalledWith(action);
  });
});

function buildCustomer(id: number, memberId: string): Customer {
  return {
    id: id,
    email: '',
    first_name: '',
    last_name: '',
    username: '',
    member_id: memberId,
    shipping: {
      first_name: '',
      last_name: '',
      company: '',
      address_1: '',
      address_2: '',
      city: '',
      postcode: '',
      country: '',
    },
    billing: {
      first_name: '',
      last_name: '',
      company: '',
      address_1: '',
      address_2: '',
      city: '',
      postcode: '',
      country: '',
      email: '',
      phone: '',
    },
  };
}

function buildAction(customers: Customer[]) {
  return {
    type: `woocommerceApi/executeQuery/fulfilled`,
    meta: {
      arg: {
        endpointName: 'getCustomers',
      },
    },
    payload: customers,
  };
}