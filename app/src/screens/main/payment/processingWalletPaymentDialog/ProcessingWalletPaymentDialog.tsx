import { formatPrice } from '../../../../format/formatPrice';
import { Spinner } from '../../../../components/spinner/Spinner';
import { useAppSelector } from '../../../../store/store';
import { PaymentState } from '../../../../store/slices/sessionSlice.ts';

export function ProcessingWalletPaymentDialog() {
    const payment: PaymentState = useAppSelector(state => state.session.session.payment);

    return (
            <>
                <div className={'flex-1 grid grid-cols-2 grid-rows-1 gap-4 overflow-y-auto'}>
                    <div className={'p-4 border-r border-gray-300'}>
                        <div className={'grid grid-cols-2 gap-2 my-4'}>
                            <div>Betrag:</div>
                            <span className="text-right">{formatPrice(payment.orderTotal)} CHF</span>
                            <div>Bestellnummer:</div>
                            <span className="text-right">{payment.orderId}</span>
                            <div>Bezahlt mit:</div>
                            <span className="text-right">Virtuelles Konto</span>
                            <div>Transaktionsnummer:</div>
                            <span className="text-right"><Spinner className={'ml-2 h-4 w-4 inline-block'} /></span>
                        </div>
                    </div>
                    <div className={'p-4 flex justify-center items-center'}>
                        <Spinner className={'w-72 h-72'} />
                    </div>
                </div>
            </>
    );
}