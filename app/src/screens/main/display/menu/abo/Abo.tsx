import classNames from "classnames";
import { Button } from "../../../../../components/button/Button";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../../store/store";
import { setViewMode, selectViewMode } from "../../../../../store/slices/displaySlice.ts";
import { MemberDialog } from "../../../../../components/modal/dialog/memberDialog/MemberDialog";
import { useGetAboQuery } from '../../../../../store/api/api.ts';

export function Abo() {
    const dispatch = useAppDispatch();
    const customer = useAppSelector(state => state.customer.customer);
    const { isLoading, isSuccess, refetch } = useGetAboQuery();
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
    
    const title = "Abo";

    const handleClick = () => {
        if (disabled) {
            setShowMemberDialog(true);
        } else {
            refetch();
            dispatch(setViewMode('abo'));
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