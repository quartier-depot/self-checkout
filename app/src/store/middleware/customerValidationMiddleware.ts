import { Middleware } from '@reduxjs/toolkit';
import { api } from '../api/api.ts';
import { Customer } from '../api/customers/Customer.ts';

let appInsights: any = null;

export const initializeCustomerValidationMiddleware = (insights: any) => {
  appInsights = insights;
};

export const customerValidationMiddleware: Middleware = () => (next) => (action: any) => {
  if (!appInsights) {
    return next(action);
  }

  if (
    action.type === `${api.reducerPath}/executeQuery/fulfilled` &&
    action.meta?.arg?.endpointName === 'getCustomers'
  ) {
    const customers = action.payload as Customer[];

    // Check for duplicate memberIds
    const memberIdMap = new Map<string, Customer[]>();
    customers.forEach(customer => {
      if (customer.member_id) {
        if (!memberIdMap.has(customer.member_id)) {
          memberIdMap.set(customer.member_id, []);
        }
        memberIdMap.get(customer.member_id)!.push(customer);
      }
    });

    // Track no memberId to Application Insights
    const noMemberId = memberIdMap.size === 0;
    if (customers.length && noMemberId) {
      appInsights.trackException({
        exception: new Error('No customer contains a member_id.'),
      });
    }

    // Track duplicates to Application Insights
    const duplicates = Array.from(memberIdMap.entries())
      .filter(([_, products]) => products.length > 1);

    if (duplicates.length > 0) {
      duplicates.forEach(([memberId, duplicateCustomers]) => {
        appInsights.trackException({
          exception: new Error(`Duplicate customer member_id: ${memberId} for customers ${duplicateCustomers.map(p => p.id).join(',')}`),
        });
      });
    }
  }

  return next(action);
};