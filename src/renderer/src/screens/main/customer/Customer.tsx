import { useAppContext } from '../../../context/useAppContext';
import { useWalletBalance } from '../../../api/wallet/useWalletBalance';
import { formatPrice } from '../../../format/formatPrice';
import { useState } from 'react';
import { Modal } from '../../../components/modal/Modal';

type CustomerProps = {
  className?: string
}

export function Customer({className}:CustomerProps) {
  const { state } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const walletQuery = useWalletBalance(state.customer?.email);
  const loggedIn = Boolean(state.customer);
  const name = loggedIn ? `${state.customer?.first_name} ${state.customer?.last_name}` : 'Unbekannte Kundin';

  function handleClick() {
    if (!loggedIn) {
        setShowModal(!showModal);
      }
  }

  return (
    <>
      <div onClick={handleClick} className={`m-2 ${className}`}>
         <div>
          {name}
        </div>
        <div className="text-right grow">
          {loggedIn && walletQuery.isSuccess && formatPrice(walletQuery.data)}
          {!loggedIn && formatPrice(0)}
        </div>
      </div>

      {showModal && <Modal />}
    </>
  );
}
