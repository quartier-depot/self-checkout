import { startNewSession } from '../../../../store/slices/sessionSlice';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import { useGetWalletBalanceQuery } from '../../../../store/api/api';
import { Dialog } from '../../../../components/modal/dialog/Dialog';
import { Button } from '../../../../components/button/Button';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Loading } from '../../../../components/modal/loading/Loading';

type NotEnoughBalanceDialogProps = {
    onClose: () => void;
}

export function NotEnoughBalanceDialog({ onClose }: NotEnoughBalanceDialogProps) {
    const dispatch = useAppDispatch();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const customer = useAppSelector(state => state.customer.customer);
    const {
        refetch: refetchWalletBalance
    } = useGetWalletBalanceQuery(customer?.email || '', {
        skip: !customer?.email
    });

    function restartCart() {
        dispatch(startNewSession());
        onClose();
    }

    async function refetchWallet() {
        setLoading(true);
        await refetchWalletBalance();
        setLoading(false);
        onClose();
    }

    function stepOne() {
        return (
                <>
                    <p>
                        Was möchtest du tun?
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <Button type="secondary" onClick={restartCart} className="aspect-square">
                            <div className="normal-case">
                                Ich möchte den <b>Einkauf an der Kasse abbrechen</b>.
                            </div>
                        </Button>
                        <Button type="secondary" onClick={() => setStep(2)} className="aspect-square" disabled={!customer} withDisabledLock={true}>
                            <div className="normal-case">
                                Ich möchte das <b>Virtuelle Konto aufladen</b>.
                            </div>
                        </Button>
                    </div>
                </>
        );
    }

    function stepTwo() {
        return (
                <>
                    <p>
                        Lade dein Virtuelles Konto im Webshop (QR-Code) auf.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className={'flex justify-center items-center'}>
                            <QRCodeSVG value="https://webshop.quartier-depot.ch/mein-konto/virtuelles-konto/add/" className='h-72 w-72' />
                        </div>
                        <Button type="secondary" onClick={refetchWallet} className="aspect-square" disabled={!customer} withDisabledLock={true}>
                            <div className="normal-case">
                                Ich habe das <b>Virtuelle Konto im Webshop aufgeladen</b>.
                            </div>
                        </Button>
                    </div>
                </>
        );
    }

    return (
            <>
                <Dialog title="Kontostand nicht ausreichend" onBackdropClick={onClose}>
                    <div className="p-4">
                        {step === 1 && stepOne()}
                        {step === 2 && stepTwo()}
                        <Button type="primary" onClick={onClose} className="mt-4">Schliessen</Button>
                    </div>
                </Dialog>
    
                {loading && <Loading text={"Kontostand neu laden"}/>}
            </>
    );
} 