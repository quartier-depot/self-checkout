import cartXIcon from '../../../../assets/cart-x.svg';
import { Button } from '../../../../components/button/Button.tsx';
import { useAutoClose } from '../../../../hooks/useAutoClose.ts';
import { restartApplication } from '../../../../restartAplication.ts';
import { formatPrice } from '../../../../format/formatPrice.ts';
import { PaymentState } from '../../../../store/slices/sessionSlice.ts';
import { useAppSelector } from '../../../../store/store.ts';

export function FailureDialog() {
    useAutoClose(handleClose);
    const payment: PaymentState = useAppSelector(state => state.session.session.payment);

    async function handleClose() {
        await restartApplication();
    }
    
    return  <>
        <div className={'flex-1 grid grid-cols-2 grid-rows-1 gap-4 overflow-y-auto'} onClick={handleClose} data-testid={'failure-dialog'}>
            <div className={'p-4 border-r border-gray-300'}>
                <p>Es ist ein Fehler aufgetreten. Bitte klicke auf OK und versuche es erneut. Die Kasse wird neu gestartet.</p>
                <div className={'grid grid-cols-2 gap-2 my-4'}>
                    <div>Betrag:</div>
                    <span className="text-right">{formatPrice(payment.orderTotal)} CHF</span>
                    <div>Bestellnummer:</div>
                    <span className="text-right">{payment.orderId}</span>
                    <div>Bezahlungsmethode:</div>
                    <span className="text-right">{payment.paymentMethod}</span>
                    <div>Transaktionsnummer:</div>
                    <span className="text-right">{payment.transactionId}</span>
                </div>
            </div>
            <div className={'p-4'}>
                <p className={'text-center mt-4'}>
                    <img src={cartXIcon} alt="success" className={'h-96 inline-block'} />
                </p>
            </div>
        </div>
        <div className={'p-4'}>
            <Button type="primary" onClick={handleClose}>OK</Button>
        </div>
    </>
}