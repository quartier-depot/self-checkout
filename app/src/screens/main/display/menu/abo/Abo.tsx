import classNames from "classnames";
import { Button } from "../../../../../components/button/Button";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../../store/store";
import { setViewMode, selectViewMode, setSearchTerm } from '../../../../../store/slices/displaySlice.ts';
import { MemberDialog } from "../../../../../components/modal/dialog/memberDialog/MemberDialog";
import { useGetAboQuery } from '../../../../../store/api/api.ts';
import { useAppInsightsContext } from '@microsoft/applicationinsights-react-js';

export function Abo() {
    const dispatch = useAppDispatch();
    const applicationInsights = useAppInsightsContext();
    const customer = useAppSelector(state => state.customer.customer);
    const { isLoading, isSuccess, isError, data: abo } = useGetAboQuery();
    const [showMemberDialog, setShowMemberDialog] = useState(false);
    const viewMode = useAppSelector(selectViewMode);
    const isActive = viewMode === 'abo';
    const loggedIn = Boolean(customer);

    const disabled = !customer || !isSuccess;
    const customerHasAbo = customer && abo && abo.orders[customer.id];

    useEffect(() => {
        if (loggedIn) {
            setShowMemberDialog(false);
        }
    }, [loggedIn]);
    
    useEffect(() => {
        if (abo && abo.count === 0) {
            applicationInsights.trackException({exception: new Error("Abo has not a single order.")})
        }
        if (isError) {
            applicationInsights.trackException({exception: new Error("Error loading abo data.")})
        }
    }, [abo, isError]);
    
    const title = "Abo " + (customerHasAbo && abo.description || "");

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