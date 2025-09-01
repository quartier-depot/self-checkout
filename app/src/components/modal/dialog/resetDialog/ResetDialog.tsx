import { Dialog } from '../Dialog';
import { Button } from '../../../button/Button';
import { startNewSession } from '../../../../store/slices/sessionSlice';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import { useGetWalletBalanceQuery } from '../../../../store/api/api';
import { formatPrice } from '../../../../format/formatPrice';

type ResetDialogProps = {
    onClose: () => void;
}

export function ResetDialog({ onClose }: ResetDialogProps) {
    const dispatch = useAppDispatch();
    const cart = useAppSelector(state => state.cart.cart);
    const customer = useAppSelector(state => state.customer.customer);
    const {
        data: walletBalance,
        refetch: refetchWalletBalance
    } = useGetWalletBalanceQuery(customer?.email || '', {
        skip: !customer?.email
    });

    function restartCart() {
        dispatch(startNewSession());
        onClose();
    }

    async function refetchWallet() {
        await refetchWalletBalance();
        onClose();
    }

    function restartApplication() {
        window.location.reload();
    }
    
    function getText() {
        let text = '';
        if (customer) {
            text += 'Abmelden ';
        }
        if (customer && cart.quantity > 0) {
            text += 'und '
        }
        if (cart.quantity > 0) {
            text += `${cart.quantity} Artikel löschen`;
        }
        return text;
    }
    
    return (
            <Dialog title="Was möchtest du tun?" onBackdropClick={onClose}>
                <div className="p-4">
                    <div className="grid grid-cols-3 gap-4">
                        <Button type="secondary" onClick={restartCart} className="aspect-square">
                            <div className='normal-case'>
                                <b>EINKAUF</b><br />
                                neu starten<br />
                                <br />
                                <div className="text-sm text-center mt-4">{getText()}</div>
                            </div>
                        </Button>
                        <Button type="secondary" onClick={refetchWallet} className="aspect-square" disabled={!customer} >
                            <div className='normal-case'>
                                <b>VIRTUELLES KONTO</b><br />
                                neu laden<br />
                                <br />
                                <div className="text-sm text-center mt-4">{customer && <>Aktuell {formatPrice(walletBalance?.balance)}</>}</div>
                            </div>
                        </Button>
                        <Button type="secondary" onClick={restartApplication} className="aspect-square">
                            <div className='normal-case'>
                                <b>KASSE</b><br />
                                neu starten<br />
                                <br />
                                <div className="text-sm text-center mt-4">Version: {__APP_VERSION__}</div>
                            </div>
                        </Button>
                    </div>

                    <Button type="primary" onClick={onClose} className="mt-4">Schliessen</Button>
                </div>
            </Dialog>
    );
} 