import { formatPrice } from '../../../../format/formatPrice';
import { Dialog } from '../../../../components/modal/dialog/Dialog';
import { useAppInsightsContext } from '@microsoft/applicationinsights-react-js';


type Props = {
    total: number,
    newBalance: number,
    orderId: string,
    transactionId: number,
    onClose: () => void,
}

export function Confirmation(props: Props) {
    const applicationInsights = useAppInsightsContext();

    function close(choice: string) {
        console.log('tracking' + choice);
        applicationInsights.getAppInsights().trackEvent({ name: 'survey' }, { choice: choice });
        props.onClose();
    }

    return (
            <Dialog title={'Vielen Dank für deinen Einkauf'}>
                <div className="p-4 text-blue-gray-800">
                    <p>Dein virtuelles Konto wurde mit {formatPrice(props.total)} belastet, der neue Kontostand
                        beträgt {formatPrice(props.newBalance)}.</p>
                    <p>Bestellnummer {props.orderId}, Transaktionsnummer {props.transactionId}.</p>
                </div>
                <div className="border-t border-stone-200 p-4 pt-12">
                    <p>Zum Abschluss noch eine Frage zur Weiterentwicklung der Kasse:</p>
                    <p className={'font-bold'}>Welche Funktionalität wünschst du dir am meisten?</p>
                </div>
                <div className="p-4 flex gap-2">
                    <button className={'rounded-lg text-lg w-full py-3 focus:outline-none text-white bg-emerald-700 h-48'}
                            onClick={() => close('abo')}>Anzeige<br /> deiner aktuellen <br />Abo-Bestellung
                    </button>
                    <button className={'rounded-lg text-lg w-full py-3 focus:outline-none text-white bg-emerald-700'}
                            onClick={() => close('twint')}>Bezahlen <br />mit Twint
                    </button>
                    <button className={'rounded-lg text-lg w-full py-3 focus:outline-none text-white bg-emerald-700'}
                            onClick={() => close('wallet')}>Bezahlen<br />mit Handy-<br/>Wallet<br />(ohne einloggen)
                    </button>
                    <button className={'rounded-lg text-lg w-full py-3 focus:outline-none text-white bg-emerald-700'}
                            onClick={() => close('badge')}>Bezahlen <br />mit Schlüssel-Badge
                    </button>
                    <button className={'rounded-lg text-lg w-full py-3 focus:outline-none text-white bg-emerald-700'}
                            onClick={() => close('other')}>Anderes <br />
                    </button>
                </div>
            </Dialog>
    );
}