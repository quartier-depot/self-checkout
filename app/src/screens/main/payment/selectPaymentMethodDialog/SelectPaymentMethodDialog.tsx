import { QRCodeSVG } from 'qrcode.react';
import { Button } from '../../../../components/button/Button';
import { useAppDispatch, useAppSelector } from '../../../../store/store.ts';
import { cancel, createOrder, PaymentRoles } from '../../../../store/slices/paymentSlice.ts';
import { useEffect } from 'react';
import { useGetWalletBalanceQuery } from '../../../../store/api/api.ts';
import { formatPrice } from '../../../../format/formatPrice.ts';


export function SelectPaymentMethodDialog() {
    const dispatch = useAppDispatch();
    const payment = useAppSelector(state => state.payment);
    const customer = useAppSelector(state => state.customer.customer);
    const cart = useAppSelector(state => state.cart.cart);
    const {
        data: walletBalance
    } = useGetWalletBalanceQuery(customer?.email || '', {
        skip: !customer?.email
    });

    useEffect(() => {
        if (customer) {
            dispatch(createOrder({ paymentRole: PaymentRoles.customer }));
        }
    }, [customer, dispatch]);

    function handlePayWithWallet() {
        dispatch(createOrder({ paymentRole: PaymentRoles.guest }));
    }    
    
    function handlePayWithTwint() {
        dispatch(createOrder({ paymentRole: PaymentRoles.guest }));
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
                                    <h2 className={'font-semibold'}>Mit Guthaben bezahlen</h2>
                                    <p className={'py-8 list-decimal'}>
                                        Dein Guthaben beträgt <b>{formatPrice(walletBalance)}</b>.
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
                                    <h2 className={'font-semibold'}>Mit Guthaben bezahlen</h2>
                                    <p className={'py-8 list-decimal'}>
                                        Dein Guthaben von <b>{formatPrice(walletBalance)}</b> reicht nicht für deinen Einkauf.
                                        Öffne folgenden QR-Code mit dem Smartphone und lade das Virtuelle Konto auf.
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