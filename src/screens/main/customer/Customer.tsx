import { useAppContext } from '../../../context/useAppContext';
import { useWalletBalance } from '../../../api/wallet/useWalletBalance';
import { formatPrice } from '../../../format/formatPrice';
import { useEffect, useState } from 'react';
import { Button } from '../../../components/button/Button';
import info from '../../../assets/info.svg';
import { MemberDialog } from '../../../components/modal/dialog/memberdialog/MemberDialog';

type CustomerProps = {
    className?: string
}

export function Customer({ className }: CustomerProps) {
    const { state } = useAppContext();
    const [showDialog, setShowDialog] = useState(false);
    const walletQuery = useWalletBalance(state.customer?.email);
    const loggedIn = Boolean(state.customer);
    const name = loggedIn ? `${state.customer?.first_name} ${state.customer?.last_name}` : 'Mitgliedsausweis zeigen';

    function handleClick() {
        if (!loggedIn) {
            setShowDialog(!showDialog);
        }
    }

    useEffect(() => {
        if (loggedIn) {
            setShowDialog(false);
        }
    }, [loggedIn]);

    return (
        <>
            <div onClick={handleClick} className={`m-2 ${className}`}>
                <div>
                    {name}
                </div>
                <div className="text-right grow">
                    {!loggedIn && <img src={info} alt="info" className="h-6 inline-block" />}
                    {loggedIn && walletQuery.isLoading && <span className='animate-pulse'>Guthaben laden</span>}
                    {loggedIn && walletQuery.isSuccess && formatPrice(walletQuery.data)}
                </div>
            </div>

            <MemberDialog show={showDialog} onClose={() => setShowDialog(false)} />
        </>
    );
}
