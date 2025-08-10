import { Dialog } from '../Dialog.tsx';
import { Button } from '../../../button/Button.tsx';
import { CircularCountdown } from '../../../circularCountdown/CircularCountdown.tsx';
import { useAppSelector } from '../../../../store/store.ts';

interface InactivityDialogProps {
    onConfirm: () => void;
}

export function InactivityDialog({ onConfirm }: InactivityDialogProps) {
    const configuration = useAppSelector(state => state.configuration.configuration);
    
    return (
            <Dialog title="Bist du noch da?" onBackdropClick={onConfirm}>
                <div className="p-4">
                    <p className="mb-4">
                        Der Einkauf wird in Kürze automatisch beendet.
                    </p>
                    <div className="flex items-center justify-center mb-4">
                        <CircularCountdown duration={configuration?.inactivityConfirmationTimeout ?? 30000} />
                    </div>
                    <Button type="primary" onClick={onConfirm}>
                        Einkauf fortsetzen
                    </Button>
                </div>
            </Dialog>
    );
}
