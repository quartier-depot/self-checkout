import classNames from "classnames";
import { useFavourites } from "../../../../../api/products/useFavourites";
import { useProducts } from "../../../../../api/products/useProducts";
import { Button } from "../../../../../components/button/Button";
import { useAppContext } from "../../../../../context/useAppContext";
import { ActionTypes } from "../../../../../state/action";
import { useState } from "react";
import { MemberDialog } from "../../../../../components/modal/dialog/memberdialog/MemberDialog";

type FavouritesProps = {
    active: boolean;
    onClick: () => void;
}

export function Favourites({ active, onClick }: FavouritesProps) {
    const { dispatch, state } = useAppContext();
    const productsQuery = useProducts();
    const favouritesQuery = useFavourites(state.customer?.id, productsQuery.data || []);
    const [showDialog, setShowDialog] = useState(false);

    const disabled = !state.customer || !favouritesQuery.isSuccess;

    const handleClick = () => {
        if (disabled) {
            setShowDialog(true);
            return;
        }
        onClick();
        dispatch({
            type: ActionTypes.BROWSE,
            payload: {
                products: favouritesQuery.data || []
            }
        });
    }

    return (
        <>
            <Button type="secondary" disabled={disabled} onClick={handleClick} toggled={active} className={classNames({ 'animate-pulse': favouritesQuery.isLoading })}>
                Verlauf
            </Button>
            
            <MemberDialog show={showDialog} onClose={() => setShowDialog(false)} />
        </>
    );
} 