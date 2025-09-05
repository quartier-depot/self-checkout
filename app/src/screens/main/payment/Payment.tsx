import { formatPrice } from '../../../format/formatPrice';
import { useEffect, useState } from 'react';
import { ConfirmationDialog } from './confirmationDialog/ConfirmationDialog.tsx';
import { Button } from '../../../components/button/Button';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { startNewSession as startNewSession } from '../../../store/slices/sessionSlice';
import {
    useGetWalletBalanceQuery,
    usePayWithWalletMutation,
    useCreateOrderMutation,
    useUpdateOrderMutation
} from '../../../store/api/api';
import { useAppInsightsContext } from '@microsoft/applicationinsights-react-js';
import { MemberDialog } from '../../../components/modal/dialog/memberDialog/MemberDialog';
import { NotEnoughBalanceDialog } from './notEnoughBalanceDialog/NotEnoughtBalanceDialog.tsx';
import { ErrorDialog } from './errorDialog/ErrorDialog.tsx';
import { PaymentDialog } from './paymentDialog/PaymentDialog.tsx';

const alert = new Audio('/assets/sounds/alert.mp3');
const confirm = new Audio('/assets/sounds/confirm.mp3');

export function Payment() {
    const dispatch = useAppDispatch();
    const applicationInsights = useAppInsightsContext();
    const customer = useAppSelector(state => state.customer.customer);
    const cart = useAppSelector(state => state.cart.cart);
    const configuration = useAppSelector(state => state.configuration.configuration);
    const {
        data: walletBalance,
        isSuccess: isWalletSuccess,
        refetch: refetchWalletBalance
    } = useGetWalletBalanceQuery(customer?.email || '', {
        skip: !customer?.email
    });
    const session = useAppSelector(state => state.session.session);
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
    const [showMemberDialog, setShowMemberDialog] = useState(false);
    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const [showNotEnoughBalanceDialog, setShowNotEnoughBalanceDialog] = useState(false);
    const [currentPercentage, setCurrentPercentage] = useState(0);
    const [maxPercentage, setMaxPercentage] = useState(0);
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
        if (session.initialState) {
            setShowPaymentDialog(false);
            setShowNotEnoughBalanceDialog(false);
            setLog('');
            setCurrentPercentage(0);
            setMaxPercentage(0);
        }
    }, [session.initialState]);

    useEffect(() => {
        if (loggedIn) {
            setShowMemberDialog(false);
        }
    }, [loggedIn]);

    useEffect(() => {
        if (showConfirmationDialog) {
            confirm.play();
        }
    }, [showConfirmationDialog]);

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

        setShowPaymentDialog(true);
        setMaxPercentage(39);

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
            setCurrentPercentage(40);
            setMaxPercentage(59);
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
            setCurrentPercentage(60);
            setMaxPercentage(79);
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
            setCurrentPercentage(80);
            setMaxPercentage(99);
            paymentLog += `\n  Status: ${updateOrderStatus}`;
            paymentLog += `\nRefetching wallet balance...`;

            startStep = performance.now();
            const { data: newBalance } = await refetchWalletBalance();
            paymentLog += `\nRefetching wallet balance returned:`;
            paymentLog += `\n  Duration: ${performance.now() - startStep}ms`;
            setCurrentPercentage(100);
            paymentLog += `\n  New balance: ${newBalance!.balance}`;

            paymentLog += `\nPayment OK`;
            paymentLog += `\n  Duration: ${performance.now() - start}ms`;
            console.log(paymentLog);

            dispatch(startNewSession());
            setNewBalance(newBalance!.balance);
            setTotal(orderTotal);
            setTransactionId(walletTransactionId);
            setOrderId(orderId);
            setShowPaymentDialog(false);
            setShowConfirmationDialog(true);
            setTimeout(() => {
                setShowConfirmationDialog(false);
            }, configuration?.inactivityTimeout || 60000);
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
            setTimeout(() => {
                setShowErrorDialog(false);
            }, configuration?.inactivityTimeout || 60000);
            dispatch(startNewSession());
            applicationInsights.getAppInsights().trackException({
                exception: error as Error,
                properties: { log: paymentLog }
            });
        } finally {
            setShowPaymentDialog(false);
        }
    }

    function closeErrorDialog() {
        setShowErrorDialog(false);
        setLog('');
    }

    function closeConfirmation() {
        setShowConfirmationDialog(false);
    }

    return (
            <>
                <div className={'w-full text-center mt-2 '}>
                    <div className={'flex font-mono'}>
                        <div>TOTAL</div>
                        <div className={'text-right w-full text-xl'}>{formatPrice(cart.price)} CHF</div>
                    </div>
                    <Button disabled={!paymentEnabled} withDisabledLock={true} onClick={handlePayment} type={'primary'}>
                        {isNotEnoughWalletBalance ? 'Kontostand nicht ausreichend' : 'Bezahlen'}
                    </Button>
                </div>

                {showPaymentDialog && <PaymentDialog percentage={currentPercentage} maxPercentage={maxPercentage} estimatedTime={6000}/>}

                {showConfirmationDialog && <ConfirmationDialog total={total} newBalance={newBalance} orderId={orderId}
                                                               transactionId={transactionId}
                                                               onClose={closeConfirmation} />}

                {showMemberDialog && <MemberDialog onClose={() => setShowMemberDialog(false)} />}

                {showNotEnoughBalanceDialog &&
                        <NotEnoughBalanceDialog onClose={() => setShowNotEnoughBalanceDialog(false)} />}

                {showErrorDialog && <ErrorDialog onClose={closeErrorDialog} log={log} />}
            </>
    );
}
