import {  useGetWalletBalanceQuery } from '../../../store/api/api';
import { formatPrice } from '../../../format/formatPrice';
import { useEffect, useState } from 'react';
import { MemberDialog } from '../../../components/modal/dialog/memberDialog/MemberDialog';
import { ResetDialog } from '../../../components/modal/dialog/resetDialog/ResetDialog.tsx';
import { useAppSelector } from '../../../store/store.ts';
import { Button } from '../../../components/button/Button.tsx';

type CustomerProps = {
    className?: string
}

export function Customer({ className }: CustomerProps) {
    const customer = useAppSelector(state => state.customer.customer);
    const session = useAppSelector(state => state.session.session);
    const [showMemberDialog, setShowMemberDialog] = useState(false);
    const [showResetDialog, setShowResetDialog] = useState(false);
    const { data: walletBalance, isLoading, isSuccess } = useGetWalletBalanceQuery(customer?.email || '', {
        skip: !customer?.email
    });
    const loggedIn = Boolean(customer);
    const name = `${customer?.first_name} ${customer?.last_name}`;

    function handleClick() {
        if (loggedIn) {
            setShowResetDialog(!showMemberDialog);
        } else {
            // setShowMemberDialog(!showMemberDialog);
            
        }
    }

    useEffect(() => {
        if (loggedIn) {
            setShowMemberDialog(false);
        }
    }, [loggedIn]);

    useEffect(() => {
        if (session.initialState) {
            setShowMemberDialog(false);
            setShowResetDialog(false);
        }
    }, [session.initialState]);
    return (
        <>
            <div onClick={handleClick} className={`m-2 ${className}`}>
            {!loggedIn && (
                <>
                    <div className={'h-18'}>
                        <Button type={'primary'} onClick={handleClick} className={'h-16'}>Mitgliedsausweis zeigen</Button>
                    </div>
                </>
            )}
            {loggedIn && (
                <>
                    <div className={'h-8 font-bold text-xl'}>
                        {name}
                    </div>
                    <div className="text-right h-12 flex flex-col items-end justify-end">
                        {isLoading && <span className={'inline-block animate-pulse'}>Kontostand laden</span>}
                        {isSuccess && (<><span className={'text-sm'}>Kontostand</span><span className={'font-mono text-xl'}>{formatPrice(walletBalance.balance)} CHF</span></>)}
                    </div>
                </>
            )}
        </div>

            {showMemberDialog && <MemberDialog onClose={() => setShowMemberDialog(false)} /> }

            {showResetDialog && <ResetDialog onClose={() => setShowResetDialog(false)} /> }
        </>
    );
}
