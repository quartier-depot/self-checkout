import { QRCodeSVG } from 'qrcode.react';
import { Button } from '../../../../components/button/Button';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import {
    cancel,
    payWithWallet as payWithWalletAction,
    showSuccess, setTransactionId, payWithPayrexx, showFailure
} from '../../../../store/slices/sessionSlice.ts';
import {
    useGetWalletBalanceQuery,
    usePayWithWalletMutation,
    useUpdateOrderMutation
} from '../../../../store/api/woocommerceApi/woocommerceApi';
import {
    useCheckSignatureQuery, useCreateGatewayMutation
} from '../../../../store/api/payrexxApi/payrexxApi';
import { formatPrice } from '../../../../format/formatPrice';
import { useEffect } from 'react';
import { Spinner } from '../../../../components/spinner/Spinner';
import { useAppInsightsContext } from '@microsoft/applicationinsights-react-js';

export function SelectPaymentMethodDialog() {
    const dispatch = useAppDispatch();
    const applicationInsights = useAppInsightsContext();
    const payment = useAppSelector(state => state.session.session.payment);
    const customer = useAppSelector(state => state.customer.customer);
    const cart = useAppSelector(state => state.cart.cart);
    const {
        data: walletBalance,
        refetch: refetchWalletBalance,
        isFetching: isRefetchingBalance
    } = useGetWalletBalanceQuery(customer?.email || '', {
        skip: !customer?.email
    });
    const [payWithWallet] = usePayWithWalletMutation();
    const [updateOrder] = useUpdateOrderMutation();
    const [createGateway] = useCreateGatewayMutation();
    const { data: payrexxAvailable, refetch: refetchPayrexx } = useCheckSignatureQuery();
    const name = `${customer?.first_name} ${customer?.last_name}`;

    useEffect(() => {
        if (!walletBalance || walletBalance.balance >= cart.price) {
            return;
        }

        const intervalId = setInterval(() => {
            refetchWalletBalance();
        }, 5000);

        return () => clearInterval(intervalId);
    }, [walletBalance, cart.price, refetchWalletBalance]);


    async function handlePayWithWallet() {
        try {
            assertOrder();
            dispatch(payWithWalletAction());

            const { isError: isPayWithWalletError, transactionId: walletTransactionId } = await payWithWallet({
                customer: customer!,
                amount: payment.orderTotal!,
                note: `For self-checkout-order payment #${payment.orderId}`
            }).unwrap();

            if (isPayWithWalletError) {
                throw new Error('Error paying with wallet');
            }

            dispatch(setTransactionId({ transactionId: walletTransactionId }));

            await updateOrder({
                id: payment.orderId!,
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
            assertOrder();
            dispatch(payWithPayrexx());

            const gateway = await createGateway({
                customer: customer!,
                orderId: payment.orderId!,
                orderTotal: payment.orderTotal!
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

    function assertOrder() {
        if (!payment.orderId) {
            throw new Error('Missing order ID');
        }
        if (!payment.orderTotal) {
            throw new Error('Missing orderTotal');
        }
    }

    function handleCancel() {
        dispatch(cancel());
    }

    return (
            <>
                <div className={'flex-1 grid grid-cols-2 grid-rows-1 gap-4 overflow-y-auto'}>

                    {payrexxAvailable && (<>
                        <div className={'p-4 border-r border-gray-300'}>
                            <h2 className={'font-semibold'}>Mit Twint bezahlen</h2>
                            <p className={'py-8 list-decimal'}>
                                Bezahle <b>{formatPrice(cart.price)}</b> mit Twint.<br />
                                Du benötigst dazu dein Smartphone.
                            </p>
                            <div className={'flex justify-center justify-left items-center'}>
                                <div className="w-72">
                                    <Button type="primary" onClick={handlePayWithPayrexx}>Mit Twint
                                        bezahlen</Button>
                                </div>
                            </div>
                        </div>
                    </>)}

                    {!payrexxAvailable && (<>
                        <div className={'p-4 border-r border-gray-300'}>
                            <h2 className={'font-semibold'}>Mit Twint bezahlen {payrexxAvailable?.toString()}</h2>
                            <p className={'py-8 list-decimal'}>
                                Bezahlung mit Twint steht momentan nicht zur Verfügung.<br />
                                Bitte verwende dein Guthaben oder probiere es später noch einmal.
                            </p>
                            <div className={'flex justify-center justify-left items-center'}>
                                <div className="w-72">
                                    <Button type="primary" onClick={refetchPayrexx} disabled={true}>Mit Twint
                                        bezahlen</Button>
                                </div>
                            </div>
                        </div>
                    </>)}

                    {customer && walletBalance && walletBalance.balance > cart.price && (<>
                                <div className={'p-4'}>
                                    <h2 className={'font-semibold'}>
                                        Mit Guthaben bezahlen
                                    </h2>
                                    <p className={'py-8 list-decimal'}>
                                        Bezahle <b>{formatPrice(cart.price)}</b> mit dem Guthaben<br />
                                        von <b>{name}</b> ({formatPrice(walletBalance.balance)}).
                                    </p>
                                    <div className={'flex justify-center justify-left items-center'}>
                                        <div className="w-72">
                                            <Button type="primary" onClick={handlePayWithWallet}>Mit Guthaben
                                                bezahlen</Button>
                                        </div>
                                    </div>
                                </div>
                            </>
                    )}

                    {customer && walletBalance && walletBalance.balance <= cart.price && (<>
                                <div className={'p-4 border-r border-gray-300'}>
                                    <h2 className={'font-semibold'}>
                                        Mit Guthaben bezahlen
                                        {isRefetchingBalance && <Spinner className={'ml-2 h-4 w-4 inline-block'} />}
                                    </h2>
                                    <p className={'py-8 list-decimal'}>
                                        <b>{name}</b>, dein Guthaben ({formatPrice(walletBalance?.balance)}) reicht für deinen
                                        Einkauf nicht aus.
                                        Öffne folgenden QR-Code mit dem Smartphone und lade dein Virtuelles Konto
                                        auf.
                                    </p>
                                    <div className={'flex justify-center justify-left items-center'}>
                                        <QRCodeSVG
                                                value="https://webshop.quartier-depot.ch/mein-konto/virtuelles-konto/add/"
                                                className="h-72 w-72" />
                                    </div>
                                </div>
                            </>
                    )}
                    
                </div>
                <div className={'p-4'}>
                    <Button type="secondary" onClick={handleCancel}>Abbrechen</Button>
                </div>
            </>
    );
} 