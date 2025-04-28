import classNames from "classnames";
import { useFavourites } from "../../../../../api/products/useFavourites";
import { useProducts } from "../../../../../api/products/useProducts";
import { Button } from "../../../../../components/button/Button";
import { useAppContext } from "../../../../../context/useAppContext";
import { ActionTypes } from "../../../../../state/action";

type FavouritesProps = {
    active: boolean;
    onClick: () => void;
}

export function Favourites({ active, onClick }: FavouritesProps) {
    const { dispatch, state } = useAppContext();
    const productsQuery = useProducts();
    const favouritesQuery = useFavourites(state.customer?.id, productsQuery.data || []);

    const disabled = !state.customer || !favouritesQuery.isSuccess;

    const handleClick = () => {
        onClick();
        dispatch({
            type: ActionTypes.BROWSE,
            payload: {
                products: favouritesQuery.data || []
            }
        });
    }

    return (
        <Button type="secondary" disabled={disabled} onClick={handleClick} toggled={active} className={classNames({ 'animate-pulse': favouritesQuery.isLoading })}>
            Favoriten
        </Button>
    );
} 