import { formatPrice } from '../../../format/formatPrice';
import { useEffect, useState } from 'react';
import { Loading } from '../../../components/modal/loading/Loading';
import { Confirmation } from './confirmation/Confirmation';
import { Button } from '../../../components/button/Button';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { startNewSession as startNewSession } from '../../../store/slices/appSlice';
import {
    useGetWalletBalanceQuery,
    usePayWithWalletMutation,
    useCreateOrderMutation,
    useUpdateOrderMutation
} from '../../../store/api/api';
import { Dialog } from '../../../components/modal/dialog/Dialog';
import { useAppInsightsContext } from '@microsoft/applicationinsights-react-js';
import { MemberDialog } from '../../../components/modal/dialog/memberDialog/MemberDialog';
import cartXIcon from '../../../assets/cart-x.svg';
import { NotEnoughBalanceDialog } from './notEnoughBalanceDialog/NotEnoughtBalanceDialog.tsx';

const alert = new Audio('/assets/sounds/alert.mp3');
const confirm = new Audio('/assets/sounds/confirm.mp3');

export function Payment() {
    const dispatch = useAppDispatch();
    const applicationInsights = useAppInsightsContext();
    const customer = useAppSelector(state => state.customer.customer);
    const cart = useAppSelector(state => state.cart.cart);
    const {
        data: walletBalance,
        isSuccess: isWalletSuccess,
        refetch: refetchWalletBalance
    } = useGetWalletBalanceQuery(customer?.email || '', {
        skip: !customer?.email
    });
    const [showLoading, setShowLoading] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showMemberDialog, setShowMemberDialog] = useState(false);
    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const [showNotEnoughBalanceDialog, setShowNotEnoughBalanceDialog] = useState(false);
    const [log, setLog] = useState('');
    const [total, setTotal] = useState(0);
    const [newBalance, setNewBalance] = useState(0);
    const [transactionId, setTransactionId] = useState(0);
    const [orderId, setOrderId] = useState('');
    const loggedIn = Boolean(customer);

    const paymentEnabled = isWalletSuccess && walletBalance && walletBalance.balance >= cart.price && cart.price > 0;

    const [payWithWallet] = usePayWithWalletMutation();
    const [createOrder] = useCreateOrderMutation();
    const [updateOrder] = useUpdateOrderMutation();

    useEffect(() => {
        if (loggedIn) {
            setShowMemberDialog(false);
        }
    }, [loggedIn]);

    useEffect(() => {
        if (showConfirmation) {
            confirm.play();
        }
    }, [showConfirmation]);

    useEffect(() => {
        if (showErrorDialog) {
            alert.play();
        }
    }, [showErrorDialog]);


    const isNotEnoughWalletBalance = customer && walletBalance && walletBalance.balance < cart.price;

    async function handlePayment() {
        if (!customer) {
            setShowMemberDialog(true);
            return;
        }
        
        if (isNotEnoughWalletBalance) {
            setShowNotEnoughBalanceDialog(true);
            return;
        }
        
        if (!paymentEnabled) {
            return;
        }

        setShowLoading(true);

        let paymentLog = '';

        try {

            const start = performance.now();

            let startStep = performance.now();
            paymentLog = 'Creating order...';
            paymentLog += `\n  customerId: ${customer.id}`;
            paymentLog += `\n  cart: ${JSON.stringify(cart)}`;
            const { status: createOrderStatus, orderId, orderTotal } = await createOrder({
                customer: customer,
                cart: cart
            }).unwrap();

            paymentLog += `\nCreating order OK:`;
            paymentLog += `\n  Duration: ${performance.now() - startStep}ms`;
            paymentLog += `\n  Order ID: ${orderId}`;
            paymentLog += `\n  Order total: ${orderTotal}`;
            paymentLog += `\n  Status: ${createOrderStatus}`;

            startStep = performance.now();
            paymentLog += '\nPaying with wallet...';
            paymentLog += `\n  amount: ${orderTotal}`;

            const { isError: isPayWithWalletError, response: payWithWalletResponse, transactionId: walletTransactionId } = await payWithWallet({
                customer: customer,
                amount: orderTotal,
                note: `For self-checkout-order payment #${orderId}`
            }).unwrap();

            if (isPayWithWalletError) {
                paymentLog += '\nPaying with wallet failed:';
                paymentLog += `\n  Response: ${payWithWalletResponse}`;
                
                throw new Error('Error paying with wallet');
            }

            paymentLog += '\nPaying with wallet OK:';
            paymentLog += `\n  Duration: ${performance.now() - startStep}ms`;
            paymentLog += `\n  Transaction ID: ${walletTransactionId}`;

            startStep = performance.now();
            paymentLog += '\nUpdating order...';
            paymentLog += `\n  order ID: ${orderId}`;
            paymentLog += `\n  payment method: wallet`;
            paymentLog += `\n  transaction ID: ${walletTransactionId}`;
            paymentLog += `\n  status: completed`;

            const { status: updateOrderStatus } = await updateOrder({
                id: orderId,
                payment_method: 'wallet',
                transaction_id: walletTransactionId.toString(),
                status: 'completed'
            }).unwrap();

            paymentLog += '\nUpdating order OK:';
            paymentLog += `\n  Duration: ${performance.now() - startStep}ms`;
            paymentLog += `\n  Status: ${updateOrderStatus}`;
            paymentLog += `\nRefetching wallet balance...`;

            startStep = performance.now();
            const { data: newBalance } = await refetchWalletBalance();
            paymentLog += `\nRefetching wallet balance returned:`;
            paymentLog += `\n  Duration: ${performance.now() - startStep}ms`;
            paymentLog += `\n  New balance: ${newBalance!.balance}`;

            paymentLog += `\nPayment OK`;
            paymentLog += `\n  Duration: ${performance.now() - start}ms`;
            console.log(paymentLog);

            dispatch(startNewSession());
            setNewBalance(newBalance!.balance);
            setTotal(orderTotal);
            setTransactionId(walletTransactionId);
            setOrderId(orderId);
            setShowConfirmation(true);
            applicationInsights.getAppInsights().trackEvent({ name: 'success' }, {
                customer: customer.id,
                orderId: orderId,
                transactionId: walletTransactionId,
                log: paymentLog,
                duration: performance.now() - start
            });
        } catch (error: any) {
            paymentLog += `\nPayment failed: ${error?.message}`;
            setLog(paymentLog);
            console.error('Payment failed:', paymentLog);
            setShowErrorDialog(true);
            applicationInsights.getAppInsights().trackException({
                exception: error as Error,
                properties: { log: paymentLog }
            });
        } finally {
            setShowLoading(false);
        }
    }

    function closeErrorDialog() {
        setShowErrorDialog(false);
        setLog('');
    }

    function closeConfirmation() {
        setShowConfirmation(false);
    }

    return (
            <>
                <div className={'w-full text-center mt-2 '}>
                    <div className={'flex font-mono'}>
                        <div>TOTAL</div>
                        <div className={'text-right w-full'}>CHF {formatPrice(cart.price)}</div>
                    </div>
                    <Button disabled={!paymentEnabled} onClick={handlePayment} type={'primary'}>
                        {isNotEnoughWalletBalance ? 'Kontostand nicht ausreichend': 'Bezahlen'}
                    </Button>
                </div>

                {showLoading && <Loading text={'Bezahlvorgang'} />}

                {showConfirmation && <Confirmation total={total} newBalance={newBalance} orderId={orderId}
                                                   transactionId={transactionId} onClose={closeConfirmation} />}

                {showMemberDialog && <MemberDialog onClose={() => setShowMemberDialog(false)} />}

                {showNotEnoughBalanceDialog && <NotEnoughBalanceDialog onClose={() => setShowNotEnoughBalanceDialog(false)} /> }

                {showErrorDialog && (
                        <Dialog onBackdropClick={closeErrorDialog} title="Es ist ein Fehler aufgetreten">
                            <p className={'text-center mt-4'}>
                                <img src={cartXIcon} alt="failure" className={'h-24 inline-block'} />
                            </p>
                            <div className={'mt-4 flex-grow'}>
                                Der Bezahlvorgang konnte nicht abgeschlossen werden. Bitte melde dich bei uns.
                                <br />
                                Die folgenden Informationen wurden übermittelt:
                                <pre>{log}</pre>
                            </div>
                            <div className={'mt-4'}>
                                <Button type="primary" onClick={closeErrorDialog}>OK</Button>
                            </div>
                        </Dialog>
                )}
            </>
    );
}
