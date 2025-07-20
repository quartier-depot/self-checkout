import { formatPrice } from '../../../../format/formatPrice';
import { Dialog } from '../../../../components/modal/dialog/Dialog';
import { Button } from '../../../../components/button/Button';
import cartCheckIcon from '../../../../assets/cart-check.svg';

type Props = {
    total: number,
    newBalance: number,
    orderId: string,
    transactionId: number,
    onClose: () => void,
}

export function Confirmation(props: Props) {
    return (
            <Dialog title={'Einkauf erfolgreich'}>
                <div className="p-4 text-blue-gray-800">
                    <p>Vielen Dank für deinen Einkauf!</p>
                    <p className={'text-center mt-4'}>
                        <img src={cartCheckIcon} alt="success" className={'h-24 inline-block'} />
                    </p>
                    <div className={'grid grid-cols-2 gap-2 my-4'}>
                        <div>Betrag:</div><span className="font-bold text-right">{formatPrice(props.total)}</span>
                        <div>Virtueller Kontostand neu:</div>  <span className="text-right">{formatPrice(props.newBalance)}</span>
                        <div>Bestellnummer:</div> <span className="text-right">{props.orderId}</span>
                        <div>Transaktionsnummer:</div><span className="text-right">{props.transactionId}</span>
                    </div>
                    <Button type="primary" onClick={() => props.onClose()}>Schliessen</Button>
                </div>
            </Dialog>
    );
}