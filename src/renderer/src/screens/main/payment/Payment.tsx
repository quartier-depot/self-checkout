import { useAppContext } from '../../../context/useAppContext';
import { formatPrice } from '../../../format/formatPrice';
import { useWalletBalance } from '../../../api/wallet/useWalletBalance';
import classNames from 'classnames';
import { useCreateOrder } from '../../../api/orders/useCreateOrder';
import { usePayWithWallet } from '../../../api/wallet/usePayWithWallet';
import { useUpdateOrder } from '../../../api/orders/useUpdateOrder';
import { ActionTypes } from '../../../actions/action';
import { useState } from 'react';
import { Loading } from '../../../components/modal/loading/Loading';
import { useQueryClient } from '@tanstack/react-query';
import { Confirmation } from './confirmation/Confirmation';

export function Payment() {
  const { state, dispatch } = useAppContext();
  const walletQuery = useWalletBalance(state.customer?.email);
  const [showLoading, setShowLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [total, setTotal] = useState(0);
  const [newBalance, setNewBalance] = useState(0);
  const [transactionId, setTransactionId] = useState(0);
  const [orderId, setOrderId] = useState('');

  const paymentEnabled =
    walletQuery.isSuccess && walletQuery.data != undefined && walletQuery.data >= state.cart.price;

  const queryClient = useQueryClient();
  const createOrderMutation = useCreateOrder();
  const payWithWalletMutation = usePayWithWallet(queryClient);
  const updateOrderMutation = useUpdateOrder();

  async function handlePayment() {
    setShowLoading(true);
    const { orderId, orderTotal } = await createOrderMutation.mutateAsync({
      customer: state.customer!,
      cart: state.cart
    });
    const walletTransactionId = await payWithWalletMutation.mutateAsync({
      customer: state.customer!,
      amount: orderTotal,
      note: `For self-checkout-order payment #${orderId}`
    });
    await updateOrderMutation.mutateAsync({
      id: orderId,
      payment_method: 'wallet',
      payment_method_title: 'Virtuelles Konto',
      status: 'completed',
      transaction_id: walletTransactionId.toString()
    });
    const newBalance = (await walletQuery.refetch()).data;
    dispatch({ type: ActionTypes.START_NEW_ORDER });
    setNewBalance(newBalance!);
    setTotal(orderTotal);
    setTransactionId(walletTransactionId);
    setOrderId(orderId);
    setShowLoading(false);
    setShowConfirmation(true);
  }

  function closeThankYou() {
    setShowConfirmation(false);
  }

  return (
    <>
      <div className={'select-none h-auto w-full text-center pt-3 pb-4 px-4'}>
        <div className={'flex mb-3 text-lg font-semibold text-blue-gray-700'}>
          <div>TOTAL</div>
          <div className={'text-right w-full'}>CHF {formatPrice(state.cart.price)}</div>
        </div>
        <button
          disabled={!paymentEnabled}
          onClick={handlePayment}
          className={classNames(
            'rounded-2xl text-lg w-full py-3 focus:outline-none',
            { 'text-white bg-orange-900': !paymentEnabled },
            { 'text-white bg-emerald-700': paymentEnabled }
          )}
        >
          {paymentEnabled ? 'BEZAHLEN' : 'Nicht genügend Kredit'}
        </button>
      </div>

      {showLoading && <Loading />}

      {showConfirmation && <Confirmation total={total} newBalance={newBalance} orderId={orderId} transactionId={transactionId} onClose={closeThankYou} />}
    </>
  );
}
