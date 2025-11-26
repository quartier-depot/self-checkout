import { Dialog } from '../Dialog';
import { Button } from '../../../button/Button';
import { startNewSession } from '../../../../store/slices/sessionSlice';
import store, { useAppDispatch, useAppSelector } from '../../../../store/store';

type ResetDialogProps = {
    onClose: () => void;
}

export function ResetDialog({ onClose }: ResetDialogProps) {
    const dispatch = useAppDispatch();
    const cart = useAppSelector(state => state.cart.cart);
    const customer = useAppSelector(state => state.customer.customer);

    function restartCart() {
        dispatch(startNewSession());
        onClose();
    }

    async function restartApplication() {
        await store.persistor.purge();
        window.location.reload();
    }
    
    return (
            <Dialog title="Was möchtest du tun?" onBackdropClick={onClose}>
                <div className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Button type="secondary" onClick={restartCart} className="aspect-square" disabled={cart.quantity === 0 && !customer} >
                            <div className='normal-case'>
                                <b>WARENKORB</b><br />
                                leeren<br />
                                und<br />
                                <b>ABMELDEN</b><br />
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