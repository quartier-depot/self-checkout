import classNames from "classnames";
import { useGetProductsQuery, useGetFavouritesQuery } from "../../../../../store/api/woocommerceApi";
import { Button } from "../../../../../components/button/Button";
import { useState } from "react";
import { MemberDialog } from "../../../../../components/modal/dialog/memberdialog/MemberDialog";
import { useAppDispatch, useAppSelector } from "../../../../../store/store";
import { setViewMode, selectViewMode } from "../../../../../store/slices/productsSlice";


export function Favourites() {
    const dispatch = useAppDispatch();
    const customer = useAppSelector(state => state.customer.customer);
    const { data: products = [] } = useGetProductsQuery();
    const { data: favourites = [], isSuccess: isFavouritesSuccess } = useGetFavouritesQuery(
        { customerId: customer?.id?.toString() || '', products },
        { skip: !customer?.id }
    );
    const [showDialog, setShowDialog] = useState(false);
    const viewMode = useAppSelector(selectViewMode);
    const isActive = viewMode === 'favourites';

    const disabled = !customer || !isFavouritesSuccess;

    const handleClick = () => {
        if (disabled) {
            setShowDialog(true);
            return;
        } else {
            dispatch(setViewMode('favourites'));
        }
    }

    return (
        <>
            <Button type="secondary" disabled={disabled} onClick={handleClick} toggled={isActive} className={classNames({ 'animate-pulse': isFavouritesSuccess })}>
                Favoriten
            </Button>
            
            {showDialog && <MemberDialog onClose={() => setShowDialog(false)} />}
        </>
    );
} 