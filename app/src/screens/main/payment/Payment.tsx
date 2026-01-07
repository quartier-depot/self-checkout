import { formatPrice } from '../../../format/formatPrice';
import { Button } from '../../../components/button/Button';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { PaymentDialog } from './paymentDialog/PaymentDialog.tsx';
import {
    createOrder as setCreateOrder,
    setOrder,
    showFailure, PaymentState, payWithWallet as payWithWalletAction, setTransactionId, showSuccess, payWithPayrexx
} from '../../../store/slices/sessionSlice';
import {
    useCreateOrderMutation,
    useGetWalletBalanceQuery,
    usePayWithWalletMutation, useUpdateOrderMutation
} from '../../../store/api/woocommerceApi/woocommerceApi';
import { useAppInsightsContext } from '@microsoft/applicationinsights-react-js';
import { useState } from 'react';
import { MemberDialog } from '../../../components/modal/dialog/memberDialog/MemberDialog.tsx';
import { useCheckSignatureQuery, useCreateGatewayMutation } from '../../../store/api/payrexxApi/payrexxApi.ts';
import { TopUpWalletDialog } from './topUpWalletDialog/TopUpWalletDialog.tsx';

export function Payment() {
    const dispatch = useAppDispatch();
    const applicationInsights = useAppInsightsContext();
    const cart = useAppSelector(state => state.cart.cart);
    const customer = useAppSelector(state => state.customer.customer);
    const payment: PaymentState = useAppSelector(state => state.session.session.payment);
    const [createOrder] = useCreateOrderMutation();
    const [showMemberDialog, setShowMemberDialog] = useState(false);
    const [showTopUpWalletDialog, setShowTopUpWalletDialog] = useState(false);
    const { data: walletBalance, isSuccess: walletBalanceSuccess } = useGetWalletBalanceQuery(customer?.email || '', {
        skip: !customer?.email
    });
    const loggedIn = Boolean(customer);
    const cartEmpty = cart.items.length == 0;
    const sufficientBalance = walletBalanceSuccess && walletBalance?.balance >= cart.price;
    const { data: payrexxAvailable, refetch: refetchPayrexx } = useCheckSignatureQuery();
    const [createGateway] = useCreateGatewayMutation();
    const [payWithWallet] = usePayWithWalletMutation();
    const [updateOrder] = useUpdateOrderMutation();

    const noop = () => {
    };


    async function handlePayWithWallet() {
        try {
            const { orderId, orderTotal } = await handleCreateOrder();
            dispatch(payWithWalletAction());

            const { isError: isPayWithWalletError, transactionId: walletTransactionId } = await payWithWallet({
                customer: customer!,
                amount: orderTotal,
                note: `For self-checkout-order payment #${orderId}`
            }).unwrap();

            if (isPayWithWalletError) {
                throw new Error('Error paying with wallet');
            }

            dispatch(setTransactionId({ transactionId: walletTransactionId }));

            await updateOrder({
                id: orderId,
                payment_method: 'wallet',
                payment_method_title: 'Virtuelles Konto',
                transaction_id: walletTransactionId.toString(),
                status: 'completed'
            }).unwrap();

            dispatch(showSuccess());
        } catch (error: any) {
            dispatch(showFailure());
            applicationInsights.getAppInsights().trackException({
                exception: error as Error,
                properties: {
                    ...payment
                }
            });
        }
    }

    async function handlePayWithPayrexx() {
        try {
            const { orderId, orderTotal } = await handleCreateOrder();
            dispatch(payWithPayrexx());

            const gateway = await createGateway({
                customer: customer!,
                orderId: orderId,
                orderTotal: orderTotal
            }).unwrap();

            if (gateway.status !== 'success') {
                throw new Error('Error creating gateway. Status is ' + gateway.status);
            }

            if (!gateway.link) {
                throw new Error('Missing gateway link in successful response: ' + gateway.link);
            }

            window.location.replace(gateway?.link);
        } catch (error: any) {
            dispatch(showFailure());
            applicationInsights.getAppInsights().trackException({
                exception: error as Error,
                properties: {
                    ...payment
                }
            });
        }
    }

    async function handleCreateOrder() {
            dispatch(setCreateOrder());

            const { orderId, orderTotal } = await createOrder({
                customer: customer,
                cart: cart
            }).unwrap();

            dispatch(setOrder({ orderId, orderTotal }));
            
            return { orderId, orderTotal };
    }

    return (
            <>
                <div className={'w-full text-center mt-2 '}>
                    <div className={'flex font-mono'}>
                        <div>TOTAL</div>
                        <div className={'text-right w-full text-xl'}>{formatPrice(cart.price)} CHF</div>
                    </div>
                </div>

                <div className={'flex flex-row gap-2'}>

                    {!loggedIn && (
                            <Button type={'primary'} className={'h-20'} onClick={() => setShowMemberDialog(true)}>
                                Mitgliedsausweis zeigen
                            </Button>
                    )}

                    {loggedIn && cartEmpty && (
                            <>
                                <Button type={'primary'} className={'h-20'} onClick={noop} disabled={true}
                                        withDisabledLock={true}>
                                    Twint
                                </Button>
                                <Button type={'primary'} className={'h-20'} onClick={noop} disabled={true}
                                        withDisabledLock={true}>
                                    Guthaben
                                </Button>
                            </>
                    )}

                    {loggedIn && !cartEmpty && payrexxAvailable && (
                            <Button type={'primary'} className={'h-20'} onClick={handlePayWithPayrexx}>
                                <div className={'lowercase'}>bezahlen mit</div>
                                <div className={'mb-6 font-bold'}>Twint</div>
                            </Button>
                    )}

                    {loggedIn && !cartEmpty && !payrexxAvailable && (
                            <Button type={'primary'} className={'h-20'} onClick={refetchPayrexx} disabled={true}
                                    withDisabledLock={true}>
                                Twint
                            </Button>
                    )}

                    {loggedIn && !cartEmpty && walletBalanceSuccess && !sufficientBalance && (
                            <Button type={'secondary'} className={'h-20'} onClick={() => setShowTopUpWalletDialog(true)}>
                                <div>{formatPrice(walletBalance.balance)} CHF</div>
                                <div className={'font-bold'}>Guthaben</div>
                                <div className={'lowercase'}>aufladen</div>
                            </Button>
                    )}

                    {loggedIn && !cartEmpty && walletBalanceSuccess && sufficientBalance && (
                            <Button type={'primary'} className={'h-20'} onClick={handlePayWithWallet}>
                                <div className={'lowercase'}>bezahlen mit</div>
                                <div className={'font-bold'}>Guthaben</div>
                                <div>{formatPrice(walletBalance.balance)} CHF</div>
                            </Button>
                    )}
                </div>

                {payment.state !== 'NoPayment' && <PaymentDialog />}

                {showMemberDialog && <MemberDialog onClose={() => setShowMemberDialog(false)} />}
                
                {showTopUpWalletDialog && <TopUpWalletDialog onClose={() => setShowTopUpWalletDialog(false)} />}
            </>
    );
}
