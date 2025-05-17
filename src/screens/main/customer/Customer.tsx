import { useGetWalletBalanceQuery } from '../../../store/api/woocommerceApi';
import { formatPrice } from '../../../format/formatPrice';
import { useEffect, useState } from 'react';
import info from '../../../assets/info.svg';
import { MemberDialog } from '../../../components/modal/dialog/memberdialog/MemberDialog';
import { useAppSelector } from '../../../store/store';

type CustomerProps = {
    className?: string
}

export function Customer({ className }: CustomerProps) {
    const customer = useAppSelector(state => state.customer.customer);
    const [showDialog, setShowDialog] = useState(false);
    const { data: walletBalance, isLoading, isSuccess } = useGetWalletBalanceQuery(customer?.email || '', {
        skip: !customer?.email
    });
    const loggedIn = Boolean(customer);
    const name = loggedIn ? `${customer?.first_name} ${customer?.last_name}` : 'Mitgliedsausweis zeigen';

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
                    {loggedIn && isLoading && <span className='animate-pulse'>Guthaben laden</span>}
                    {loggedIn && isSuccess && formatPrice(walletBalance.balance)}
                </div>
            </div>

            {showDialog && <MemberDialog onClose={() => setShowDialog(false)} /> }
        </>
    );
}
