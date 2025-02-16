import { useAppContext } from '../../../context/useAppContext';
import { useWalletBalance } from '../../../api/wallet/useWalletBalance';
import { formatPrice } from '../../../format/formatPrice';
import { useState } from 'react';
import { Modal } from '../../../components/modal/Modal';

export function Customer() {
  const { state } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const walletQuery = useWalletBalance(state.customer?.email);
  const loggedIn = Boolean(state.customer);
  const name = loggedIn ? `${state.customer?.first_name} ${state.customer?.last_name}` : 'Bitte einloggen';

  function handleClick() {
    if (!loggedIn) {
        setShowModal(!showModal);
      }
  }

  return (
    <>
      <div onClick={handleClick}>
         <div>
          {name}
        </div>
        <div className="text-right flex-grow">
          {loggedIn && walletQuery.isSuccess && formatPrice(walletQuery.data)}
        </div>
      </div>

      {showModal && <Modal />}
    </>
  );
}
