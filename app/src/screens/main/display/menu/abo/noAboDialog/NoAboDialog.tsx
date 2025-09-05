import { Dialog } from '../../../../../../components/modal/dialog/Dialog.tsx';
import { Button } from '../../../../../../components/button/Button.tsx';


type NoAboDialogProps = {
    onClose: () => void;
}

export function NoAboDialog({ onClose }: NoAboDialogProps) {
    return (
            
            <Dialog title="Interessiert am Abo?" onBackdropClick={onClose}>
                <div className={'p-4'} onClick={onClose}>
                    Unsere Frischwaren (Gemüse, Früchte, Milch, Butter, Joghurt) kommen im Abo. 
                    Dieses kann alle ein, zwei oder drei Wochen bestellt werden und lässt sich  pausieren.
                    Auf der Webseite erfährst du alles über die Frischwaren Abos und kannst sie sogleich bestellen.
                </div>
                <div className={'p-4'} onClick={onClose}>
                    Hast du bereits ein Abo? Dann liegt möglicherweise ein Fehler vor,
                    denn deine Abo Bestellung dieser Woche sollte hier angezeigt werden.
                    Bitte melde dich bei uns.
                </div>
                <div className={'p-4'}>
                    <Button type="primary" onClick={onClose}>Schliessen</Button>
                </div>
            </Dialog>
    );
} 