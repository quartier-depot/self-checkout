import { QRCodeSVG } from 'qrcode.react';
import { Button } from '../../../../components/button/Button';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import {
    cancel,
    payWithWallet as payWithWalletAction,
    PaymentRoles, showSuccess, setTransactionId
} from '../../../../store/slices/paymentSlice.ts';
import {
    useGetWalletBalanceQuery,
    usePayWithWalletMutation,
    useUpdateOrderMutation
} from '../../../../store/api/api.ts';
import { formatPrice } from '../../../../format/formatPrice';
import { useEffect } from 'react';
import { Spinner } from '../../../../components/spinner/Spinner';


export function SelectPaymentMethodDialog() {
    const dispatch = useAppDispatch();
    const payment = useAppSelector(state => state.payment);
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
        if (!payment.orderId ) {
            throw new Error('Missing order ID');
        }
        if (!customer ) {
            throw new Error('Missing customer');
        }
        if (!payment.orderTotal) {
            throw new Error('Missing orderTotal');
        }

        dispatch(payWithWalletAction());
        
        const { isError: isPayWithWalletError, transactionId: walletTransactionId } = await payWithWallet({
            customer: customer,
            amount: payment.orderTotal,
            note: `For self-checkout-order payment #${payment.orderId}`
        }).unwrap();

        if (isPayWithWalletError) {
            throw new Error('Error paying with wallet');
        }
        
        dispatch(setTransactionId({transactionId: walletTransactionId}))
        
        await updateOrder({
            id: payment.orderId,
            payment_method: 'wallet',
            transaction_id: walletTransactionId.toString(),
            status: 'completed'
        }).unwrap();

        dispatch(showSuccess());
    }    
    
    function handlePayWithTwint() {
        // dispatch(createOrder({ paymentRole: PaymentRoles.guest }));
    }

    function handleCancel() {
        dispatch(cancel());
    }

    return (
            <>
                <div className={'flex-1 grid grid-cols-2 grid-rows-1 gap-4 overflow-y-auto'}>

                    {payment.paymentRole === PaymentRoles.guest && (<>
                        <div className={'p-4 border-r border-gray-300'}>
                            <h2 className={'font-semibold'}>Mit Guthaben bezahlen</h2>
                            <p className={'py-8 list-decimal'}>
                                Als Gast steht dir diese Zahlmöglichkeit nicht zur Verfügung.
                            </p>
                            <div className={'flex justify-center justify-left items-center'}>
                                <div className="w-72">
                                    <Button type="primary" onClick={() => {
                                    }} disabled>Mit Guthaben bezahlen</Button>
                                </div>
                            </div>
                        </div>
                    </>)}

                    {payment.paymentRole === PaymentRoles.customer && customer && walletBalance && walletBalance.balance > cart.price && (<>
                                <div className={'p-4 border-r border-gray-300'}>
                                    <h2 className={'font-semibold'}>
                                        Mit Guthaben bezahlen
                                    </h2>
                                    <p className={'py-8 list-decimal'}>
                                        Dein Guthaben beträgt <b>{formatPrice(walletBalance.balance)}</b>.<br />
                                        Ein Klick und alles ist bezahlt.
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
                    
                    {payment.paymentRole === PaymentRoles.customer && customer && walletBalance && walletBalance.balance <= cart.price && (<>
                                <div className={'p-4 border-r border-gray-300'}>
                                    <h2 className={'font-semibold'}>
                                        Mit Guthaben bezahlen
                                        {isRefetchingBalance && <Spinner className={'ml-2 h-4 w-4 inline-block'}/>}
                                    </h2>
                                    <p className={'py-8 list-decimal'}>
                                        Dein Guthaben ({formatPrice(walletBalance?.balance)}) reicht für deinen Einkauf nicht aus.
                                        Öffne folgenden QR-Code mit dem Smartphone und lade dein Virtuelles Konto auf.
                                    </p>
                                    <div className={'flex justify-center justify-left items-center'}>
                                        <QRCodeSVG value="https://webshop.quartier-depot.ch/mein-konto/virtuelles-konto/add/" className='h-72 w-72' />
                                    </div>
                                </div>
                            </>
                    )}
                    
                    <div className={'p-4'}>
                        <h2 className={'font-semibold'}>Mit Twint bezahlen</h2>
                        <p className={'py-8 list-decimal'}>
                            Bezahle mit Twint.<br />
                            Du benötigst dazu dein Smartphone.
                        </p>
                        <div className={'flex justify-center justify-left items-center'}>
                            <div className="w-72">
                                <Button type="primary" onClick={handlePayWithTwint}>Mit Twint bezahlen</Button>
                            </div>
                        </div>
                    </div>
                    ;
                </div>
                <div className={'p-4'}>
                    <Button type="secondary" onClick={handleCancel}>Abbrechen</Button>
                </div>
                ;
            </>

    )
            ;
} 