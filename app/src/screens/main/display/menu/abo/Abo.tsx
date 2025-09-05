import classNames from 'classnames';
import { Button } from '../../../../../components/button/Button';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../store/store';
import { setViewMode, selectViewMode, setSearchTerm } from '../../../../../store/slices/displaySlice.ts';
import { MemberDialog } from '../../../../../components/modal/dialog/memberDialog/MemberDialog';
import { useGetAboQuery } from '../../../../../store/api/api.ts';
import { useAppInsightsContext } from '@microsoft/applicationinsights-react-js';
import { NoAboDialog } from './noAboDialog/NoAboDialog.tsx';

export function Abo() {
    const dispatch = useAppDispatch();
    const applicationInsights = useAppInsightsContext();
    const customer = useAppSelector(state => state.customer.customer);
    const { isLoading, isError, data: abo } = useGetAboQuery();
    const [showMemberDialog, setShowMemberDialog] = useState(false);
    const [showNoAboDialog, setShowNoAboDialog] = useState(false);
    const viewMode = useAppSelector(selectViewMode);
    const isActive = viewMode === 'abo';
    const loggedIn = Boolean(customer);
    const customerHasAbo = customer && abo && abo.orders[customer.id];
    const disabled = !customer || isError || !abo || !customerHasAbo;


    useEffect(() => {
        if (loggedIn) {
            setShowMemberDialog(false);
        }
    }, [loggedIn]);

    useEffect(() => {
        if (abo && abo.count === 0) {
            applicationInsights.trackException({ exception: new Error('Abo has not a single order.') });
        }
        if (isError) {
            applicationInsights.trackException({ exception: new Error('Error loading abo data.') });
        }
    }, [abo, isError]);

    const title = 'Abo ' + (customerHasAbo && abo.description || '');

    const handleClick = () => {
        if (customer && abo) {
            if (customerHasAbo) {
                dispatch(setViewMode('abo'));
                dispatch(setSearchTerm('abo'));
            } else {
                setShowNoAboDialog(true);
            }
        } else {
            setShowMemberDialog(true);
        }
    };

    return (
            <>
                <Button type="secondary" disabled={disabled} onClick={handleClick} toggled={isActive}
                        className={classNames({ 'animate-pulse': isLoading })}>
                    {title}
                </Button>

                {showMemberDialog && <MemberDialog onClose={() => setShowMemberDialog(false)} />}
                {showNoAboDialog && <NoAboDialog onClose={() => setShowNoAboDialog(false)} />}
            </>
    )
}
