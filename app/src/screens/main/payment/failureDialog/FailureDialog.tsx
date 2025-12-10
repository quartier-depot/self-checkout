import cartXIcon from '../../../../assets/cart-x.svg';
import { Button } from '../../../../components/button/Button.tsx';
import { useAutoClose } from '../../../../hooks/useAutoClose.ts';
import { restartApplication } from '../../../../restartAplication.ts';

export function FailureDialog() {
    useAutoClose(handleClose);
    
    async function handleClose() {
        await restartApplication();
    }
    
    return  <>
        <div className={'flex-1 grid grid-cols-2 grid-rows-1 gap-4 overflow-y-auto'} onClick={handleClose}>
            <div className={'p-4 border-r border-gray-300'}>
                <h2 className={'font-semibold mb-2'}>Es ist ein Fehler aufgetreten. Bitte melde dich bei uns.</h2>
                <p>Bitte klicke auf OK und versuche es erneut. Die Kasse wird neu gestartet.</p>
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