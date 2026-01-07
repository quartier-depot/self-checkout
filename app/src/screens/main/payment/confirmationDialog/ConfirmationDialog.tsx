import { formatPrice } from '../../../../format/formatPrice';
import { Button } from '../../../../components/button/Button';
import cartCheckIcon from '../../../../assets/cart-check.svg';
import { PaymentState } from '../../../../store/slices/sessionSlice.ts';
import { useAppDispatch, useAppSelector } from '../../../../store/store.ts';
import { useGetWalletBalanceQuery } from '../../../../store/api/woocommerceApi/woocommerceApi';
import { startNewSession } from '../../../../store/slices/sessionSlice.ts';
import { useAutoClose } from '../../../../hooks/useAutoClose.ts';
import { Spinner } from '../../../../components/spinner/Spinner.tsx';

export function ConfirmationDialog() {
    const dispatch = useAppDispatch();
    const payment: PaymentState = useAppSelector(state => state.session.session.payment);
    const customer = useAppSelector(state => state.customer.customer);
    const {
        data: walletBalance
    } = useGetWalletBalanceQuery(customer?.email || '', {
        skip: !customer?.email
    });

    useAutoClose(handleClose);

    function handleClose() {
        dispatch(startNewSession());
    }

    return (
            <>
                <div className={'flex-1 grid grid-cols-2 grid-rows-1 gap-4 overflow-y-auto'} onClick={handleClose}>
                    <div className={'p-4 border-r border-gray-300'}>
                        <div className={'grid grid-cols-2 gap-2 my-4'}>
                            <div>Betrag:</div>
                            <span className="text-right">{formatPrice(payment.orderTotal)} CHF</span>
                            <div>Bestellnummer:</div>
                            <span className="text-right">{payment.orderId}</span>
                            <div>Bezahlt mit:</div>
                            <span className="text-right">
                                {payment.paymentMethod === 'Wallet' && "Virtuelles Konto"}
                                {payment.paymentMethod === 'Payrexx' && "Twint"}
                            </span>
                            {payment.charges && (<>
                                <div>Twint Gebühren:</div>
                                <span className="text-right">{formatPrice(payment.charges)} CHF</span>
                            </>)}
                            <div>Transaktionsnummer:</div>
                            <span className="text-right">{payment.transactionId}</span>
                            {payment.paymentMethod === 'Wallet' && (<>
                                <div>Neuer Kontostand:</div>
                                <span className="text-right">
                                {walletBalance?.balance && formatPrice(walletBalance?.balance)+" CHF"}
                                    {!walletBalance && <Spinner className={'ml-2 h-4 w-4 inline-block'} />}
                            </span>
                            </>)}
                        </div>
                        <h2 className={'font-semibold mt-30'}>Vielen Dank für deinen Einkauf!</h2>
                    </div>
                    <div className={'p-4'}>
                        <p className={'text-center mt-4'}>
                            <img src={cartCheckIcon} alt="success" className={'h-96 inline-block'} />
                        </p>
                    </div>
                </div>
                <div className={'p-4'}>
                    <Button type="primary" onClick={handleClose}>Schliessen</Button>
                </div>
            </>
    );
}