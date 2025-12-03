import { Button } from '../../../components/button/Button';
import { Dialog } from '../../../components/modal/dialog/Dialog';
import { useAutoClose } from '../../../hooks/useAutoClose.ts';
import { restartApplication } from '../../../restartAplication.ts';

export function Error() {
    useAutoClose(restartApplication);

    return (
            <>
                <div className={'bg-slate-950 text-slate-950 h-screen flex flex-row hide-print'}>
                    <Dialog title="Es ist ein Fehler aufgetreten">
                        <div className="p-4 text-blue-gray-800">
                            <p>Entschuldige, das hätte nicht passieren dürfen.</p>
                            <p className="my-4">Bitte klicke auf OK und versuche es erneut. Die Kasse wird neu gestartet.</p>
                            <Button type="primary" onClick={restartApplication}>OK</Button>
                        </div>
                    </Dialog>
                </div>
            </>
    );
}