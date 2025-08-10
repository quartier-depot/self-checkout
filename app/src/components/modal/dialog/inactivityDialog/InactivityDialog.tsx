import { Dialog } from '../Dialog.tsx';
import { Button } from '../../../button/Button.tsx';

interface InactivityDialogProps {
    onConfirm: () => void;
}

export function InactivityDialog({ onConfirm }: InactivityDialogProps) {
    return (
            <Dialog title="Bist du noch da?" onBackdropClick={onConfirm}>
                <div className="p-4">
                    <p className="mb-4">
                        Dieser Einkauf wird in Kürze automatisch beendet.
                    </p>
                    <Button type="primary" onClick={onConfirm}>
                        Ja, ich bin noch da
                    </Button>
                </div>
            </Dialog>
    );
}
