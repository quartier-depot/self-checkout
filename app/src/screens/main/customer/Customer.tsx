import { useGetWalletBalanceQuery } from '../../../store/api/api';
import { formatPrice } from '../../../format/formatPrice';
import { useEffect, useState } from 'react';
import info from '../../../assets/info.svg';
import { MemberDialog } from '../../../components/modal/dialog/memberDialog/MemberDialog';
import classNames from 'classnames';
import { ResetDialog } from '../../../components/modal/dialog/resetDialog/ResetDialog.tsx';
import { useAppSelector } from '../../../store/store.ts';

type CustomerProps = {
    className?: string
}

export function Customer({ className }: CustomerProps) {
    const customer = useAppSelector(state => state.customer.customer);
    const [showMemberDialog, setShowMemberDialog] = useState(false);
    const [showResetDialog, setShowResetDialog] = useState(false);
    const { data: walletBalance, isLoading, isSuccess } = useGetWalletBalanceQuery(customer?.email || '', {
        skip: !customer?.email
    });
    const loggedIn = Boolean(customer);
    const name = loggedIn ? `${customer?.first_name} ${customer?.last_name}` : 'Mitgliedsausweis zeigen';

    function handleClick() {
        if (loggedIn) {
            setShowResetDialog(!showMemberDialog);
        } else {
            setShowMemberDialog(!showMemberDialog);
        }
    }

    useEffect(() => {
        if (loggedIn) {
            setShowMemberDialog(false);
        }
    }, [loggedIn]);

    return (
        <>
            <div onClick={handleClick} className={`m-2 ${className}`}>
                <div className={classNames('h-6', { 'font-bold text-xl': loggedIn})}>
                    {name}
                </div>
                <div className="text-right grow">
                    {!loggedIn && <img src={info} alt="info" className="h-6 inline-block" />}
                    {loggedIn && isLoading && <span className='animate-pulse'>Guthaben laden</span>}
                    {loggedIn && isSuccess && formatPrice(walletBalance.balance)}
                </div>
            </div>

            {showMemberDialog && <MemberDialog onClose={() => setShowMemberDialog(false)} /> }

            {showResetDialog && <ResetDialog onClose={() => setShowResetDialog(false)} /> }
        </>
    );
}
