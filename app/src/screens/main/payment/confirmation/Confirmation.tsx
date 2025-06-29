import { formatPrice } from '../../../../format/formatPrice';
import { Dialog } from '../../../../components/modal/dialog/Dialog';
import { Button } from '../../../../components/button/Button';


type Props = {
    total: number,
    newBalance: number,
    orderId: string,
    transactionId: number,
    onClose: () => void,
}

export function Confirmation(props: Props) {
    return (
            <Dialog title={'Vielen Dank für deinen Einkauf'}>
                <div className="p-4 text-blue-gray-800">
                    <p>Dein virtuelles Konto wurde mit <span className="font-bold">{formatPrice(props.total)}</span> belastet, der neue Kontostand
                        beträgt <span className="font-bold">{formatPrice(props.newBalance)}</span>.</p>
                    <p>Bestellnummer <span className="font-bold">{props.orderId}</span>, Transaktionsnummer <span className="font-bold">{props.transactionId}</span>.</p>
                    <Button type="primary" onClick={() => props.onClose()}>Schliessen</Button>
                </div>
            </Dialog>
    );
}