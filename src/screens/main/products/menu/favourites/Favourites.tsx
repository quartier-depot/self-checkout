import classNames from "classnames";
import { useGetProductsQuery, useGetFavouritesQuery } from "../../../../../store/api/woocommerceApi";
import { Button } from "../../../../../components/button/Button";
import { useState } from "react";
import { MemberDialog } from "../../../../../components/modal/dialog/memberdialog/MemberDialog";
import { useAppDispatch, useAppSelector } from "../../../../../store/store";
import { setProducts } from "../../../../../store/slices/browseSlice";

type FavouritesProps = {
    active: boolean;
    onClick: () => void;
}

export function Favourites({ active, onClick }: FavouritesProps) {
    const dispatch = useAppDispatch();
    const customer = useAppSelector(state => state.customer.customer);
    const { data: products = [] } = useGetProductsQuery();
    const { data: favourites = [], isSuccess: isFavouritesSuccess } = useGetFavouritesQuery(
        { customerId: customer?.id?.toString() || '', products },
        { skip: !customer?.id }
    );
    const [showDialog, setShowDialog] = useState(false);

    const disabled = !customer || !isFavouritesSuccess;

    const handleClick = () => {
        if (disabled) {
            setShowDialog(true);
            return;
        }
        onClick();
        dispatch(setProducts(favourites));
    }

    return (
        <>
            <Button type="secondary" disabled={disabled} onClick={handleClick} toggled={active} className={classNames({ 'animate-pulse': isFavouritesSuccess })}>
                Verlauf
            </Button>
            
            <MemberDialog show={showDialog} onClose={() => setShowDialog(false)} />
        </>
    );
} 