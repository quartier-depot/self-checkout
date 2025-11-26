import { formatPrice } from '../../../../format/formatPrice';
import { Button } from '../../../../components/button/Button';
import cartCheckIcon from '../../../../assets/cart-check.svg';
import { PaymentState } from '../../../../store/slices/paymentSlice.ts';
import { useAppDispatch, useAppSelector } from '../../../../store/store.ts';
import { useGetWalletBalanceQuery } from '../../../../store/api/api.ts';
import { startNewSession } from '../../../../store/slices/sessionSlice.ts';


export function ConfirmationDialog2() {
    const dispatch = useAppDispatch();
    const payment: PaymentState = useAppSelector(state => state.payment);
    const customer = useAppSelector(state => state.customer.customer);
    const {
        data: walletBalance
    } = useGetWalletBalanceQuery(customer?.email || '', {
        skip: !customer?.email
    });
    
    function handleClose() {
        dispatch(startNewSession());
    }
    
    return (
            <>
                <div className={'flex-1 grid grid-cols-2 grid-rows-1 gap-4 overflow-y-auto'} onClick={handleClose}>
                    <div className={'p-4 border-r border-gray-300'}>
                        <h2 className={'font-semibold'}>Vielen Dank für deinen Einkauf!</h2>
                        <div className={'grid grid-cols-2 gap-2 my-4'}>
                            <div>Betrag:</div>
                            <span className="text-right">{formatPrice(payment.orderTotal)}</span>
                            <div>Neuer Kontostand:</div>
                            <span className="text-right">{formatPrice(walletBalance?.balance)}</span>
                            <div>Bestellnummer:</div>
                            <span className="text-right">{payment.orderId}</span>
                            <div>Transaktionsnummer:</div>
                            <span className="text-right">{payment.transactionId}</span>
                        </div>
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