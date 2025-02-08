import { Customer } from '../../api/customers/Customer';
import { Action } from '../action';
import { CustomerActionTypes } from './customerAction';

export function setCustomer(customer:Customer): Action {
  return {
    type: CustomerActionTypes.SET_CUSTOMER,
    payload: customer
  }
}
