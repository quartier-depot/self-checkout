import classNames from "classnames";
import { Button } from "../../../../../components/button/Button";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../../store/store";
import { setViewMode, selectViewMode } from "../../../../../store/slices/displaySlice.ts";
import { useGetCustomerOrdersQuery } from "../../../../../store/api/api";
import { MemberDialog } from "../../../../../components/modal/dialog/memberDialog/MemberDialog";


export function Favourites() {
    const dispatch = useAppDispatch();
    const customer = useAppSelector(state => state.customer.customer);
    const { isLoading, isSuccess } = useGetCustomerOrdersQuery(
        customer?.id || 0,
        { skip: !customer?.id }
    );
    const [showDialog, setShowDialog] = useState(false);
    const viewMode = useAppSelector(selectViewMode);
    const isActive = viewMode === 'favourites';
    const loggedIn = Boolean(customer);

    const disabled = !customer || !isSuccess;

    useEffect(() => {
        if (loggedIn) {
            setShowDialog(false);
        }
    }, [loggedIn]);

    const handleClick = () => {
        if (disabled) {
            setShowDialog(true);
        } else {
            dispatch(setViewMode('favourites'));
        }
    }

    return (
        <>
            <Button type="secondary" disabled={disabled} onClick={handleClick} toggled={isActive} className={classNames({ 'animate-pulse': isLoading })} withDisabledLock={true}>
                Meine Favoriten
            </Button>
            
            {showDialog && <MemberDialog onClose={() => setShowDialog(false)} />}
        </>
    );
} 