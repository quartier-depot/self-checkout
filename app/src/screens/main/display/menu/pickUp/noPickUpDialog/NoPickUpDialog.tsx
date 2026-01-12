import { Dialog } from '../../../../../../components/modal/dialog/Dialog.tsx';
import { Button } from '../../../../../../components/button/Button.tsx';
import { QRCodeSVG } from 'qrcode.react';


type NoAboDialogProps = {
    onClose: () => void;
}

export function NoPickUpDialog({ onClose }: NoAboDialogProps) {
    return (
            <Dialog title="Keine Vorbestellung gefunden" onBackdropClick={onClose} className={'size-7/8'} >
                <div className={'flex-1 grid grid-cols-2 grid-rows-1 gap-4 overflow-y-auto'} onClick={onClose}>
                    <div>
                        <div className={'p-4'}>
                            Unsere Frischwaren (Gemüse, Früchte, Milch, Butter, Joghurt) kommen im Abo.
                            Dieses kann alle ein, zwei oder drei Wochen bestellt werden und lässt sich  pausieren.
                            Auf der Webseite (QR-Code links) erfährst du alles über die Frischwaren Abos und kannst sie sogleich bestellen.
                        </div>
                        <div className={'p-4'} >
                            Aktuell hast du keine Vorbestellung.
                            Vorbestellungen erscheinen in der Kasse bis 5 Tage nach dem Abholtag.
                        </div>
                    </div>
                    <div>
                        <div className={'p-4'}>
                            <div className={'flex justify-center items-center'}>
                                <QRCodeSVG value="https://webshop.quartier-depot.ch/mein-konto/vorbestellungen/" className='h-72 w-72' />
                            </div>
                        </div>
                    </div>
                </div>
                <div className={'p-4'}>
                    <Button type="primary" onClick={onClose}>Schliessen</Button>
                </div>
            </Dialog>
    );
} 