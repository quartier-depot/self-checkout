import { Spinner } from '../../../../components/spinner/Spinner.tsx';
import { formatPrice } from '../../../../format/formatPrice.ts';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog } from '../../../../components/modal/dialog/Dialog.tsx';
import { useGetWalletBalanceQuery } from '../../../../store/api/woocommerceApi/woocommerceApi.ts';
import { useEffect } from 'react';
import { useAppSelector } from '../../../../store/store.ts';
import { Button } from '../../../../components/button/Button.tsx';

type TopUpWalletDialogProps = {
    onClose: () => void;
}


export function TopUpWalletDialog({ onClose }: TopUpWalletDialogProps) {
    const cart = useAppSelector(state => state.cart.cart);
    const customer = useAppSelector(state => state.customer.customer);
    const {
        data: walletBalance,
        refetch: refetchWalletBalance,
        isFetching: isRefetchingBalance
    } = useGetWalletBalanceQuery(customer?.email || '', {
        skip: !customer?.email
    });

    useEffect(() => {
        if (!walletBalance || walletBalance.balance >= cart.price) {
            onClose();
        }

        const intervalId = setInterval(() => {
            refetchWalletBalance();
        }, 5000);

        return () => clearInterval(intervalId);
    }, [walletBalance, cart.price, refetchWalletBalance]);
    
    return (
            <Dialog title="Guthaben aufladen" onBackdropClick={onClose}>
                <div className={'p-4 flex-grow'} onClick={onClose}>
                    <div className={'flex justify-center items-center'}>
                        <QRCodeSVG
                                value="https://webshop.quartier-depot.ch/mein-konto/virtuelles-konto/add/"
                                className="h-72 w-72" />
                    </div>
                    <ol className={'py-8 p-4 list-decimal'}>
                        <li>Scanne zuerst den QR-Code oben mit deinem Smartphone.</li>
                        <li>Lade dein Virtuelles Konto im Webshop auf.</li>
                        <li>Warte, bis sich dieser Dialog automatisch schliesst.</li>
                    </ol>
                    <ul>
                        <li>Warenkorb: {formatPrice(cart.price)} CHF</li>
                        <li>Guthaben: {formatPrice(walletBalance?.balance || 0)} CHF {isRefetchingBalance && <Spinner className={'ml-2 h-4 w-4 inline-block'} />}</li>
                    </ul>
                </div>
                <div className={'p-4'}>
                    <Button type="secondary" onClick={onClose}>Abbrechen</Button>
                </div>
            </Dialog>)
}