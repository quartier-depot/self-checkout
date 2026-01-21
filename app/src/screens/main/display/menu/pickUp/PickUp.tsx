import classNames from 'classnames';
import { Button } from '../../../../../components/button/Button';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../store/store';
import {
    setViewMode,
    selectViewMode,
    setSearchTerm,
    customerHasPickUp
} from '../../../../../store/slices/displaySlice.ts';
import { MemberDialog } from '../../../../../components/modal/dialog/memberDialog/MemberDialog';
import { NoPickUpDialog } from './noPickUpDialog/NoPickUpDialog';
import { useGetPickUpQuery } from '../../../../../store/api/woocommerceApi/woocommerceApi';

export function PickUp() {
    const dispatch = useAppDispatch();
    const customer = useAppSelector(state => state.customer.customer);
    const { isLoading, isError,  data: pickUp } = useGetPickUpQuery();
    const [showMemberDialog, setShowMemberDialog] = useState(false);
    const [showNoPickUpDialog, setShowNoPickUpDialog] = useState(false);
    const viewMode = useAppSelector(selectViewMode);
    const isActive = viewMode === 'abo';
    const loggedIn = Boolean(customer);
    const disabled = !customer || isError || !pickUp || !customerHasPickUp;
    
    useEffect(() => {
        if (loggedIn) {
            setShowMemberDialog(false);
        }
    }, [loggedIn]);

    const handleClick = () => {
        if (customer && pickUp) {
            if (customerHasPickUp(customer?.id, pickUp)) {
                dispatch(setViewMode('abo'));
                dispatch(setSearchTerm('abo'));
            } else {
                setShowNoPickUpDialog(true);
            }
        } else {
            setShowMemberDialog(true);
        }
    };

    return (
            <>
                <Button type="secondary" disabled={disabled} onClick={handleClick} toggled={isActive}
                        withDisabledLock={!customer}
                        className={classNames({ 'animate-pulse': isLoading })}>
                    Vorbestellungen
                </Button>

                {showMemberDialog && <MemberDialog onClose={() => setShowMemberDialog(false)} />}
                {showNoPickUpDialog && <NoPickUpDialog onClose={() => setShowNoPickUpDialog(false)} />}
            </>
    );
}
