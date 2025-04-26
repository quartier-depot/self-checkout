import { useAppContext } from '../../../context/useAppContext';
import { useWalletBalance } from '../../../api/wallet/useWalletBalance';
import { formatPrice } from '../../../format/formatPrice';
import { Dialog } from '../../../components/modal/dialog/Dialog';
import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '../../../components/button/Button';

type CustomerProps = {
    className?: string
}

export function Customer({ className }: CustomerProps) {
    const { state } = useAppContext();
    const [showDialog, setShowDialog] = useState(false);
    const walletQuery = useWalletBalance(state.customer?.email);
    const loggedIn = Boolean(state.customer);
    const name = loggedIn ? `${state.customer?.first_name} ${state.customer?.last_name}` : 'Unbekannte Kundin';

    function handleClick() {
        if (!loggedIn) {
            setShowDialog(!showDialog);
        }
    }

    useEffect(() => {
        if (loggedIn) {
            setShowDialog(false);
        }
    }, [loggedIn]);

    return (
        <>
            <div onClick={handleClick} className={`m-2 ${className}`}>
                <div>
                    {name}
                </div>
                <div className="text-right grow">
                    {loggedIn && walletQuery.isSuccess && formatPrice(walletQuery.data)}
                    {!loggedIn && formatPrice(0)}
                </div>
            </div>

            {showDialog && (
                <Dialog title="Mitgliedsausweis" onClick={() => setShowDialog(false)}>
                        <div className={'p-4 flex-grow'}>
                            <div className={'flex justify-center items-center'}>
                                <QRCodeSVG value="https://peloso.ch/quartier-depot" className='h-72 w-72' />
                            </div>
                            <ul className={'py-8 p-4 list-decimal'}>
                                <li>Scanne zuerst den QR-Code oben mit deinem Smartphone.</li>
                                <li>Scanne dann den QR-Code auf deinem Smartphone mit dem Scanner an der Kasse.</li>
                            </ul>
                        </div>
                        <div className={'p-4'}>
                            <Button type="primary" onClick={() => setShowDialog(false)}>OK</Button>
                        </div>
                </Dialog>)
}
        </>
    );
}
