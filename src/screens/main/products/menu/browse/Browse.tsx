import { useProducts } from "../../../../../api/products/useProducts";
import { Button } from "../../../../../components/button/Button";
import { useAppContext } from "../../../../../context/useAppContext";
import { useMemo } from "react";
import { ActionTypes } from "../../../../../state/action";

type BrowseProps = {
    active: boolean;
    onClick: () => void;
}

export function Browse({ active, onClick }: BrowseProps) {
    const productQuery = useProducts();
    const { dispatch } = useAppContext();

    const productsByGestell = useMemo(() => {
        if (!productQuery.data) {
            return [];
        }
        return Array.from(new Set(productQuery.data.map(p => p.gestell)))
        .filter(g => Boolean(g))
        .map(g => {
            return {
                gestell: g!,
                products: productQuery.data.filter(p => p.gestell === g && p.hasBarcodes())
            }
        })
        .filter(i => i.products.length > 0)
        .sort((a, b) => a.gestell.localeCompare(b.gestell));
    }, [productQuery]);

    const handleClick = () => {
        onClick();
        dispatch({
            type: ActionTypes.BROWSE,
            payload: {
                products: productsByGestell
            }
        });
    }

    return (
        <Button type="secondary" onClick={handleClick} toggled={active}>
            Kategorie
        </Button>
    );
}