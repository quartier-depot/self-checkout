import { Dialog } from '../../../../components/modal/dialog/Dialog.tsx';
import cartXIcon from '../../../../assets/cart-x.svg';
import { Button } from '../../../../components/button/Button.tsx';
import { useEffect } from 'react';
const alert = new Audio('/assets/sounds/alert.mp3');

type ErrorDialogProps = {
    onClose: () => void;
    log: string;
}

export function ErrorDialog({ onClose, log }: ErrorDialogProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 60000); // 60 seconds

        return () => clearTimeout(timer);
    }, [onClose]);
    
    useEffect(() => {
        // noinspection JSIgnoredPromiseFromCall
        alert.play();
    })
    
    return  <Dialog onBackdropClick={onClose} title="Es ist ein Fehler aufgetreten">
        <p className={'text-center mt-4'}>
            <img src={cartXIcon} alt="failure" className={'h-24 inline-block'} />
        </p>
        <div className={'mt-4 p-4 flex-grow'}>
            Der Bezahlvorgang konnte nicht abgeschlossen werden. 
            <b>Bitte melde dich bei uns.</b>
            <br />
            <br />
            Die folgenden Informationen wurden übermittelt:
            <pre className={'overflow-scroll text-xs mt-4'}>{log}</pre>
        </div>
        <div className={'mt-4'}>
            <Button type="primary" onClick={onClose}>OK</Button>
        </div>
    </Dialog>
}