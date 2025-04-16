import { useAppContext } from '../../../context/useAppContext';
import { formatPrice } from '../../../format/formatPrice';
import { useWalletBalance } from '../../../api/wallet/useWalletBalance';
import classNames from 'classnames';
import { useCreateOrder } from '../../../api/orders/useCreateOrder';
import { usePayWithWallet } from '../../../api/wallet/usePayWithWallet';
import { useUpdateOrder } from '../../../api/orders/useUpdateOrder';
import { ActionTypes } from '../../../state/action';
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
            walletQuery.isSuccess && walletQuery.data && walletQuery.data >= state.cart.price;

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
                <div className={'w-full text-center mt-2 '}>
                    <div className={'flex font-mono'}>
                        <div>TOTAL</div>
                        <div className={'text-right w-full'}>CHF {formatPrice(state.cart.price)}</div>
                    </div>
                    <button
                            disabled={!paymentEnabled}
                            onClick={handlePayment}
                            className={classNames(
                                    'rounded-lg w-full mt-2 p-2 border-2 uppercase text-white',
                                    { 'text-slate-950 bg-slate-500 border-slate-500 active:border-slate-400 active:bg-slate-400': !paymentEnabled },
                                    { 'text-white bg-emerald-700 border-emerald-700  active:border-emerald-600 active:bg-emerald-600': paymentEnabled }
                            )}
                    >
                        Bezahlen
                    </button>
                </div>

                {showLoading && <Loading />}

                {showConfirmation && <Confirmation total={total} newBalance={newBalance} orderId={orderId}
                                                   transactionId={transactionId} onClose={closeThankYou} />}
            </>
    );
}
