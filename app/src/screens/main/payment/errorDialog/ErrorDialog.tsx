import cartXIcon from '../../../../assets/cart-x.svg';
import { Button } from '../../../../components/button/Button.tsx';
import { useEffect } from 'react';
const alert = new Audio('/assets/sounds/alert.mp3');

export function ErrorDialog() {
    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, 60000); // 60 seconds

        return () => clearTimeout(timer);
    }, [handleClose]);
    
    useEffect(() => {
        // noinspection JSIgnoredPromiseFromCall
        alert.play();
    })
    
    function handleClose() {
        window.location.reload();
    }
    
    return  <>
        <div className={'flex-1 grid grid-cols-2 grid-rows-1 gap-4 overflow-y-auto'} onClick={handleClose}>
            <div className={'p-4 border-r border-gray-300'}>
                <h2 className={'font-semibold mb-2'}>Es ist ein Fehler aufgetreten</h2>
                <p>
                    Der Bezahlvorgang konnte nicht abgeschlossen werden.
                    <b>Bitte melde dich bei uns.</b>
                </p>
                <br />
                <p>Die Kasse wird neu gestartet.</p>
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
    </>
}