import classNames from "classnames";
import { Button } from "../../../../../components/button/Button";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../../store/store";
import { setViewMode, selectViewMode, setSearchTerm } from '../../../../../store/slices/displaySlice.ts';
import { MemberDialog } from "../../../../../components/modal/dialog/memberDialog/MemberDialog";
import { useGetAboQuery } from '../../../../../store/api/api.ts';

export function Abo() {
    const dispatch = useAppDispatch();
    const customer = useAppSelector(state => state.customer.customer);
    const { isLoading, isSuccess, data: abo } = useGetAboQuery();
    const [showMemberDialog, setShowMemberDialog] = useState(false);
    const viewMode = useAppSelector(selectViewMode);
    const isActive = viewMode === 'abo';
    const loggedIn = Boolean(customer);

    const disabled = !customer || !isSuccess;

    useEffect(() => {
        if (loggedIn) {
            setShowMemberDialog(false);
        }
    }, [loggedIn]);
    
    const title = "Abo " + (customer && abo && abo.orders[customer.id] && abo.description || "");

    const handleClick = () => {
        if (disabled) {
            setShowMemberDialog(true);
        } else {
            dispatch(setViewMode('abo'));
            dispatch(setSearchTerm('abo'))
        }
    }

    return (
            <>
                <Button type="secondary" disabled={disabled} onClick={handleClick} toggled={isActive} className={classNames({ 'animate-pulse': isLoading })}>
                    {title}
                </Button>

                {showMemberDialog && <MemberDialog onClose={() => setShowMemberDialog(false)} />}
            </>
    );
} 