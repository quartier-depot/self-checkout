import { Dialog } from '../Dialog';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '../../../button/Button';

type MemberDialogProps = {
    onClose: () => void;
}

export function MemberDialog({ onClose }: MemberDialogProps) {
    return (
        <Dialog title="Mitgliedsausweis zeigen" onBackdropClick={onClose}>
            <div className={'p-4 flex-grow'} onClick={onClose}>
                <div className={'flex justify-center items-center'}>
                    <QRCodeSVG value="https://webshop.quartier-depot.ch/mein-konto/memberid" className='h-72 w-72' />
                </div>
                <ul className={'py-8 p-4 list-decimal'}>
                    <li>Scanne zuerst den QR-Code oben mit deinem Smartphone.</li>
                    <li>Scanne dann den Barcode auf deinem Smartphone mit dem Scanner an der Kasse.</li>
                </ul>
            </div>
            <div className={'p-4'}>
                <Button type="primary" onClick={onClose}>OK</Button>
            </div>
        </Dialog>
    );
} 