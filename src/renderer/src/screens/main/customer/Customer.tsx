import { useAppContext } from '../../../context/useAppContext';
import { useWalletBalance } from '../../../api/wallet/useWalletBalance';
import { formatPrice } from '../../../format/formatPrice';
import { useState } from 'react';
import { Modal } from '../../../components/modal/Modal';
import { CustomerActionTypes } from '../../../state/customer/customerAction';
import { useCustomers } from '../../../api/customers/useCustomers';

type CustomerProps = {
  className?: string
}

export function Customer({className}:CustomerProps) {
  const { state, dispatch } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const walletQuery = useWalletBalance(state.customer?.email);
  const loggedIn = Boolean(state.customer);
  const name = loggedIn ? `${state.customer?.first_name} ${state.customer?.last_name}` : 'Unbekannte Kundin';
  const customersQuery = useCustomers();

  function handleClick() {
    if (!loggedIn) {
        setShowModal(!showModal);
      }
  }

  function handleDoubleClick() {
    if (!loggedIn) {
        // TODO test only
        dispatch({ type: CustomerActionTypes.SET_CUSTOMER, payload: customersQuery.data?.find(c => c.id === 213) });
    }
  }

  return (
    <>
      <div onClick={handleClick} onDoubleClick={handleDoubleClick} className={`m-2 ${className}`}>
         <div>
          {name}
        </div>
        <div className="text-right grow">
          {loggedIn && walletQuery.isSuccess && formatPrice(walletQuery.data)}
          {!loggedIn && formatPrice(0)}
        </div>
      </div>

      {showModal && <Modal onClick={() => setShowModal(false)}/>}
    </>
  );
}
