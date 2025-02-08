import { Customer } from '../../api/customers/Customer';

export enum CustomerActionTypes {
  SET_CUSTOMER = 'SET_CUSTOMER'
}

export type SetCustomerAction = {
  type: CustomerActionTypes.SET_CUSTOMER;
  payload?: Customer;
};


export type CustomerAction =
  | SetCustomerAction
