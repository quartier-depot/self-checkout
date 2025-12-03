import { Button } from '../../../../components/button/Button.tsx';
import { useEffect } from 'react';
import { useAppDispatch } from '../../../../store/store.ts';
import { cancel } from '../../../../store/slices/sessionSlice.ts';
import cartXIcon from '../../../../assets/cart-x.svg';
import { useSearchParams } from 'react-router';

const alert = new Audio('/assets/sounds/alert.mp3');

export function ProcessingPaymentFailed() {
    const dispatch = useAppDispatch();
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        // noinspection JSIgnoredPromiseFromCall
        alert.play();
    });
    
    useEffect(() => {
        if (searchParams.has("payrexx")) {
            searchParams.delete("payrexx");
            setSearchParams(searchParams);
        }
    });

    function handleClose() {
        setSearchParams({});
        dispatch(cancel());
    }

    return <>
        <div className={'flex-1 grid grid-cols-2 grid-rows-1 gap-4 overflow-y-auto'} onClick={handleClose}>
            <div className={'p-4 border-r border-gray-300'}>
                <h2 className={'font-semibold mb-2'}>Bezahlen fehlgeschlagen</h2>
                <p>Bitte beginne einen neuen Bezahlvorgang.</p>
            </div>
            <div className={'p-4'}>
                <p className={'text-center mt-4'}>
                    <img src={cartXIcon} alt="success" className={'h-96 inline-block'} />
                </p>
            </div>
        </div>
        <div className={'p-4'}>
            <Button type="primary" onClick={handleClose}>OK</Button>
        </div>
    </>;
}