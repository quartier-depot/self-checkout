import { Button } from "../../../components/button/Button";
import { Dialog } from "../../../components/modal/dialog/Dialog";
import { startNewSession } from "../../../store/slices/sessionSlice";
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { useEffect } from 'react';

export function Error() {
    const dispatch = useAppDispatch();
    const configuration = useAppSelector(state => state.configuration.configuration);

    useEffect(() => {
        if (configuration?.inactivityTimeout) {
            const timer = setTimeout(() => {
                dispatch(startNewSession());
            }, configuration.inactivityTimeout);

            return () => clearTimeout(timer);
        }
    }, [configuration]);

    return (
            <>
                <div className={'bg-slate-950 text-slate-950 h-screen flex flex-row hide-print'}>
                    <Dialog title="Es ist ein Fehler aufgetreten">
                        <div className="p-4 text-blue-gray-800">
                            <p>Entschuldige, das hätte nicht passieren dürfen.</p>
                            <p className="my-4">Bitte klicke auf OK und versuche es erneut.</p>
                            <Button type="primary" onClick={() => dispatch(startNewSession())}>OK</Button>
                        </div>
                    </Dialog>
                </div>
            </>
    );
}