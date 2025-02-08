import { Customer } from '../../api/customers/Customer';
import { Action, ActionTypes } from '../action';

export function setCustomer(customer:Customer): Action {
  return {
    type: ActionTypes.SET_CUSTOMER,
    payload: customer
  }
}
