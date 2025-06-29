import { describe, expect, test } from 'vitest';
import customerReducer, { setCustomer } from './customerSlice';
import { Customer } from '../api/customers/Customer';

describe('customerSlice', () => {
  describe('when no customer is set', () => {
    test('on set customer sets customer', () => {
      const initialState = {
        customer: undefined,
      };

      const actual = customerReducer(
        initialState,
        setCustomer(customer),
      );

      expect(actual.customer).toBe(customer);
    });
  });
});

const customer: Customer = {
  id: 42,
  email: 'test@test.com',
  first_name: 'first',
  last_name: 'last',
  username: 'username',
  member_id: 'member_id',
  billing: {
    first_name: 'first',
    last_name: 'last',
    company: 'company',
    address_1: 'address_1',
    address_2: 'address_2',
    city: 'city',
    postcode: '8000',
    country: 'country',
    email: 'email',
    phone: 'phone'
  },
  shipping: {
    first_name: 'first',
    last_name: 'last',
    company: 'company',
    address_1: 'address_1',
    address_2: 'address_2',
    city: 'city',
    postcode: '8000',
    country: 'country',
  },
}; 