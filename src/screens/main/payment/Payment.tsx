import { formatPrice } from '../../../format/formatPrice';
import { useState } from 'react';
import { Loading } from '../../../components/modal/loading/Loading';
import { Confirmation } from './confirmation/Confirmation';
import { Button } from '../../../components/button/Button';
import { MemberDialog } from '../../../components/modal/dialog/memberdialog/MemberDialog';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { startNewSession as startNewSession } from '../../../store/slices/appSlice';
import { useGetWalletBalanceQuery, usePayWithWalletMutation, useCreateOrderMutation, useUpdateOrderMutation } from '../../../store/api/woocommerceApi';
import { Dialog } from '../../../components/modal/dialog/Dialog';

export function Payment() {
    const dispatch = useAppDispatch();
    const customer = useAppSelector(state => state.customer.customer);
    const cart = useAppSelector(state => state.cart.cart);
    const { data: walletBalance, isSuccess: isWalletSuccess, refetch: refetchWalletBalance } = useGetWalletBalanceQuery(customer?.email || '', {
        skip: !customer?.email
    });
    const [showLoading, setShowLoading] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showMemberDialog, setShowMemberDialog] = useState(false);
    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const [log, setLog] = useState('');
    const [total, setTotal] = useState(0);
    const [newBalance, setNewBalance] = useState(0);
    const [transactionId, setTransactionId] = useState(0);
    const [orderId, setOrderId] = useState('');

    const paymentEnabled = isWalletSuccess && walletBalance && walletBalance.balance >= cart.price;

    const [payWithWallet] = usePayWithWalletMutation();
    const [createOrder] = useCreateOrderMutation();
    const [updateOrder] = useUpdateOrderMutation();

    async function handlePayment() {
        if (!customer) {
            setShowMemberDialog(true);
            return;
        }

        setShowLoading(true);

        let paymentLog = '';

        try {

            paymentLog = 'Creating order...';
            paymentLog += `\n  customerId: ${customer.id}`;
            paymentLog += `\n  cart: ${JSON.stringify(cart)}`;
            const { orderId, orderTotal } = await createOrder({
                customer: customer,
                cart: cart
            }).unwrap();

            paymentLog += `\nCreating order OK`;
            paymentLog += `\n  Order ID: ${orderId}`;
            paymentLog += `\n  Order total: ${orderTotal}`;

            paymentLog += '\nPaying with wallet...';
            paymentLog += `\n  amount: ${orderTotal}`;

            const { transactionId: walletTransactionId } = await payWithWallet({
                customer: customer,
                amount: orderTotal,
                note: `For self-checkout-order payment #${orderId}`
            }).unwrap();

            paymentLog += '\nPaying with wallet OK';
            paymentLog += `\n  Transaction ID: ${walletTransactionId}`;

            paymentLog += '\nUpdating order...';
            paymentLog += `\n  order ID: ${orderId}`;
            paymentLog += `\n  payment method: wallet`;
            paymentLog += `\n  transaction ID: ${walletTransactionId}`;
            paymentLog += `\n  status: completed`;

            await updateOrder({
                id: orderId,
                payment_method: 'wallet',
                payment_method_title: 'Wallet',
                transaction_id: walletTransactionId.toString(),
                status: 'completed'
            }).unwrap();

            paymentLog += '\nUpdating order OK';
            paymentLog += `\nRefetching wallet balance...`;

            const { data: newBalance } = await refetchWalletBalance();
            paymentLog += `\nRefetching wallet balance OK`;
            paymentLog += `\n  new balance: ${newBalance!.balance}`;
            console.log(paymentLog);

            dispatch(startNewSession());
            setNewBalance(newBalance!.balance);
            setTotal(orderTotal);
            setTransactionId(walletTransactionId);
            setOrderId(orderId);
            setShowConfirmation(true);
        } catch (error) {
            paymentLog += `\nPayment failed: ${JSON.stringify(error)}`;
            setLog(paymentLog);
            console.error('Payment failed:', paymentLog);
            setShowErrorDialog(true);
        } finally {
            
            setShowLoading(false);
        }
    }

    function closeErrorDialog() {
        setShowErrorDialog(false);
        setLog('');
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

            {showMemberDialog && <MemberDialog onClose={() => setShowMemberDialog(false)} />}

            {showErrorDialog && (
                <Dialog onBackdropClick={closeErrorDialog} title="Es ist ein Fehler aufgetreten">
                    <div className={'p-4 flex-grow'}>
                        Der Bezahlvorgang konnte nicht abgeschlossen werden. Bitte melde dich bei uns.
                        <br />
                        Die folgenden Informationen wurden übermittelt:
                        <pre>{log}</pre>
                    </div>
                    <div className={'p-4'}>
                        <Button type="primary" onClick={closeErrorDialog}>OK</Button>
                    </div>
                </Dialog>
            )}
        </>
    );
}
