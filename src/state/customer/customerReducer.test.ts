import { describe, expect, test } from 'vitest';
import { initialState as withoutCustomer, reducer } from '../reducer';
import { setCustomer } from './setCustomer';
import { Customer } from '../../api/customers/Customer';


describe('customerReducer', () => {
  describe('when no customer is set', () => {
    test('on set customer sets customer', () => {
      const actual = reducer(
        withoutCustomer,
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