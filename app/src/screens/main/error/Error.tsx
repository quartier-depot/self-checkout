import { Button } from '../../../components/button/Button';
import { Dialog } from '../../../components/modal/dialog/Dialog';
import { useEffect } from 'react';

export function Error() {
    useEffect(() => {
        const timer = setTimeout(() => {
            reload();
        }, 30000);

        return () => clearTimeout(timer);
    });

    function reload() {
        window.location.reload();
    }

    return (
            <>
                <div className={'bg-slate-950 text-slate-950 h-screen flex flex-row hide-print'}>
                    <Dialog title="Es ist ein Fehler aufgetreten">
                        <div className="p-4 text-blue-gray-800">
                            <p>Entschuldige, das hätte nicht passieren dürfen.</p>
                            <p className="my-4">Bitte klicke auf OK und versuche es erneut.</p>
                            <Button type="primary" onClick={reload}>OK</Button>
                        </div>
                    </Dialog>
                </div>
            </>
    );
}