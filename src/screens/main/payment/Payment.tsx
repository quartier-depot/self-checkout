import { formatPrice } from '../../../format/formatPrice';
import { useState } from 'react';
import { Loading } from '../../../components/modal/loading/Loading';
import { Confirmation } from './confirmation/Confirmation';
import { Button } from '../../../components/button/Button';
import { MemberDialog } from '../../../components/modal/dialog/memberdialog/MemberDialog';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { startNewOrder } from '../../../store/slices/appSlice';
import { useGetWalletBalanceQuery, usePayWithWalletMutation, useCreateOrderMutation, useUpdateOrderMutation } from '../../../store/api/woocommerceApi';

export function Payment() {
    const dispatch = useAppDispatch();
    const customer = useAppSelector(state => state.customer.customer);
    const cart = useAppSelector(state => state.cart.cart);
    const { data: walletBalance, isSuccess: isWalletSuccess, refetch: refetchWalletBalance } = useGetWalletBalanceQuery(customer?.email || '', {
        skip: !customer?.email
    });
    const [showLoading, setShowLoading] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showDialog, setShowDialog] = useState(false);

    const [total, setTotal] = useState(0);
    const [newBalance, setNewBalance] = useState(0);
    const [transactionId, setTransactionId] = useState(0);
    const [orderId, setOrderId] = useState('');

    const paymentEnabled = isWalletSuccess && walletBalance && walletBalance >= cart.price;

    const [payWithWallet] = usePayWithWalletMutation();
    const [createOrder] = useCreateOrderMutation();
    const [updateOrder] = useUpdateOrderMutation();

    async function handlePayment() {
        if (!customer) {
            setShowDialog(true);
            return;
        }

        setShowLoading(true);

        try {
            const { orderId, orderTotal } = await createOrder({
                customer: customer,
                cart: cart
            }).unwrap();

            const { transactionId: walletTransactionId } = await payWithWallet({
                customer: customer,
                amount: orderTotal,
                note: `For self-checkout-order payment #${orderId}`
            }).unwrap();

            await updateOrder({
                id: orderId,
                payment_method: 'wallet',
                payment_method_title: 'Wallet',
                transaction_id: walletTransactionId,
                status: 'completed'
            }).unwrap();

            const { data: newBalance } = await refetchWalletBalance();
            dispatch(startNewOrder());
            setNewBalance(newBalance!);
            setTotal(orderTotal);
            setTransactionId(walletTransactionId);
            setOrderId(orderId);
            setShowConfirmation(true);
        } catch (error) {
            console.error('Payment failed:', error);
            setShowDialog(true);
        } finally {
            setShowLoading(false);
        }
    }

    function closeThankYou() {
        setShowConfirmation(false);
    }

    return (
        <>
            <div className={'w-full text-center mt-2 '}>
                <div className={'flex font-mono'}>
                    <div>TOTAL</div>
                    <div className={'text-right w-full'}>CHF {formatPrice(cart.price)}</div>
                </div>
                <Button disabled={!paymentEnabled} onClick={handlePayment} type={'primary'}>Bezahlen</Button>
            </div>

            {showLoading && <Loading text={'Bezahlvorgang'} />}

            {showConfirmation && <Confirmation total={total} newBalance={newBalance} orderId={orderId}
                transactionId={transactionId} onClose={closeThankYou} />}

            {showDialog && <MemberDialog onClose={() => setShowDialog(false)} />}
        </>
    );
}
